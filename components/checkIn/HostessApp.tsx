'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronRight, Clock, Info, Link2, Loader2, ScanLine, Search, TriangleAlert, Undo2, UserPlus, WifiOff, Check, Users } from 'lucide-react';
import type { CheckInOp, CheckInSnapshot, CheckInSnapshotGuest } from '../../src/types/wedding';
import { arrivedCount, checkInKey, countStats, matchesSearch, opsAffectedNames, parseGuestQr, surnameSortKey, walkInDocId } from '../../lib/checkIn';
import { track } from '../../lib/analytics/client';
import BrandWordmark from '../BrandWordmark';
import { useHostessSync, newOpId, type AccessError } from './useHostessSync';
import GuestSheet from './GuestSheet';
import MoveTableSheet from './MoveTableSheet';
import WalkInSheet from './WalkInSheet';
import QrScannerSheet from './QrScannerSheet';
import { BTN_PRIMARY, BTN_SECONDARY, Badge, CARD, Overlay, StatusCircle, guestBadges, seatsSummary, tableNamesOf, time } from './ui';

// Spec 33 — modo hostess (`/check-in/[código]`). Tablet horizontal: lista a la izquierda y ficha o
// escáner a la derecha. Celular y tablet vertical: lista a pantalla completa; la ficha y el escáner
// se abren encima. Diseño: https://claude.ai/artifact/LsX2mwZckXyXXx8niHF9JJ

const NAME_KEY = 'invyta-checkin-name';
type Filter = 'all' | 'missing' | 'done';
type ScanResult =
  | { kind: 'ok'; guest: CheckInSnapshotGuest; opId: string; at: string }
  | { kind: 'dupe'; guest: CheckInSnapshotGuest; by: string; at: string }
  | { kind: 'opened'; guest: CheckInSnapshotGuest }
  | { kind: 'other_wedding' }
  | { kind: 'not_found' };

function useWide(): boolean {
  // Dos columnas: ≥1024 px, o tablet (≥768 px) en horizontal.
  const query = '(min-width: 1024px), (min-width: 768px) and (orientation: landscape)';
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return wide;
}

// La pantalla no se apaga mientras el modo hostess está abierto (si el navegador lo permite).
function useWakeLock() {
  useEffect(() => {
    type Sentinel = { release: () => Promise<void> };
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<Sentinel> } };
    if (!nav.wakeLock) return;
    let sentinel: Sentinel | null = null;
    const request = () => {
      if (document.visibilityState !== 'visible') return;
      nav.wakeLock!.request('screen').then((s) => (sentinel = s)).catch(() => {});
    };
    request();
    document.addEventListener('visibilitychange', request);
    return () => {
      document.removeEventListener('visibilitychange', request);
      void sentinel?.release().catch(() => {});
    };
  }, []);
}

