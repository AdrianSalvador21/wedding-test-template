// Spec 28 — mensaje prearmado de WhatsApp y link `wa.me`. Se abre el WhatsApp de la pareja con
// el texto escrito; la pareja pulsa enviar desde su número (sin WhatsApp Business API).
import type { FirebaseGuest, WeddingData } from '../src/types/wedding';
import { normalizePhone } from './phone';
import { resolveHasEnglish } from './wedding-language';

export type WhatsAppMessageKind = 'invitation' | 'saveTheDate';

const TEMPLATES: Record<'es' | 'en', Record<WhatsAppMessageKind, string>> = {
  es: {
    invitation:
      '¡Hola, {nombre}! 💌\nCon mucha ilusión queremos invitarte a nuestra boda el {fecha}.\nAquí está tu invitación con todos los detalles y para confirmar tu asistencia:\n{link}\nCon cariño, {novios}',
    saveTheDate:
      '¡Hola, {nombre}! Aparta la fecha: nos casamos el {fecha}. 💍\nAgrégalo a tu calendario aquí:\n{link}\nPronto te llegará la invitación formal.\n{novios}',
  },
  en: {
    invitation:
      'Hi {nombre}! 💌\nWe would love for you to join us at our wedding on {fecha}.\nHere is your invitation with all the details and your RSVP:\n{link}\nWith love, {novios}',
    saveTheDate:
      "Hi {nombre}! Save the date: we're getting married on {fecha}. 💍\nAdd it to your calendar here:\n{link}\nFormal invitation to follow.\n{novios}",
  },
};

// Mismo link que copia `handleCopyLink` en la Lista de invitados.
export function buildGuestInvitationUrl(origin: string, weddingId: string, guest: Pick<FirebaseGuest, 'guestId' | 'language'>): string {
  return `${origin}/${guest.language || 'es'}/wedding/${weddingId}?guest=${guest.guestId}`;
}

// "14 de marzo de 2027" / "March 14, 2027". Vacío si la boda no tiene fecha válida.
function formatWeddingDate(rawDate: string | undefined, lang: 'es' | 'en'): string {
  if (!rawDate) return '';
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function buildDefaultWhatsAppMessage(
  kind: WhatsAppMessageKind,
  guest: FirebaseGuest,
  wedding: WeddingData,
  invitationUrl: string
): string {
  const lang: 'es' | 'en' = resolveHasEnglish(wedding) && guest.language === 'en' ? 'en' : 'es';
  const bride = wedding.couple?.bride?.name?.trim() || '';
  const groom = wedding.couple?.groom?.name?.trim() || '';
  const values: Record<string, string> = {
    nombre: guest.name,
    novios: [bride, groom].filter(Boolean).join(' & '),
    fecha: formatWeddingDate(wedding.event?.date, lang),
    link: invitationUrl,
  };

  // Una línea cuya variable queda vacía (p. ej. {fecha} sin fecha de boda) se quita completa.
  return TEMPLATES[lang][kind]
    .split('\n')
    .filter((line) => !Object.keys(values).some((key) => line.includes(`{${key}}`) && !values[key]))
    .map((line) => line.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match))
    .join('\n');
}

// Con teléfono válido abre el chat de ese número; sin teléfono (o `phone = null`) abre WhatsApp
// para que la pareja elija el contacto.
export function buildWhatsAppUrl(phone: string | null | undefined, text: string): string {
  const normalized = normalizePhone(phone);
  const encoded = encodeURIComponent(text);
  if (normalized.valid && normalized.value) {
    return `https://wa.me/${normalized.value.slice(1)}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}
