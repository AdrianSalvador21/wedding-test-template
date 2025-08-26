'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock, MapPin, Users, Calendar, Star, Circle, Sparkles, Gift, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Pool de iconos genéricos neutros
  const iconPool = [Clock, Users, Calendar, Star, Circle, MapPin, Sparkles, Gift];

  // Función para asignar icono por índice
  const getIconByIndex = (index: number) => {
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
    icon: getIconByIndex(index)
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
            <p className="section-subtitle font-body">
              {t('scheduleNote')}
            </p>
          </div>

          {/* Timeline colapsable */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-border rounded-lg">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-5 flex items-center justify-between hover:border-primary/30 transition-colors"
              >
                <h3 className="text-base font-body text-dark">
                  {t('eventSchedule')}
                </h3>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-dark" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-dark" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border">
                  <div className="space-y-4 mt-4">
                    {events.map((event, index) => {
                      const IconComponent = event.icon;
                      
                      return (
                        <div
                          key={index}
                          className="flex items-start space-x-4 bg-gray-50 rounded-lg p-4"
                        >
                          {/* Icono */}
                          <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          
                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-base font-medium text-dark font-body">
                                {event.time}
                              </span>
                              <div className="flex-1 h-px bg-border"></div>
                            </div>
                            <h4 className="text-sm font-medium text-dark mb-1 font-body">
                              {event.title}
                            </h4>
                            <p className="text-xs text-text leading-relaxed font-body">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Timeline; 