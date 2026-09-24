// Validaciones compartidas por el panel del operador y sus rutas de servidor (spec 08).

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const TEMPLATE_OPTIONS = [
  { id: 'template-01', name: 'Clásico', description: 'Serif elegante, monograma en sello y detalles botánicos mínimos.' },
  { id: 'template-02', name: 'Moderno', description: 'Sans-serif geométrica, anillos concéntricos y acentos de línea botánica.' },
  { id: 'template-03', name: 'Botánica Editorial', description: 'Fotografía en arco, motivos botánicos y countdown en vivo.' },
] as const;

export type TemplateId = (typeof TEMPLATE_OPTIONS)[number]['id'];

export const isTemplateId = (value: unknown): value is TemplateId => TEMPLATE_OPTIONS.some((t) => t.id === value);

export const MAX_OWNER_EMAILS = 6;

export const isValidEmail = (value: string) => value.length <= 120 && EMAIL_RE.test(value);

// 'YYYY-MM-DD' que además sea una fecha real (rechaza 2026-02-31).
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

// Normaliza a minúsculas, sin espacios ni duplicados; devuelve null si alguno no es un correo válido.
export function normalizeEmailList(values: unknown, min: number, max: number): string[] | null {
  if (!Array.isArray(values)) return null;
  const unique = Array.from(new Set(values.map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : ''))));
  if (unique.length < min || unique.length > max) return null;
  return unique.every(isValidEmail) ? unique : null;
}
