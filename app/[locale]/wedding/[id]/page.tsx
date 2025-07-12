import type { Metadata } from 'next';
import { getMockWeddingData } from '../../../../src/data/mockData';
import WeddingPageClient from '../../../../components/WeddingPageClient';

interface WeddingPageProps {
  params: { id: string };
  searchParams: { guest?: string };
}

// Generar metadatos dinámicos para cada boda
export async function generateMetadata({ params }: WeddingPageProps): Promise<Metadata> {
  const weddingData = getMockWeddingData(params.id);
  
  if (!weddingData) {
    return {
      title: 'Invitación de Boda',
      description: 'Una celebración especial te espera.',
    };
  }

  const { couple, event } = weddingData;
  const weddingDate = new Date(event.date);
  const formattedDate = weddingDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const title = `${couple.bride.name} & ${couple.groom.name} - Invitación de Boda`;
  const description = `Te invitamos a celebrar nuestro amor el ${formattedDate}. ${couple.story.substring(0, 160)}...`;
  
  // Crear keywords con verificaciones de seguridad
  const keywords = [
    'boda',
    'invitación',
    'wedding',
    couple.bride.name,
    couple.groom.name,
    formattedDate,
    weddingDate.getFullYear().toString(),
  ];

  // Agregar venue names solo si existen
  if (event.ceremonyVenue?.name) {
    keywords.push(event.ceremonyVenue.name);
  }
  if (event.receptionVenue?.name) {
    keywords.push(event.receptionVenue.name);
  }
  
  return {
    title,
    description,
    keywords,
    authors: [{ name: `${couple.bride.name} & ${couple.groom.name}` }],
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: weddingData.heroImage.url,
          width: 1200,
          height: 630,
          alt: weddingData.heroImage.alt,
        },
      ],
      siteName: 'Invitación de Boda',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [weddingData.heroImage.url],
    },
    robots: {
      index: false, // Las invitaciones no deberían ser indexadas
      follow: false,
    },
  };
}

export default function WeddingPage({ params, searchParams }: WeddingPageProps) {
  const weddingId = params.id;
  const guestId = searchParams.guest || null;

  return <WeddingPageClient weddingId={weddingId} guestId={guestId} />;
}
