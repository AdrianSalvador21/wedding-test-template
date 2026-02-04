'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';

interface HeroV2Props {
  overlayVisible: boolean;
}

export default function HeroV2({ overlayVisible }: HeroV2Props) {
  const [animationKey, setAnimationKey] = useState(0);
  const [wasOverlayVisible, setWasOverlayVisible] = useState(overlayVisible);
  const [monogramExists, setMonogramExists] = useState(false);

  useEffect(() => {
    if (wasOverlayVisible && !overlayVisible) {
      setAnimationKey((prev: number) => prev + 1);
    }
    setWasOverlayVisible(overlayVisible);
  }, [overlayVisible, wasOverlayVisible]);

  const { t, currentLanguage } = useTranslations('hero');
  const weddingData = useAppSelector(selectCurrentWedding);

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

  const brideName = weddingData?.couple.bride.name || 'María';
  const groomName = weddingData?.couple.groom.name || 'Carlos';
  const weddingDate = weddingData?.event.date ? new Date(weddingData.event.date) : new Date('2025-11-21T16:00:00');
  const heroImageUrl = heroImage;
  const heroImageAlt = weddingData?.heroImage?.alt || 'Imagen principal de boda';

  const [fixedHeight, setFixedHeight] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isChromeIOS, setIsChromeIOS] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const detectChromeIOS = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isChrome = /CriOS/.test(navigator.userAgent) || /Chrome/.test(navigator.userAgent);
      const isChromeIOSDetected = isIOS && isChrome;
      setIsChromeIOS(isChromeIOSDetected);
    };

    checkMobile();
    detectChromeIOS();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const img = document.createElement('img');
    img.src = heroImageUrl;

    const setFixedViewportHeight = () => {
      const currentHeight = window.innerHeight;

      if (isChromeIOS) {
        const conservativeHeight = Math.min(currentHeight, 640);
        setFixedHeight(conservativeHeight);
      } else {
        setFixedHeight(currentHeight);
      }

      const vh = currentHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setFixedViewportHeight();

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

  useEffect(() => {
    if (isChromeIOS) {
      document.body.classList.add('chrome-ios');
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

  const localeMap: { [key: string]: string } = {
    es: 'es-ES',
    en: 'en-US',
  };

  const locale = localeMap[currentLanguage] || 'es-ES';

  const formatDate = () => {
    return weddingDate.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section
      className="hero-section relative overflow-hidden md:flex md:items-center md:justify-center text-white"
      style={{
        ...(isChromeIOS
          ? {
              height: '812px',
              minHeight: '812px',
              maxHeight: '812px',
            }
          : {
              height: fixedHeight ? `${fixedHeight}px` : '100vh',
              minHeight: fixedHeight ? `${fixedHeight}px` : '100vh',
            }),
        ...(!isMobile && !isChromeIOS ? { backgroundImage: `url(${heroImageUrl})` } : {}),
      }}
    >
      <section className="md:hidden relative w-full h-full bg-[#fbf7f1] overflow-hidden">
        <div className="absolute inset-x-0 top-0 overflow-hidden bg-[#fbf7f1]" style={{ height: '64%' }}>
          <img
            src={heroImageUrl}
            alt={heroImageAlt}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 25%', display: 'block' }}
          />
          <span
            className="absolute left-0 right-0 bottom-0 z-20 pointer-events-none"
            style={{
              height: '58%',
              left: '-6px',
              right: '-6px',
              bottom: '-6px',
              background:
                'linear-gradient(to bottom, rgba(251,247,241,0) 0%, rgba(251,247,241,0.65) 49%, rgba(251,247,241,1) 90%)',
            }}
          />
        </div>

        <div
          className="absolute inset-x-0 bottom-0 bg-[#fbf7f1] px-6"
          style={{ height: '9%', top: 'calc(64% - 6px)' }}
        >
          <div className="relative h-full flex items-center justify-center">
            <div className="w-full max-w-[22rem] text-center text-[#3b342b]">
              <motion.h2
                key={`hero-subtitle-mobile-${animationKey}`}
                className="text-[11px] font-medium tracking-[0.45em] uppercase text-[#6f6254]"
                initial={{ opacity: 0, letterSpacing: '0.8em' }}
                animate={{
                  opacity: overlayVisible ? 0 : 1,
                  letterSpacing: overlayVisible ? '0.8em' : '0.45em',
                }}
                transition={{ duration: 1, ease: 'easeOut', delay: overlayVisible ? 0 : 0.1 }}
              >
                {t('ourWedding')}
              </motion.h2>

            <motion.h1
              key={`hero-names-mobile-${animationKey}`}
              className="mt-6 text-[42px] leading-[1.05] font-serif font-light"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{
                opacity: overlayVisible ? 0 : 1,
                scale: overlayVisible ? 0.92 : 1,
                y: overlayVisible ? 16 : 0,
              }}
              transition={{ duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94], delay: overlayVisible ? 0 : 0.2 }}
            >
              <motion.span
                key={`hero-bride-mobile-${animationKey}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: overlayVisible ? 0 : 1, x: overlayVisible ? -10 : 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: overlayVisible ? 0 : 0.35 }}
              >
                {brideName}
              </motion.span>
              <motion.span
                key={`hero-ampersand-mobile-${animationKey}`}
                className="mx-3 font-serif italic text-[#b79a7a]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: overlayVisible ? 0 : 1, scale: overlayVisible ? 0.9 : 1 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: overlayVisible ? 0 : 0.45 }}
              >
                &
              </motion.span>
              <motion.span
                key={`hero-groom-mobile-${animationKey}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: overlayVisible ? 0 : 1, x: overlayVisible ? 10 : 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: overlayVisible ? 0 : 0.55 }}
              >
                {groomName}
              </motion.span>
            </motion.h1>

            <motion.p
              key={`hero-date-mobile-${animationKey}`}
              className="mt-6 text-base text-[#6f6254]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: overlayVisible ? 0 : 1, y: overlayVisible ? 10 : 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: overlayVisible ? 0 : 0.7 }}
            >
              {formatDate()}
            </motion.p>

            {weddingData?.showConfirmCta !== false && (
              <motion.button
                key={`hero-cta-mobile-${animationKey}`}
                onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-8 inline-flex items-center justify-center rounded-full px-10 py-3.5 text-sm font-medium bg-[#b79a7a] text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: overlayVisible ? 0 : 1, y: overlayVisible ? 10 : 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: overlayVisible ? 0 : 0.85 }}
              >
                <span className="font-serif font-normal tracking-wide">{t('cta')}</span>
              </motion.button>
            )}
          </div>
          </div>
        </div>
      </section>

      <div className="hidden md:block absolute inset-0 z-0 overflow-hidden">
        <img src={heroImageUrl} alt={heroImageAlt} className="hero-background-image" />
        <div className="absolute inset-0 bg-black/35 z-10" />
      </div>

      <div className="hidden md:block relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="relative z-10">
          {monogramExists && (
            <motion.div
              key={`hero-monogram-${animationKey}`}
              className="mb-10 flex justify-center"
              initial={{ opacity: 0, y: -30, scale: 0.8 }}
              animate={{
                opacity: overlayVisible ? 0 : 1,
                y: overlayVisible ? -30 : 0,
                scale: overlayVisible ? 0.8 : 1,
              }}
              transition={{
                duration: 1.2,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: overlayVisible ? 0 : 0.1,
              }}
            >
              <motion.div
                className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                initial={{ rotate: -5 }}
                animate={{ rotate: overlayVisible ? -5 : 0 }}
                transition={{ duration: 1, ease: 'easeOut', delay: overlayVisible ? 0 : 0.3 }}
                whileHover={{ scale: 1.05, rotate: 2, transition: { duration: 0.3 } }}
              >
                <img
                  src={`/assets/wedding-images/${weddingData?.id}/monogram.svg`}
                  alt="Monograma de los novios"
                  className="w-full h-full object-contain filter drop-shadow-lg"
                  style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8)) brightness(0.95)' }}
                />
              </motion.div>
            </motion.div>
          )}

          <motion.div
            key={`hero-title-${animationKey}`}
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: overlayVisible ? 0 : 1, y: overlayVisible ? -20 : 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: overlayVisible ? 0 : monogramExists ? 0.4 : 0.2 }}
          >
            <motion.h2
              key={`hero-subtitle-${animationKey}`}
              className="text-[11px] md:text-xs font-light tracking-[0.45em] uppercase text-white/90 mb-2"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
              initial={{ opacity: 0, letterSpacing: '0.8em' }}
              animate={{
                opacity: overlayVisible ? 0 : 1,
                letterSpacing: overlayVisible ? '0.8em' : '0.45em',
              }}
              transition={{ duration: 1, ease: 'easeOut', delay: overlayVisible ? 0 : monogramExists ? 0.4 : 0.2 }}
            >
              {t('ourWedding')}
            </motion.h2>

            <div className="flex flex-col items-center space-y-4">
              <motion.div
                key={`hero-line-top-${animationKey}`}
                className="h-px bg-white/40"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: overlayVisible ? 0 : '6rem', opacity: overlayVisible ? 0 : 1 }}
                transition={{ duration: 1, ease: 'easeOut', delay: overlayVisible ? 0 : monogramExists ? 0.8 : 0.6 }}
              />

              <motion.h1
                key={`hero-names-${animationKey}`}
                className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-light tracking-wide leading-tight"
                style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.9)', opacity: 0.95 }}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{
                  opacity: overlayVisible ? 0 : 0.95,
                  scale: overlayVisible ? 0.8 : 1,
                  y: overlayVisible ? 30 : 0,
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: overlayVisible ? 0 : monogramExists ? 1.0 : 0.8,
                }}
              >
                <motion.span
                  key={`hero-bride-${animationKey}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: overlayVisible ? 0 : 1, x: overlayVisible ? -30 : 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: overlayVisible ? 0 : 1 }}
                >
                  {brideName}
                </motion.span>
                <motion.span
                  key={`hero-ampersand-${animationKey}`}
                  className="mx-4 md:mx-6 font-serif italic text-[#b79a7a]/90"
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: overlayVisible ? 0 : 1, scale: overlayVisible ? 0.5 : 1, rotate: overlayVisible ? -10 : 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: overlayVisible ? 0 : 1.2, type: 'spring', stiffness: 200 }}
                >
                  &
                </motion.span>
                <motion.span
                  key={`hero-groom-${animationKey}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: overlayVisible ? 0 : 1, x: overlayVisible ? 30 : 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: overlayVisible ? 0 : 1.4 }}
                >
                  {groomName}
                </motion.span>
              </motion.h1>

              <motion.div
                key={`hero-line-bottom-${animationKey}`}
                className="h-px bg-white/40"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: overlayVisible ? 0 : '6rem', opacity: overlayVisible ? 0 : 1 }}
                transition={{ duration: 1, ease: 'easeOut', delay: overlayVisible ? 0 : 1.6 }}
              />
            </div>
          </motion.div>

          <motion.div
            key={`hero-date-container-${animationKey}`}
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: overlayVisible ? 0 : 1, y: overlayVisible ? 20 : 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: overlayVisible ? 0 : 1.8 }}
          >
            <motion.p
              key={`hero-date-text-${animationKey}`}
              className="text-sm md:text-base text-white/90 tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: overlayVisible ? 0 : 1 }}
              transition={{ duration: 1, ease: 'easeOut', delay: overlayVisible ? 0 : 2 }}
            >
              {formatDate()}
            </motion.p>
          </motion.div>

          {weddingData?.showConfirmCta !== false && (
            <motion.div
              key={`hero-cta-container-${animationKey}`}
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: overlayVisible ? 0 : 1, y: overlayVisible ? 30 : 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: overlayVisible ? 0 : 2.2 }}
            >
              <motion.button
                key={`hero-cta-button-${animationKey}`}
                onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#b79a7a]/85 text-white font-medium py-3.5 px-10 rounded-full text-sm md:text-base shadow-[0_14px_30px_rgba(0,0,0,0.25)] hover:opacity-95 transition-opacity backdrop-blur-sm border border-white/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: overlayVisible ? 0 : 1 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: overlayVisible ? 0 : 2.4 }}
              >
                <span className="font-serif font-normal tracking-wide">{t('cta')}</span>
              </motion.button>
            </motion.div>
          )}

          <motion.div
            key={`hero-scroll-indicator-${animationKey}`}
            animate={{ y: overlayVisible ? [0, 0, 0] : [0, 8, 0], opacity: overlayVisible ? 0 : 1 }}
            transition={{ duration: 2.5, repeat: overlayVisible ? 0 : Infinity, ease: 'easeInOut', delay: overlayVisible ? 0 : 3 }}
            className="flex flex-col items-center opacity-70 pt-4"
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 3.2 }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none" />
    </section>
  );
}
