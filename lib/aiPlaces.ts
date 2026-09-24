import { generateJson } from './openai';
import { checkAndIncrementUsage } from './aiUsage';
import { buildMapsSearchUrl } from './maps';

export interface PlaceSuggestion {
  name: string;
  category: string;
  reason: string;
  reasonEn: string;
  mapsUrl: string;
}

// Comparte la lógica de hoteles y lugares: valida el shape, filtra categorías
// no permitidas, agrega el link de búsqueda de Maps y no consume intento si la
// IA no pudo ubicar la zona (lista vacía).
export async function suggestPlaces(opts: {
  weddingId: string;
  counter: string;
  systemPrompt: string;
  userPrompt: string;
  withEnglish: boolean;
  allowedCategories: string[];
  mapsArea: string;
  min: number;
  max: number;
  excludeNames: string[];
}) {
  const exclude = new Set(opts.excludeNames.map((n) => n.trim().toLowerCase()).filter(Boolean));

  return checkAndIncrementUsage(
    opts.weddingId,
    opts.counter,
    async () => {
      const json = await generateJson<{ places?: unknown[] }>(opts.systemPrompt, opts.userPrompt);
      const raw = Array.isArray(json.places) ? json.places : [];

      const places: PlaceSuggestion[] = [];
      for (const item of raw) {
        if (!item || typeof item !== 'object') continue;
        const p = item as Record<string, unknown>;
        if (typeof p.name !== 'string' || !p.name.trim()) continue;
        if (typeof p.reason !== 'string' || !p.reason.trim()) continue;
        if (opts.withEnglish && (typeof p.reasonEn !== 'string' || !p.reasonEn.trim())) continue;
        const category = typeof p.category === 'string' ? p.category : '';
        if (!opts.allowedCategories.includes(category)) continue;
        if (exclude.has(p.name.trim().toLowerCase())) continue;
        places.push({
          name: p.name.trim(),
          category,
          reason: p.reason.trim(),
          reasonEn: opts.withEnglish ? (p.reasonEn as string).trim() : '',
          mapsUrl: buildMapsSearchUrl(p.name.trim(), opts.mapsArea),
        });
      }

      if (places.length === 0 && raw.length > 0) throw new Error('La respuesta de OpenAI no tiene el shape esperado');
      if (places.length > 0 && places.length < opts.min && raw.length >= opts.min) {
        throw new Error('La respuesta de OpenAI no tiene el shape esperado');
      }
      return { places: places.slice(0, opts.max) };
    },
    { countIf: (r) => r.places.length > 0 }
  );
}
