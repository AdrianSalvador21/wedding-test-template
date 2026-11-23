import { NextRequest, NextResponse } from 'next/server';
import { generateJson } from '../../../../lib/openai';
import { checkAndIncrementUsage } from '../../../../lib/aiUsage';
import { clampText, invalidId, isValidId, usageResponse } from '../../../../lib/aiRoute';

// Spec 27 — "Proponer con IA" para el mensaje opcional de "Aparta la fecha". Mismo patrón y mismo
// límite por boda que el resto de la IA del Editor (spec 07).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isValidId(body.weddingId)) return invalidId();
    const withEnglish = body.withEnglish === true;

    const result = await checkAndIncrementUsage(body.weddingId, 'saveTheDateMessage', async () => {
      const rules =
        'Eres un redactor de invitaciones de boda en México. Escribes el mensaje corto de un "save the date" ("Aparta la fecha"): 1 o 2 frases cálidas, de no más de 25 palabras en total, en primera persona del plural (la pareja habla). Pide a los invitados que reserven la fecha y adelanta que pronto llegará la invitación formal. No repitas los nombres, la fecha ni la ciudad (ya aparecen en la pantalla), no menciones confirmación de asistencia, regalos ni vestimenta, sin emojis ni markdown.';
      const systemPrompt = withEnglish
        ? `${rules} Respondes siempre con un objeto JSON con las claves "es" y "en" (el inglés es una adaptación natural, no literal).`
        : `${rules} Respondes siempre con un objeto JSON con la clave "es".`;
      const userPrompt = [
        `Pareja: ${clampText(body.bride, 80) || 'la novia'} y ${clampText(body.groom, 80) || 'el novio'}`,
        `Fecha: ${clampText(body.date, 80) || 'no especificada'}`,
        `Lugar: ${clampText(body.place, 120) || 'no especificado'}`,
        `Mensaje actual (si hay, propón una alternativa distinta): ${clampText(body.current, 400) || 'ninguno'}`,
        '',
        'Escribe el mensaje del save the date.',
      ].join('\n');

      const json = await generateJson<{ es?: string; en?: string }>(systemPrompt, userPrompt);
      if (!json.es || (withEnglish && !json.en)) throw new Error('Respuesta de OpenAI incompleta');
      return withEnglish ? { es: json.es, en: json.en as string } : { es: json.es };
    });

    return usageResponse(result);
  } catch (error) {
    console.error('Error en /api/ai/save-the-date-message:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
