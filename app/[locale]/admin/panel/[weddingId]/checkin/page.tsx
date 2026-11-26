'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Copy, DoorOpen, ExternalLink, Info, Loader2, Printer, QrCode, RefreshCw, Search, Share2, TriangleAlert, Users } from 'lucide-react';
import { usePanelData } from '../../../../../../components/admin/panel/PanelDataContext';
import { AdminStatCard, AdminStatusPill, AdminTopBar, manrope } from '../../../../../../components/admin/ui';
import { useAuth } from '../../../../../../lib/auth-context';
import { SITE } from '../../../../../../lib/site';
import { track } from '../../../../../../lib/analytics/client';
import { CHECKIN_POLL_MS, arrivedCount, countStats, isArrived, normalizeSearch, surnameSortKey } from '../../../../../../lib/checkIn';
import type { CheckInActivity, CheckInSnapshot } from '../../../../../../src/types/wedding';

// Spec 33 — sección "Check-in" del panel. Diseño: https://claude.ai/artifact/LsX2mwZckXyXXx8niHF9JJ
// (Panel · Check-in). El interruptor se guarda al instante (no usa "Guardar cambios") y todo se
// actualiza solo cada 10 s mientras la pestaña está visible.

interface PanelCheckIn {
  enabled: boolean;
  code: string | null;
  ended: boolean;
  snapshot: CheckInSnapshot;
  activity: CheckInActivity[];
}

const ACTIVITY_TEXT: Record<CheckInActivity['type'], (a: CheckInActivity) => string> = {
  arrived: (a) => `marcó la llegada de ${a.guestName}`,
  undone: (a) => `deshizo la llegada de ${a.guestName}`,
  moved: (a) => `movió a ${a.guestName} a ${a.detail || 'otra mesa'}`,
  walk_in: (a) => `agregó a ${a.guestName}${a.detail ? ` (${a.detail})` : ''}`,
};

const time = (iso: string) => new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' });

