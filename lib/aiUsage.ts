import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { DEFAULT_USAGE_LIMIT, TRANSLATE_USAGE_LIMIT } from './aiLimits';

export { DEFAULT_USAGE_LIMIT, TRANSLATE_USAGE_LIMIT };

export type UsageResult<T> =
  | { ok: true; data: T; usage: { key: string; used: number; limit: number } }
  | { ok: false; reason: 'limit_reached'; key: string; limit: number }
  | { ok: false; reason: 'error'; message?: string };

function getNestedCount(obj: Record<string, unknown> | undefined, path: string): number {
  if (!obj) return 0;
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return 0;
    }
  }
  return typeof current === 'number' ? current : 0;
}

// Lee aiUsage.<counterPath> del documento de la boda; si ya llegó al límite no
// ejecuta run(). Solo incrementa el contador si run() tiene éxito (spec 07:
// un error de OpenAI no debe consumir uno de los intentos). `countIf` permite
// no consumir intento cuando el resultado es válido pero inútil (lista vacía).
// `extra` son contadores adicionales (ej. un tope total) que se revisan e
// incrementan junto con el principal.
export async function checkAndIncrementUsage<T>(
  weddingId: string,
  counterPath: string,
  run: () => Promise<T>,
  options: { limit?: number; countIf?: (result: T) => boolean; extra?: { path: string; limit: number }[] } = {}
): Promise<UsageResult<T>> {
  const limit = options.limit ?? DEFAULT_USAGE_LIMIT;
  const docRef = doc(db, 'weddings', weddingId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return { ok: false, reason: 'error', message: 'La boda no existe' };
  }

  const aiUsage = docSnap.data()?.aiUsage as Record<string, unknown> | undefined;
  const currentCount = getNestedCount(aiUsage, counterPath);

  if (currentCount >= limit) {
    return { ok: false, reason: 'limit_reached', key: counterPath, limit };
  }
  for (const extra of options.extra ?? []) {
    if (getNestedCount(aiUsage, extra.path) >= extra.limit) {
      return { ok: false, reason: 'limit_reached', key: counterPath, limit: currentCount };
    }
  }

  let result: T;
  try {
    result = await run();
  } catch (err) {
    return { ok: false, reason: 'error', message: err instanceof Error ? err.message : 'Error desconocido' };
  }

  let used = currentCount;
  if (!options.countIf || options.countIf(result)) {
    const updates: Record<string, ReturnType<typeof increment>> = { [`aiUsage.${counterPath}`]: increment(1) };
    for (const extra of options.extra ?? []) updates[`aiUsage.${extra.path}`] = increment(1);
    await updateDoc(docRef, updates);
    used = currentCount + 1;
  }

  return { ok: true, data: result, usage: { key: counterPath, used, limit } };
}
