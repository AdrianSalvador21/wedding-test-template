'use client';

import { useState } from 'react';
import { useWedding } from '../src/store/hooks';
import Hero from './sections/Hero';
import Countdown from './sections/Countdown';
import About from './sections/About';
import Gallery from './sections/Gallery';
import Timeline from './sections/Timeline';
import DressCode from './sections/DressCode';
import GiftRegistry from './sections/GiftRegistry';
import Accommodation from './sections/Accommodation';
import RSVP from './sections/RSVP';
import Location from './sections/Location';
import Footer from './sections/Footer';
import InvitationOverlay from './InvitationOverlay';

interface WeddingTemplateProps {
  guestId?: string | null;
}

export default function WeddingTemplate({ guestId }: WeddingTemplateProps) {
  const { currentWedding, loading, error, initialized } = useWedding();
  const [showOverlay, setShowOverlay] = useState(!!guestId);

  // Estado de carga
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-800 font-medium">Cargando invitación...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitación no encontrada</h2>
          <p className="text-gray-600 mb-6">
            {error || 'No pudimos encontrar esta invitación. Verifica que el enlace sea correcto.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // Renderizar la invitación completa
  return (
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
      <RSVP />
      <Footer />
      
      {/* Overlay de invitación personalizada */}
      {showOverlay && guestId && currentWedding && (
        <InvitationOverlay
          guestId={guestId}
          weddingId={currentWedding.id}
          onClose={() => setShowOverlay(false)}
        />
      )}
    </main>
  );
}
