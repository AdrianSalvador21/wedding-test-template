'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Activity, CalendarDays, CheckSquare, MapPin, MessageSquare, Table2, UserPlus, UtensilsCrossed, XCircle } from 'lucide-react';
import { usePanelData, computeGuestStats, computeTableStats } from '../../../../../../components/admin/panel/PanelDataContext';
import { getSeatedGuestCount } from '../../../../../../services/guestService';
import { activityService, type ActivityLogEntry, type ActivityType } from '../../../../../../services/activityService';
import { manrope, displayFont, AdminStatusPill } from '../../../../../../components/admin/ui';

const DIET_LABELS: Record<string, string> = {
  vegetarian: 'Vegetariano',
  glutenFree: 'Sin gluten',
  other: 'Otro',
};

const ACTIVITY_ICON: Record<ActivityType, typeof UserPlus> = {
  guest_added: UserPlus,
  guest_confirmed: CheckSquare,
  guest_declined: XCircle,
};

const ACTIVITY_COLOR: Record<ActivityType, string> = {
  guest_added: '#0A0A0A',
  guest_confirmed: '#15803D',
  guest_declined: '#B91C1C',
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'justo ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function DashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  const { weddingId, weddingData, guests, tables } = usePanelData();

  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  useEffect(() => {
    if (!weddingId) return;
    let cancelled = false;
    activityService.getRecentActivity(weddingId, 6).then((entries) => {
      if (!cancelled) setRecentActivity(entries);
    });
    return () => {
      cancelled = true;
    };
  }, [weddingId]);

  const recentMessages = useMemo(() => {
    return guests
      .filter((g) => !!g.rsvpConfirmation?.message)
      .sort((a, b) => new Date(b.rsvpConfirmation!.submittedAt).getTime() - new Date(a.rsvpConfirmation!.submittedAt).getTime())
      .slice(0, 5);
  }, [guests]);

  const guestStats = useMemo(() => computeGuestStats(guests), [guests]);
  const tableStats = useMemo(() => computeTableStats(tables, guests), [tables, guests]);

  const confirmedPct = guestStats.total > 0 ? Math.round((guestStats.confirmed / guestStats.total) * 100) : 0;
  const declinedPct = guestStats.total > 0 ? Math.round((guestStats.declined / guestStats.total) * 100) : 0;
  const pendingPct = Math.max(0, 100 - confirmedPct - declinedPct);

  const freeSeats = Math.max(0, tableStats.totalCapacity - tableStats.seatedGuests);
  const tablePreview = useMemo(() => {
    return tables.slice(0, 2).map((table) => {
      const occupied = guests
        .filter((g) => g.tableId === table.id)
        .reduce((sum, g) => sum + getSeatedGuestCount(g), 0);
      return { id: table.id, name: table.name, occupied, capacity: table.capacity };
    });
  }, [tables, guests]);

  const dietBreakdown = useMemo(() => {
    const counts: Record<string, number> = { vegetarian: 0, glutenFree: 0, other: 0 };
    let total = 0;
    guests.forEach((g) => {
      if (g.rsvpConfirmation?.attending !== true && g.rsvpStatus !== 'confirmed') return;
      const value = g.rsvpConfirmation?.dietaryRestriction;
      if (value && counts[value] !== undefined) {
        counts[value] += 1;
        total += 1;
      }
    });
    return { counts, total };
  }, [guests]);

  const confirmedPersons = guestStats.totalConfirmedPersons;

  const daysToEvent = useMemo(() => {
    if (!weddingData?.event?.date) return null;
    const diffMs = new Date(weddingData.event.date).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [weddingData?.event?.date]);

  const eventDateLabel = weddingData?.event?.date
    ? new Date(weddingData.event.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const venueLabel = weddingData?.event?.receptionVenue?.name?.es || weddingData?.event?.ceremonyVenue?.name?.es || null;
  const coupleTitle = [weddingData?.couple?.bride?.name, weddingData?.couple?.groom?.name].filter(Boolean).join(' & ') || weddingData?.id || '';

  return (
    <main className="flex-1 px-4 sm:px-8 py-8 box-border w-full max-w-[1280px]" style={manrope}>
      <div className="flex items-start justify-between gap-6 flex-wrap mb-7">
        <div>
          <div className="text-[11px] font-extrabold tracking-[0.08em] text-[#AE5730] uppercase mb-1.5">Panorama general</div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="m-0 text-[28px] sm:text-[32px] text-[#0A0A0A] leading-tight" style={displayFont}>{coupleTitle}</h1>
            <AdminStatusPill tone={weddingData?.isActive ? 'active' : 'draft'}>
              {weddingData?.isActive ? 'Activa' : 'Borrador'}
            </AdminStatusPill>
          </div>
          <div className="flex items-center gap-3.5 flex-wrap mt-2.5">
            {eventDateLabel && (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-[#3F3F46] font-semibold">
                <CalendarDays className="h-3.5 w-3.5 text-[#C6663C]" />
                {eventDateLabel}
              </span>
            )}
            {venueLabel && (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-[#3F3F46] font-semibold">
                <MapPin className="h-3.5 w-3.5 text-[#C6663C]" />
                {venueLabel}
              </span>
            )}
          </div>
        </div>
        {daysToEvent !== null && (
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="w-px self-stretch bg-[rgba(0,0,0,0.08)]" />
            <div className="text-right">
              <div className="text-[10px] font-extrabold tracking-[0.1em] text-[#71717A] uppercase mb-1.5">Cuenta regresiva</div>
              <div className="flex items-center gap-2.5 justify-end">
                <span className="text-[52px] leading-none text-[#AE5730] tracking-[-0.03em]" style={displayFont}>{daysToEvent}</span>
                <span className="text-[13px] text-[#3F3F46] font-bold leading-tight text-left max-w-[60px]">
                  días<br />para el<br />gran día
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <a
          href={`/${locale}/admin/panel/${weddingData?.id}/confirmations`}
          className="block no-underline text-inherit bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3.5">
            <CheckSquare className="h-3.5 w-3.5 text-[#AE5730]" />
            <span className="text-[11px] font-extrabold tracking-[0.08em] text-[#AE5730] uppercase">Confirmaciones</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3.5">
            <span className="text-[28px] text-[#AE5730] font-semibold">{confirmedPct}%</span>
            <span className="text-[13px] text-[#71717A] font-semibold">{guestStats.confirmed} de {guestStats.total} confirmados</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-[#F4F4F5] mb-3.5">
            <div className="h-full bg-[#15803D]" style={{ width: `${confirmedPct}%` }} />
            <div className="h-full bg-[#475569]" style={{ width: `${pendingPct}%` }} />
            <div className="h-full bg-[#B91C1C]" style={{ width: `${declinedPct}%` }} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[13px] text-[#3F3F46] font-semibold">
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />Confirmados</span>
              <span className="font-extrabold text-[#0A0A0A]">{guestStats.confirmed}</span>
            </div>
            <div className="flex items-center justify-between text-[13px] text-[#3F3F46] font-semibold">
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#475569]" />Pendientes</span>
              <span className="font-extrabold text-[#0A0A0A]">{guestStats.pending}</span>
            </div>
            <div className="flex items-center justify-between text-[13px] text-[#3F3F46] font-semibold">
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />Declinados</span>
              <span className="font-extrabold text-[#0A0A0A]">{guestStats.declined}</span>
            </div>
          </div>
        </a>

        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <Table2 className="h-3.5 w-3.5 text-[#AE5730]" />
            <span className="text-[11px] font-extrabold tracking-[0.08em] text-[#AE5730] uppercase">Asignación de mesas</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3.5">
            <span className="text-[28px] text-[#AE5730] font-semibold">{tableStats.seatedGuests}</span>
            <span className="text-[13px] text-[#71717A] font-semibold">de {tableStats.totalCapacity} confirmados sentados</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-[#F4F4F5] mb-2.5">
            <div
              className="h-full bg-[#0A0A0A]"
              style={{ width: `${tableStats.totalCapacity > 0 ? Math.min(100, Math.round((tableStats.seatedGuests / tableStats.totalCapacity) * 100)) : 0}%` }}
            />
          </div>
          <div className="text-[12px] text-[#71717A] font-semibold mb-4">{freeSeats} lugares libres en total</div>
          {tablePreview.length > 0 ? (
            <div className="flex flex-col gap-2.5 border-t border-[rgba(0,0,0,0.06)] pt-3.5">
              {tablePreview.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-[13px] text-[#3F3F46] font-semibold">
                  <span>{t.name}</span>
                  <span className="font-extrabold text-[#0A0A0A]">{t.occupied}/{t.capacity}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-[#71717A]">Aún no hay mesas creadas.</p>
          )}
        </div>

        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <UtensilsCrossed className="h-3.5 w-3.5 text-[#AE5730]" />
            <span className="text-[11px] font-extrabold tracking-[0.08em] text-[#AE5730] uppercase">Restricciones alimenticias</span>
          </div>
          {weddingData?.hasDiet ? (
            <>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[28px] text-[#AE5730]" style={displayFont}>{dietBreakdown.total}</span>
                <span className="text-[13px] text-[#71717A] font-semibold">de {confirmedPersons} personas confirmadas</span>
              </div>
              <div className="flex flex-col gap-2">
                {Object.entries(dietBreakdown.counts).map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between text-[13px] text-[#3F3F46] font-semibold">
                    <span>{DIET_LABELS[key]}</span>
                    <span className="font-extrabold text-[#0A0A0A]">{count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[13px] text-[#71717A]">Esta boda no pregunta restricciones alimenticias.</p>
          )}
        </div>

        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <Activity className="h-3.5 w-3.5 text-[#AE5730]" />
            <span className="text-[11px] font-extrabold tracking-[0.08em] text-[#AE5730] uppercase">Actividad reciente</span>
          </div>
          {recentActivity.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentActivity.map((entry) => {
                const Icon = ACTIVITY_ICON[entry.type];
                return (
                  <div key={entry.id} className="flex items-start gap-2.5">
                    <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: ACTIVITY_COLOR[entry.type] }} />
                    <div className="min-w-0">
                      <div className="text-[13px] text-[#27272A] font-semibold leading-snug">{entry.message}</div>
                      <div className="text-[11px] text-[#9CA3AF] font-semibold mt-0.5">{formatRelativeTime(entry.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-[#71717A]">Aún no hay actividad registrada.</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 mt-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-3.5 w-3.5 text-[#AE5730]" />
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-[#AE5730] uppercase">Mensajes de los invitados</span>
        </div>
        {recentMessages.length > 0 ? (
          <div className="flex flex-col divide-y divide-[rgba(0,0,0,0.06)]">
            {recentMessages.map((guest) => (
              <div key={guest.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[13px] font-extrabold text-[#0A0A0A]">{guest.name}</span>
                  <span className="text-[11px] text-[#9CA3AF] font-semibold flex-shrink-0">{formatRelativeTime(guest.rsvpConfirmation!.submittedAt)}</span>
                </div>
                <p className="text-[13px] text-[#3F3F46] italic leading-relaxed">&ldquo;{guest.rsvpConfirmation!.message}&rdquo;</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#71717A]">Aún no hay mensajes de invitados.</p>
        )}
      </div>
    </main>
  );
}
