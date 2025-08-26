'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { GalleryIcon } from '../icons';

const Gallery = () => {
  const { t } = useTranslations('gallery');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { galleryImages } = useWeddingImages(weddingData?.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const { getBackgroundStyle } = useThemePatterns();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Usar imágenes dinámicas de la galería
  const photos = (galleryImages || []).map((src, index) => ({
    id: index + 1,
    src: src,
    alt: `Foto ${index + 1} de la boda`
  }));

  // Si no hay imágenes, renderizar null pero después de todos los hooks
  const shouldRender = photos.length > 0;

  const hashtag = weddingData?.couple.hashtag || t('hashtag');



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

  const galleryContent = (
    <section 
      ref={ref} 
      className="bg-white relative overflow-hidden"
      style={{
        ...getBackgroundStyle(2, '240px'),
        backgroundSize: '585px 401px',
        backgroundRepeat: 'repeat',
        backgroundPosition: '166% 11%'
      }}
    >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
        {/* Título */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-6">
            <GalleryIcon 
              size={28} 
              className="text-accent mr-3 opacity-80" 
            />
            <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
          </div>
          <div className="w-16 h-0.5 bg-accent mx-auto mb-6"></div>
          <p className="section-subtitle">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main Carousel */}
            <div className="relative overflow-hidden rounded-3xl shadow-xl">
              <div className="relative h-96 sm:h-80 md:h-96 lg:h-[480px]">
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
            <p className="opacity-90 mb-6 font-body">
              {t('cameraMessage')} <span className="font-semibold">{hashtag}</span> {t('hashtagPrompt')}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Camera className="w-5 h-5" />
              <span className="font-body font-semibold">{hashtag}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );

  // No renderizar si no hay imágenes
  if (!shouldRender) {
    return null;
  }

  return galleryContent;
};

export default Gallery; 