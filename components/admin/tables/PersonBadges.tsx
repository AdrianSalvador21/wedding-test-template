'use client';

// Piezas visuales compartidas para representar a una PERSONA individual (spec 23) en
// Mesas: avatar con iniciales, pill de estado RSVP y el ícono con iniciales que usa el
// Plano alrededor de cada mesa. Centralizadas aquí para que Cuadrícula, el panel de
// asignación y el Plano se vean consistentes entre sí.
import React from 'react';
import type { AttendanceStatus } from '../../../services/guestService';

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const STATUS_STYLES: Record<AttendanceStatus, { label: string; bg: string; text: string; dot: string }> = {
  confirmed: { label: 'Confirmado', bg: 'rgba(21,128,61,0.1)', text: '#15803D', dot: '#15803D' },
  pending: { label: 'Pendiente', bg: 'rgba(180,131,15,0.12)', text: '#92650D', dot: '#B4830F' },
  declined: { label: 'Declinado', bg: '#F4F4F5', text: '#71717A', dot: '#A1A1AA' },
};

export { STATUS_STYLES };

export function Avatar({ name, size = 26 }: { name: string; size?: number }) {
  return (
    <span
      className="flex-shrink-0 rounded-full bg-[#EEEEF0] text-[#3F3F46] font-extrabold flex items-center justify-center"
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.38) }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}

export function StatusPill({ status }: { status: AttendanceStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="flex-shrink-0 text-[10.5px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

export function StatusDot({ status }: { status: AttendanceStatus }) {
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_STYLES[status].dot }} />;
}

/** Ícono de persona del Plano (spec 23): iniciales en vez de la silueta genérica. */
export function SeatInitialsIcon({ name, size, color }: { name: string; size: number; color: string }) {
  return (
    <span
      className="flex items-center justify-center rounded-full bg-white font-extrabold"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(7, size * 0.4),
        color,
        border: `1.5px solid ${color}`,
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
