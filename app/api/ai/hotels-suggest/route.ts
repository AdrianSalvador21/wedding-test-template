import { NextRequest, NextResponse } from 'next/server';
import { suggestPlaces } from '../../../../lib/aiPlaces';
import { clampText, hasAddress, invalidId, isValidId, parseVenue, usageResponse, venuesBlock } from '../../../../lib/aiRoute';

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
      ? '{ "name": "...", "category": "hospedaje", "reason": "...", "reasonEn": "..." }'
      : '{ "name": "...", "category": "hospedaje", "reason": "..." }';
    const systemPrompt = `Eres un asistente que conoce hoteles y hospedajes reales cerca de una dirección dada, basándote en tu conocimiento general de la zona. Sugieres opciones de hospedaje para invitados de una boda, cercanas a la ceremonia y a la recepción, con variedad de presupuesto. Solo sugiere hospedajes reales que estés seguro que existen en la zona. Si las direcciones no te permiten identificar la ciudad o zona con certeza, responde {"places": []}. Respondes siempre con un objeto JSON con la clave "places": un arreglo de 3 a 5 sugerencias con el shape ${shape}. "reason" es una razón corta (una frase) de por qué conviene a los invitados${withEnglish ? ' y "reasonEn" su versión natural en inglés' : ''}. No inventes precios ni distancias exactas.`;
    const userPrompt = `${venuesBlock(ceremony, reception)}\nYa están agregados (no los repitas): ${existing.join(', ') || 'ninguno'}\n\nSugiere hoteles cerca.`;

    const result = await suggestPlaces({
      weddingId: body.weddingId,
      counter: 'hotelsSuggest',
      systemPrompt,
      userPrompt,
      withEnglish,
      allowedCategories: ['hospedaje'],
      mapsArea: reception.address || ceremony.address,
      min: 3,
      max: 5,
      excludeNames: existing,
    });

    return usageResponse(result);
  } catch (error) {
    console.error('Error en /api/ai/hotels-suggest:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
