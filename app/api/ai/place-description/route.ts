import { NextRequest, NextResponse } from 'next/server';
import { generateJson } from '../../../../lib/openai';
import { checkAndIncrementUsage } from '../../../../lib/aiUsage';
import { clampText, invalidId, isValidId, usageResponse } from '../../../../lib/aiRoute';
import { PLACE_GENERATE_TOTAL_LIMIT } from '../../../../lib/aiLimits';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isValidId(body.weddingId)) return invalidId();
    if (!isValidId(body.placeId) || body.placeId.length > 60) return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
    const withEnglish = body.withEnglish === true;

    const result = await checkAndIncrementUsage(body.weddingId, `placeGenerate.${body.placeId}`, async () => {
      const systemPrompt = withEnglish
        ? 'Eres un redactor de invitaciones de boda. Escribes descripciones breves y cálidas (1 a 2 frases) de lugares recomendados para los invitados. Respondes siempre con un objeto JSON con las claves "es" y "en" (el inglés es una adaptación natural).'
        : 'Eres un redactor de invitaciones de boda. Escribes descripciones breves y cálidas (1 a 2 frases) de lugares recomendados para los invitados. Respondes siempre con un objeto JSON con la clave "es".';
      const userPrompt = `Nombre del lugar: ${clampText(body.placeName, 200) || 'no especificado'}\n\nEscribe una descripción breve para este lugar recomendado. No inventes datos concretos (horarios, precios).`;

      const json = await generateJson<{ es?: string; en?: string }>(systemPrompt, userPrompt);
      if (!json.es || (withEnglish && !json.en)) throw new Error('Respuesta de OpenAI incompleta');
      return withEnglish ? { es: json.es, en: json.en as string } : { es: json.es };
    }, { extra: [{ path: 'placeGenerateTotal', limit: PLACE_GENERATE_TOTAL_LIMIT }] });

    return usageResponse(result);
  } catch (error) {
    console.error('Error en /api/ai/place-description:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
