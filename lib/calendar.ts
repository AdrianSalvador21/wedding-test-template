import type { WeddingData } from '../src/types/wedding';
import { getTranslation, type Language } from './translations';

// "Agregar al calendario" de template-02 (spec 25). Solo lee datos que ya existen: el instante
// es el mismo que usa la cuenta regresiva (`new Date(event.date)`), con duración fija de 6 h
// porque el panel no edita las duraciones de ceremonia/recepción.
const EVENT_DURATION_HOURS = 6;

const pad = (n: number) => String(n).padStart(2, '0');

function toIcsUtc(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function localized(value: unknown, locale: Language): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const v = value as Record<string, string | undefined>;
    return v[locale] || v.es || '';
  }
  return '';
}

function fill(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{${k}}`).join(v), template);
}

export function getWeddingCalendarLocation(wedding: WeddingData, locale: Language): string {
  const reception = wedding.event?.receptionVenue;
  const ceremony = wedding.event?.ceremonyVenue;
  const venue = localized(reception?.name, locale) ? reception : ceremony;
  const name = localized(venue?.name, locale);
  const address = venue?.address || '';
  return [name, address].filter(Boolean).join(', ');
}

export function buildWeddingIcs(wedding: WeddingData, locale: Language): string {
  const start = new Date(wedding.event.date);
  const end = new Date(start.getTime() + EVENT_DURATION_HOURS * 60 * 60 * 1000);
  const title = fill(getTranslation('template02.calendar.title', locale), {
    bride: wedding.couple.bride.name,
    groom: wedding.couple.groom.name,
  });
  const location = getWeddingCalendarLocation(wedding, locale);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Invyta//Invitacion//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${wedding.id}@invyta`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    ...(location ? [`LOCATION:${escapeIcsText(location)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function getWeddingIcsFilename(wedding: WeddingData, locale: Language): string {
  const base = fill(getTranslation('template02.calendar.filename', locale), {
    bride: wedding.couple.bride.name,
    groom: wedding.couple.groom.name,
  });
  const slug = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'boda'}.ics`;
}

export function downloadIcs(filename: string, ics: string): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
