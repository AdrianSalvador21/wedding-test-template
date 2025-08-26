'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';
import { openExternalLink } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { useTranslations } from '../../lib/translations';
import { AccommodationIcon } from '../icons';

const Accommodation = () => {
  const { t } = useTranslations('accommodation');
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();

  // Si no hay hoteles configurados, no mostrar la sección
  if (!weddingData?.accommodation?.hotels?.length) {
    return null;
  }

  const accommodationOptions = weddingData.accommodation.hotels;

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section 
        className="bg-white relative overflow-hidden"
        style={{
          ...getBackgroundStyle(2, '240px'),
          backgroundSize: '400px 500px',
          backgroundRepeat: 'repeat',
          backgroundPosition: '-304px -136px'
        }}
      >
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
          {/* Título */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center mb-6">
              <AccommodationIcon 
                size={28} 
                className="text-accent mr-3 opacity-80" 
              />
              <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
            </div>
            <motion.div 
              className="w-16 h-0.5 bg-accent mx-auto mb-6"
              initial={{ width: 0 }}
              whileInView={{ width: 64 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            ></motion.div>
            <motion.p 
              className="section-subtitle"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              {t('subtitle')}
            </motion.p>
          </motion.div>

          <div className="max-w-lg mx-auto space-y-4">
            {/* Lista de hoteles sin cards */}
            {accommodationOptions.map((hotel, index) => (
              <motion.div 
                key={index} 
                className="py-2 px-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.5 + (index * 0.1), ease: "easeOut" }}
              >
                <div className="flex items-center justify-center mb-4">
                  <h4 className="text-base md:text-lg font-body font-semibold text-stone-700">{hotel.name}</h4>
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={() => openExternalLink(`https://maps.google.com/maps?q=${encodeURIComponent(hotel.name)}`)}
                    className="inline-flex items-center text-accent hover:text-accent-dark transition-colors font-body"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {t('seeLocation')}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
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
    <section 
      className="bg-white relative overflow-hidden"
      style={{
        ...getBackgroundStyle(2, '240px'),
        backgroundSize: '400px 500px',
        backgroundRepeat: 'repeat',
        backgroundPosition: '-304px -136px'
      }}
          >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-12 animation-delay-200">
            <div className="flex items-center justify-center mb-6">
              <AccommodationIcon 
                size={28} 
                className="text-accent mr-3 opacity-80" 
              />
              <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
            </div>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-6"></div>
            <p className="section-subtitle">
              {t('subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Hoteles recomendados - diseño limpio */}
            <div className="animation-delay-400">
              <div className="text-center mb-12">
                <MapPin className="w-12 h-12 mx-auto mb-6 text-accent" />
                <h3 className="text-2xl font-heading font-semibold text-primary mb-4">
                  {t('nearbyHotels')}
                </h3>
                <p className="text-text font-body opacity-80">
                  {t('description')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {accommodationOptions.map((hotel, index) => (
                  <div key={index} className="py-2 px-4">
                    <div className="flex items-center justify-center mb-4">
                      <h4 className="text-base md:text-lg font-body font-semibold text-stone-700">{hotel.name}</h4>
                    </div>
                    
                    <div className="flex justify-center">
                      <button
                        onClick={() => openExternalLink(`https://maps.google.com/maps?q=${encodeURIComponent(hotel.name)}`)}
                        className="inline-flex items-center text-accent hover:text-accent-dark transition-colors font-body"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {t('seeLocation')}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Accommodation; 