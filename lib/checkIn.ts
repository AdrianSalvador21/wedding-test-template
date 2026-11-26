// Spec 33 — check-in el día del evento: lógica pura compartida por el servidor, el modo hostess y
// el panel. Sin dependencias de Firebase.

import type { CheckInOp, CheckInSnapshot, CheckInSnapshotGuest } from '../src/types/wedding';
import { mexicoCityTime, weddingDay, type AlbumWeddingLike } from './album';

export const CHECKIN_MAX_PEOPLE = 10;
export const CHECKIN_MAX_OPS = 200;
export const CHECKIN_POLL_MS = 10_000;

export const checkInKey = (guestDocId: string, seatIndex: number) => `${guestDocId}__${seatIndex}`;
export const checkInDocId = (weddingId: string, guestDocId: string, seatIndex: number) => `${weddingId}__${guestDocId}__${seatIndex}`;
export const walkInDocId = (opId: string) => `door_${opId}`;

// El link de hostess vence a las 23:59:59 del día siguiente a la boda (hora CDMX). Sin fecha, no vence.
export function checkInEndsAt(wedding: AlbumWeddingLike): Date | null {
  const day = weddingDay(wedding);
  return day ? mexicoCityTime(day.y, day.m, day.d + 1, 23, 59, 59) : null;
}

export function isCheckInEnded(wedding: AlbumWeddingLike, now: Date = new Date()): boolean {
  const ends = checkInEndsAt(wedding);
  return !!ends && now.getTime() > ends.getTime();
}

