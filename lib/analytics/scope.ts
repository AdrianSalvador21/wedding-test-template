// Decide si una ruta se mide y cómo (specs 11 y 31). Funciones puras, sin dependencias del navegador.
import { MARKETING_PAGES } from '../site';
import { isDemoId, type DemoId } from './demos';

// 'marketing':  páginas públicas del sitio. GA4 + trazas automáticas de Performance.
// 'demo':       demos públicas de invitación y sus subrutas. GA4 + trazas automáticas.
// 'admin':      login y paneles de admin. GA4 sin personalización de anuncios. Sin trazas automáticas.
// 'invitation': invitaciones reales, su save the date y su álbum. GA4 sin personalización de
//               anuncios y SIN ID de boda ni `?guest=`. Sin trazas automáticas. Nunca GoogleAdsTag.
// null:         cualquier otra ruta: no se envía nada.
export type TrackingScope = 'marketing' | 'demo' | 'admin' | 'invitation' | null;

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

// `/wedding/<id>`, `/wedding/<id>/aparta-la-fecha` y `/wedding/<id>/fotos`.
const WEDDING_PATH = /^\/wedding\/([^/]+)(?:\/(aparta-la-fecha|fotos))?\/?$/;

type WeddingSubpage = 'invitation' | 'save_the_date' | 'album';

function parseWeddingPath(pathname: string): { id: string; subpage: WeddingSubpage } | null {
  const match = WEDDING_PATH.exec(stripLocale(pathname));
  if (!match) return null;
  const subpage = match[2] === 'aparta-la-fecha' ? 'save_the_date' : match[2] === 'fotos' ? 'album' : 'invitation';
  return { id: match[1], subpage };
}

export function resolveScope(pathname: string): TrackingScope {
  const path = trimTrailingSlash(stripLocale(pathname));

  if (MARKETING_PATHS.has(path)) return 'marketing';

  const wedding = parseWeddingPath(pathname);
  if (wedding) return isDemoId(wedding.id) ? 'demo' : 'invitation';

  if (path === '/login' || path === '/admin' || path.startsWith('/admin/')) return 'admin';
  // Spec 33 — el modo hostess es una herramienta del personal: se mide como admin, con la ruta saneada.
  if (path.startsWith('/check-in/')) return 'admin';

  return null;
}

// `/wedding/<id>` y sus subrutas (con o sin prefijo de idioma): devuelve el id solo si es una demo.
export function demoIdFromPath(pathname: string): DemoId | null {
  const wedding = parseWeddingPath(pathname);
  return wedding && isDemoId(wedding.id) ? wedding.id : null;
}

// Primer segmento legible de la ruta, usado en `page` y en la etiqueta de WhatsApp.
export function pageKey(pathname: string): string {
  const path = trimTrailingSlash(stripLocale(pathname));
  if (path === '/') return 'home';
  if (path === '/wedding-planners') return 'planners';
  if (path === '/preguntas-frecuentes') return 'faq';
  if (path === '/aviso-de-privacidad') return 'privacidad';
  if (path.startsWith('/disenos/')) return `disenos-${path.slice('/disenos/'.length)}`;
  if (path.startsWith('/wedding/')) return demoIdFromPath(pathname) ? 'demo' : 'invitacion';
  if (path.startsWith('/check-in/')) return 'check-in';
  return path.slice(1).replace(/\//g, '-') || 'home';
}

// Título que viaja en `page_title`. `null` = usar `document.title` (marketing y demos, sin datos
// reales). En invitaciones y admin es fijo: `document.title` podría llevar nombres de personas.
export function pageTitleFor(pathname: string, scope: TrackingScope): string | null {
  if (scope === 'invitation') {
    const subpage = parseWeddingPath(pathname)?.subpage;
    if (subpage === 'save_the_date') return 'Aparta la fecha';
    if (subpage === 'album') return 'Álbum';
    return 'Invitación';
  }
  if (scope === 'admin') {
    const path = trimTrailingSlash(stripLocale(pathname));
    if (path.startsWith('/check-in/')) return 'Check-in';
    return path === '/login' ? 'Login' : 'Admin';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Saneamiento de URLs (`page_location`, `page_referrer`)
// ---------------------------------------------------------------------------

// El ID de boda viaja en la URL y contiene los nombres de la pareja:
//   `/es/admin/panel/karen-y-juan/guests` -> `/admin/panel/:weddingId/guests`
//   `/en/wedding/karen-y-juan/fotos`      -> `/en/wedding/:weddingId/fotos` (las demos se conservan)
const ADMIN_WEDDING_PATH = /(?:\/(?:es|en))?\/admin\/panel\/[^/?#\s]+/g;
const WEDDING_ID_PATH = /\/wedding\/([^/?#\s]+)/g;
// Spec 33 — el código secreto del link de hostess nunca sale del navegador.
const CHECK_IN_CODE_PATH = /\/check-in\/[^/?#\s]+/g;

// Lista permitida de parámetros de consulta: cualquier otro (`guest`, `invitado`, `notrack`,
// `ga_debug` o uno nuevo con datos personales) se elimina.
const ALLOWED_QUERY_PARAMS = new Set([
  'src',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'preview',
  'vista',
]);

export function sanitizePath(pathname: string): string {
  return pathname
    .replace(ADMIN_WEDDING_PATH, '/admin/panel/:weddingId')
    .replace(CHECK_IN_CODE_PATH, '/check-in/:code')
    .replace(WEDDING_ID_PATH, (match, id: string) => (isDemoId(id) ? match : '/wedding/:weddingId'));
}

// Funciona con rutas (`/wedding/x?guest=1`) y con URLs absolutas. Otros textos se devuelven igual.
export function sanitizeUrl(value: string): string {
  const isAbsolute = /^https?:\/\//i.test(value);
  if (!isAbsolute && !value.startsWith('/')) return value;

  let url: URL;
  try {
    url = new URL(value, 'https://invyta.local');
  } catch {
    return sanitizePath(value.split(/[?#]/)[0]);
  }

  const query = new URLSearchParams();
  url.searchParams.forEach((paramValue, key) => {
    if (ALLOWED_QUERY_PARAMS.has(key)) query.append(key, paramValue);
  });
  const search = query.toString();
  const rest = `${sanitizePath(url.pathname)}${search ? `?${search}` : ''}${url.hash}`;
  return isAbsolute ? `${url.origin}${rest}` : rest;
}
