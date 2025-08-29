'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Heart } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';

const Hero = () => {
  const { t, currentLanguage } = useTranslations('hero');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { heroImage } = useWeddingImages(weddingData?.id);
  const [isMounted, setIsMounted] = useState(false);

  // Datos dinámicos con fallbacks
  const brideName = weddingData?.couple.bride.name || 'María';
  const groomName = weddingData?.couple.groom.name || 'Carlos';
  const weddingDate = weddingData?.event.date ? new Date(weddingData.event.date) : new Date('2025-11-21T16:00:00');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const venueName = weddingData?.event.receptionVenue?.name || t('location');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const eventTime = weddingData?.event.time || '16:00';

  // Imagen del Hero dinámicamente cargada
  const heroImageUrl = heroImage;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const heroImageAlt = weddingData?.heroImage?.alt || 'Imagen principal de boda';

  // Estado para la altura fija
  const [fixedHeight, setFixedHeight] = useState<number | null>(null);

  // Detectar si es móvil y tipo de navegador
  const [isMobile, setIsMobile] = useState(false);
  const [isChromeIOS, setIsChromeIOS] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Detectar Chrome en iOS específicamente
    const detectChromeIOS = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isChrome = /CriOS/.test(navigator.userAgent) || /Chrome/.test(navigator.userAgent);
      const isChromeIOSDetected = isIOS && isChrome;
      setIsChromeIOS(isChromeIOSDetected);
      console.log('🔍 Navegador detectado:', {
        isIOS,
        isChrome,
        isChromeIOS: isChromeIOSDetected
      });
    };

    checkMobile();
    detectChromeIOS();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Precargar imagen de fondo para evitar layout shift
    const img = document.createElement('img');
    img.src = heroImageUrl;

    // SOLUCIÓN: Calcular altura UNA SOLA VEZ y fijarla
    const setFixedViewportHeight = () => {
      const currentHeight = window.innerHeight;
      console.log('🔒 Fijando altura Hero a:', currentHeight + 'px');

      // Para Chrome iOS, usar una altura aún más conservadora
      if (isChromeIOS) {
        // Usar la altura mínima del viewport para evitar redimensionamiento
        const conservativeHeight = Math.min(currentHeight, 640);
        setFixedHeight(conservativeHeight);
        console.log('🤖 Chrome iOS detectado - Altura conservadora:', conservativeHeight + 'px');
      } else {
        setFixedHeight(currentHeight);
      }

      // También setear la variable CSS como backup
      const vh = currentHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Calcular altura solo una vez al montar
    setFixedViewportHeight();

    // Solo recalcular en cambio de orientación (no en scroll)
    const handleOrientationChange = () => {
      setTimeout(() => {
        setFixedViewportHeight();
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    setIsMounted(true);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [heroImageUrl, isChromeIOS]);

  // Agregar clase CSS para Chrome iOS
  useEffect(() => {
    if (isChromeIOS) {
      document.body.classList.add('chrome-ios');
      console.log('🎯 Clase chrome-ios agregada al body');

      // Pasar la imagen al CSS usando CSS custom property
      document.documentElement.style.setProperty('--hero-bg-image', `url(${heroImageUrl})`);
    } else {
      document.body.classList.remove('chrome-ios');
      document.documentElement.style.removeProperty('--hero-bg-image');
    }

    return () => {
      document.body.classList.remove('chrome-ios');
      document.documentElement.style.removeProperty('--hero-bg-image');
    };
  }, [isChromeIOS, heroImageUrl]);

  // Mapeo de locales para formateo de fechas
  const localeMap: { [key: string]: string } = {
    'es': 'es-ES',
    'en': 'en-US'
  };

  const locale = localeMap[currentLanguage] || 'es-ES';

  // Formatear fecha según el idioma
  const formatDate = () => {
    return weddingDate.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Debug para móvil
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🖼️ Debug Hero - URL imagen:', heroImageUrl);
      console.log('📱 Es móvil?', window.innerWidth <= 768);
      console.log('📏 Altura fija calculada:', fixedHeight ? `${fixedHeight}px` : 'Calculando...');
      console.log('🤖 Es Chrome iOS?', isChromeIOS);
    }
  }, [heroImageUrl, fixedHeight, isChromeIOS]);

  return (
    <section
      className="hero-section relative flex items-center justify-center text-white overflow-hidden"
      style={{
        // Chrome iOS: usar altura fija en píxeles para evitar redimensionamiento
        ...(isChromeIOS ? {
          height: '812px',  // Altura fija típica de iPhone
          minHeight: '812px',
          maxHeight: '812px'
        } : {
          height: fixedHeight ? `${fixedHeight}px` : '100vh',
          minHeight: fixedHeight ? `${fixedHeight}px` : '100vh'
        }),
        // Solo aplicar background-image en desktop (NO en móvil ni Chrome iOS)
        ...(!isMobile && !isChromeIOS ? { backgroundImage: `url(${heroImageUrl})` } : {})
      }}
    >
      {/* Background Image - Solo visible en desktop */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={heroImageUrl}
          alt={heroImageAlt}
          className="hero-background-image"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto m-relative-10">
        <motion.div
          initial={isMounted ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMounted ? 0.8 : 0, ease: "easeOut" }}
          className="space-y-12"
        >
          {/* "NUESTRA BODA" */}
          <div className="mb-8">
            <h2 className="text-xs md:text-sm font-body font-light tracking-[0.4em] uppercase text-white opacity-90 mb-2">
              {t('ourWedding')}
            </h2>

            {/* Nombres de la pareja - en línea con & decorativo */}
            <div className="flex flex-col items-center space-y-4">
              {/* Línea decorativa superior */}
              <div className="w-24 h-px bg-white bg-opacity-40"></div>

              {/* Nombres en una línea */}
              <h1 className="text-4xl md:text-7xl lg:text-8xl xl:text-9xl font-heading text-white tracking-wide leading-tight">
                {brideName}
                <span className="text-3xl md:text-6xl lg:text-7xl xl:text-8xl text-stone-200 opacity-80 mx-4 md:mx-6 font-serif italic">
                  &
                </span>
                {groomName}
              </h1>

              {/* Línea decorativa inferior */}
              <div className="w-24 h-px bg-white bg-opacity-40"></div>
            </div>
          </div>

          {/* Fecha del evento */}
          <div className="mb-8">
            <p className="text-lg md:text-xl font-body font-light text-white opacity-90">
              {formatDate()}
            </p>
          </div>

          {/* Call to Action Button */}
          <div className="space-y-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-stone-400 bg-opacity-70 text-white font-body font-medium py-3 px-8 md:py-3.5 md:px-10 rounded-full text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
            >
              {t('cta')}
            </motion.button>

            {/* Scroll indicator - abajo del botón */}
            <motion.div
              animate={isMounted ? { y: [0, 8, 0] } : { y: 0 }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: isMounted ? 1 : 0
              }}
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