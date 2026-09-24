import type { WeddingData } from '../src/types/wedding';

type Bilingual = { es?: string; en?: string } | string | null | undefined;

export interface EnglishField {
  // Llave estable del campo (sirve también para el registro de traducciones con IA en `i18nMeta`)
  id: string;
  tab: string;
  tabLabel: string;
  label: string;
  es: string;
  en: string;
  // Ruta punteada del campo EN dentro del documento, ej. 'timeline.0.title.en'
  path: string;
}

const esOf = (v: Bilingual): string => (typeof v === 'string' ? v : v?.es ?? '');
const enOf = (v: Bilingual): string => (typeof v === 'string' ? '' : v?.en ?? '');
export const isFilled = (s: string): boolean => s.trim().length > 0;

// Todos los campos con contraparte EN que el editor puede llenar. Con
// `includeDisabled` incluye también secciones apagadas (regalos, solo adultos),
// útil para inferir si la boda ya tiene contenido en inglés.
export function getEnglishFields(
  data: Partial<WeddingData> | null | undefined,
  options: { includeDisabled?: boolean } = {}
): EnglishField[] {
  if (!data) return [];
  const fields: EnglishField[] = [];
  const add = (tab: string, tabLabel: string, label: string, value: Bilingual, pathBase: string, id: string) => {
    fields.push({ id, tab, tabLabel, label, es: esOf(value), en: enOf(value), path: `${pathBase}.en` });
  };

  add('couple', 'Pareja', 'Historia de amor', data.couple?.story, 'couple.story', 'couple|story');
  add('couple', 'Pareja', 'Frase especial', data.couple?.quote, 'couple.quote', 'couple|quote');

  add('event', 'Evento', 'Código de vestimenta: estilo', data.event?.dressCode?.style, 'event.dressCode.style', 'dressCode|style');
  add('event', 'Evento', 'Código de vestimenta: descripción', data.event?.dressCode?.description, 'event.dressCode.description', 'dressCode|description');

  add('venues', 'Lugares', 'Nombre de la ceremonia', data.event?.ceremonyVenue?.name, 'event.ceremonyVenue.name', 'ceremonyVenue|name');
  add('venues', 'Lugares', 'Nombre de la recepción', data.event?.receptionVenue?.name, 'event.receptionVenue.name', 'receptionVenue|name');

  (data.timeline ?? []).forEach((event, i) => {
    const key = event.id ?? i;
    add('timeline', 'Cronograma', `Evento ${i + 1}: título`, event.title, `timeline.${i}.title`, `timeline|${key}|title`);
    add('timeline', 'Cronograma', `Evento ${i + 1}: descripción`, event.description, `timeline.${i}.description`, `timeline|${key}|description`);
  });

  (data.accommodation?.hotels ?? []).forEach((hotel, i) => {
    add('accommodation', 'Hoteles Recomendados', `Hotel ${i + 1}: descripción`, hotel.description, `accommodation.hotels.${i}.description`, `hotels|${hotel.id ?? i}|description`);
  });

  (data.accommodation?.recommendedPlaces ?? []).forEach((place, i) => {
    add('recommendedPlaces', 'Lugares Recomendados', `Lugar ${i + 1}: descripción`, place.description, `accommodation.recommendedPlaces.${i}.description`, `places|${place.id ?? i}|description`);
  });

  if (options.includeDisabled || data.giftRegistry?.enabled) {
    add('gifts', 'Regalos', 'Mensaje para los invitados', data.giftRegistry?.message, 'giftRegistry.message', 'gifts|message');
    (data.giftRegistry?.registries ?? []).forEach((registry, i) => {
      add('gifts', 'Regalos', `Tienda ${i + 1}: descripción`, registry.description, `giftRegistry.registries.${i}.description`, `registries|${registry.id ?? i}|description`);
    });
    if (data.giftRegistry?.bankAccount) {
      add('gifts', 'Regalos', 'Cuenta bancaria: descripción', data.giftRegistry.bankAccount.description, 'giftRegistry.bankAccount.description', 'bank|description');
    }
  }

  if (options.includeDisabled || data.adultOnlyEvent?.enabled) {
    add('settings', 'Solo adultos', 'Mensaje para los invitados', data.adultOnlyEvent?.message, 'adultOnlyEvent.message', 'adults|message');
  }

  return fields;
}

export function inferHasEnglish(data: Partial<WeddingData> | null | undefined): boolean {
  return getEnglishFields(data, { includeDisabled: true }).some((f) => isFilled(f.en));
}

// Si la boda ya tiene la bandera se respeta; si no, se infiere del contenido EN.
export function resolveHasEnglish(data: Partial<WeddingData> | null | undefined): boolean {
  if (!data) return false;
  return typeof data.hasEnglish === 'boolean' ? data.hasEnglish : inferHasEnglish(data);
}

// Progreso del inglés: total = campos con español escrito, done = los que ya tienen inglés.
export function getEnglishProgress(data: Partial<WeddingData> | null | undefined) {
  const withSpanish = getEnglishFields(data).filter((f) => isFilled(f.es));
  const pending = withSpanish.filter((f) => !isFilled(f.en));
  return { total: withSpanish.length, done: withSpanish.length - pending.length, pending };
}

// Escribe un valor en una ruta punteada, creando objetos intermedios. Si un
// nivel intermedio es un string heredado (ej. un nombre sin {es,en}), lo
// convierte a { es, en } para no perder el texto en español.
export function setByPath(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.');
  let current = target as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const next = current[k];
    if (typeof next === 'string') current[k] = { es: next, en: '' };
    else if (next === undefined || next === null) current[k] = {};
    current = current[k] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}
