import { MetadataRoute } from 'next';
import { MARKETING_PAGES, absoluteUrl } from '../lib/site';

// Solo URLs canónicas, indexables y con respuesta 200 (sin fragmentos ni
// redirecciones). Se derivan de MARKETING_PAGES: agregar una página allí la
// incluye aquí. `lastModified` es la fecha del último cambio real de contenido.
export default function sitemap(): MetadataRoute.Sitemap {
  return MARKETING_PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: new Date(`${page.lastModified}T00:00:00Z`),
    changeFrequency: page.path === '/' ? 'weekly' : 'monthly',
    priority: page.path === '/' ? 1 : 0.8,
  }));
}
