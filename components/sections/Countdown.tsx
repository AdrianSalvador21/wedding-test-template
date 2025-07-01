'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from 'next-intl';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Countdown = () => {
  const t = useTranslations('countdown');
  const weddingDate = new Date('2025-11-21T18:00:00').getTime();
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [isEventPassed, setIsEventPassed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = weddingDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setIsEventPassed(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsEventPassed(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  const timeUnits = [
    { value: timeLeft.days, label: t('days') },
    { value: timeLeft.hours, label: t('hours') },
    { value: timeLeft.minutes, label: t('minutes') },
    { value: timeLeft.seconds, label: t('seconds') }
  ];

  // Versión sin animaciones para móvil
  if (isMobile) {
    return (
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="text-center max-w-4xl mx-auto">
            {/* Título minimalista */}
            <h2 className="section-title mb-4">
              {isEventPassed ? t('eventPassed') : t('subtitle')}
            </h2>

            <div className="w-16 h-px bg-primary mx-auto mb-12" />

            {/* Contador minimalista */}
            {!isEventPassed && (
              <div className="grid grid-cols-2 gap-6 mb-12">
                {timeUnits.map((unit) => (
                  <div key={unit.label} className="text-center">
                    <div className="text-3xl font-heading font-light text-primary mb-2">
                      {unit.value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm font-medium text-text uppercase tracking-wide">
                      {unit.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fecha simple */}
            <div className="text-center">
              <div className="text-lg font-body text-text mb-1">
                21 de Noviembre, 2025
              </div>
              <div className="text-base text-text opacity-75">
                6:00 PM
              </div>
            </div>

            {/* Mensaje para evento pasado */}
            {isEventPassed && (
              <div className="text-center">
                <div className="text-xl font-body text-primary mb-4">
                  {t('thankYou')}
                </div>
                <div className="text-base text-text opacity-75">
                  Su presencia hizo de nuestro día algo inolvidable
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Versión con animaciones para desktop
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <section ref={ref} className="py-16 bg-white">
      <div className="section-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Título minimalista */}
          <motion.h2 
            variants={itemVariants}
            className="section-title mb-4"
          >
            {isEventPassed ? t('eventPassed') : t('subtitle')}
          </motion.h2>

          <motion.div
            variants={itemVariants}
            className="w-16 h-px bg-primary mx-auto mb-12"
          />

          {/* Contador minimalista */}
          {!isEventPassed && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
            >
              {timeUnits.map((unit) => (
                <div
                  key={unit.label}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-heading font-light text-primary mb-2">
                    {unit.value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm font-medium text-text uppercase tracking-wide">
                    {unit.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Fecha simple */}
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <div className="text-lg font-body text-text mb-1">
              21 de Noviembre, 2025
            </div>
            <div className="text-base text-text opacity-75">
              6:00 PM
            </div>
          </motion.div>

          {/* Mensaje para evento pasado */}
          {isEventPassed && (
            <motion.div
              variants={itemVariants}
              className="text-center"
            >
              <div className="text-xl font-body text-primary mb-4">
                {t('thankYou')}
              </div>
              <div className="text-base text-text opacity-75">
                Su presencia hizo de nuestro día algo inolvidable
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Countdown; 