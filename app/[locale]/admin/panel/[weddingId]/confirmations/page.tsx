'use client';

import { useMemo, useState } from 'react';
import { Check, Clock, Users } from 'lucide-react';
import { usePanelData, computeGuestStats } from '../../../../../../components/admin/panel/PanelDataContext';
import { resolveGuestAttendance } from '../../../../../../services/guestService';
import { manrope, displayFont, AdminStatCard, AdminStatusPill } from '../../../../../../components/admin/ui';

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'declined';

const STATUS_LABEL: Record<'confirmed' | 'pending' | 'declined', string> = {
  confirmed: 'Confirmado',
  pending: 'Pendiente',
  declined: 'Declinado',
};

const STATUS_TONE: Record<'confirmed' | 'pending' | 'declined', 'confirmed' | 'pending' | 'declined'> = {
  confirmed: 'confirmed',
  pending: 'pending',
  declined: 'declined',
};

export default function ConfirmationsPage() {
  const { weddingData, guests } = usePanelData();
  const [filter, setFilter] = useState<FilterStatus>('all');

  const stats = useMemo(() => computeGuestStats(guests), [guests]);

  const confirmedPct = stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0;
  const declinedPct = stats.total > 0 ? Math.round((stats.declined / stats.total) * 100) : 0;
  const pendingPct = Math.max(0, 100 - confirmedPct - declinedPct);

  const filteredGuests = useMemo(() => {
    if (filter === 'all') return guests;
    return guests.filter((g) => resolveGuestAttendance(g) === filter);
  }, [guests, filter]);

  const coupleTitle = [weddingData?.couple?.bride?.name, weddingData?.couple?.groom?.name].filter(Boolean).join(' & ') || weddingData?.id || '';

  const filters: { id: FilterStatus; label: string; count: number }[] = [
    { id: 'all', label: 'Todos', count: stats.total },
    { id: 'confirmed', label: 'Confirmados', count: stats.confirmed },
    { id: 'pending', label: 'Pendientes', count: stats.pending },
    { id: 'declined', label: 'Declinados', count: stats.declined },
  ];

  return (
    <main className="flex-1 px-4 sm:px-8 py-8 box-border w-full max-w-[1280px]" style={manrope}>
      <div className="mb-6">
        <div className="text-[11px] font-extrabold tracking-[0.08em] text-[#AE5730] uppercase mb-1.5">{coupleTitle}</div>
        <h1 className="m-0 text-[24px] sm:text-[28px] text-[#0A0A0A]" style={displayFont}>Confirmaciones</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-7">
        <AdminStatCard icon={Users} label="Total invitaciones" value={stats.total} tone="ink" />
        <AdminStatCard icon={Check} label="Confirmadas" value={stats.confirmed} tone="success" />
        <AdminStatCard icon={Clock} label="Pendientes" value={stats.pending} tone="pending" />
        <AdminStatCard icon={Users} label="Personas invitadas" value={stats.totalGuestCount} tone="accent" />
        <AdminStatCard icon={Check} label="Personas confirmadas" value={stats.totalConfirmedPersons} tone="success" />
      </div>

      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-7 sm:p-9 mb-8">
        <div className="text-base font-extrabold text-[#0A0A0A] mb-2">Resumen de confirmaciones</div>
        <div className="text-[13px] text-[#71717A] mb-7">
          {stats.confirmed} de {stats.total} invitaciones confirmaron · tasa de confirmación {confirmedPct}%
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-[#F4F4F5] mb-7">
          <div className="h-full bg-[#15803D]" style={{ width: `${confirmedPct}%` }} />
          <div className="h-full bg-[#475569]" style={{ width: `${pendingPct}%` }} />
          <div className="h-full bg-[#B91C1C]" style={{ width: `${declinedPct}%` }} />
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-3 text-[13px] text-[#3F3F46] font-semibold">
          <span className="flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded-full bg-[#15803D] flex-shrink-0" />Confirmados — <span className="font-extrabold text-[#0A0A0A]">{stats.confirmed} ({confirmedPct}%)</span></span>
          <span className="flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded-full bg-[#475569] flex-shrink-0" />Pendientes — <span className="font-extrabold text-[#0A0A0A]">{stats.pending} ({pendingPct}%)</span></span>
          <span className="flex items-center gap-2.5"><span className="w-2.5 h-2.5 rounded-full bg-[#B91C1C] flex-shrink-0" />Declinados — <span className="font-extrabold text-[#0A0A0A]">{stats.declined} ({declinedPct}%)</span></span>
        </div>
      </div>

      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm font-extrabold text-[#0A0A0A]">Invitados</span>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`text-[13px] px-3.5 py-1.5 rounded-full border transition-colors ${
                  filter === f.id
                    ? 'bg-[#AE5730] text-white border-[#AE5730] font-bold'
                    : 'bg-[#FAFAFA] text-[#3F3F46] border-[rgba(0,0,0,0.1)] font-semibold'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>
        {filteredGuests.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#71717A] text-sm">No hay invitados en este filtro.</div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr] gap-3 px-5 py-3 bg-[#FAFAFA] text-[11px] font-extrabold tracking-[0.04em] text-[#71717A] uppercase">
              <span>Invitado</span>
              <span>Personas</span>
              <span>Estado</span>
            </div>
            {filteredGuests.map((guest) => {
              const status = resolveGuestAttendance(guest);
              return (
                <div key={guest.id} className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr] gap-3 px-5 py-3.5 border-t border-[rgba(0,0,0,0.06)] items-center">
                  <span className="text-[13px] font-bold text-[#0A0A0A]">{guest.name}</span>
                  <span className="text-[13px] text-[#3F3F46]">{guest.rsvpConfirmation?.guestCount || guest.guestCount || 1} personas</span>
                  <span className="justify-self-start">
                    <AdminStatusPill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</AdminStatusPill>
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </main>
  );
}
