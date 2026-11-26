// Spec 32 — modo "Día del evento": ventana en la que el link personal abre el pase del invitado
// (funciones puras). Usa la misma base horaria que el álbum (spec 29): hora de la Ciudad de México.

import type { EventDayConfig } from '../src/types/wedding';
import { mexicoCityTime, weddingDay, type AlbumWeddingLike } from './album';

export interface EventDayWeddingLike extends AlbumWeddingLike {
  eventDay?: Partial<EventDayConfig> | null;
}

// Valores al habilitar el modo por primera vez desde el Editor.
export const DEFAULT_EVENT_DAY: EventDayConfig = {
  enabled: false,
  showTable: true,
  showFloorPlan: true,
  showAlbum: true,
};

// 00:00 del día de la boda, hora CDMX.
export function eventDayStartsAt(wedding: EventDayWeddingLike): Date | null {
  const day = weddingDay(wedding);
  return day ? mexicoCityTime(day.y, day.m, day.d, 0) : null;
}

// 06:00 del día siguiente, hora CDMX: cubre bodas que terminan de madrugada.
export function eventDayEndsAt(wedding: EventDayWeddingLike): Date | null {
  const day = weddingDay(wedding);
  return day ? mexicoCityTime(day.y, day.m, day.d + 1, 6) : null;
}

export function isEventDayEnabled(wedding: EventDayWeddingLike): boolean {
  return wedding.eventDay?.enabled === true;
}

// Spec 33 — solo la ventana (00:00 del día de la boda a 06:00 del día siguiente, hora CDMX), sin
// mirar si "Día del evento" está habilitado: el QR de entrada depende solo del check-in.
export function isInEventDayWindow(wedding: EventDayWeddingLike, now: Date = new Date()): boolean {
  const starts = eventDayStartsAt(wedding);
  const ends = eventDayEndsAt(wedding);
  if (!starts || !ends) return false;
  const t = now.getTime();
  return t >= starts.getTime() && t < ends.getTime();
}

// Habilitado y dentro de la ventana. Sin `event.date` nunca se activa.
export function isEventDayActive(wedding: EventDayWeddingLike, now: Date = new Date()): boolean {
  return isEventDayEnabled(wedding) && isInEventDayWindow(wedding, now);
}

// Configuración completa con los valores por defecto para campos que falten.
export function eventDayConfig(wedding: EventDayWeddingLike): EventDayConfig {
  return { ...DEFAULT_EVENT_DAY, ...(wedding.eventDay ?? {}) } as EventDayConfig;
}
