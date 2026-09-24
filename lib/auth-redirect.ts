import type { LinkedWedding } from './auth-context';

const NEXT_PATTERN = /^\/(?:[a-z]{2}\/)?admin(?:\/(?:wedding-editor|guests|confirmations)\/([A-Za-z0-9_-]+))?\/?$/;

// A dónde llevar a la cuenta tras iniciar sesión (spec 08):
// 1. `next` (solo rutas internas de admin) si pertenece a una de sus bodas.
// 2. Una sola boda: directo a su editor.
// 3. Varias, operador o ninguna: "Mis invitaciones".
export function resolveLanding(opts: { locale: string; weddings: LinkedWedding[]; isAdmin: boolean; next?: string | null }): string {
  const { locale, weddings, isAdmin, next } = opts;

  if (next) {
    const match = NEXT_PATTERN.exec(next);
    if (match) {
      const weddingId = match[1];
      if (!weddingId || isAdmin || weddings.some((w) => w.id === weddingId)) return next;
    }
  }

  if (!isAdmin && weddings.length === 1) return `/${locale}/admin/wedding-editor/${weddings[0].id}`;
  return `/${locale}/admin`;
}
