'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from '../../lib/translations';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Countdown = () => {
  const { t, currentLanguage } = useTranslations('countdown');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  // Memoize the wedding date to avoid recreating it on every render
  const weddingDate = useMemo(() => {
    return weddingData?.event.date ? new Date(weddingData.event.date) : new Date('2025-11-21T16:00:00');
  }, [weddingData?.event.date]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  // Fallback mientras cargan los datos
  if (!mounted) {
    return (
      <section id="countdown" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 text-center py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-6">
                  <div className="h-12 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isEventPassed = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  // Formatear tiempo dinámico
  const eventTime = weddingData?.event.time || '16:00';
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <section 
      id="countdown" 
      className="bg-gray-50 relative overflow-hidden"
      style={{
        ...getBackgroundStyle(1, '200px'),
        backgroundSize: '1388px 909px'
      }}
          >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 text-center py-16">
        {isEventPassed ? (
          <div className="max-w-2xl mx-auto">
            <p className="text-2xl text-accent font-body font-semibold mb-4">{t('eventPassed')}</p>
            <p className="text-gray-600 font-body">{t('thankYou')}</p>
          </div>
        ) : (
          <>
            {/* Título con línea decorativa */}
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="section-title text-stone-600 opacity-90 mb-4">
                {t('subtitle')}
              </h2>
              <motion.div 
                className="w-16 h-0.5 bg-accent mx-auto"
                initial={{ width: 0 }}
                whileInView={{ width: 64 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              ></motion.div>
            </motion.div>

            {/* Números de cuenta regresiva horizontales */}
            <motion.div 
              className="flex justify-center items-center gap-2 sm:gap-4 md:gap-6 mb-12 countdown-numbers"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            >
              {/* Días */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-light text-stone-600 mb-2 font-body opacity-70">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm font-body font-medium text-gray-600 tracking-widest">
                  {t('days')}
                </div>
              </motion.div>

              {/* Separador */}
              <motion.div 
                className="text-base sm:text-lg md:text-xl text-stone-600 font-light mx-1 opacity-70"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.7 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3, delay: 0.6, ease: "easeOut" }}
              >:</motion.div>

              {/* Horas */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-light text-stone-600 mb-2 font-body opacity-70">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm font-body font-medium text-gray-600 tracking-widest">
                  {t('hours')}
                </div>
              </motion.div>

              {/* Separador */}
              <motion.div 
                className="text-base sm:text-lg md:text-xl text-stone-600 font-light mx-1 opacity-70"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.7 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3, delay: 0.8, ease: "easeOut" }}
              >:</motion.div>

              {/* Minutos */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.9, ease: "easeOut" }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-light text-stone-600 mb-2 font-body opacity-70">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm font-body font-medium text-gray-600 tracking-widest">
                  {t('minutes')}
                </div>
              </motion.div>

              {/* Separador */}
              <motion.div 
                className="text-base sm:text-lg md:text-xl text-stone-600 font-light mx-1 opacity-70"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.7 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3, delay: 1.0, ease: "easeOut" }}
              >:</motion.div>

              {/* Segundos */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 1.1, ease: "easeOut" }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-light text-stone-600 mb-2 font-body opacity-70">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm font-body font-medium text-gray-600 tracking-widest">
                  {t('seconds')}
                </div>
              </motion.div>
            </motion.div>

            {/* Fecha y hora del evento */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
            >
              <p className="text-lg md:text-xl font-body font-light text-gray-700">
                {weddingDate.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              {(() => {
                // Lógica de prioridad: ceremonia religiosa > recepción > tiempo genérico
                const ceremonyTime = weddingData?.event.ceremony?.time;
                const receptionTime = weddingData?.event.reception?.time;
                const displayTime = ceremonyTime || receptionTime || eventTime;
                
                return displayTime ? (
                  <p className="text-base md:text-lg font-body font-light text-gray-600">
                    {formatTime(displayTime)}
                  </p>
                ) : null;
              })()}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

export default Countdown; 