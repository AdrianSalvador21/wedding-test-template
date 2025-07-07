'use client';

import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { openExternalLink } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';

const Accommodation = () => {
  const { t } = useTranslations('location');
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);

  const accommodationOptions = weddingData?.accommodation || [
    {
      name: 'Hotel Boutique Central',
      distance: '5 min del lugar',
      price: 'Desde $120/noche',
      phone: '+52 55 1111-2222'
    },
    {
      name: 'Casa de Huéspedes Jardín',
      distance: '10 min del lugar', 
      price: 'Desde $80/noche',
      phone: '+52 55 3333-4444'
    },
    {
      name: 'Hotel Familiar Plaza',
      distance: '15 min del lugar',
      price: 'Desde $95/noche',
      phone: '+52 55 5555-6666'
    }
  ];

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section className="py-12 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">Hospedaje Recomendado</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
            <p className="section-subtitle">
              Opciones de alojamiento cercanas al evento
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            {/* Hospedaje */}
            <div className="bg-gradient-to-br from-light to-white rounded-2xl p-6 shadow-lg">
              <div className="space-y-3">
                {accommodationOptions.map((hotel, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-border hover:border-accent hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-opacity-20 transition-colors duration-200">
                          <MapPin className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-dark text-sm">{hotel.name}</h4>
                          <p className="text-xs text-text opacity-70">{hotel.distance}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => openExternalLink(`https://maps.google.com/maps?q=${encodeURIComponent(hotel.name)}`)}
                        className="flex items-center space-x-1 text-accent hover:text-primary transition-colors duration-200 text-sm font-medium px-2 py-1 rounded-md hover:bg-accent hover:bg-opacity-10"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Ver</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <section className="py-12 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
            <div className="max-w-4xl mx-auto">
              <div className="h-96 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Versión para desktop con animaciones CSS
  return (
    <section className="py-12 bg-gradient-to-br from-light via-white to-light">
      <div className="section-container">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-12 animation-delay-200">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">Hospedaje Recomendado</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
            <p className="section-subtitle">
              Opciones de alojamiento cercanas al evento
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Hospedaje recomendado */}
            <div className="animation-delay-400">
              <div className="bg-gradient-to-br from-light to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-heading font-semibold text-primary mb-4">
                    Hoteles Cercanos
                  </h3>
                  <p className="text-text opacity-80">
                    Te recomendamos estos hoteles para tu comodidad
                  </p>
                </div>
                
                <div className="space-y-4">
                  {accommodationOptions.map((hotel, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-accent group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-xl flex items-center justify-center group-hover:bg-opacity-20 transition-all duration-200">
                            <MapPin className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-primary">{hotel.name}</h4>
                            <p className="text-text opacity-70">{hotel.distance}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => openExternalLink(`https://maps.google.com/maps?q=${encodeURIComponent(hotel.name)}`)}
                          className="flex items-center space-x-2 text-accent hover:text-primary transition-all duration-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent hover:bg-opacity-10 hover:scale-105"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Ver ubicación</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Accommodation; 