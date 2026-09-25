// Constructores de datos estructurados (schema.org) — spec 10.
// Solo hechos verificados: nada de foundingDate, "líder", reseñas ni perfiles que
// no existan. Los precios salen de PACKAGES (misma constante que la landing).

import { SITE, absoluteUrl } from './site';
import { PACKAGES, type FaqItem } from './marketing-content';

const ORG_ID = `${SITE.url}/#organization`;

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE.name,
  url: SITE.url,
  logo: absoluteUrl('/icons/512'),
  description:
    'Invitaciones digitales para boda con enlace único por invitado y confirmación de asistencia en tiempo real.',
  email: SITE.email,
  telephone: SITE.phone,
  areaServed: 'MX',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: SITE.phone,
    email: SITE.email,
    availableLanguage: ['es'],
    areaServed: 'MX',
  },
  sameAs: [SITE.social.instagram],
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url,
  inLanguage: 'es-MX',
  publisher: { '@id': ORG_ID },
});

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Inicio', path: '/' }, ...items].map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const packagesSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Invitaciones digitales para boda',
  serviceType: 'Invitación digital de boda',
  url: absoluteUrl('/paquetes'),
  areaServed: 'MX',
  provider: { '@id': ORG_ID },
  offers: PACKAGES.map((pkg) => ({
    '@type': 'Offer',
    name: pkg.name,
    description: pkg.forWho,
    price: pkg.price,
    priceCurrency: pkg.currency,
    url: absoluteUrl('/paquetes'),
  })),
});

export const faqSchema = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
});
