// Decide si una ruta se mide y cómo (spec 11). Funciones puras, sin dependencias del navegador.
import { MARKETING_PAGES } from '../site';
import { isDemoId, type DemoId } from './demos';

// 'marketing': páginas públicas del sitio. Eventos y grabación.
// 'demo':      demos públicas de invitación. Eventos y grabación.
// 'admin':     login y paneles de admin. Eventos, SIN grabación.
// null:        cualquier otra ruta (incluidas las invitaciones reales): no se mide.
export type TrackingScope = 'marketing' | 'demo' | 'admin' | null;

// Con `localePrefix: 'as-needed'` el español va sin prefijo (`/admin/...`) y el inglés con `/en`.
// Se acepta también `/es` por si el navegador aún no siguió la redirección.
const LOCALE_PREFIX = /^\/(?:es|en)(?=\/|$)/;

export function stripLocale(pathname: string): string {
  const stripped = pathname.replace(LOCALE_PREFIX, '');
  return stripped === '' ? '/' : stripped;
}

// Rutas de marketing exactas: las de MARKETING_PAGES más el aviso de privacidad.
const MARKETING_PATHS = new Set<string>([...MARKETING_PAGES.map((p) => p.path), '/aviso-de-privacidad']);

function trimTrailingSlash(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

export function resolveScope(pathname: string): TrackingScope {
  const path = trimTrailingSlash(stripLocale(pathname));

  if (MARKETING_PATHS.has(path)) return 'marketing';

  const demoId = demoIdFromPath(pathname);
  if (demoId) return 'demo';

  if (path === '/login' || path === '/admin' || path.startsWith('/admin/')) return 'admin';

  return null;
}

// `/wedding/<id>` (con o sin prefijo de idioma): devuelve el id solo si es una demo conocida.
export function demoIdFromPath(pathname: string): DemoId | null {
  const match = /^\/wedding\/([^/]+)\/?$/.exec(stripLocale(pathname));
  return match && isDemoId(match[1]) ? match[1] : null;
}

// Primer segmento legible de la ruta, usado en `page` y en la etiqueta de WhatsApp.
export function pageKey(pathname: string): string {
  const path = trimTrailingSlash(stripLocale(pathname));
  if (path === '/') return 'home';
  if (path === '/wedding-planners') return 'planners';
  if (path === '/preguntas-frecuentes') return 'faq';
  if (path === '/aviso-de-privacidad') return 'privacidad';
  if (path.startsWith('/disenos/')) return `disenos-${path.slice('/disenos/'.length)}`;
  if (path.startsWith('/wedding/')) return 'demo';
  return path.slice(1).replace(/\//g, '-') || 'home';
}

// El ID de boda viaja en la URL del admin y contiene los nombres de la pareja:
// `/es/admin/wedding-editor/karen-y-juan` -> `/admin/wedding-editor/:weddingId`.
// Funciona con rutas y con URLs absolutas (`$current_url`, `$referrer`).
const ADMIN_WEDDING_URL = /(?:\/(?:es|en))?\/admin\/(wedding-editor|guests|confirmations)\/[^/?#\s]+/g;

export function sanitizeUrl(value: string): string {
  return value.replace(ADMIN_WEDDING_URL, '/admin/$1/:weddingId');
}
