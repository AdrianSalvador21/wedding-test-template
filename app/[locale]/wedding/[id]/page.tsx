import type { Metadata } from 'next';
import { getMockWeddingData } from '../../../../src/data/mockData';
import WeddingPageClient from '../../../../components/WeddingPageClient';

interface WeddingPageProps {
  params: { id: string; locale: string };
  searchParams: { guest?: string };
}

// Generar metadatos dinámicos para cada boda
export async function generateMetadata({ params }: WeddingPageProps): Promise<Metadata> {
  const weddingData = getMockWeddingData(params.id);
  
  if (!weddingData) {
    return {
      title: params.locale === 'en' ? 'Wedding Invitation' : 'Invitación de Boda',
      description: params.locale === 'en' 
        ? 'A special celebration awaits you. Love, joy, and unforgettable moments.'
        : 'Una celebración especial te espera. Amor, alegría y momentos inolvidables.',
    };
  }

  const { couple, event } = weddingData;
  const weddingDate = new Date(event.date);
  const formattedDate = weddingDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Metadatos íntimos y personales para la invitación
  const title = params.locale === 'en' 
    ? `${couple.bride.name} & ${couple.groom.name} - Our Wedding Day`
    : `${couple.bride.name} & ${couple.groom.name} - Nuestra Boda`;
    
  const storyText = typeof couple.story === 'object' && couple.story 
    ? (couple.story[params.locale as 'es' | 'en'] || couple.story.es || '')
    : (couple.story as string || '');
    
  const description = params.locale === 'en'
    ? `Join us as we celebrate our love and begin our journey together as husband and wife on ${weddingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Your presence would make our special day even more meaningful. ${storyText.substring(0, 120)}...`
    : `Acompáñanos a celebrar nuestro amor y el inicio de nuestro camino juntos como esposos el ${formattedDate}. Tu presencia hará que nuestro día especial sea aún más significativo. ${storyText.substring(0, 120)}...`;
  
  // Crear keywords íntimas y personales
  const keywords = [
    params.locale === 'en' ? 'wedding' : 'boda',
    params.locale === 'en' ? 'wedding invitation' : 'invitación de boda',
    params.locale === 'en' ? 'love celebration' : 'celebración de amor',
    params.locale === 'en' ? 'marriage' : 'matrimonio',
    couple.bride.name,
    couple.groom.name,
    `${couple.bride.name} ${couple.groom.name}`,
    formattedDate,
    weddingDate.getFullYear().toString(),
    params.locale === 'en' ? 'join us' : 'acompáñanos',
    params.locale === 'en' ? 'special day' : 'día especial'
  ];

  // Agregar venue names solo si existen
  if (event.ceremonyVenue?.name) {
    const ceremonyName = typeof event.ceremonyVenue.name === 'object' 
      ? (event.ceremonyVenue.name[params.locale as 'es' | 'en'] || event.ceremonyVenue.name.es || '')
      : (event.ceremonyVenue.name as string || '');
    if (ceremonyName) keywords.push(ceremonyName);
  }
  if (event.receptionVenue?.name) {
    const receptionName = typeof event.receptionVenue.name === 'object' 
      ? (event.receptionVenue.name[params.locale as 'es' | 'en'] || event.receptionVenue.name.es || '')
      : (event.receptionVenue.name as string || '');
    if (receptionName) keywords.push(receptionName);
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
      siteName: params.locale === 'en' ? 'Wedding Invitation' : 'Invitación de Boda',
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
