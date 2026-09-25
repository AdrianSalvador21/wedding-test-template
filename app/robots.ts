import type { MetadataRoute } from 'next';
import { absoluteUrl } from '../lib/site';

// Las invitaciones y las demos (/wedding/*) NO se bloquean aquí: Google solo lee
// su `noindex` (meta + X-Robots-Tag, ver next.config.js) si puede rastrearlas.
// Sí se bloquean los enlaces personales por invitado (?guest=), la API y los paneles.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/*/admin/',
          '/login',
          '/*/login',
          '/*?guest=',
          '/demo/',
          '/*/demo/',
          '/typography-test/',
          '/*/typography-test/',
          '/*/invitation/',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
