import { NextRequest, NextResponse } from 'next/server';
import { generateJson } from '../../../../lib/openai';
import { checkAndIncrementUsage } from '../../../../lib/aiUsage';
import { clampText, invalidId, isValidId, usageResponse } from '../../../../lib/aiRoute';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isValidId(body.weddingId)) return invalidId();
    const withEnglish = body.withEnglish === true;

    const result = await checkAndIncrementUsage(body.weddingId, 'storyGenerate', async () => {
      const systemPrompt = withEnglish
        ? 'Eres un redactor experto en textos para invitaciones de boda. Escribes en tono cálido y natural, nunca genérico ni cursi en exceso. Respondes siempre con un objeto JSON con las claves "es" y "en", cada una con la Historia de Amor de la pareja en ese idioma (2 a 4 párrafos cortos, sin encabezados ni markdown). El texto en inglés es una adaptación natural del mismo contenido, no una traducción literal.'
        : 'Eres un redactor experto en textos para invitaciones de boda. Escribes en tono cálido y natural, nunca genérico ni cursi en exceso. Respondes siempre con un objeto JSON con la clave "es" con la Historia de Amor de la pareja (2 a 4 párrafos cortos, sin encabezados ni markdown).';
      const userPrompt = `Cómo se conocieron: ${clampText(body.howMet) || 'no especificado'}\nAnécdota o momento especial: ${clampText(body.anecdote) || 'no especificado'}\nTono deseado: ${clampText(body.tone, 200) || 'cálido y cercano'}\n\nEscribe la Historia de Amor para la invitación de boda.`;

      const json = await generateJson<{ es?: string; en?: string }>(systemPrompt, userPrompt);
      if (!json.es || (withEnglish && !json.en)) throw new Error('Respuesta de OpenAI incompleta');
      return withEnglish ? { es: json.es, en: json.en as string } : { es: json.es };
    });

    return usageResponse(result);
  } catch (error) {
    console.error('Error en /api/ai/story:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
