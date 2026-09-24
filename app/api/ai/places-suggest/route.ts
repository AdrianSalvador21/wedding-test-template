import { NextRequest, NextResponse } from 'next/server';
import { suggestPlaces } from '../../../../lib/aiPlaces';
import { clampText, hasAddress, invalidId, isValidId, parseVenue, usageResponse, venuesBlock } from '../../../../lib/aiRoute';

const CATEGORIES = ['restaurante', 'cafe', 'atraccion', 'experiencia'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isValidId(body.weddingId)) return invalidId();
    const withEnglish = body.withEnglish === true;
    const ceremony = parseVenue(body.ceremony);
    const reception = parseVenue(body.reception);
    const existing = (Array.isArray(body.existingNames) ? body.existingNames : [])
      .map((n: unknown) => clampText(n, 200))
      .filter(Boolean)
      .slice(0, 40);

    if (!hasAddress(ceremony, reception)) {
      return NextResponse.json({ places: [], reason: 'no_location' });
    }

    const shape = withEnglish
      ? '{ "name": "...", "category": "restaurante" | "cafe" | "atraccion" | "experiencia", "reason": "...", "reasonEn": "..." }'
      : '{ "name": "...", "category": "restaurante" | "cafe" | "atraccion" | "experiencia", "reason": "..." }';
    const systemPrompt = `Eres un asistente que conoce negocios y lugares reales cerca de una dirección dada, basándote en tu conocimiento general de la zona. Sugieres LUGARES PARA VISITAR o disfrutar durante el viaje a una boda: restaurantes, cafés, atracciones y experiencias. NUNCA sugieras hoteles, hostales ni ningún hospedaje (eso va en otra sección). Solo sugiere lugares reales que estés seguro que existen en la zona. Si las direcciones no te permiten identificar la ciudad o zona con certeza, responde {"places": []}. Respondes siempre con un objeto JSON con la clave "places": un arreglo de 3 a 6 sugerencias con el shape ${shape}. "reason" es una razón corta (una frase)${withEnglish ? ' y "reasonEn" su versión natural en inglés' : ''}.`;
    const userPrompt = `${venuesBlock(ceremony, reception)}\nYa están agregados (no los repitas): ${existing.join(', ') || 'ninguno'}\n\nSugiere lugares para visitar cerca.`;

    const result = await suggestPlaces({
      weddingId: body.weddingId,
      counter: 'placesSuggest',
      systemPrompt,
      userPrompt,
      withEnglish,
      allowedCategories: CATEGORIES,
      mapsArea: reception.address || ceremony.address,
      min: 3,
      max: 6,
      excludeNames: existing,
    });

    return usageResponse(result);
  } catch (error) {
    console.error('Error en /api/ai/places-suggest:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
