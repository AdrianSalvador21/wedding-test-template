import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['es', 'en'];

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  // Validar locale
  if (!locales.includes(locale)) {
    notFound();
  }

  try {
    const t = await getTranslations({ locale, namespace: 'hero' });
    
    return {
      title: `${t('title')} - Invitación de Boda`,
      description: `Nos casamos el ${t('date')}. Acompáñanos en este día tan especial lleno de amor y alegría.`,
      keywords: ["boda", "invitación", "wedding", "María", "Carlos", "21 de noviembre", "2025"],
      authors: [{ name: "María & Carlos" }],
      openGraph: {
        title: `${t('title')} - Invitación de Boda`,
        description: `Nos casamos el ${t('date')}. Acompáñanos en este día tan especial.`,
        type: "website",
        locale: locale === 'es' ? 'es_ES' : 'en_US',
        url: `https://maria-carlos-wedding.vercel.app/${locale}`,
        siteName: `Boda ${t('title')}`,
        images: [
          {
            url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80",
            width: 1200,
            height: 630,
            alt: `${t('title')} - Invitación de Boda`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${t('title')} - Invitación de Boda`,
        description: `Nos casamos el ${t('date')}. Acompáñanos en este día tan especial.`,
        images: ["https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80"],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    // Fallback metadata si hay error
    return {
      title: "María & Carlos - Invitación de Boda",
      description: "Nos casamos el 21 de noviembre de 2025. Acompáñanos en este día tan especial.",
    };
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Validar locale
  if (!locales.includes(locale)) {
    notFound();
  }

  // Obtener mensajes para el locale actual - IMPORTANTE: pasar el locale explícitamente
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
} 