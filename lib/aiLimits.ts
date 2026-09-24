// Límites de uso de IA por boda (spec 07). Compartido entre servidor y editor.
export const DEFAULT_USAGE_LIMIT = 5;
export const TRANSLATE_USAGE_LIMIT = 30;
// Tope total de "Redactar con IA" en lugares: cada lugar tiene su propio contador
// (aiUsage.placeGenerate.<id>), pero el id lo manda el cliente, así que sin un tope
// total se podría evadir el límite variando el id.
export const PLACE_GENERATE_TOTAL_LIMIT = 25;

export function limitForKey(key: string): number {
  if (key === 'translate') return TRANSLATE_USAGE_LIMIT;
  if (key === 'placeGenerateTotal') return PLACE_GENERATE_TOTAL_LIMIT;
  return DEFAULT_USAGE_LIMIT;
}

// Aplana aiUsage ({ storyGenerate: 2, placeGenerate: { 'place-1': 1 } }) a
// { storyGenerate: 2, 'placeGenerate.place-1': 1 }.
export function flattenUsage(aiUsage: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!aiUsage || typeof aiUsage !== 'object') return out;
  for (const [key, value] of Object.entries(aiUsage as Record<string, unknown>)) {
    if (typeof value === 'number') out[key] = value;
    else if (value && typeof value === 'object') {
      for (const [sub, n] of Object.entries(value as Record<string, unknown>)) {
        if (typeof n === 'number') out[`${key}.${sub}`] = n;
      }
    }
  }
  return out;
}
