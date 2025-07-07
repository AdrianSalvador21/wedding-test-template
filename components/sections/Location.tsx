'use client';

import React from 'react';
import { ExternalLink, Church, Music4 } from 'lucide-react';
import { openExternalLink } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { getFloralBackgroundStyle } from '../../lib/floral-patterns';

const Location = () => {
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);

  // Datos dinámicos con fallbacks
  const ceremonyVenue = weddingData?.event.ceremonyVenue;
  const receptionVenue = weddingData?.event.receptionVenue;
  


  const handleMapsClick = (venue: { name: string; address: string; coordinates?: { lat: number; lng: number } }) => {
    if (venue?.coordinates) {
      openExternalLink(`https://maps.google.com/maps?q=${venue.coordinates.lat},${venue.coordinates.lng}`);
    } else {
      openExternalLink(`https://maps.google.com/maps?q=${encodeURIComponent(venue?.name + ' ' + venue?.address)}`);
    }
  };

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section 
        className="py-12 bg-white relative overflow-hidden"
        style={getFloralBackgroundStyle(2, '240px')}
      >
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">Ubicación del Evento</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
          </div>

          <div className="max-w-lg mx-auto space-y-8">
            {/* Ceremonia */}
            {ceremonyVenue && (
              <div className="bg-gradient-to-br from-light to-white rounded-2xl p-6 shadow-lg">
                <div className="text-center mb-8">
                  <Church className="w-8 h-8 mx-auto mb-4 text-accent" />
                  <h3 className="text-xl font-heading font-semibold text-primary mb-2">
                    Ceremonia Religiosa
                  </h3>
                  <h4 className="text-lg font-semibold text-dark mb-2">
                    {ceremonyVenue.name}
                  </h4>
                  <p className="text-text">{ceremonyVenue.address}</p>
                </div>



                {/* Botón de direcciones */}
                <button
                  onClick={() => handleMapsClick(ceremonyVenue)}
                  className="w-full bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Cómo llegar</span>
                </button>
              </div>
            )}

            {/* Recepción */}
            {receptionVenue && (
              <div className="bg-gradient-to-br from-light to-white rounded-2xl p-6 shadow-lg">
                <div className="text-center mb-8">
                  <Music4 className="w-8 h-8 mx-auto mb-4 text-accent" />
                  <h3 className="text-xl font-heading font-semibold text-primary mb-2">
                    Recepción
                  </h3>
                  <h4 className="text-lg font-semibold text-dark mb-2">
                    {receptionVenue.name}
                  </h4>
                  <p className="text-text">{receptionVenue.address}</p>
                </div>



                {/* Botón de direcciones */}
                <button
                  onClick={() => handleMapsClick(receptionVenue)}
                  className="w-full bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Cómo llegar</span>
                </button>
              </div>
            )}


          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <section id="location" className="py-12 bg-white">
        <div className="section-container">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
            <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="h-64 bg-gray-200 rounded-2xl" />
              <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Versión para desktop con animaciones CSS
  return (
    <section 
      id="location" 
      className="py-12 bg-white relative overflow-hidden"
      style={getFloralBackgroundStyle(2, '240px')}
    >
      <div className="section-container">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-12 animation-delay-200">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">Ubicación del Evento</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            
            {/* Información del lugar */}
            <div className="grid lg:grid-cols-2 gap-8 animation-delay-400">
              
              {/* Ceremonia */}
              {ceremonyVenue && (
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="text-center mb-8">
                    <Church className="w-12 h-12 mx-auto mb-6 text-accent" />
                    <h3 className="text-2xl font-heading font-semibold text-primary mb-2">
                      Ceremonia Religiosa
                    </h3>
                    <h4 className="text-xl font-semibold text-dark mb-2">
                      {ceremonyVenue.name}
                    </h4>
                    <p className="text-text text-lg mb-4">{ceremonyVenue.address}</p>
                  </div>

                  {/* Botón de direcciones */}
                  <button
                    onClick={() => handleMapsClick(ceremonyVenue)}
                    className="w-full bg-gradient-primary text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Cómo llegar</span>
                  </button>
                </div>
              )}

              {/* Recepción */}
              {receptionVenue && (
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="text-center mb-8">
                    <Music4 className="w-12 h-12 mx-auto mb-6 text-accent" />
                    <h3 className="text-2xl font-heading font-semibold text-primary mb-2">
                      Recepción
                    </h3>
                    <h4 className="text-xl font-semibold text-dark mb-2">
                      {receptionVenue.name}
                    </h4>
                    <p className="text-text text-lg mb-4">{receptionVenue.address}</p>
                  </div>

                  {/* Botón de direcciones */}
                  <button
                    onClick={() => handleMapsClick(receptionVenue)}
                    className="w-full bg-gradient-primary text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Cómo llegar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location; 