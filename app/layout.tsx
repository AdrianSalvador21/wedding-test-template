import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces, Manrope } from 'next/font/google';
import ReduxProvider from '../src/components/providers/ReduxProvider';
import DataInitializer from '../src/components/providers/DataInitializer';
import AnalyticsProvider from '../components/analytics/AnalyticsProvider';
import { SITE } from '../lib/site';

const inter = Inter({ subsets: ['latin'] });

// Fuentes de la marca (landing, páginas de marketing y paneles de admin).
// Se exponen como variables CSS; lib/brand.ts y components/admin/ui.tsx las usan.
const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-fraunces',
});
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  // Las etiquetas solo se emiten si la variable existe (spec 10, paso 16).
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: SITE.themeColor,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className={inter.className}>
        <ReduxProvider>
          <DataInitializer>
            {children}
          </DataInitializer>
        </ReduxProvider>
        <AnalyticsProvider />
      </body>
    </html>
  );
}