function Toggle({ on, onClick, disabled, label }: { on: boolean; onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`relative flex-shrink-0 mt-0.5 h-7 w-12 rounded-full transition-colors disabled:opacity-60 ${on ? 'bg-[#AE5730]' : 'bg-[#D4D4D8]'}`}
    >
      <span className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-all ${on ? 'left-[23px]' : 'left-[3px]'}`} />
    </button>
  );
}

const card = 'bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] px-4 sm:px-5 py-5';
const smallBtn = 'inline-flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold no-underline';

export default function CheckInPanelPage() {
  const params = useParams();
  const weddingId = params.weddingId as string;
  const locale = (params.locale as string) || 'es';
  const auth = useAuth();
  const { weddingData } = usePanelData();
  const [data, setData] = useState<PanelCheckIn | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [pendingQuery, setPendingQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await auth.authedFetch(`/api/panel/check-in/${weddingId}`);
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as PanelCheckIn);
      setUpdatedAt(Date.now());
      setError(null);
    } catch {
      setError('No pudimos cargar el check-in. Revisa tu conexión.');
    }
  }, [auth, weddingId]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, CHECKIN_POLL_MS);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(id);
      window.clearInterval(tick);
    };
  }, [load]);

  // Mismo dominio del panel (producción, preview o local), para que el link sirva donde se probó.
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE.url;
  const link = data?.code ? `${origin}/check-in/${data.code}` : null;

  useEffect(() => {
    if (!link) {
      setQrUrl(null);
      return;
    }
    let cancelled = false;
    import('qrcode').then((QR) => QR.default.toDataURL(link, { margin: 1, width: 280, errorCorrectionLevel: 'M' })).then((url) => {
      if (!cancelled) setQrUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [link]);

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await auth.authedFetch(`/api/panel/check-in/${weddingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(String(res.status));
      await load();
      return true;
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggle = async () => {
    if (!data) return;
    const next = !data.enabled;
    if ((await patch({ enabled: next })) && next) track('checkin_enabled', {});
  };

  const rotate = async () => {
    if (await patch({ rotate: true })) {
      track('checkin_link_rotated', {});
      setConfirmRotate(false);
    }
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el link sigue visible para copiarlo a mano.
    }
  };

  const snapshot = data?.snapshot;
  const stats = useMemo(() => (snapshot ? countStats(snapshot) : null), [snapshot]);

  const byTable = useMemo(() => {
    if (!snapshot) return [];
    const rows = snapshot.tables.map((t) => {
      let assigned = 0;
      let arrived = 0;
      snapshot.guests.forEach((g) => {
        for (let i = 0; i < g.count; i += 1) {
          if (g.seats[i] !== t.id) continue;
          assigned += 1;
          if (isArrived(snapshot, g.docId, i)) arrived += 1;
        }
      });
      return { id: t.id, name: t.name, assigned, arrived };
    });
    return rows
      .filter((r) => r.assigned > 0)
      .sort((a, b) => {
        const ca = a.arrived === a.assigned ? 1 : 0;
        const cb = b.arrived === b.assigned ? 1 : 0;
        if (ca !== cb) return ca - cb;
        return b.assigned - b.arrived - (a.assigned - a.arrived) || a.name.localeCompare(b.name, 'es', { numeric: true });
      });
  }, [snapshot]);

  const pending = useMemo(() => {
    if (!snapshot) return { rows: [], people: 0 };
    const tableNames = new Map(snapshot.tables.map((t) => [t.id, t.name]));
    let people = 0;
    const rows = snapshot.guests
      .filter((g) => g.status === 'confirmed')
      .map((g) => {
        const missing = g.count - arrivedCount(snapshot, g);
        people += missing;
        const tables = Array.from(new Set(g.seats.map((id) => (id ? tableNames.get(id) : null)).filter(Boolean))) as string[];
        return { g, missing, tables };
      })
      .filter((r) => r.missing > 0)
      .sort((a, b) => surnameSortKey(a.g.name).localeCompare(surnameSortKey(b.g.name), 'es'));
    return { rows, people };
  }, [snapshot]);

  const q = normalizeSearch(pendingQuery);
  const pendingRows = q ? pending.rows.filter((r) => normalizeSearch(r.g.name).includes(q) || r.tables.some((t) => normalizeSearch(t).includes(q))) : pending.rows;

  const eventDayOn = weddingData?.eventDay?.enabled === true;
  const isFree = weddingData?.tier === 'free';
  const ago = updatedAt ? Math.max(0, Math.round((now - updatedAt) / 1000)) : null;
  const waText = link ? `Hola, este es el link para el check-in de la boda de ${snapshot?.wedding.bride || ''} y ${snapshot?.wedding.groom || ''}. Ábrelo en Safari o Chrome: ${link}` : '';

  if (!data && !error) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
      </div>
    );
  }

  return (
    <div style={manrope}>
      <AdminTopBar
        title={
          <span className="inline-flex items-center gap-2.5">
            Check-in
            {data?.enabled && !data.ended && <AdminStatusPill tone="active">En vivo</AdminStatusPill>}
            {data?.ended && <AdminStatusPill tone="draft">Terminado</AdminStatusPill>}
          </span>
        }
        actions={
          ago !== null ? (
            <span className="inline-flex items-center gap-1.5 text-[13px] text-[#71717A]">
              <RefreshCw className="h-3.5 w-3.5" />
              Se actualiza solo · hace {ago} s
            </span>
          ) : undefined
        }
      />
      <div className="px-4 sm:px-10 py-6 sm:py-7 space-y-[18px] max-w-[1200px]">
        {error && (
          <div className="flex gap-2.5 items-start bg-[#FFFBEB] border border-[#FDE68A] rounded-[10px] px-3.5 py-3 text-[13px] text-[#78350F]">
            <TriangleAlert className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#B45309]" />
            <span>{error}</span>
          </div>
        )}

        {data && (
          <>
            <section className={`${card} space-y-3.5`}>
              <div className="flex items-start gap-4">
                <Toggle on={data.enabled} onClick={toggle} disabled={saving} label="Activar check-in" />
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[15px] font-semibold text-[#0A0A0A]">Activar check-in</span>
                  <span className="text-[13px] leading-relaxed text-[#71717A]">
                    {data.enabled
                      ? isFree
                        ? 'Las hostess pueden usar su link y buscar a cada invitado por nombre.'
                        : 'Las hostess pueden usar su link. Cada invitado tiene su QR de entrada el día de la boda.'
                      : 'Al activarlo se crea el link para las hostess y cada invitado tiene su QR de entrada el día de la boda.'}
                  </span>
                </div>
                <span className={`hidden sm:inline-flex flex-shrink-0 h-[26px] items-center px-2.5 rounded-full text-xs font-semibold ${data.enabled ? 'bg-[#F0FDF4] text-[#15803D]' : 'bg-[#F4F4F5] text-[#52525B]'}`}>
                  {data.enabled ? 'Activo' : 'Apagado'}
                </span>
              </div>
              {data.ended && (
                <div className="flex gap-2.5 items-start bg-[#F4F4F5] rounded-[10px] px-3.5 py-3 text-[13px] text-[#3F3F46]">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>El check-in terminó (el link vence a las 23:59 del día siguiente a la boda). Los resultados quedan aquí.</span>
                </div>
              )}
              {data.enabled && !isFree && (
                <div className={`flex flex-wrap gap-3 items-start rounded-[12px] px-4 py-3.5 ${eventDayOn ? 'bg-[#F0FDF4]' : 'bg-[#EFF6FF]'}`}>
                  <QrCode className={`h-5 w-5 flex-shrink-0 ${eventDayOn ? 'text-[#15803D]' : 'text-[#1D4ED8]'}`} />
                  <div className={`flex-1 min-w-[220px] flex flex-col gap-1 text-[13px] leading-relaxed ${eventDayOn ? 'text-[#14532D]' : 'text-[#1E3A8A]'}`}>
                    <span className="text-sm font-semibold">
                      {eventDayOn ? 'Tus invitados ven su QR de entrada dentro de su pase' : 'Tus invitados ven su QR de entrada en un botón de su invitación'}
                    </span>
                    <span>
                      {eventDayOn
                        ? 'El día de la boda, el pase de cada invitado muestra su mesa, el plano y su QR de entrada. Si lo cierran, lo vuelven a abrir con “Mi pase”.'
                        : 'El día de la boda, cada link personal muestra “Mi QR de entrada”. Si activas Día del evento, el QR va dentro de su pase junto con su mesa y el plano.'}
                    </span>
                  </div>
                  {!eventDayOn && (
                    <a href={`/${locale}/admin/panel/${weddingId}/editor`} className="flex-shrink-0 inline-flex h-9 items-center px-3 rounded-lg border border-[rgba(29,78,216,0.3)] bg-white text-[13px] font-semibold text-[#1D4ED8] no-underline">
                      Ir a Día del evento
                    </a>
                  )}
                </div>
              )}
            </section>

            {data.enabled && link && (
              <div className="grid gap-[18px] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <section className={`${card} flex flex-col gap-3.5`}>
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-semibold text-[#0A0A0A]">Link para hostess</h3>
                    <p className="text-[13px] leading-relaxed text-[#71717A]">
                      Mándalo a quien estará en la entrada. No necesita cuenta. Varias personas pueden usarlo a la vez. Pídeles abrirlo en Safari o Chrome antes del evento y aceptar la cámara.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1 min-w-0 w-full flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 h-[46px] px-3 bg-[#FAFAFA] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[13px] text-[#3F3F46] overflow-hidden">
                        <span className="truncate">{link.replace(/^https?:\/\//, '')}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={copy} className={`${smallBtn} bg-[#111111] text-white`}>
                          <Copy className="h-3.5 w-3.5" />
                          {copied ? 'Copiado' : 'Copiar link'}
                        </button>
                        <a href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer" className={`${smallBtn} border border-[rgba(0,0,0,0.14)] bg-white text-[#0A0A0A]`}>
                          <Share2 className="h-3.5 w-3.5" />
                          Compartir por WhatsApp
                        </a>
                        <a href={link} target="_blank" rel="noopener noreferrer" className={`${smallBtn} border border-[rgba(0,0,0,0.14)] bg-white text-[#0A0A0A]`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          Abrir modo hostess
                        </a>
                      </div>
                    </div>
                    {qrUrl && (
                      <div className="flex flex-col items-center gap-1.5 p-2.5 border border-[rgba(0,0,0,0.1)] rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrUrl} alt="QR del link para hostess" width={132} height={132} />
                        <span className="text-[11px] text-[#71717A] text-center max-w-[140px]">Escanéalo con el celular de la hostess</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-[rgba(0,0,0,0.06)]">
                    {confirmRotate ? (
                      <div className="flex flex-col gap-2.5 bg-[#FEF2F2] border border-[rgba(185,28,28,0.2)] rounded-[10px] px-3.5 py-3">
                        <span className="text-[13px] leading-relaxed text-[#7F1D1D]">
                          El link anterior dejará de funcionar de inmediato. Si alguna hostess tiene cambios sin enviar (sin señal), ya no se podrán enviar con ese link. ¿Generar uno nuevo?
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setConfirmRotate(false)} className={`${smallBtn} border border-[rgba(0,0,0,0.14)] bg-white text-[#0A0A0A]`}>
                            Cancelar
                          </button>
                          <button type="button" onClick={rotate} disabled={saving} className={`${smallBtn} bg-[#B91C1C] text-white disabled:opacity-60`}>
                            <RefreshCw className="h-3.5 w-3.5" />
                            Generar link nuevo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <span className="text-xs text-[#71717A]">¿Se compartió con alguien que no debía? Genera uno nuevo y el anterior deja de funcionar.</span>
                        <button type="button" onClick={() => setConfirmRotate(true)} className={`${smallBtn} h-9 border border-[rgba(185,28,28,0.3)] bg-white text-[#B91C1C]`}>
                          <RefreshCw className="h-3.5 w-3.5" />
                          Generar link nuevo
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                <section className={`${card} flex flex-col gap-3`}>
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-semibold text-[#0A0A0A]">Lista impresa de respaldo</h3>
                    <p className="text-[13px] leading-relaxed text-[#71717A]">Por si falla la señal o un celular. Imprímela antes de la boda.</p>
                  </div>
                  {/* Misma ventana y navegación interna: el panel ya está cargado, así no se ve el dashboard
                      un instante antes de la vista de impresión. */}
                  <Link href={`/${locale}/admin/panel/${weddingId}/checkin/imprimir?orden=apellido`} className={`${smallBtn} h-[42px] border border-[rgba(0,0,0,0.14)] text-[#0A0A0A]`}>
                    <Printer className="h-4 w-4" />
                    Imprimir por apellido
                  </Link>
                  <Link href={`/${locale}/admin/panel/${weddingId}/checkin/imprimir?orden=mesa`} className={`${smallBtn} h-[42px] border border-[rgba(0,0,0,0.14)] text-[#0A0A0A]`}>
                    <Printer className="h-4 w-4" />
                    Imprimir por mesa
                  </Link>
                </section>
              </div>
            )}

            {!data.enabled && (
              <section className={`${card} space-y-3`}>
                <h3 className="text-[15px] font-semibold text-[#0A0A0A]">Así funciona el día de la boda</h3>
                <ol className="list-decimal pl-5 space-y-2.5 text-sm leading-relaxed text-[#3F3F46]">
                  <li>Activa el check-in y manda el link a quien estará en la entrada. No necesita cuenta.</li>
                  <li>{isFree ? 'La hostess busca a cada invitado por nombre o apellido.' : 'Cada invitado tiene un QR de entrada. La hostess lo escanea, o lo busca por nombre o apellido.'}</li>
                  <li>La hostess marca quién llegó, puede cambiar a alguien de mesa y agregar a quien llegó sin invitación.</li>
                  <li>Aquí ves en vivo cuántos llegaron, qué mesas faltan y quién no ha llegado. Sin señal en el salón, los cambios se guardan y se envían solos.</li>
                </ol>
              </section>
            )}

            {stats && snapshot && snapshot.guests.length > 0 && (data.enabled || stats.arrivedTotal > 0) && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <AdminStatCard
                    icon={DoorOpen}
                    label="Llegaron"
                    tone="success"
                    value={
                      <span>
                        {stats.arrivedConfirmed} <span className="text-base font-medium text-[#71717A]">de {stats.expected}</span>
                      </span>
                    }
                  />
                  <AdminStatCard icon={Users} label="Invitaciones completas" value={`${stats.completeInvitations} de ${stats.totalInvitations}`} />
                  <AdminStatCard icon={Users} label="Agregados en la entrada" value={`${stats.walkIns}${stats.walkIns ? ` · ${stats.walkInPeople} pers.` : ''}`} />
                  <AdminStatCard icon={Users} label="Sin confirmar que llegaron" value={stats.arrivedOther} />
                </div>

                <div className="grid gap-[18px] lg:grid-cols-3">
                  <section className={`${card} flex flex-col gap-2`}>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[15px] font-semibold text-[#0A0A0A]">Avance por mesa</h3>
                      <span className="text-xs text-[#71717A]">Incompletas primero</span>
                    </div>
                    {byTable.length === 0 && <p className="text-[13px] text-[#71717A] py-2">Aún no hay personas sentadas en mesas.</p>}
                    {byTable.map((r) => {
                      const pct = Math.round((100 * r.arrived) / r.assigned);
                      const color = r.arrived === r.assigned ? '#15803D' : r.arrived === 0 ? '#A1A1AA' : '#F59E0B';
                      return (
                        <div key={r.id} className="flex flex-col gap-1.5 py-2.5 border-t border-[rgba(0,0,0,0.06)]">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-[#0A0A0A]">{r.name}</span>
                            <span className="text-[#3F3F46]">{r.arrived} de {r.assigned} llegaron</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#F4F4F5] overflow-hidden">
                            <div className="h-full" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </section>

                  <section className={`${card} flex flex-col gap-2`}>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[15px] font-semibold text-[#0A0A0A]">Faltan por llegar</h3>
                      <span className="text-xs text-[#71717A]">{pending.people} {pending.people === 1 ? 'persona' : 'personas'} de invitaciones confirmadas</span>
                    </div>
                    <label className="flex items-center gap-2 h-10 px-3 border border-[rgba(0,0,0,0.14)] rounded-lg">
                      <Search className="h-4 w-4 text-[#71717A]" />
                      <input value={pendingQuery} onChange={(e) => setPendingQuery(e.target.value)} placeholder="Buscar" aria-label="Buscar pendientes" className="flex-1 min-w-0 text-[13px] outline-none bg-transparent" />
                    </label>
                    <div className="max-h-[420px] overflow-y-auto">
                      {pendingRows.map(({ g, missing, tables }) => (
                        <div key={g.docId} className="flex flex-col gap-0.5 py-2.5 border-t border-[rgba(0,0,0,0.06)]">
                          <span className="text-sm font-semibold text-[#0A0A0A]">{g.name}</span>
                          <span className="text-xs text-[#71717A]">
                            {missing === g.count ? `${g.count} ${g.count === 1 ? 'persona' : 'personas'}` : `Faltan ${missing} de ${g.count}`} · {tables.length ? tables.join(', ') : 'Sin mesa'}
                          </span>
                        </div>
                      ))}
                      {pendingRows.length === 0 && <p className="text-[13px] text-[#71717A] py-2">{q ? 'Sin resultados.' : 'Ya llegaron todas las personas confirmadas.'}</p>}
                    </div>
                  </section>

                  <section className={`${card} flex flex-col gap-2`}>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[15px] font-semibold text-[#0A0A0A]">Actividad</h3>
                      <span className="text-xs text-[#71717A]">Últimas acciones de las hostess</span>
                    </div>
                    {data.activity.length === 0 && <p className="text-[13px] text-[#71717A] py-2">Todavía no hay actividad.</p>}
                    <div className="max-h-[460px] overflow-y-auto">
                      {data.activity.map((a, i) => (
                        <div key={a.id || `${a.at}-${i}`} className="flex gap-2.5 py-2.5 border-t border-[rgba(0,0,0,0.06)] text-[13px] leading-snug">
                          <span className="flex-shrink-0 w-10 text-[#71717A] tabular-nums">{time(a.at)}</span>
                          <span className="text-[#3F3F46]">
                            <span className="font-semibold text-[#0A0A0A]">{a.by}</span> {ACTIVITY_TEXT[a.type]?.(a) ?? ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