function readName(): string {
  try {
    return window.localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------

export default function HostessApp({ code }: { code: string }) {
  const sync = useHostessSync(code);
  const [name, setName] = useState<string | null>(null);
  const [askName, setAskName] = useState(false);

  useEffect(() => {
    const saved = readName();
    setName(saved);
    setAskName(!saved);
  }, []);

  if (name === null) return <FullCenter><Loader2 className="h-8 w-8 animate-spin text-[#111111]" /></FullCenter>;

  if (sync.accessError) {
    return <AccessScreen error={sync.accessError} view={sync.view} queue={sync.queue} />;
  }
  if (!sync.view) {
    return (
      <FullCenter>
        {sync.status === 'offline' ? (
          <StateCard icon={<WifiOff className="h-7 w-7 text-[#B45309]" />} title="No hay conexión" text="Para abrir el check-in por primera vez se necesita señal. Intenta de nuevo cuando la tengas." />
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
        )}
      </FullCenter>
    );
  }
  if (askName) {
    return (
      <NameScreen
        view={sync.view}
        initial={name}
        onDone={(n) => {
          try {
            window.localStorage.setItem(NAME_KEY, n);
          } catch {
            // sin localStorage: el nombre dura esta sesión
          }
          setName(n);
          setAskName(false);
        }}
      />
    );
  }
  return <HostessMain sync={sync} view={sync.view} name={name} onChangeName={() => setAskName(true)} />;
}

function FullCenter({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-[#FAFAFA] p-6" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>{children}</div>;
}

function StateCard({ icon, title, text, children }: { icon: ReactNode; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-3.5 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F4F5]">{icon}</span>
      <h1 className="m-0 text-xl font-semibold text-[#0A0A0A]">{title}</h1>
      <p className="m-0 text-sm leading-relaxed text-[#3F3F46]">{text}</p>
      {children}
    </div>
  );
}

function AccessScreen({ error, view, queue }: { error: AccessError; view: CheckInSnapshot | null; queue: CheckInOp[] }) {
  const copy = {
    invalid: { icon: <Link2 className="h-7 w-7 text-[#71717A]" />, title: 'Este link ya no funciona', text: 'Pide el link nuevo a quien organiza la boda.' },
    disabled: { icon: <Info className="h-7 w-7 text-[#71717A]" />, title: 'El check-in de esta boda está desactivado', text: 'Cuando lo activen, este mismo link volverá a funcionar.' },
    ended: { icon: <Clock className="h-7 w-7 text-[#71717A]" />, title: 'El check-in de esta boda ya terminó', text: 'Los resultados quedaron guardados en el panel de la boda.' },
  }[error || 'invalid'];
  const names = view && queue.length ? opsAffectedNames(view, queue) : [];
  return (
    <FullCenter>
      <StateCard icon={copy.icon} title={copy.title} text={copy.text}>
        {queue.length > 0 && (
          <div className="flex w-full items-start gap-2.5 rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-3 text-left text-[13px] leading-relaxed text-[#78350F]">
            <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#B45309]" />
            <span>
              <span className="font-semibold">
                {queue.length === 1 ? '1 cambio no se pudo enviar.' : `${queue.length} cambios no se pudieron enviar.`}
              </span>{' '}
              Avisa a quien organiza{names.length ? `: ${names.slice(0, 8).join(', ')}${names.length > 8 ? '…' : ''}` : ''}.
            </span>
          </div>
        )}
      </StateCard>
    </FullCenter>
  );
}

function NameScreen({ view, initial, onDone }: { view: CheckInSnapshot; initial: string; onDone: (name: string) => void }) {
  const [value, setValue] = useState(initial);
  const date = view.wedding.date
    ? new Date(view.wedding.date).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Mexico_City' })
    : '';
  const ok = value.trim().length > 0;
  return (
    <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-[#FAFAFA] px-6 py-8" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
      <form
        className="flex w-full max-w-[420px] flex-col gap-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) onDone(value.trim().slice(0, 60));
        }}
      >
        <BrandWordmark className="text-[26px]" />
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#AE5730]">Modo hostess</span>
          <h1 className="m-0 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[#0A0A0A]">
            Check-in de {view.wedding.bride} &amp; {view.wedding.groom}
          </h1>
          {date && <p className="m-0 text-[15px] capitalize text-[#3F3F46]">{date}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="hostess-name" className="text-sm font-semibold text-[#27272A]">
            ¿Cómo te llamas?
          </label>
          <input id="hostess-name" autoFocus value={value} onChange={(e) => setValue(e.target.value)} className="h-[52px] rounded-xl border-[1.5px] border-[#111111] bg-white px-4 text-base outline-none" />
          <p className="m-0 text-[13px] leading-relaxed text-[#71717A]">Tu nombre queda en cada llegada que marques. Solo se pide una vez en este equipo.</p>
        </div>
        <button type="submit" disabled={!ok} className={`${BTN_PRIMARY} h-[52px]`}>
          Empezar
        </button>
        <div className="flex items-start gap-2.5 rounded-[10px] bg-[#F4F4F5] px-3.5 py-3 text-[13px] leading-relaxed text-[#3F3F46]">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>Este link es solo para el personal de la entrada. No lo compartas con los invitados.</span>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------

function HostessMain({ sync, view, name, onChangeName }: { sync: ReturnType<typeof useHostessSync>; view: CheckInSnapshot; name: string; onChangeName: () => void }) {
  const wide = useWide();
  useWakeLock();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [moving, setMoving] = useState<{ guestDocId: string; seatIndex: number } | null>(null);
  const [walkIn, setWalkIn] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recent, setRecent] = useState<{ at: string; name: string; detail: string }[]>([]);
  const openedTracked = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (openedTracked.current) return;
    openedTracked.current = true;
    track('hostess_opened', { device: window.matchMedia('(min-width: 768px)').matches ? 'tablet' : 'phone' });
  }, []);

  const names = useMemo(() => tableNamesOf(view), [view]);
  const stats = useMemo(() => countStats(view), [view]);
  const byDoc = useMemo(() => new Map(view.guests.map((g) => [g.docId, g])), [view]);

  const list = useMemo(() => {
    const rows = view.guests.filter((g) => matchesSearch(g, names, query));
    const filtered = rows.filter((g) => {
      const a = arrivedCount(view, g);
      if (filter === 'missing') return a < g.count;
      if (filter === 'done') return a === g.count && g.count > 0;
      return true;
    });
    return filtered.sort((a, b) => {
      if (filter === 'missing') {
        const ca = a.status === 'confirmed' ? 0 : 1;
        const cb = b.status === 'confirmed' ? 0 : 1;
        if (ca !== cb) return ca - cb;
      }
      return surnameSortKey(a.name).localeCompare(surnameSortKey(b.name), 'es');
    });
  }, [view, names, query, filter]);

  const counts = useMemo(() => {
    let missing = 0;
    let done = 0;
    view.guests.forEach((g) => {
      const a = arrivedCount(view, g);
      if (a < g.count) missing += 1;
      else if (g.count > 0) done += 1;
    });
    return { all: view.guests.length, missing, done };
  }, [view]);

  // ---------- acciones ----------
  const op = (extra: Record<string, unknown>) => ({ opId: newOpId(), at: new Date().toISOString(), by: name, ...extra }) as CheckInOp;

  const arrive = useCallback(
    (guest: CheckInSnapshotGuest, seats: number[]) => {
      sync.enqueue(seats.map((seatIndex) => op({ type: 'arrive', guestDocId: guest.docId, seatIndex })));
      track('checkin_arrive', { people: seats.length });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sync.enqueue, name]
  );
  const undo = (guest: CheckInSnapshotGuest, seatIndex: number) => sync.enqueue([op({ type: 'undo', guestDocId: guest.docId, seatIndex })]);
  const move = (guestDocId: string, seatIndex: number, tableId: string | null) => {
    sync.enqueue([op({ type: 'move', guestDocId, seatIndex, tableId })]);
    track('checkin_move', {});
    setMoving(null);
  };
  const addWalkIn = (data: { name: string; count: number; tableId: string | null }) => {
    const o = op({ type: 'walkIn', ...data });
    sync.enqueue([o]);
    track('checkin_walk_in', { people: data.count });
    setWalkIn(false);
    setSelectedId(walkInDocId(o.opId));
  };

  // ---------- escaneo ----------
  const pushRecent = (n: string, detail: string) => setRecent((r) => [{ at: new Date().toISOString(), name: n, detail }, ...r].slice(0, 5));

  const onDecode = (text: string) => {
    const parsed = parseGuestQr(text);
    if (!parsed) {
      setScanResult({ kind: 'not_found' });
      track('checkin_scan', { result: 'not_found' });
      return;
    }
    if (parsed.weddingId !== view.wedding.id) {
      setScanResult({ kind: 'other_wedding' });
      track('checkin_scan', { result: 'other_wedding' });
      return;
    }
    const guest = view.guests.find((g) => g.guestId === parsed.guestId);
    if (!guest) {
      setScanResult({ kind: 'not_found' });
      track('checkin_scan', { result: 'not_found' });
      return;
    }
    const a = arrivedCount(view, guest);
    if (guest.count > 0 && a === guest.count) {
      const recs = Array.from({ length: guest.count }, (_, i) => view.checkIns[checkInKey(guest.docId, i)]).filter(Boolean);
      const lastRec = recs.sort((x, y) => (x!.at < y!.at ? 1 : -1))[0];
      setScanResult({ kind: 'dupe', guest, by: lastRec?.by || '', at: lastRec?.arrivedAt || lastRec?.at || '' });
      track('checkin_scan', { result: 'dupe' });
      return;
    }
    track('checkin_scan', { result: 'ok' });
    if (guest.count === 1) {
      const o = op({ type: 'arrive', guestDocId: guest.docId, seatIndex: 0 });
      sync.enqueue([o]);
      track('checkin_arrive', { people: 1 });
      setScanResult({ kind: 'ok', guest, opId: o.opId, at: o.at });
      pushRecent(guest.name, `${seatsSummary(guest, names)} · 1 de 1`);
      return;
    }
    // Varias personas: se abre su ficha para marcar a quienes llegaron.
    setScanResult({ kind: 'opened', guest });
    pushRecent(guest.name, `${seatsSummary(guest, names)} · ficha abierta (${guest.count} personas)`);
    setSelectedId(guest.docId);
    setScanning(false);
  };

  const resultCard = scanResult ? (
    <ScanResultCard
      result={scanResult}
      names={names}
      onUndo={(g) => {
        undo(g, 0);
        setScanResult(null);
      }}
      onOpen={(g) => {
        setSelectedId(g.docId);
        setScanning(false);
      }}
      onDismiss={() => setScanResult(null)}
    />
  ) : null;

  const recentList =
    recent.length > 0 ? (
      <section className={`${CARD} px-[18px] py-3`}>
        <span className="text-[13px] font-semibold text-[#3F3F46]">Últimos escaneos en este equipo</span>
        {recent.map((r) => (
          <div key={r.at} className="flex items-center gap-3 border-t border-[rgba(0,0,0,0.06)] py-2.5 text-sm">
            <span className="w-10 text-[#71717A]">{time(r.at)}</span>
            <span className="font-semibold text-[#0A0A0A]">{r.name}</span>
            <span className="truncate text-[#71717A]">{r.detail}</span>
          </div>
        ))}
      </section>
    ) : null;

  const selected = selectedId ? byDoc.get(selectedId) || null : null;
  const offline = sync.status === 'offline' && sync.queue.length > 0;

  const syncPill = offline ? (
    <span className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-3 text-[13px] font-semibold text-[#78350F]">
      <WifiOff className="h-[15px] w-[15px]" />
      Sin conexión · {sync.queue.length} por enviar
    </span>
  ) : sync.status === 'sending' ? (
    <span className="inline-flex h-[30px] items-center gap-1.5 rounded-full bg-[#F4F4F5] px-3 text-[13px] font-semibold text-[#3F3F46]">
      <Loader2 className="h-[15px] w-[15px] animate-spin" />
      Enviando…
    </span>
  ) : (
    <span className="inline-flex h-[30px] items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 text-[13px] font-semibold text-[#15803D]">
      <span className="h-2 w-2 rounded-full bg-[#15803D]" />
      Actualizado
    </span>
  );

  const pct = stats.expected ? Math.min(100, Math.round((100 * stats.arrivedConfirmed) / stats.expected)) : 0;

  const header = (
    <header className="flex flex-shrink-0 flex-wrap items-center gap-x-6 gap-y-3 border-b border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 md:h-[72px] md:flex-nowrap md:px-6 md:py-0">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">Check-in</span>
        <span className="truncate text-base font-semibold text-[#0A0A0A] md:text-[17px]">
          {view.wedding.bride} &amp; {view.wedding.groom}
        </span>
      </div>
      <div className="order-3 flex w-full items-center gap-3.5 md:order-none md:w-auto md:max-w-[520px] md:flex-1">
        <span className="whitespace-nowrap text-[20px] font-semibold tracking-[-0.02em] text-[#0A0A0A] md:text-[22px]">
          {stats.arrivedConfirmed}{' '}
          <span className="text-[13px] font-medium text-[#71717A] md:text-sm">
            de {stats.expected} confirmados{stats.arrivedOther ? ` · +${stats.arrivedOther} sin confirmar` : ''}
          </span>
        </span>
        <div className="h-2 min-w-[60px] flex-1 overflow-hidden rounded-full bg-[#F4F4F5]">
          <div className="h-full rounded-full bg-[#15803D]" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3.5">
        {syncPill}
        <span className="hidden flex-col items-end gap-px sm:flex">
          <span className="text-[13px] font-semibold text-[#0A0A0A]">{name}</span>
          <button type="button" onClick={onChangeName} className="text-xs font-semibold text-[#AE5730]">
            Cambiar hostess
          </button>
        </span>
      </div>
    </header>
  );

  const offlineBanner = offline ? (
    <div role="status" className="flex items-start gap-2.5 border-b border-[#FDE68A] bg-[#FFFBEB] px-4 py-2.5 text-[13px] leading-relaxed text-[#78350F] md:items-center md:px-6 md:text-sm">
      <WifiOff className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-[#B45309] md:mt-0" />
      <span>
        <span className="font-semibold">Sin señal.</span> Sigue marcando: los cambios se envían solos cuando vuelva.{' '}
        <span className="font-semibold">No cierres ni recargues esta pestaña.</span>
        {!sync.storageOk && ' Este navegador no guarda cambios sin conexión: mantén la señal.'}
      </span>
    </div>
  ) : null;

  const listColumn = (
    <aside aria-label="Lista de invitaciones" className={`flex min-h-0 flex-col gap-3 bg-[#FAFAFA] p-4 ${wide ? 'w-[440px] flex-shrink-0 border-r border-[rgba(0,0,0,0.1)]' : 'flex-1'}`}>
      <label className={`flex h-[52px] flex-shrink-0 items-center gap-2.5 rounded-xl bg-white px-3.5 ${wide ? 'border-[1.5px] border-[#111111]' : 'border border-[rgba(0,0,0,0.14)]'}`}>
        <Search className="h-[19px] w-[19px] text-[#71717A]" />
        <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, apellido o mesa" aria-label="Buscar invitado" className="min-w-0 flex-1 bg-transparent text-base outline-none" />
      </label>
      <div className="grid flex-shrink-0 grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            setScanResult(null);
            setScanning(true);
            setSelectedId(null);
          }}
          className={`${BTN_PRIMARY} h-[50px]`}
        >
          <ScanLine className="h-[18px] w-[18px]" />
          Escanear QR
        </button>
        <button type="button" onClick={() => setWalkIn(true)} className={`${BTN_SECONDARY} h-[50px] text-sm`}>
          <UserPlus className="h-[18px] w-[18px]" />
          Agregar invitado
        </button>
      </div>
      <div role="group" aria-label="Filtro" className="grid flex-shrink-0 grid-cols-3 gap-1 rounded-full border border-[rgba(0,0,0,0.1)] bg-white p-1">
        {(
          [
            ['all', 'Todos', counts.all],
            ['missing', 'Faltan', counts.missing],
            ['done', 'Llegaron', counts.done],
          ] as const
        ).map(([id, label, n]) => (
          <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={`h-9 rounded-full text-[13px] font-semibold ${filter === id ? 'bg-[#111111] text-white' : 'text-[#3F3F46]'}`}>
            {label} <span className="opacity-70">{n}</span>
          </button>
        ))}
      </div>
      <section className={`${CARD} min-h-0 flex-1 overflow-y-auto`}>
        {list.map((g, i) => {
          const a = arrivedCount(view, g);
          const isSel = wide && g.docId === selectedId;
          const badges = guestBadges(view, g);
          return (
            <button
              key={g.docId}
              type="button"
              onClick={() => {
                setSelectedId(g.docId);
                setScanning(false);
              }}
              className={`flex min-h-16 w-full items-center gap-3 px-3.5 py-3 text-left ${i > 0 ? 'border-t border-[rgba(0,0,0,0.06)]' : ''} ${isSel ? 'bg-[rgba(198,102,60,0.08)] shadow-[inset_3px_0_0_#AE5730]' : ''}`}
            >
              <StatusCircle arrived={a} count={g.count} />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[15px] font-semibold text-[#0A0A0A]">{g.name}</span>
                <span className="text-[13px] text-[#71717A]">
                  {g.count} {g.count === 1 ? 'persona' : 'personas'} · {seatsSummary(g, names)}
                </span>
                {(badges.length > 0 || sync.pendingGuestIds.has(g.docId)) && (
                  <span className="flex flex-wrap gap-1.5">
                    {badges.map((b) => (
                      <Badge key={b.text} tone={b.tone}>
                        {b.text}
                      </Badge>
                    ))}
                    {sync.pendingGuestIds.has(g.docId) && (
                      <Badge tone="warn">
                        <Clock className="h-3 w-3" />
                        Por enviar
                      </Badge>
                    )}
                  </span>
                )}
              </span>
              <ChevronRight className="h-[18px] w-[18px] flex-shrink-0 text-[#A1A1AA]" />
            </button>
          );
        })}
        {list.length === 0 && <p className="px-4 py-6 text-center text-sm text-[#71717A]">{query ? 'Nadie con ese nombre o mesa. Si llegó sin invitación, usa “Agregar invitado”.' : 'Sin invitaciones en este filtro.'}</p>}
      </section>
    </aside>
  );

  const ficha = (g: CheckInSnapshotGuest, back?: () => void) => (
    <GuestSheet view={view} guest={g} onArrive={(seats) => arrive(g, seats)} onUndo={(i) => undo(g, i)} onMove={(i) => setMoving({ guestDocId: g.docId, seatIndex: i })} onBack={back} />
  );

  const movingGuest = moving ? byDoc.get(moving.guestDocId) : null;

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-[#FAFAFA] text-[#0A0A0A]" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
      {header}
      {offlineBanner}
      {wide ? (
        <div className="flex min-h-0 flex-1">
          {listColumn}
          <main className="flex min-h-0 min-w-0 flex-1 flex-col">
            {scanning ? (
              <QrScannerSheet embedded onDecode={onDecode} onClose={() => setScanning(false)} onSearch={() => { setScanning(false); searchRef.current?.focus(); }} result={resultCard} recent={recentList} />
            ) : selected ? (
              ficha(selected)
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center text-[#71717A]">
                <Users className="h-10 w-10" strokeWidth={1.5} />
                <span className="text-base font-semibold text-[#3F3F46]">Escanea un QR o elige a alguien de la lista</span>
                <span className="max-w-[360px] text-sm">Su ficha aparece aquí, con cada persona de su invitación y su mesa.</span>
              </div>
            )}
          </main>
        </div>
      ) : (
        <>
          {listColumn}
          {selected && !scanning && <Overlay label={`Ficha de ${selected.name}`} onClose={() => setSelectedId(null)}>{ficha(selected, () => setSelectedId(null))}</Overlay>}
          {scanning && (
            <QrScannerSheet embedded={false} onDecode={onDecode} onClose={() => setScanning(false)} onSearch={() => { setScanning(false); window.setTimeout(() => searchRef.current?.focus(), 50); }} result={resultCard} />
          )}
        </>
      )}
      {!wide && (
        <div className="flex flex-shrink-0 items-center justify-between border-t border-[rgba(0,0,0,0.08)] bg-white px-4 py-2 text-xs text-[#71717A] sm:hidden">
          <span>Hostess: {name}</span>
          <button type="button" onClick={onChangeName} className="font-semibold text-[#AE5730]">
            Cambiar hostess
          </button>
        </div>
      )}
      {moving && movingGuest && <MoveTableSheet view={view} guest={movingGuest} seatIndex={moving.seatIndex} onMove={(t) => move(movingGuest.docId, moving.seatIndex, t)} onClose={() => setMoving(null)} />}
      {walkIn && <WalkInSheet view={view} onAdd={addWalkIn} onClose={() => setWalkIn(false)} />}
    </div>
  );
}

function ScanResultCard({
  result,
  names,
  onUndo,
  onOpen,
  onDismiss,
}: {
  result: ScanResult;
  names: Map<string, string>;
  onUndo: (g: CheckInSnapshotGuest) => void;
  onOpen: (g: CheckInSnapshotGuest) => void;
  onDismiss: () => void;
}) {
  if (result.kind === 'ok') {
    return (
      <section role="status" className="flex flex-col gap-2.5 rounded-[14px] border-[1.5px] border-[rgba(21,128,61,0.35)] bg-[#F0FDF4] px-5 py-4">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#15803D]">
          <Check className="h-[17px] w-[17px]" strokeWidth={2.4} />
          Llegada marcada
        </span>
        <span className="text-[24px] font-semibold tracking-[-0.02em] text-[#14532D] md:text-[26px]">{result.guest.name}</span>
        <span className="flex flex-wrap items-center gap-x-3.5 text-base text-[#14532D]">
          <span>1 persona</span>
          <span className="font-semibold">{seatsSummary(result.guest, names)}</span>
          <span className="text-[#166534]">{time(result.at)}</span>
        </span>
        <div className="flex gap-2.5">
          <button type="button" onClick={() => onUndo(result.guest)} className="inline-flex h-11 items-center gap-1.5 rounded-[10px] border border-[rgba(21,128,61,0.35)] bg-white px-4 text-sm font-semibold text-[#14532D]">
            <Undo2 className="h-4 w-4" />
            Deshacer
          </button>
          <button type="button" onClick={() => onOpen(result.guest)} className="h-11 px-3 text-sm font-semibold text-[#14532D]">
            Ver ficha
          </button>
        </div>
      </section>
    );
  }
  if (result.kind === 'dupe') {
    return (
      <section role="alert" className="flex flex-col gap-2.5 rounded-[14px] border-[1.5px] border-[#F59E0B] bg-[#FFFBEB] px-5 py-4">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#B45309]">
          <TriangleAlert className="h-[18px] w-[18px]" />
          Este QR ya se usó
        </span>
        <span className="text-[24px] font-semibold tracking-[-0.02em] text-[#78350F] md:text-[26px]">{result.guest.name}</span>
        <span className="text-[15px] leading-relaxed text-[#78350F]">
          Ya {result.guest.count === 1 ? 'llegó' : `llegaron las ${result.guest.count} personas`}
          {result.at ? ` · ${time(result.at)}` : ''}
          {result.by ? ` · marcado por ${result.by}` : ''}. Revisa que no sea una captura compartida.
        </span>
        <div className="flex gap-2.5">
          <button type="button" onClick={() => onOpen(result.guest)} className="h-11 rounded-[10px] border border-[#F59E0B] bg-white px-4 text-sm font-semibold text-[#78350F]">
            Ver ficha
          </button>
          <button type="button" onClick={onDismiss} className="h-11 rounded-[10px] bg-[#B45309] px-4 text-sm font-semibold text-white">
            Seguir escaneando
          </button>
        </div>
      </section>
    );
  }
  if (result.kind === 'opened') return null;
  return (
    <section role="alert" className="flex items-start gap-2.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-3 text-sm font-semibold text-[#78350F]">
      <TriangleAlert className="h-[18px] w-[18px] flex-shrink-0 text-[#B45309]" />
      <span className="flex flex-col gap-0.5">
        {result.kind === 'other_wedding' ? 'Este QR es de otra boda' : 'No encontramos esta invitación'}
        <span className="text-[13px] font-medium">{result.kind === 'other_wedding' ? 'Pide al invitado el pase de esta boda o búscalo por nombre.' : 'Búscala por nombre en la lista.'}</span>
      </span>
    </section>
  );
}
