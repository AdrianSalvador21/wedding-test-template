'use client';

import { createContext, useContext } from 'react';
import type { RecommendedPlace, WeddingData } from '../../src/types/wedding';

// Única fuente de verdad (spec 25) para saber qué secciones numeradas de Template02 se ven, en qué
// orden y con qué número. La usan Template02 (numeración), DesktopNavV2 (anclas) y cada sección
// para decidir si se renderiza, así número y nav nunca apuntan a una sección oculta.

export type V2Locale = 'es' | 'en';

export type V2SectionKey =
  | 'about'
  | 'location'
  | 'timeline'
  | 'dresscode'
  | 'gallery'
  | 'gifts'
  | 'accommodation'
  | 'places'
  | 'rsvp';

export const V2_ANCHORS: Record<V2SectionKey, string> = {
  about: 'about',
  location: 'location',
  timeline: 'timeline',
  dresscode: 'dresscode',
  gallery: 'gallery',
  gifts: 'gift-registry',
  accommodation: 'accommodation',
  places: 'recommended-places',
  rsvp: 'rsvp',
};

// Orden del diseño aprobado: Nosotros → Dónde → Itinerario → Vestimenta → Galería → Regalos →
// Hospedaje → Lugares → (Solo adultos, sin número) → RSVP.
const V2_ORDER: V2SectionKey[] = [
  'about',
  'location',
  'timeline',
  'dresscode',
  'gallery',
  'gifts',
  'accommodation',
  'places',
  'rsvp',
];

export function v2Localized(value: unknown, locale: string): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const v = value as Record<string, string | undefined>;
    return v[locale] || v.es || '';
  }
  return '';
}

export function v2Fill(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{${k}}`).join(String(v)), template);
}

export function v2DateLocale(locale: string): string {
  return locale === 'en' ? 'en-US' : 'es-ES';
}

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// "Sábado 7 de noviembre, 2026" / "Saturday, November 7, 2026"
export function v2FormatLongDate(date: Date, locale: string): string {
  if (locale === 'en') {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'long' });
  const dayMonth = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  return `${capitalize(weekday)} ${dayMonth}, ${date.getFullYear()}`;
}

// "sábado 7 de noviembre de 2026" (en medio de una frase)
export function v2FormatSentenceDate(date: Date, locale: string): string {
  return date.toLocaleDateString(v2DateLocale(locale), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).replace(',', '');
}

// "18:00" → "6:00 PM", igual que la cuenta regresiva anterior.
export function v2FormatTime(time: string | undefined): string {
  if (!time) return '';
  const [hours, minutes = '00'] = time.split(':');
  const hour24 = parseInt(hours, 10);
  if (Number.isNaN(hour24)) return time;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function v2WeddingDate(wedding: WeddingData | null | undefined): Date {
  return wedding?.event?.date ? new Date(wedding.event.date) : new Date('2025-11-21T16:00:00');
}

export function v2Initials(wedding: WeddingData | null | undefined): { bride: string; groom: string } {
  return {
    bride: (wedding?.couple?.bride?.name || 'M').charAt(0).toUpperCase(),
    groom: (wedding?.couple?.groom?.name || 'C').charAt(0).toUpperCase(),
  };
}

// --- Reglas de visibilidad (las mismas que aplicaba cada sección de sections-v2) ---------------

export function v2Venues(wedding: WeddingData | null | undefined, locale: string) {
  const ceremony = wedding?.event?.ceremonyVenue;
  const reception = wedding?.event?.receptionVenue;
  const ceremonyName = v2Localized(ceremony?.name, locale);
  const receptionName = v2Localized(reception?.name, locale);
  const normalize = (s: string) => s.trim().toLowerCase();
  const sameVenue = !!ceremonyName && !!receptionName && normalize(ceremonyName) === normalize(receptionName);
  return {
    ceremony: ceremonyName ? { name: ceremonyName, address: ceremony?.address || '', mapsUrl: ceremony?.mapsUrl || '' } : null,
    reception: receptionName
      ? { name: receptionName, address: reception?.address || '', mapsUrl: reception?.mapsUrl || '' }
      : null,
    sameVenue,
  };
}

export function v2HasGiftContent(wedding: WeddingData | null | undefined): boolean {
  const gifts = wedding?.giftRegistry;
  if (!gifts?.enabled) return false;
  const hasRegistries = !!gifts.registries && gifts.registries.length > 0;
  const bank = gifts.bankAccount;
  const hasBank = !!bank && !!(bank.bankName || bank.accountName || bank.accountNumber);
  return hasRegistries || hasBank;
}

export function v2RecommendedPlaces(wedding: WeddingData | null | undefined): RecommendedPlace[] {
  if (!wedding || wedding.showRecommendedPlaces === false) return [];
  if (wedding.accommodation?.recommendedPlaces?.length) {
    return wedding.accommodation.recommendedPlaces as unknown as RecommendedPlace[];
  }
  const rp = wedding.recommendedPlaces as unknown;
  if (Array.isArray(rp) && rp.length > 0) return rp as RecommendedPlace[];
  if (
    wedding.recommendedPlaces &&
    typeof wedding.recommendedPlaces === 'object' &&
    'places' in wedding.recommendedPlaces &&
    wedding.recommendedPlaces.enabled &&
    wedding.recommendedPlaces.places?.length
  ) {
    return wedding.recommendedPlaces.places;
  }
  return [];
}

export function isV2SectionVisible(
  key: V2SectionKey,
  wedding: WeddingData | null | undefined,
  galleryCount: number,
  locale: string
): boolean {
  if (!wedding) return false;
  switch (key) {
    case 'about':
    case 'rsvp':
      return true;
    case 'dresscode': {
      const dress = wedding.event?.dressCode;
      return !!(v2Localized(dress?.style, locale) || v2Localized(dress?.description, locale));
    }
    case 'location': {
      const { ceremony, reception } = v2Venues(wedding, locale);
      return !!(ceremony || reception);
    }
    case 'timeline':
      return !!wedding.timeline?.length;
    case 'gallery':
      return galleryCount > 0;
    case 'gifts':
      return v2HasGiftContent(wedding);
    case 'accommodation':
      return !!wedding.accommodation?.hotels?.length;
    case 'places':
      return v2RecommendedPlaces(wedding).length > 0;
    default:
      return false;
  }
}

export interface V2VisibleSection {
  key: V2SectionKey;
  number: string;
  anchorId: string;
}

export function getVisibleSectionsV2(
  wedding: WeddingData | null | undefined,
  galleryCount: number,
  locale: string = 'es'
): V2VisibleSection[] {
  return V2_ORDER.filter((key) => isV2SectionVisible(key, wedding, galleryCount, locale)).map((key, index) => ({
    key,
    number: String(index + 1).padStart(2, '0'),
    anchorId: V2_ANCHORS[key],
  }));
}

// Números calculados por Template02 y leídos por cada sección (las secciones no reciben props).
export const V2SectionNumbersContext = createContext<Partial<Record<V2SectionKey, string>>>({});

export function useV2SectionNumber(key: V2SectionKey): string | undefined {
  return useContext(V2SectionNumbersContext)[key];
}
