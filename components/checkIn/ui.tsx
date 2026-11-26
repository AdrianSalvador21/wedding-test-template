'use client';

import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import type { CheckInSnapshot, CheckInSnapshotGuest } from '../../src/types/wedding';
import { arrivedCount } from '../../lib/checkIn';
import type { FloorPlanTheme } from '../eventDay/EventDayFloorPlan';

// Spec 33 — piezas compartidas del modo hostess, con el estilo del panel (Manrope, neutros,
// terracota). Diseño: https://claude.ai/artifact/LsX2mwZckXyXXx8niHF9JJ

export const BTN_PRIMARY = 'inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#111111] px-4 text-[15px] font-semibold text-white disabled:opacity-50';
export const BTN_SECONDARY = 'inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(0,0,0,0.14)] bg-white px-4 text-[15px] font-semibold text-[#0A0A0A] disabled:opacity-50';
export const BTN_OK = 'inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#15803D] px-4 text-[15px] font-semibold text-white disabled:opacity-50';
export const BTN_WARN = 'inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#B45309] px-4 text-[14px] font-semibold text-white';
export const CARD = 'rounded-[14px] border border-[rgba(0,0,0,0.1)] bg-white';

type BadgeTone = 'ok' | 'warn' | 'grey' | 'door' | 'acc';
const BADGE: Record<BadgeTone, string> = {
  ok: 'bg-[#F0FDF4] text-[#15803D]',
  warn: 'bg-[#FFFBEB] text-[#78350F]',
  grey: 'bg-[#F4F4F5] text-[#52525B]',
  door: 'bg-[#EFF6FF] text-[#1D4ED8]',
  acc: 'bg-[rgba(198,102,60,0.08)] text-[#AE5730]',
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={`inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full px-2 text-[11px] font-semibold ${BADGE[tone]}`}>{children}</span>;
}

export function guestBadges(view: CheckInSnapshot, g: CheckInSnapshotGuest): { tone: BadgeTone; text: string }[] {
  const out: { tone: BadgeTone; text: string }[] = [];
  const a = arrivedCount(view, g);
  if (g.status === 'pending') out.push({ tone: 'warn', text: 'No confirmó' });
  if (g.status === 'declined') out.push({ tone: 'grey', text: a > 0 ? 'Declinó · llegó' : 'Declinó' });
  if (g.addedAtDoor) out.push({ tone: 'door', text: 'Agregado en la entrada' });
  return out;
}

export function StatusCircle({ arrived, count }: { arrived: number; count: number }) {
  if (count > 0 && arrived === count) {
    return (
      <span aria-label="Llegaron todos" className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[#15803D]">
        <Check className="h-5 w-5" strokeWidth={2.4} />
      </span>
    );
  }
  return (
    <span
      className={`box-border flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${arrived > 0 ? 'border-2 border-[#15803D] text-[#15803D]' : 'border-[1.5px] border-dashed border-[#A1A1AA] text-[#71717A]'}`}
    >
      {arrived}/{count}
    </span>
  );
}

export const tableNamesOf = (view: CheckInSnapshot) => new Map(view.tables.map((t) => [t.id, t.name]));

// Mesas de una invitación para la fila: "Mesa 7" o "Mesa 7, sin mesa".
export function seatsSummary(g: CheckInSnapshotGuest, names: Map<string, string>): string {
  const labels: string[] = [];
  for (let i = 0; i < g.count; i += 1) {
    const id = g.seats[i];
    const label = id ? names.get(id) || 'Mesa' : 'Sin mesa';
    if (!labels.includes(label)) labels.push(label);
  }
  return labels.join(', ') || 'Sin mesa';
}

export const time = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' }) : '';

// Plano del pase (spec 32) con un tema neutro del panel.
export const NEUTRAL_PLAN: FloorPlanTheme = {
  frame: 'rgba(0,0,0,0.1)',
  frameFill: '#FFFFFF',
  fixtureFill: '#F4F4F5',
  fixtureStroke: '#E4E4E7',
  fixtureText: '#71717A',
  fixtureRadius: 6,
  labelFont: 'var(--font-manrope), sans-serif',
  tableFill: '#FFFFFF',
  tableStroke: '#D4D4D8',
  tableText: '#71717A',
  numberFont: 'var(--font-manrope), sans-serif',
  highlightFill: '#AE5730',
  highlightText: '#FFFFFF',
  highlightRing: '#AE5730',
  youLabel: '#AE5730',
  segTrack: { border: '1px solid rgba(0,0,0,0.1)', borderRadius: 999 },
  segActive: { background: '#111111', color: '#FFFFFF', borderRadius: 999, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, fontWeight: 600 },
  segIdle: { background: 'transparent', color: '#3F3F46', borderRadius: 999, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, fontWeight: 600 },
  hint: { fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12, color: '#71717A' },
};

// Overlay: en celular ocupa toda la pantalla; en tablet vertical sube como hoja.
export function Overlay({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-[rgba(10,10,10,0.45)]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col overflow-hidden bg-[#FAFAFA] md:h-auto md:max-h-[85vh] md:rounded-t-[22px] md:shadow-[0_-16px_40px_rgba(0,0,0,0.18)]"
      >
        {children}
      </div>
    </div>
  );
}

// Modal centrado (tablet) / hoja desde abajo (celular).
export function Modal({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(10,10,10,0.45)] md:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-[20px] bg-white p-4 shadow-[0_-12px_30px_rgba(0,0,0,0.18)] md:w-[560px] md:rounded-[18px] md:p-7"
      >
        {children}
      </div>
    </div>
  );
}
