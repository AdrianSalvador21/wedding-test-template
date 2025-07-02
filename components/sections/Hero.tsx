'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from '../../lib/translations';
import { ChevronDown, Heart, Calendar, MapPin, Languages } from 'lucide-react';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';

const Hero = () => {
  const { t, currentLanguage } = useTranslations('hero');
  const weddingData = useAppSelector(selectCurrentWedding);

  // Datos dinámicos con fallbacks
  const brideNames = weddingData?.couple.bride.name || t('title').split(' & ')[0] || 'María';
  const groomNames = weddingData?.couple.groom.name || t('title').split(' & ')[1] || 'Carlos';
  const weddingDate = weddingData?.event.date ? new Date(weddingData.event.date) : new Date('2025-11-21T16:00:00');
  const venueName = weddingData?.event.venue.name || t('location');
  const eventTime = weddingData?.event.time || '16:00';

  const formatDate = (date: Date) => {
    // Mapeo de idiomas a locales
    const localeMap = {
      'es': 'es-ES',
      'en': 'en-US'
    };
    
    return date.toLocaleDateString(localeMap[currentLanguage] || 'es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <section className="hero-section relative h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="space-y-12"
        >
          {/* "NUESTRA BODA" */}
          <div className="mb-16">
            <h2 className="text-sm md:text-base font-light tracking-[0.4em] uppercase text-white opacity-80 mb-12">
              {t('ourWedding')}
            </h2>
            
            {/* Nombres de la pareja - primer nombre con & */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light text-white opacity-75 tracking-wide">
                {brideNames} <span className="text-stone-300 opacity-80">&</span>
              </h1>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light text-white opacity-75 tracking-wide">
                {groomNames}
              </h1>
            </div>
          </div>

          {/* Fecha del evento */}
          <div className="mb-8">
            <p className="text-xl md:text-2xl font-light text-white opacity-90">
              {formatDate(weddingDate)}
            </p>
          </div>

          {/* Call to Action Button */}
          <div className="space-y-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-stone-400 bg-opacity-70 text-white font-medium py-3.5 px-8 md:py-4 md:px-12 rounded-full text-lg md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
            >
              {t('cta')}
            </motion.button>

            {/* Scroll indicator - abajo del botón */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center opacity-70 pt-4"
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <Heart className="absolute top-20 left-10 w-8 h-8 opacity-20 animate-pulse" />
          <Heart className="absolute top-40 right-16 w-6 h-6 opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
          <Heart className="absolute bottom-32 left-20 w-10 h-10 opacity-15 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    </section>
  );
};

export default Hero; 