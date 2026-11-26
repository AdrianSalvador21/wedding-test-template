'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CheckInOp, CheckInSnapshot } from '../../src/types/wedding';
import { CHECKIN_MAX_OPS, CHECKIN_POLL_MS, applyOps, walkInDocId } from '../../lib/checkIn';
import { track } from '../../lib/analytics/client';

// Spec 33 — sincronización del modo hostess. Lo que se ve es siempre "última foto del servidor +
// acciones pendientes". Las acciones se guardan en el equipo y se envían en orden; sin señal se
// quedan en la fila y se reintentan cada 10 s y al volver la conexión. La foto se pide con su
// versión: si nada cambió, el servidor responde 304 sin cuerpo.

export type AccessError = 'invalid' | 'disabled' | 'ended' | null;
export type SyncStatus = 'loading' | 'ok' | 'sending' | 'offline';

const cacheKey = (code: string) => `invyta-checkin-cache:${code}`;
const queueKey = (code: string) => `invyta-checkin-queue:${code}`;

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const ERROR_BY_STATUS: Record<number, AccessError> = { 404: 'invalid', 403: 'disabled', 410: 'ended' };

export function newOpId(): string {
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c?.randomUUID) return c.randomUUID().replace(/-/g, '');
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function useHostessSync(code: string) {
  const [snapshot, setSnapshot] = useState<CheckInSnapshot | null>(null);
  const [queue, setQueue] = useState<CheckInOp[]>([]);
  const [status, setStatus] = useState<SyncStatus>('loading');
  const [accessError, setAccessError] = useState<AccessError>(null);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [storageOk, setStorageOk] = useState(true);
  const queueRef = useRef<CheckInOp[]>([]);
  const versionRef = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const accessRef = useRef<AccessError>(null);

  const saveQueue = useCallback(
    (next: CheckInOp[]) => {
      queueRef.current = next;
      setQueue(next);
      setStorageOk(write(queueKey(code), next));
    },
    [code]
  );

  const acceptSnapshot = useCallback(
    (snap: CheckInSnapshot) => {
      versionRef.current = snap.version;
      setSnapshot(snap);
      setLastSyncAt(Date.now());
      write(cacheKey(code), snap);
    },
    [code]
  );

  const failAccess = useCallback((err: AccessError) => {
    accessRef.current = err;
    setAccessError(err);
  }, []);

  const fetchSnapshot = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (versionRef.current) headers['If-None-Match'] = `"${versionRef.current}"`;
      const res = await fetch(`/api/check-in/${encodeURIComponent(code)}`, { headers, cache: 'no-store' });
      if (res.status === 304) {
        setLastSyncAt(Date.now());
        setStatus(queueRef.current.length ? 'offline' : 'ok');
        return;
      }
      if (ERROR_BY_STATUS[res.status]) {
        failAccess(ERROR_BY_STATUS[res.status]);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      acceptSnapshot((await res.json()) as CheckInSnapshot);
      setStatus(queueRef.current.length ? 'offline' : 'ok');
    } catch {
      setStatus('offline');
    }
  }, [code, acceptSnapshot, failAccess]);

  const flush = useCallback(async () => {
    if (sendingRef.current || accessRef.current || queueRef.current.length === 0) return;
    sendingRef.current = true;
    setStatus('sending');
    const batch = queueRef.current.slice(0, CHECKIN_MAX_OPS);
    try {
      const res = await fetch(`/api/check-in/${encodeURIComponent(code)}/ops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ops: batch }),
      });
      if (ERROR_BY_STATUS[res.status]) {
        // Link rotado, desactivado o vencido: los pendientes no se borran; la pantalla avisa.
        failAccess(ERROR_BY_STATUS[res.status]);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { results: { opId: string }[]; snapshot: CheckInSnapshot };
      const done = new Set(data.results.map((r) => r.opId));
      const remaining = queueRef.current.filter((op) => !done.has(op.opId));
      const wasOffline = done.size > 0 && batch.length > 1;
      saveQueue(remaining);
      acceptSnapshot(data.snapshot);
      if (wasOffline) track('checkin_offline_synced', { count: done.size });
      setStatus(remaining.length ? 'offline' : 'ok');
    } catch {
      setStatus('offline');
    } finally {
      sendingRef.current = false;
    }
  }, [code, saveQueue, acceptSnapshot, failAccess]);

  // Arranque: foto guardada y pendientes del equipo, luego servidor.
  useEffect(() => {
    const cached = read<CheckInSnapshot>(cacheKey(code));
    const pending = read<CheckInOp[]>(queueKey(code)) || [];
    if (cached) {
      versionRef.current = cached.version;
      setSnapshot(cached);
    }
    queueRef.current = pending;
    setQueue(pending);
    void (async () => {
      await fetchSnapshot();
      await flush();
    })();
  }, [code, fetchSnapshot, flush]);

  // Cada 10 s: si hay pendientes se envían (la respuesta trae la foto nueva); si no, se pide la foto.
  useEffect(() => {
    const tick = () => {
      if (accessRef.current) return;
      if (queueRef.current.length) void flush();
      else void fetchSnapshot();
    };
    const id = window.setInterval(tick, CHECKIN_POLL_MS);
    const onOnline = () => tick();
    window.addEventListener('online', onOnline);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('online', onOnline);
    };
  }, [flush, fetchSnapshot]);

  const enqueue = useCallback(
    (ops: CheckInOp[]) => {
      if (ops.length === 0) return;
      saveQueue([...queueRef.current, ...ops]);
      void flush();
    },
    [saveQueue, flush]
  );

  const view = useMemo(() => (snapshot ? applyOps(snapshot, queue) : null), [snapshot, queue]);

  // Invitaciones con cambios que aún no llegan al servidor ("Por enviar").
  const pendingGuestIds = useMemo(() => {
    const ids = new Set<string>();
    queue.forEach((op) => ids.add(op.type === 'walkIn' ? walkInDocId(op.opId) : op.guestDocId));
    return ids;
  }, [queue]);

  return { view, snapshot, queue, status, accessError, lastSyncAt, storageOk, enqueue, pendingGuestIds };
}
