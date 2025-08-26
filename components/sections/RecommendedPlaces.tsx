'use client';

import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { useParams } from 'next/navigation';
import { openExternalLink } from '@/lib/utils';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { useTranslations } from '../../lib/translations';
import { RecommendedPlace } from '../../src/types/wedding';

const RecommendedPlaces = () => {
  const { t } = useTranslations('recommendedPlaces');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();
  const params = useParams();
  const currentLocale = params.locale as string;

  // Debug: mostrar estructura de datos (temporal)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗺️ RecommendedPlaces Debug:', {
      weddingData: weddingData?.id,
      recommendedPlaces: weddingData?.recommendedPlaces,
      accommodationRecommendedPlaces: weddingData?.accommodation?.recommendedPlaces
    });
  }

  // Manejar diferentes estructuras de datos - priorizar donde hay datos reales
  let places: RecommendedPlace[] = [];
  
  // Prioridad 1: accommodation.recommendedPlaces (estructura actual del admin)
  if (weddingData?.accommodation?.recommendedPlaces?.length) {
    places = weddingData.accommodation.recommendedPlaces as RecommendedPlace[];
    if (process.env.NODE_ENV === 'development') console.log('🗺️ Usando datos de accommodation.recommendedPlaces');
  }
  // Prioridad 2: recommendedPlaces como array directo (Firebase)
  else if (Array.isArray(weddingData?.recommendedPlaces) && weddingData.recommendedPlaces.length > 0) {
    places = weddingData.recommendedPlaces as RecommendedPlace[];
    if (process.env.NODE_ENV === 'development') console.log('🗺️ Usando datos de recommendedPlaces (array)');
  }
  // Prioridad 3: recommendedPlaces con estructura completa
  else if (weddingData?.recommendedPlaces && 
           typeof weddingData.recommendedPlaces === 'object' && 
           'places' in weddingData.recommendedPlaces &&
           weddingData.recommendedPlaces.enabled &&
           weddingData.recommendedPlaces.places?.length) {
    places = weddingData.recommendedPlaces.places;
    if (process.env.NODE_ENV === 'development') console.log('🗺️ Usando datos de recommendedPlaces.places');
  }

  // Si no hay lugares, no mostrar
  if (!places.length) {
    if (process.env.NODE_ENV === 'development') console.log('🗺️ No hay lugares para mostrar');
    return null;
  }

  if (process.env.NODE_ENV === 'development') console.log('🗺️ Lugares encontrados:', places.length, places);

  // Generar URL de Maps
  const getMapsUrl = (place: RecommendedPlace) => {
    if (place.coordinates) {
      return `https://maps.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(place.name + ' ' + place.address)}`;
  };

  return (
    <section 
      id="recommended-places" 
      className="relative overflow-hidden"
      style={{
        ...getBackgroundStyle(3, '400px'),
        backgroundPosition: '100px -200px',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '500px 800px'
      }}
    >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
        
        {/* Título siguiendo el patrón exacto de otras secciones */}
        <div className="text-center mb-12">
          <h2 className="section-title text-stone-600 opacity-90 mb-4">
            {t('title')}
          </h2>
          <div className="w-16 h-0.5 bg-accent mx-auto mb-6"></div>
          <p className="section-subtitle">
            {t('subtitle')}
          </p>
          <p className="text-stone-600 font-body text-sm mt-4 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Grid simple de lugares */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {places.map((place) => (
              <div 
                key={place.id} 
                className="bg-white rounded-lg shadow-sm border border-stone-100 p-6 hover:shadow-md transition-all duration-300 hover:border-stone-200"
              >
                {/* Nombre */}
                <h3 className="text-base font-body font-semibold text-stone-700 mb-3 leading-tight">
                  {place.name}
                </h3>

                {/* Descripción */}
                <p className="text-stone-600 font-body text-sm leading-relaxed mb-6">
                  {typeof place.description === 'object' 
                    ? (place.description[currentLocale as 'es' | 'en'] || place.description.es)
                    : place.description}
                </p>

                {/* Botón de Maps */}
                <button
                  onClick={() => openExternalLink(getMapsUrl(place))}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors font-body font-medium text-sm"
                >
                  <MapPin className="w-4 h-4" />
                  Ver ubicación
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendedPlaces;
