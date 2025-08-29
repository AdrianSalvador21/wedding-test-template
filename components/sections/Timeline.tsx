'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Clock, MapPin, Users, Calendar, Star, Circle, Sparkles, Gift, Heart, Music, Utensils, Wine, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from '../../lib/translations';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { TimelineIcon } from '../icons';

const Timeline = () => {
  const { t } = useTranslations('timeline');
  const params = useParams();
  const currentLocale = params.locale as string;
  const { isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();


  // Mapeo de strings a componentes de iconos
  const iconMap: Record<string, LucideIcon> = {
    'MapPin': MapPin,
    'Heart': Heart,
    'Music': Music,
    'Utensils': Utensils,
    'Users': Users,
    'Wine': Wine,
    'Clock': Clock,
    'Star': Star,
    'Gift': Gift,
    'Calendar': Calendar,
    'Circle': Circle,
    'Sparkles': Sparkles
  };

  // Pool de iconos genéricos neutros (fallback)
  const iconPool = [Clock, Users, Calendar, Star, Circle, MapPin, Sparkles, Gift];

  // Función para obtener icono por nombre o índice
  const getIcon = (iconName: string | undefined, index: number) => {
    if (iconName && iconMap[iconName]) {
      return iconMap[iconName];
    }
    // Fallback al pool genérico por índice
    return iconPool[index % iconPool.length];
  };

  // No mostrar si no hay eventos configurados
  if (!weddingData?.timeline?.length) {
    return null;
  }

  // Datos dinámicos
  const events = weddingData.timeline.map((event, index) => ({
    time: event.time,
    title: typeof event.title === 'object' && event.title
      ? (event.title[currentLocale as 'es' | 'en'] || event.title.es || '')
      : (event.title as unknown as string || ''),
    description: typeof event.description === 'object' && event.description
      ? (event.description[currentLocale as 'es' | 'en'] || event.description.es || '')
      : (event.description as unknown as string || ''),
    icon: getIcon(event.icon as string, index)
  }));

  // Loading state
  if (!isLoaded) {
    return (
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="bg-gray-50 mb-12 relative overflow-hidden"
      style={getBackgroundStyle(3, '160px')}
          >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Título y descripción */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <TimelineIcon 
                size={28} 
                className="text-accent mr-3 opacity-80" 
              />
              <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
            </div>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-6"></div>
            {/* Mensaje final elegante */}
            <motion.div 
              className="text-center mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-stone-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-accent mr-2" />
                <span className="text-accent font-medium text-sm font-body">
                  {t('scheduleNote')}
                </span>
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-accent ml-2" />
              </div>
            </motion.div>
          </div>

          {/* Timeline Visual Elegante */}
          <div className="max-w-4xl mx-auto">
            
            {/* Versión Desktop - Timeline Central */}
            <div className="hidden md:block relative">
              {/* Línea vertical central */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-accent/30 via-accent/60 to-accent/30"></div>
              
              {/* Eventos */}
              <div className="space-y-8">
                {events.map((event, index) => {
                  const IconComponent = event.icon;
                  const isLeft = index % 2 === 0;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`relative flex items-center ${
                        isLeft ? 'justify-start pr-8' : 'justify-end pl-8'
                      }`}
                    >
                      {/* Contenido del evento */}
                      <div className={`w-5/12 ${isLeft ? 'text-right pr-8' : 'text-left pl-8'}`}>
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-stone-100">
                          {/* Hora */}
                          <div className={`flex items-center ${isLeft ? 'justify-end' : 'justify-start'} mb-3`}>
                            <div className="bg-accent/10 rounded-full px-4 py-2">
                              <span className="text-accent font-medium text-sm font-body">
                                {event.time}
                              </span>
                            </div>
                          </div>
                          
                          {/* Título */}
                          <h3 className="text-stone-700 font-semibold text-lg mb-2 font-heading">
                            {event.title}
                          </h3>
                          
                          {/* Descripción */}
                          {event.description && (
                            <p className="text-stone-600 text-sm leading-relaxed font-body">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Punto central con icono */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                        <div className="w-12 h-12 bg-white rounded-full border-4 border-accent shadow-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-accent" />
                        </div>
                      </div>
                      
                      {/* Línea conectora */}
                      <div className={`absolute top-1/2 transform -translate-y-1/2 h-0.5 bg-accent/40 ${
                        isLeft 
                          ? 'right-1/2 w-8 mr-6' 
                          : 'left-1/2 w-8 ml-6'
                      }`}></div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Punto final decorativo */}
              <div className="flex justify-center mt-8">
                <div className="w-6 h-6 bg-accent rounded-full shadow-lg"></div>
              </div>
            </div>

            {/* Versión Mobile - Timeline Vertical Simple */}
            <div className="md:hidden relative">
              {/* Línea vertical izquierda */}
              <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-accent/30 via-accent/60 to-accent/30"></div>
              
              {/* Eventos */}
              <div className="space-y-6">
                {events.map((event, index) => {
                  const IconComponent = event.icon;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="relative flex items-start pl-16"
                    >
                      {/* Punto con icono */}
                      <div className="absolute left-3 top-3 transform -translate-x-1/2 z-10">
                        <div className="w-10 h-10 ml-6 bg-white rounded-full border-3 border-accent shadow-lg flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-accent" />
                        </div>
                      </div>
                      
                      {/* Línea conectora */}
                      <div className="absolute left-6 top-8 w-6 h-0.5 bg-accent/40"></div>
                      
                      {/* Contenido del evento */}
                      <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-stone-100 position-relative">
                          {/* Hora */}
                          <div className="flex items-center justify-start absolute-right-top">
                            <div className="bg-accent/10 border-left-bottom px-3 py-1.5">
                              <span className="text-accent font-medium text-xs font-body">
                                {event.time}
                              </span>
                            </div>
                          </div>
                          
                          {/* Título */}
                          <h3 className="text-stone-700 font-semibold text-base mb-2 font-blockquote">
                            {event.title}
                          </h3>
                          
                          {/* Descripción */}
                          {event.description && (
                            <p className="text-stone-600 text-sm leading-relaxed font-body">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Punto final decorativo */}
              <div className="flex justify-start mt-6 pl-6">
                <div className="w-5 h-5 bg-accent rounded-full shadow-lg transform -translate-x-1/2"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Timeline; 