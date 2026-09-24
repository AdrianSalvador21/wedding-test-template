import { NextRequest, NextResponse } from 'next/server';
import { generateJson } from '../../../../lib/openai';
import { checkAndIncrementUsage } from '../../../../lib/aiUsage';
import { clampText, invalidId, isValidId, parseVenue, usageResponse, venuesBlock } from '../../../../lib/aiRoute';

// Mismos íconos válidos que `iconOptions` en el editor (page.tsx, TimelineSection).
const ALLOWED_ICONS = ['MapPin', 'Heart', 'Music', 'Utensils', 'Users', 'Wine', 'Clock', 'Star', 'Gift'];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const CEREMONY_RE = /ceremoni|ceremony/i;

interface TimelineEventSuggestion {
  time: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
  icon: string;
}

interface ExistingEvent {
  time: string;
  title: string;
}

const norm = (s: string) => s.trim().toLowerCase();

function normalize(event: unknown, withEnglish: boolean): TimelineEventSuggestion | null {
  if (!event || typeof event !== 'object') return null;
  const e = event as Record<string, unknown>;
  const title = (e.title ?? {}) as Record<string, unknown>;
  const description = (e.description ?? {}) as Record<string, unknown>;
  if (typeof e.time !== 'string' || !TIME_RE.test(e.time)) return null;
  if (typeof e.icon !== 'string' || !ALLOWED_ICONS.includes(e.icon)) return null;
  if (typeof title.es !== 'string' || !title.es || typeof description.es !== 'string' || !description.es) return null;
  if (withEnglish && (typeof title.en !== 'string' || !title.en || typeof description.en !== 'string' || !description.en)) return null;
  return {
    time: e.time,
    icon: e.icon,
    title: { es: title.es, en: withEnglish ? (title.en as string) : '' },
    description: { es: description.es, en: withEnglish ? (description.en as string) : '' },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isValidId(body.weddingId)) return invalidId();
    const withEnglish = body.withEnglish === true;
    const ceremonyTime = TIME_RE.test(clampText(body.ceremonyTime, 5)) ? clampText(body.ceremonyTime, 5) : '';
    const ceremony = parseVenue(body.ceremony);
    const reception = parseVenue(body.reception);
    const existing: ExistingEvent[] = (Array.isArray(body.existingEvents) ? body.existingEvents : [])
      .slice(0, 40)
      .map((e: unknown) => {
        const ev = (e && typeof e === 'object' ? e : {}) as Record<string, unknown>;
        return { time: clampText(ev.time, 5), title: clampText(ev.title, 120) };
      })
      .filter((e: ExistingEvent) => e.title);
    const hasCeremony = existing.some((e) => CEREMONY_RE.test(e.title));
    const existingTitles = new Set(existing.map((e) => norm(e.title)));

    const result = await checkAndIncrementUsage(body.weddingId, 'timelineSuggest', async () => {
      const shape = withEnglish
        ? '{ "time": "HH:MM", "title": { "es": "...", "en": "..." }, "description": { "es": "...", "en": "..." }, "icon": "..." }'
        : '{ "time": "HH:MM", "title": { "es": "..." }, "description": { "es": "..." }, "icon": "..." }';
      const ceremonyRule = hasCeremony
        ? 'La ceremonia ya está en el cronograma: no la incluyas.'
        : 'El primer evento es la ceremonia y su hora es exactamente la hora de la ceremonia indicada.';
      const systemPrompt = `Eres un planeador de bodas experto en itinerarios. Sugieres el cronograma del evento a partir de la hora de la ceremonia y los lugares. Respondes siempre con un objeto JSON con la clave "events": un arreglo de 3 a 5 eventos en orden cronológico, cada uno con el shape ${shape}. ${ceremonyRule} No repitas eventos que ya existen en el cronograma. El campo "icon" debe ser exactamente uno de: ${ALLOWED_ICONS.join(', ')}. Títulos y descripciones cortos${withEnglish ? '; la versión en inglés es una adaptación natural, no literal' : ''}. Si la ceremonia y la recepción son en lugares distintos, deja tiempo de traslado.`;
      const existingBlock = existing.length
        ? `Ya existen en el cronograma: ${existing.map((e) => `${e.time} ${e.title}`).join('; ')}`
        : 'El cronograma está vacío';
      const userPrompt = `Hora de la ceremonia: ${ceremonyTime || 'no especificada'}\n${venuesBlock(ceremony, reception)}\n${existingBlock}\n\nSugiere el cronograma del evento.`;

      const json = await generateJson<{ events?: unknown[] }>(systemPrompt, userPrompt);
      const raw = (Array.isArray(json.events) ? json.events : [])
        .map((e) => normalize(e, withEnglish))
        .filter((e): e is TimelineEventSuggestion => e !== null);

      if (raw.length < 3 || raw.length > 5) throw new Error('La respuesta de OpenAI no tiene el shape esperado');

      // No confiamos en el modelo para la hora de la ceremonia: es un dato de la pareja.
      if (ceremonyTime && !hasCeremony) raw[0].time = ceremonyTime;

      const events = raw.filter((e) => !existingTitles.has(norm(e.title.es)) && !(hasCeremony && CEREMONY_RE.test(e.title.es)));
      if (events.length === 0) throw new Error('Todos los eventos sugeridos ya existen en el cronograma');
      return { events };
    });

    return usageResponse(result);
  } catch (error) {
    console.error('Error en /api/ai/timeline-suggest:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
