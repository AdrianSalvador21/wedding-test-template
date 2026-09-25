import LandingPage from '../components/LandingPage';
import { Metadata } from 'next';
import { SITE } from '../lib/site';

const title = 'Invitaciones digitales para boda | Invyta';
const description =
  'Invitaciones digitales para boda con enlace único por invitado, confirmación en tiempo real y entrega en 7 días hábiles. Desde $2,200 MXN.';

// La imagen para compartir sale de app/opengraph-image.tsx y app/twitter-image.tsx,
// y los íconos de app/icon.tsx y app/apple-icon.tsx (convenciones de archivo).
export const metadata: Metadata = {
  title,
  description,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  applicationName: SITE.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title,
    description,
    url: '/',
    siteName: SITE.name,
    locale: SITE.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
};

export default function HomePage() {
  return <LandingPage />;
}
