'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWedding } from '../src/store/hooks';
import { useTranslations } from '../lib/translations';
import { ThemeProvider } from '../lib/theme-context';
import { createWeddingTheme } from '../lib/theme-utils';
import { guestService } from '../services/guestService';
import { FirebaseGuest } from '../src/types/wedding';
import Hero from './sections/Hero';
import Countdown from './sections/Countdown';
import About from './sections/About';
import Gallery from './sections/Gallery';
import Timeline from './sections/Timeline';
import DressCode from './sections/DressCode';
import GiftRegistry from './sections/GiftRegistry';
import Accommodation from './sections/Accommodation';
import AdultOnlyEvent from './sections/AdultOnlyEvent';
import RecommendedPlaces from './sections/RecommendedPlaces';
import RSVP from './sections/RSVP';
import Location from './sections/Location';
import Footer from './sections/Footer';
import InvitationOverlay from './InvitationOverlay';
import MusicPlayer from './MusicPlayer';

interface WeddingTemplateProps {
  guestId?: string | null;
}

export default function WeddingTemplate({ guestId }: WeddingTemplateProps) {
  const { currentWedding, loading, error, initialized } = useWedding();
  const { t } = useTranslations('template');
  const [showOverlay, setShowOverlay] = useState(false);
  const [guestInfo, setGuestInfo] = useState<FirebaseGuest | null>(null);
  const [guestLoading, setGuestLoading] = useState(!!guestId);

  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as string;

  // Buscar información del invitado en Firebase y validar idioma
  useEffect(() => {
    const fetchGuestInfo = async () => {
      if (!guestId || !currentWedding?.id) {
        setGuestLoading(false);
        return;
      }

      try {
        setGuestLoading(true);
        const guest = await guestService.getGuestByGuestId(guestId, currentWedding.id);
        
        if (guest) {
          setGuestInfo(guest);
          setShowOverlay(true); // Solo mostrar overlay si encontramos info del invitado

          // Validar idioma del invitado
          if (guest.language && guest.language !== currentLocale) {
            // Redireccionar al idioma correcto del invitado
            const correctUrl = `/${guest.language}/wedding/${currentWedding.id}?guest=${guestId}`;
            router.replace(correctUrl);
            return;
          }
        } else {
          setGuestInfo(null);
          setShowOverlay(false); // No mostrar overlay si no hay info del invitado
        }
      } catch (error) {
        console.error('Error buscando invitado:', error);
        setGuestInfo(null);
        setShowOverlay(false); // No mostrar overlay en caso de error
      } finally {
        setGuestLoading(false);
      }
    };

    fetchGuestInfo();
  }, [guestId, currentWedding?.id, currentLocale, router]);

  // Estado de carga
  if (!initialized || loading || guestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-800 font-medium">
            {guestLoading ? 'Cargando información del invitado...' : t('loading')}
          </p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error || !currentWedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('notFound')}</h2>
          <p className="text-gray-600 mb-6">
            {error || t('notFoundMessage')}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  // Crear tema basado en los datos del servicio
  const weddingTheme = createWeddingTheme(currentWedding);
  
  // Debug: mostrar tema creado
  console.log('🎨 Tema creado para boda:', currentWedding.id, 'tema:', weddingTheme.id, weddingTheme.name);

  // Renderizar la invitación completa
  return (
    <ThemeProvider weddingTheme={weddingTheme}>
      <main className="min-h-screen">
        <Hero />
        <Countdown />
        <Location />
        <About />
        <Gallery />
        <Timeline />
        <DressCode />
        <GiftRegistry />
        <Accommodation />
        <AdultOnlyEvent />
        <RecommendedPlaces />
        <RSVP />
        <Footer />
        
        {/* Overlay de invitación personalizada */}
        {showOverlay && guestId && currentWedding && (
          <InvitationOverlay
            guestId={guestId}
            weddingId={currentWedding.id}
            guestInfo={guestInfo}
            onClose={() => setShowOverlay(false)}
          />
        )}

        {/* Reproductor de música de fondo */}
        {currentWedding.music && (
          <MusicPlayer music={currentWedding.music} />
        )}
      </main>

      {/* Footer Invyta */}
      <footer className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <a
              href="https://invyta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <div className="text-xl font-serif font-bold text-white">
                invyta
              </div>
            </a>
          </div>
        </div>
      </footer>
    </ThemeProvider>
  );
}
