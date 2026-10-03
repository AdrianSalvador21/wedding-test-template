// Utilidades de ocupación de mesas compartidas por la Cuadrícula y el Plano (spec 12).
// Spec 23: la ocupación ahora cuenta sub-asientos individuales (FirebaseTableSeat), no
// invitaciones completas — 1 sub-asiento ocupado = 1 lugar, sin importar de qué
// invitación venga ni si el resto de su grupo está en otra mesa.
import { FirebaseTableSeat } from '../../../src/types/wedding';

export type TableOccupancyState = 'empty' | 'space' | 'full' | 'over';

/** Mapa tableId -> personas sentadas (un sub-asiento = una persona). */
export function computeOccupancyByTable(seats: FirebaseTableSeat[]): Map<string, number> {
  const map = new Map<string, number>();
  seats.forEach((seat) => {
    if (!seat.tableId) return;
    map.set(seat.tableId, (map.get(seat.tableId) || 0) + 1);
  });
  return map;
}

export function getUnseatedCount(seats: FirebaseTableSeat[]): number {
  return seats.reduce((sum, seat) => (seat.tableId ? sum : sum + 1), 0);
}

/** Una mesa solo queda "excedida" reduciendo su capacidad después de asignar gente (spec 12, Decisiones). */
export function getOccupancyState(occupied: number, capacity: number): TableOccupancyState {
  if (occupied > capacity) return 'over';
  if (capacity > 0 && occupied === capacity) return 'full';
  if (occupied === 0) return 'empty';
  return 'space';
}

export const occupancyLabel: Record<TableOccupancyState, string> = {
  empty: 'Vacía',
  space: 'Con espacio',
  full: 'Completa',
  over: 'Excedida',
};

export const occupancyColor: Record<TableOccupancyState, { border: string; text: string; bar: string; bg?: string }> = {
  empty: { border: '#D4D4D8', text: '#9CA3AF', bar: '#F4F4F5' },
  space: { border: 'rgba(0,0,0,0.08)', text: '#71717A', bar: '#0A0A0A' },
  full: { border: 'rgba(21,128,61,0.35)', text: '#15803D', bar: '#15803D' },
  over: { border: 'rgba(185,28,28,0.35)', text: '#B91C1C', bar: '#B91C1C', bg: 'rgba(185,28,28,0.03)' },
};

// Puntos de asiento de la Cuadrícula (spec 13): reemplaza la barra de progreso por un
// punto lleno/vacío por asiento. Con más de 12 asientos no caben uno a uno, así que se
// dibujan 12 proporcionales a la ocupación y el resto de la capacidad se resume en
// "overflowLabel"; si la mesa está excedida (occupied > capacity, ver arriba) el
// excedente también se resume ahí en vez de dibujar más puntos de la cuenta.
export type SeatDot = 'filled' | 'empty';

const MAX_SEAT_DOTS = 12;

export function getSeatDots(occupied: number, capacity: number): { dots: SeatDot[]; overflowLabel: string | null } {
  if (capacity <= MAX_SEAT_DOTS) {
    const dots: SeatDot[] = Array.from({ length: capacity }, (_, i) => (i < occupied ? 'filled' : 'empty'));
    const overflow = occupied - capacity;
    return { dots, overflowLabel: overflow > 0 ? `+${overflow}` : null };
  }

  const filledCount = Math.round((Math.min(occupied, capacity) / capacity) * MAX_SEAT_DOTS);
  const dots: SeatDot[] = Array.from({ length: MAX_SEAT_DOTS }, (_, i) => (i < filledCount ? 'filled' : 'empty'));
  return { dots, overflowLabel: `+${capacity - MAX_SEAT_DOTS}` };
}
