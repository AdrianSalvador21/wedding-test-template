// Fuente única del host canónico y de los datos de marca (spec 10).
// Ninguna otra parte del código debe escribir `https://invyta.me` a mano.

export const SITE = {
  url: 'https://www.invyta.me', // host canónico, sin barra final
  name: 'Invyta',
  locale: 'es_MX',
  email: 'hola@invyta.me',
  phone: '+52 960 246 0590', // el enlace wa.me está en lib/contact.ts
  themeColor: '#C6663C',
  social: { instagram: 'https://www.instagram.com/invyta.me' }, // TikTok: pendiente (la cuenta aún no existe)
} as const;

export const absoluteUrl = (path: string) => `${SITE.url}${path === '/' ? '' : path}`;

// Rutas que NO pasan por el middleware de idioma: páginas de marketing y
// archivos generados (íconos, imagen para compartir). Coincide la ruta exacta
// o cualquier subruta (`/disenos/clasico`, `/icons/192`).
export const NON_LOCALIZED_PATHS = [
  '/',
  '/paquetes',
  '/wedding-planners',
  '/preguntas-frecuentes',
  '/disenos',
  '/icon',
  '/apple-icon',
  '/opengraph-image',
  '/twitter-image',
  '/icons',
] as const;

export function isNonLocalizedPath(pathname: string): boolean {
  return NON_LOCALIZED_PATHS.some((p) => (p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(`${p}/`)));
}

// Páginas indexables: de aquí salen el sitemap y los enlaces internos.
// `lastModified` es la fecha del último cambio real de contenido (YYYY-MM-DD),
// nunca `new Date()`.
export interface MarketingPage {
  path: string;
  title: string;
  lastModified: string;
}

export const MARKETING_PAGES: MarketingPage[] = [
  { path: '/', title: 'Invitaciones digitales para boda', lastModified: '2026-09-25' },
  { path: '/paquetes', title: 'Precios de invitaciones digitales para boda', lastModified: '2026-09-25' },
  { path: '/disenos/clasico', title: 'Invitación digital de boda clásica', lastModified: '2026-09-25' },
  { path: '/disenos/moderno', title: 'Invitación digital de boda moderna', lastModified: '2026-09-25' },
  { path: '/disenos/botanica-editorial', title: 'Invitación digital de boda botánica editorial', lastModified: '2026-09-25' },
  { path: '/wedding-planners', title: 'Invitaciones digitales para wedding planners', lastModified: '2026-09-25' },
  { path: '/preguntas-frecuentes', title: 'Preguntas frecuentes de invitaciones digitales', lastModified: '2026-09-25' },
];
