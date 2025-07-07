'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { getFloralBackgroundStyle } from '../../lib/floral-patterns';

const Gallery = () => {
  const { t } = useTranslations('gallery');
  const weddingData = useAppSelector(selectCurrentWedding);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Datos dinámicos con fallbacks
  const photos = weddingData?.gallery?.length ? weddingData.gallery.map(img => ({
    src: img.url,
    alt: img.alt
  })) : [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      alt: "Momento romántico de la pareja"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1470219556762-1771e7f9427d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      alt: "Preparativos de la boda"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      alt: "Ceremonia de boda"
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1525258370847-a2d17115dbaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      alt: "Anillos de matrimonio"
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      alt: "Celebración de boda"
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      alt: "Recepción de boda"
    }
  ];

  const hashtag = weddingData?.couple.hashtag || t('hashtag');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Autoplay functionality - pausar durante drag
  useEffect(() => {
    if (!isAutoPlaying || !inView || isDragging) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying, inView, isDragging, photos.length]);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goToSlide = useCallback((index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  }, []);

  // Mejorar detección de swipe
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset > 0 || velocity > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
  };

  // Carousel variants más suaves
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    if (newDirection === 1) {
      goToNext();
    } else {
      goToPrevious();
    }
  };

  return (
    <section 
      ref={ref} 
      className="py-12 bg-white relative overflow-hidden"
      style={getFloralBackgroundStyle(2, '240px')}
    >
      <div className="section-container">
        {/* Título */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
          <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
          <p className="section-subtitle">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main Carousel */}
            <div className="relative overflow-hidden rounded-3xl shadow-xl">
              <div className="relative h-64 sm:h-80 md:h-96 lg:h-[480px]">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                  >
                    <Image
                      src={photos[currentIndex].src}
                      alt={photos[currentIndex].alt}
                      fill
                      className="object-cover select-none"
                      quality={90}
                      priority={currentIndex === 0}
                      draggable={false}
                    />
                    
                    {/* Overlay sutil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Buttons - Solo visible en hover en desktop */}
              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <button
                  onClick={() => paginate(-1)}
                  className="pointer-events-auto bg-white/80 hover:bg-white backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 hidden md:flex"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-5 h-5 text-stone-600" />
                </button>
                
                <button
                  onClick={() => paginate(1)}
                  className="pointer-events-auto bg-white/80 hover:bg-white backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 hidden md:flex"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-5 h-5 text-stone-600" />
                </button>
              </div>
            </div>

            {/* Indicadores elegantes */}
            <div className="flex justify-center space-x-2 mt-8">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 h-2 bg-stone-600 rounded-full'
                      : 'w-2 h-2 bg-stone-300 hover:bg-stone-400 rounded-full'
                  }`}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>


          </div>
        </div>

        {/* Call to action */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-gradient-primary rounded-2xl p-8 text-white max-w-2xl mx-auto">
            <h3 className="text-xl font-heading font-semibold mb-4">
              {t('shareMessage')}
            </h3>
            <p className="opacity-90 mb-6">
              {t('cameraMessage')} <span className="font-semibold">{hashtag}</span> {t('hashtagPrompt')}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Camera className="w-5 h-5" />
              <span className="font-semibold">{hashtag}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Gallery; 