// Mismo formato de id de URL que `guestService.generateGuestId` (nombre-sufijo).
export function guestUrlId(name: string, suffix: string): string {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${clean || 'invitado'}-${suffix}`;
}

// ---------- búsqueda y orden ----------

export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// "Carlos Hernández López" → "hernandez lopez carlos"; "Familia Pérez" → "perez familia".
export function surnameSortKey(name: string): string {
  const words = normalizeSearch(name).split(' ').filter(Boolean);
  if (words.length <= 1) return words[0] || '';
  return `${words.slice(1).join(' ')} ${words[0]}`;
}

// Cada palabra buscada debe ser el inicio de alguna palabra del nombre o de una de sus mesas.
export function matchesSearch(guest: CheckInSnapshotGuest, tableNames: Map<string, string>, query: string): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  const haystack = [guest.name, guest.plusOneName || '', ...guest.seats.map((id) => (id ? tableNames.get(id) || '' : ''))]
    .map(normalizeSearch)
    .join(' ')
    .split(' ')
    .filter(Boolean);
  return q.split(' ').every((word) => haystack.some((h) => h.startsWith(word)));
}

// ---------- QR ----------

// Lee el link personal del QR de entrada: `…/(es|en)/wedding/{weddingId}?guest={guestId}`.
export function parseGuestQr(text: string): { weddingId: string; guestId: string } | null {
  const raw = (text || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const match = /\/wedding\/([^/?#]+)/.exec(url.pathname);
    const guestId = url.searchParams.get('guest');
    if (!match || !guestId) return null;
    return { weddingId: decodeURIComponent(match[1]), guestId };
  } catch {
    return null;
  }
}

// ---------- personas ----------

export function personLabel(guest: CheckInSnapshotGuest, seatIndex: number): string {
  if (seatIndex === 0) return guest.name;
  if (seatIndex === 1 && guest.plusOneName) return guest.plusOneName;
  return `Acompañante ${seatIndex}`;
}

export function isArrived(snapshot: CheckInSnapshot, guestDocId: string, seatIndex: number): boolean {
  return snapshot.checkIns[checkInKey(guestDocId, seatIndex)]?.arrived === true;
}

export function arrivedCount(snapshot: CheckInSnapshot, guest: CheckInSnapshotGuest): number {
  let n = 0;
  for (let i = 0; i < guest.count; i += 1) if (isArrived(snapshot, guest.docId, i)) n += 1;
  return n;
}

// Personas por mesa (un asiento = una persona), igual que Mesas (`computeOccupancyByTable`).
export function tableOccupancy(snapshot: CheckInSnapshot): Map<string, number> {
  const map = new Map<string, number>();
  snapshot.guests.forEach((g) => {
    for (let i = 0; i < g.count; i += 1) {
      const id = g.seats[i];
      if (id) map.set(id, (map.get(id) || 0) + 1);
    }
  });
  return map;
}

// ---------- conteos ----------

export interface CheckInStats {
  expected: number; // personas de invitaciones confirmadas
  arrivedConfirmed: number; // llegadas de invitaciones confirmadas
  arrivedOther: number; // llegadas de pendientes o declinadas ("sin confirmar")
  arrivedTotal: number;
  completeInvitations: number;
  totalInvitations: number;
  walkIns: number;
  walkInPeople: number;
  declinedArrived: number; // invitaciones declinadas con al menos una llegada
  declinedArrivedPeople: number;
}

export function countStats(snapshot: CheckInSnapshot): CheckInStats {
  const s: CheckInStats = {
    expected: 0, arrivedConfirmed: 0, arrivedOther: 0, arrivedTotal: 0, completeInvitations: 0,
    totalInvitations: snapshot.guests.length, walkIns: 0, walkInPeople: 0, declinedArrived: 0, declinedArrivedPeople: 0,
  };
  snapshot.guests.forEach((g) => {
    const a = arrivedCount(snapshot, g);
    if (g.status === 'confirmed') {
      s.expected += g.count;
      s.arrivedConfirmed += a;
    } else {
      s.arrivedOther += a;
    }
    s.arrivedTotal += a;
    if (g.count > 0 && a === g.count) s.completeInvitations += 1;
    if (g.addedAtDoor) {
      s.walkIns += 1;
      s.walkInPeople += g.count;
    }
    if (g.status === 'declined' && a > 0) {
      s.declinedArrived += 1;
      s.declinedArrivedPeople += a;
    }
  });
  return s;
}

// ---------- acciones encima de la foto (modo hostess, también sin conexión) ----------

// Aplica las acciones pendientes sobre la última foto del servidor: lo que la hostess ve es siempre
// "foto + pendientes". Gana la acción más reciente, igual que en el servidor.
export function applyOps(snapshot: CheckInSnapshot, ops: CheckInOp[]): CheckInSnapshot {
  if (ops.length === 0) return snapshot;
  const next: CheckInSnapshot = {
    ...snapshot,
    guests: snapshot.guests.map((g) => ({ ...g, seats: [...g.seats] })),
    checkIns: { ...snapshot.checkIns },
  };
  const byId = new Map(next.guests.map((g) => [g.docId, g]));
  for (const op of ops) {
    if (op.type === 'walkIn') {
      const docId = walkInDocId(op.opId);
      if (byId.has(docId)) continue;
      const guest: CheckInSnapshotGuest = {
        docId,
        guestId: docId,
        name: op.name,
        status: 'confirmed',
        count: op.count,
        seats: Array.from({ length: op.count }, () => op.tableId),
        plusOneName: null,
        addedAtDoor: true,
      };
      next.guests.push(guest);
      byId.set(docId, guest);
      for (let i = 0; i < op.count; i += 1) next.checkIns[checkInKey(docId, i)] = { arrived: true, at: op.at, arrivedAt: op.at, by: op.by };
      continue;
    }
    const guest = byId.get(op.guestDocId);
    if (!guest || op.seatIndex < 0 || op.seatIndex >= guest.count) continue;
    if (op.type === 'move') {
      guest.seats[op.seatIndex] = op.tableId;
      continue;
    }
    const key = checkInKey(op.guestDocId, op.seatIndex);
    const current = next.checkIns[key];
    if (current && current.at > op.at) continue;
    next.checkIns[key] = {
      arrived: op.type === 'arrive',
      at: op.at,
      arrivedAt: op.type === 'arrive' ? op.at : current?.arrivedAt,
      by: op.by,
    };
  }
  return next;
}

// Nombres de las personas afectadas por acciones que ya no se pudieron enviar.
export function opsAffectedNames(snapshot: CheckInSnapshot, ops: CheckInOp[]): string[] {
  const byId = new Map(snapshot.guests.map((g) => [g.docId, g]));
  const names = new Set<string>();
  ops.forEach((op) => {
    if (op.type === 'walkIn') names.add(op.name);
    else {
      const g = byId.get(op.guestDocId);
      if (g) names.add(personLabel(g, op.seatIndex));
    }
  });
  return Array.from(names);
}

// Validación de forma de una acción recibida por la ruta de servidor.
export function isValidOp(value: unknown): value is CheckInOp {
  if (!value || typeof value !== 'object') return false;
  const op = value as Record<string, unknown>;
  const str = (v: unknown, max = 200) => typeof v === 'string' && v.length > 0 && v.length <= max;
  if (!str(op.opId, 64) || !/^[A-Za-z0-9_-]+$/.test(op.opId as string)) return false;
  if (!str(op.at, 40) || Number.isNaN(Date.parse(op.at as string))) return false;
  if (!str(op.by, 60)) return false;
  if (op.type === 'arrive' || op.type === 'undo' || op.type === 'move') {
    if (!str(op.guestDocId, 120) || typeof op.seatIndex !== 'number' || !Number.isInteger(op.seatIndex) || op.seatIndex < 0 || op.seatIndex > 50) return false;
    if (op.type === 'move' && !(op.tableId === null || str(op.tableId, 120))) return false;
    return true;
  }
  if (op.type === 'walkIn') {
    return str(op.name, 120) && typeof op.count === 'number' && Number.isInteger(op.count) && op.count >= 1 && op.count <= CHECKIN_MAX_PEOPLE && (op.tableId === null || str(op.tableId, 120));
  }
  return false;
}
