import LandingPage from '../components/LandingPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invyta - Invitaciones Digitales Elegantes para Bodas | Crea tu Invitación Online',
  description: 'Crea invitaciones digitales únicas y elegantes para tu boda con Invyta. Diseños personalizables, gestión de invitados, RSVP en tiempo real y mucho más. ¡Empieza gratis hoy!',
  keywords: [
    'invitaciones digitales',
    'invitaciones de boda',
    'invitaciones online',
    'invitaciones virtuales',
    'invitaciones electrónicas',
    'bodas digitales',
    'wedding invitations',
    'invitaciones personalizadas',
    'save the date digital',
    'RSVP online',
    'gestión de invitados',
    'invitaciones móviles',
    'invitaciones responsive',
    'invitaciones elegantes',
    'invitaciones modernas',
    'invitaciones baratas',
    'invitaciones gratis',
    'crear invitación boda',
    'diseño invitaciones',
    'invitaciones México',
    'invitaciones matrimonio',
    'invitaciones interactivas',
    'invitaciones animadas',
    'invitaciones con mapa',
    'confirmación asistencia',
    'lista de regalos digital',
    'cronograma boda',
    'invitaciones ecológicas',
    'sin papel',
    'sustentable'
  ],
  authors: [{ name: 'Invyta' }],
  creator: 'Invyta',
  publisher: 'Invyta',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://invyta.com'),
  alternates: {
    canonical: '/',
    languages: {
      'es-MX': '/es',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'Invyta - Invitaciones Digitales Elegantes para Bodas',
    description: 'Crea invitaciones digitales únicas y elegantes para tu boda. Diseños personalizables, gestión de invitados y RSVP en tiempo real.',
    url: 'https://invyta.com',
    siteName: 'Invyta',
    images: [
      {
        url: '/assets/landing/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Invyta - Invitaciones Digitales para Bodas',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invyta - Invitaciones Digitales Elegantes para Bodas',
    description: 'Crea invitaciones digitales únicas y elegantes para tu boda. Diseños personalizables, gestión de invitados y RSVP en tiempo real.',
    images: ['/assets/landing/og-image.jpg'],
    creator: '@invyta',
    site: '@invyta',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#d97706',
      },
    ],
  },
  manifest: '/site.webmanifest',
  other: {
    'theme-color': '#d97706',
    'msapplication-TileColor': '#d97706',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Invyta',
    'application-name': 'Invyta',
    'mobile-web-app-capable': 'yes',
  },
};

export default function HomePage() {
  return <LandingPage />;
} 