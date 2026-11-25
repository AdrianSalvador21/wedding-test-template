// Spec 29 — álbum de fotos de los invitados: fechas y fase del álbum (funciones puras).
// Todas las fechas se calculan en hora de la Ciudad de México. México dejó el horario de verano
// en 2022, así que la zona es UTC-6 todo el año y no hace falta una librería de zonas horarias.

import type { PhotoAlbumConfig } from '../src/types/wedding';

export const ALBUM_PHOTO_LIMIT = 30;
// Máximo de fotos por boda (incluidas las ocultas, que también ocupan espacio). Mantiene el costo
// de Storage y descargas en ~10 % del precio del álbum y evita abusos del QR general.
export const ALBUM_WEDDING_LIMIT = 2000;
export const ALBUM_TIME_ZONE = 'America/Mexico_City';
const MX_UTC_OFFSET_HOURS = 6;

export type AlbumPhase = 'disabled' | 'before' | 'open' | 'closed' | 'expired';
export type AlbumMode = PhotoAlbumConfig['mode'];

// Lo mínimo de una boda que necesitan estas funciones (sirve con WeddingData o con el documento crudo).
export interface AlbumWeddingLike {
  tier?: 'free' | 'template' | string;
  event?: { date?: string };
  photoAlbum?: Partial<PhotoAlbumConfig> | null;
}

// `event.date` se guarda como "YYYY-MM-DDT16:00:00.000Z": el día de la boda es la parte de la fecha.
function weddingDay(wedding: AlbumWeddingLike): { y: number; m: number; d: number } | null {
  const raw = wedding.event?.date;
  if (typeof raw !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

// Instante UTC de una hora local de la Ciudad de México. Date.UTC normaliza días fuera de rango.
function mexicoCityTime(y: number, m: number, d: number, h: number, min = 0, s = 0): Date {
  return new Date(Date.UTC(y, m - 1, d, h + MX_UTC_OFFSET_HOURS, min, s));
}

export function uploadOpensAt(wedding: AlbumWeddingLike): Date | null {
  const day = weddingDay(wedding);
  return day ? mexicoCityTime(day.y, day.m, day.d, 0) : null;
}

export function uploadClosesAt(wedding: AlbumWeddingLike): Date | null {
  const day = weddingDay(wedding);
  return day ? mexicoCityTime(day.y, day.m, day.d + 21, 23, 59, 59) : null;
}

export function revealAt(wedding: AlbumWeddingLike): Date | null {
  const day = weddingDay(wedding);
  return day ? mexicoCityTime(day.y, day.m, day.d + 1, 10) : null;
}

// Las fotos se guardan hasta el final del día de la boda + 1 año.
export function expiresAt(wedding: AlbumWeddingLike): Date | null {
  const day = weddingDay(wedding);
  return day ? mexicoCityTime(day.y + 1, day.m, day.d, 23, 59, 59) : null;
}

export function isAlbumEnabled(wedding: AlbumWeddingLike): boolean {
  return wedding.tier !== 'free' && wedding.photoAlbum?.enabled === true;
}

export function albumMode(wedding: AlbumWeddingLike): AlbumMode {
  return wedding.photoAlbum?.mode === 'disposable' ? 'disposable' : 'open';
}

// La pareja puede cerrar la subida antes de que termine la ventana (y volver a abrirla).
export function areUploadsClosedByCouple(wedding: AlbumWeddingLike): boolean {
  return wedding.photoAlbum?.uploadsClosed === true;
}

export function albumPhase(wedding: AlbumWeddingLike, now: Date = new Date()): AlbumPhase {
  if (!isAlbumEnabled(wedding)) return 'disabled';
  const opens = uploadOpensAt(wedding);
  const closes = uploadClosesAt(wedding);
  const expires = expiresAt(wedding);
  if (!opens || !closes || !expires) return 'before';
  const t = now.getTime();
  if (t < opens.getTime()) return 'before';
  if (t <= closes.getTime()) return areUploadsClosedByCouple(wedding) ? 'closed' : 'open';
  if (t <= expires.getTime()) return 'closed';
  return 'expired';
}

// En modo desechable, antes del revelado cada invitado solo ve sus fotos. Si la pareja cierra la
// subida, el álbum se revela completo: lo cierra para compartirlo.
export function isRevealed(wedding: AlbumWeddingLike, now: Date = new Date()): boolean {
  if (albumMode(wedding) === 'open') return true;
  if (areUploadsClosedByCouple(wedding)) return true;
  const reveal = revealAt(wedding);
  return !!reveal && now.getTime() >= reveal.getTime();
}

// Fechas legibles en la zona de la boda ("14 de marzo de 2027" / "March 14, 2027").
export function formatAlbumDate(date: Date, locale: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }): string {
  return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', { ...options, timeZone: ALBUM_TIME_ZONE });
}

export function formatAlbumTime(date: Date, locale: string): string {
  return date.toLocaleTimeString(locale === 'en' ? 'en-US' : 'es-MX', { hour: '2-digit', minute: '2-digit', timeZone: ALBUM_TIME_ZONE });
}

// Formato de un id de boda existente (las demos usan ids reservados para altas, así que no se usa isValidWeddingId).
export const isWeddingIdFormat = (id: string): boolean => /^[a-zA-Z0-9_-]{3,50}$/.test(id);

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// Nombre de archivo sin acentos ni espacios, para los JPG y los ZIP que se descargan.
export const slug = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'invitado';

// Nombre con el que se descarga una foto: {invitado}-{fecha}-{id}.jpg. El servidor lo guarda como
// Content-Disposition del archivo en Storage, así el botón "Descargar" baja la foto directo de
// Firebase (o de la caché del navegador) sin pasar por nuestro servidor.
export const photoFileName = (photo: { id: string; uploaderName?: string | null; createdAt: string }) =>
  `${slug(photo.uploaderName || 'invitado')}-${photo.createdAt.slice(0, 10)}-${photo.id.slice(0, 6).toLowerCase()}.jpg`;
