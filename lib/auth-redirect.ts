import type { LinkedWedding } from './auth-context';

const NEXT_PATTERN = /^\/(?:[a-z]{2}\/)?admin(?:\/(?:wedding-editor|guests|confirmations)\/([A-Za-z0-9_-]+))?\/?$/;

// A dónde llevar a la cuenta tras iniciar sesión:
// 1. `next` (solo rutas internas de admin) si pertenece a una de sus bodas — así vuelve a la
//    página exacta que pedía antes de mandarla a iniciar sesión (AuthGuard).
// 2. Cualquier otro caso, con una boda o con varias, gratuita o con plantilla: siempre
//    "Mis invitaciones", para que decida ahí a cuál entrar y desde ahí pueda crear otra.
export function resolveLanding(opts: { locale: string; weddings: LinkedWedding[]; isAdmin: boolean; next?: string | null }): string {
  const { locale, isAdmin, weddings, next } = opts;

  if (next) {
    const match = NEXT_PATTERN.exec(next);
    if (match) {
      const weddingId = match[1];
      if (!weddingId || isAdmin || weddings.some((w) => w.id === weddingId)) return next;
    }
  }

  return `/${locale}/admin`;
}
