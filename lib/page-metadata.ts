import type { Metadata } from 'next';
import { SITE } from './site';

// Metadatos comunes de las páginas de marketing (spec 10).
// Título ≤ 60 y descripción ≤ 155 caracteres; el canonical es la ruta propia de la página.
// La imagen para compartir sale de app/opengraph-image.tsx y app/twitter-image.tsx.
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE.name,
      locale: SITE.locale,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}
