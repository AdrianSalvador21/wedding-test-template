import { NextRequest, NextResponse } from 'next/server';
import { generateJson } from '../../../../lib/openai';
import { checkAndIncrementUsage, TRANSLATE_USAGE_LIMIT } from '../../../../lib/aiUsage';
import { clampText, invalidId, isValidId, usageResponse } from '../../../../lib/aiRoute';

const MAX_ITEMS = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isValidId(body.weddingId)) return invalidId();

    const items = (Array.isArray(body.items) ? body.items : [])
      .map((i: unknown) => {
        const it = (i && typeof i === 'object' ? i : {}) as Record<string, unknown>;
        return { key: clampText(it.key, 120), text: clampText(it.text, 3000) };
      })
      .filter((i: { key: string; text: string }) => i.key && i.text)
      .slice(0, MAX_ITEMS);

    if (items.length === 0) return NextResponse.json({ error: 'Missing items' }, { status: 400 });

    const result = await checkAndIncrementUsage(
      body.weddingId,
      'translate',
      async () => {
        const systemPrompt =
          'Eres un traductor profesional de español a inglés especializado en textos de invitaciones de boda. Traduces de forma natural (no literal), manteniendo el tono y el largo aproximado. Conserva tal cual los nombres propios de personas y de lugares. Respondes siempre con un objeto JSON con la clave "items": un arreglo con un elemento por cada entrada recibida, con el shape { "key": "<la misma key>", "en": "<traducción>" }.';
        const userPrompt = `Traduce al inglés estas entradas:\n${JSON.stringify(items)}`;

        const json = await generateJson<{ items?: { key?: string; en?: string }[] }>(systemPrompt, userPrompt);
        const byKey = new Map<string, string>();
        for (const it of Array.isArray(json.items) ? json.items : []) {
          if (typeof it?.key === 'string' && typeof it?.en === 'string' && it.en.trim()) byKey.set(it.key, it.en.trim());
        }
        const missing = items.filter((i: { key: string }) => !byKey.has(i.key));
        if (missing.length > 0) throw new Error('La respuesta de OpenAI está incompleta');
        return { items: items.map((i: { key: string }) => ({ key: i.key, en: byKey.get(i.key) as string })) };
      },
      { limit: TRANSLATE_USAGE_LIMIT }
    );

    return usageResponse(result);
  } catch (error) {
    console.error('Error en /api/ai/translate:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
