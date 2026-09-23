'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { T1Monogram, T1LeafSprig, T1_COLORS } from './ui';

interface HeroProps {
  overlayVisible?: boolean;
}

const Hero = ({ overlayVisible = false }: HeroProps) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [wasOverlayVisible, setWasOverlayVisible] = useState(overlayVisible);
  const [monogramExists, setMonogramExists] = useState(false);

  // Detectar cuando el overlay se cierra para reactivar animaciones
  useEffect(() => {
    if (wasOverlayVisible && !overlayVisible) {
      // El overlay se acaba de cerrar, reactivar animaciones
      setAnimationKey(prev => prev + 1);
    }
    setWasOverlayVisible(overlayVisible);
  }, [overlayVisible, wasOverlayVisible]);

  const { t, currentLanguage } = useTranslations('hero');
  const weddingData = useAppSelector(selectCurrentWedding);

  // Verificar si existe el monograma SVG
  useEffect(() => {
    const checkMonogram = async () => {
      if (weddingData?.id) {
        try {
          const response = await fetch(`/assets/wedding-images/${weddingData.id}/monogram.svg`);
          setMonogramExists(response.ok);
        } catch {
          setMonogramExists(false);
        }
      }
    };
    checkMonogram();
  }, [weddingData?.id]);
  const { heroImage } = useWeddingImages(weddingData?.id);
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
      const isChromeIOSDetected = isIOS && /CriOS/.test(navigator.userAgent);
      setIsChromeIOS(isChromeIOSDetected);
      console.log('🔍 Navegador detectado:', {
        isIOS,
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
      console.log('Debug Hero - URL imagen:', heroImageUrl);
      console.log('Es móvil?', window.innerWidth <= 768);
      console.log('Altura fija calculada:', fixedHeight ? `${fixedHeight}px` : 'Calculando...');
      console.log('Es Chrome iOS?', isChromeIOS);
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

      {/* Franja horizontal de pantalla completa - animada */}
      {/*<motion.div 
        key={`hero-overlay-${animationKey}`}
        className="absolute top-34 inset-x-0 top-1/2 transform -translate-y-1/2 h-80 md:h-80 bg-gradient-to-b from-black/20 via-black/60 to-black/20 z-5"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ 
          opacity: overlayVisible ? 0 : 1,
          scaleX: overlayVisible ? 0 : 1
        }}
        transition={{ 
          duration: 1, 
          ease: "easeOut", 
          delay: overlayVisible ? 0 : 0.5 
        }}
      />*/}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Contenido del texto */}
        <div className="relative z-10">

          {/* Monograma personalizado si existe; si no, el sello de Template01 como respaldo */}
          <motion.div
            key={`hero-monogram-${animationKey}`}
            className="mb-12 flex justify-center"
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{
              opacity: overlayVisible ? 0 : 1,
              y: overlayVisible ? -30 : 0,
              scale: overlayVisible ? 0.8 : 1
            }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: overlayVisible ? 0 : 0.1
            }}
          >
            {monogramExists ? (
              <motion.div
                className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40"
                initial={{ rotate: -5 }}
                animate={{
                  rotate: overlayVisible ? -5 : 0,
                }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  delay: overlayVisible ? 0 : 0.3
                }}
                whileHover={{
                  scale: 1.05,
                  rotate: 2,
                  transition: { duration: 0.3 }
                }}
              >
                <img
                  src={`/assets/wedding-images/${weddingData?.id}/monogram.svg`}
                  alt="Monograma de los novios"
                  className="w-full h-full object-contain filter drop-shadow-lg"
                  style={{
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8)) brightness(0.9)'
                  }}
                />
              </motion.div>
            ) : (
              <T1Monogram
                size={112}
                initials={`${brideName.charAt(0)}${groomName.charAt(0)}`}
                className="md:scale-125 lg:scale-150"
              />
            )}
          </motion.div>

          {/* Hojas flotantes: reemplazan los corazones genéricos anteriores */}
          <T1LeafSprig size={26} className="absolute top-20 left-10 opacity-30 hidden md:block" />
          <T1LeafSprig size={18} className="absolute top-40 right-16 opacity-25 hidden md:block" />
          <T1LeafSprig size={22} className="absolute bottom-32 left-20 opacity-20 hidden md:block" />

          {/* "NUESTRA BODA" - Animación de entrada suave */}
          <motion.div
            key={`hero-title-${animationKey}`}
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: overlayVisible ? 0 : 1, y: overlayVisible ? -20 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: overlayVisible ? 0 : (monogramExists ? 0.4 : 0.2) }}
          >
            <motion.h2
              key={`hero-subtitle-${animationKey}`}
              className="text-xs md:text-sm font-body font-light tracking-[0.4em] uppercase text-white opacity-90 mb-2 drop-shadow-lg"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
              initial={{ opacity: 0, letterSpacing: '0.8em' }}
              animate={{
                opacity: overlayVisible ? 0 : 1,
                letterSpacing: overlayVisible ? '0.8em' : '0.4em'
              }}
              transition={{ duration: 1, ease: "easeOut", delay: overlayVisible ? 0 : (monogramExists ? 0.4 : 0.2) }}
            >
              {t('ourWedding')}
            </motion.h2>

            {/* Nombres de la pareja - con animaciones escalonadas */}
            <div className="flex flex-col items-center space-y-4">
              {/* Línea decorativa superior */}
              <motion.div
                key={`hero-line-top-${animationKey}`}
                className="h-px bg-white bg-opacity-40"
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: overlayVisible ? 0 : '6rem',
                  opacity: overlayVisible ? 0 : 1
                }}
                transition={{ duration: 1, ease: "easeOut", delay: overlayVisible ? 0 : (monogramExists ? 0.8 : 0.6) }}
              />

              {/* Nombres con animación elegante */}
              <motion.h1
                key={`hero-names-${animationKey}`}
                className="text-4xl md:text-7xl lg:text-8xl xl:text-9xl text-white tracking-wide leading-tight drop-shadow-2xl opacity-90"
                style={{ fontFamily: "'Allura', cursive", textShadow: '3px 3px 6px rgba(0,0,0,0.9)', opacity: 0.9 }}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{
                  opacity: overlayVisible ? 0 : 0.9,
                  scale: overlayVisible ? 0.8 : 1,
                  y: overlayVisible ? 30 : 0
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.25, 0.46, 0.45, 0.94], // Curva de animación elegante
                  delay: overlayVisible ? 0 : (monogramExists ? 1.0 : 0.8)
                }}
              >
                <motion.span
                  key={`hero-bride-${animationKey}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{
                    opacity: overlayVisible ? 0 : 1,
                    x: overlayVisible ? -30 : 0
                  }}
                  transition={{ duration: 0.1, ease: "easeOut", delay: overlayVisible ? 0 : 1 }}
                >
                  {brideName}
                </motion.span>
                <motion.span
                  key={`hero-ampersand-${animationKey}`}
                  className="text-3xl md:text-6xl lg:text-7xl xl:text-8xl text-stone-200 opacity-80 mx-4 md:mx-6 font-serif italic"
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{
                    opacity: overlayVisible ? 0 : 1,
                    scale: overlayVisible ? 0.5 : 1,
                    rotate: overlayVisible ? -10 : 0
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                    delay: overlayVisible ? 0 : 1.2,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  &
                </motion.span>
                <motion.span
                  key={`hero-groom-${animationKey}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{
                    opacity: overlayVisible ? 0 : 1,
                    x: overlayVisible ? 30 : 0
                  }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: overlayVisible ? 0 : 1.4 }}
                >
                  {groomName}
                </motion.span>
              </motion.h1>

              {/* Línea decorativa inferior */}
              <motion.div
                key={`hero-line-bottom-${animationKey}`}
                className="h-px bg-white bg-opacity-40"
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: overlayVisible ? 0 : '6rem',
                  opacity: overlayVisible ? 0 : 1
                }}
                transition={{ duration: 1, ease: "easeOut", delay: overlayVisible ? 0 : 1.6 }}
              />
            </div>
          </motion.div>

          {/* Fecha del evento */}
          <motion.div
            key={`hero-date-container-${animationKey}`}
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: overlayVisible ? 0 : 1,
              y: overlayVisible ? 20 : 0
            }}
            transition={{ duration: 0.8, ease: "easeOut", delay: overlayVisible ? 0 : 1.8 }}
          >
            <motion.p
              key={`hero-date-text-${animationKey}`}
              className="text-lg md:text-xl font-body font-light text-white opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: overlayVisible ? 0 : 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: overlayVisible ? 0 : 2 }}
            >
              {formatDate()}
            </motion.p>
          </motion.div>

          {/* Call to Action Button - Solo mostrar si showConfirmCta no es false */}
          {weddingData?.showConfirmCta !== false && (
            <motion.div
              key={`hero-cta-container-${animationKey}`}
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: overlayVisible ? 0 : 1,
                y: overlayVisible ? 30 : 0
              }}
              transition={{ duration: 0.8, ease: "easeOut", delay: overlayVisible ? 0 : 2.2 }}
            >
              <motion.button
                key={`hero-cta-button-${animationKey}`}
                onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 font-body font-medium py-3.5 px-10 text-xs md:text-sm tracking-[0.2em] uppercase transition-colors duration-300"
                style={{ border: `1.5px solid ${T1_COLORS.accent}`, color: '#fff', background: 'transparent' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: overlayVisible ? 0 : 1 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: overlayVisible ? 0 : 2.4
                }}
              >
                {t('cta')}
              </motion.button>
            </motion.div>
          )}

          {/* Scroll indicator - abajo del botón */}
          <motion.div
            key={`hero-scroll-indicator-${animationKey}`}
            animate={{
              y: overlayVisible ? [0, 0, 0] : [0, 8, 0],
              opacity: overlayVisible ? 0 : 1
            }}
            transition={{
              duration: 2.5,
              repeat: overlayVisible ? 0 : Infinity,
              ease: "easeInOut",
              delay: overlayVisible ? 0 : 3
            }}
            className="flex flex-col items-center opacity-70 pt-4"
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3.2
              }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
      </div> {/* Cierre del contenido del texto */}
    </div>
    </section >
  );
};

export default Hero; 