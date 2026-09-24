import { NextRequest, NextResponse } from 'next/server';
import { generateJson } from '../../../../lib/openai';
import { checkAndIncrementUsage } from '../../../../lib/aiUsage';
import { clampText, invalidId, isValidId, usageResponse } from '../../../../lib/aiRoute';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isValidId(body.weddingId)) return invalidId();
    const withEnglish = body.withEnglish === true;

    const result = await checkAndIncrementUsage(body.weddingId, 'dresscodeGenerate', async () => {
      const systemPrompt = withEnglish
        ? 'Eres un redactor de invitaciones de boda. Escribes la descripción del código de vestimenta para los invitados: 2 a 3 frases cálidas y claras, sin markdown. Respondes siempre con un objeto JSON con las claves "es" y "en" (el inglés es una adaptación natural, no literal).'
        : 'Eres un redactor de invitaciones de boda. Escribes la descripción del código de vestimenta para los invitados: 2 a 3 frases cálidas y claras, sin markdown. Respondes siempre con un objeto JSON con la clave "es".';
      const userPrompt = `Estilo de vestimenta: ${clampText(body.style, 200) || 'no especificado'}\n\nEscribe una descripción breve del código de vestimenta para los invitados.`;

      const json = await generateJson<{ es?: string; en?: string }>(systemPrompt, userPrompt);
      if (!json.es || (withEnglish && !json.en)) throw new Error('Respuesta de OpenAI incompleta');
      return withEnglish ? { es: json.es, en: json.en as string } : { es: json.es };
    });

    return usageResponse(result);
  } catch (error) {
    console.error('Error en /api/ai/dresscode:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
