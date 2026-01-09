'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { openExternalLink } from '@/lib/utils';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { useTranslations } from '../../lib/translations';
import { RecommendedPlace } from '../../src/types/wedding';
import { RecommendedPlacesIcon } from '../icons';

const RecommendedPlaces = () => {
  const { t } = useTranslations('recommendedPlaces');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();
  const params = useParams();
  const currentLocale = params.locale as string;

  // Si showRecommendedPlaces es false, no mostrar la sección
  if (weddingData?.showRecommendedPlaces === false) {
    return null;
  }

  // Debug: mostrar estructura de datos (temporal)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗺️ RecommendedPlaces Debug:', {
      weddingData: weddingData?.id,
      showRecommendedPlaces: weddingData?.showRecommendedPlaces,
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
        
        {/* Título con animaciones suaves */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="flex items-center justify-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <RecommendedPlacesIcon 
              size={28} 
              className="text-accent mr-3 opacity-80" 
            />
            <h2 className="section-title text-stone-600 opacity-90">
              {t('title')}
            </h2>
          </motion.div>
          
          <motion.div 
            className="title-decorative-line mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 64 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          />
          
          <motion.p 
            className="section-subtitle"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          >
            {t('subtitle')}
          </motion.p>
          
          <motion.p 
            className="text-stone-600 font-body text-sm mt-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          >
            {t('description')}
          </motion.p>
        </motion.div>

        {/* Grid de lugares con animaciones escalonadas */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {places.map((place, index) => (
              <motion.div 
                key={place.id}
                className="bg-white rounded-lg shadow-sm border border-stone-100 p-6 hover:shadow-md transition-all duration-300 hover:border-stone-200"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.8 + (index * 0.1), // Animación escalonada
                  ease: [0.25, 0.46, 0.45, 0.94] // Curva de animación elegante
                }}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
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
                <motion.button
                  onClick={() => openExternalLink(getMapsUrl(place))}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-transparent text-accent hover:text-accent-dark transition-colors font-body font-medium text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <MapPin className="w-4 h-4" />
                  {t('button')}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendedPlaces;
