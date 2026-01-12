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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const { getBackgroundStyle } = useThemePatterns();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Usar imágenes dinámicas de la galería
  const photos = galleryImages.map((src, index) => ({
    id: index + 1,
    src: src,
    alt: `Foto ${index + 1} de la boda`
  }));

  // Si no hay imágenes, renderizar null pero después de todos los hooks
  const shouldRender = photos.length > 0;

  const hashtag = weddingData?.couple.hashtag || t('hashtag');

  // Precargar todas las imágenes en desktop
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768 && photos.length > 0) {
      photos.forEach((photo) => {
        if (!preloadedImages.has(photo.src)) {
          const img = document.createElement('img');
          img.onload = () => {
            setPreloadedImages(prev => new Set([...Array.from(prev), photo.src]));
          };
          img.src = photo.src;
        }
      });
    }
  }, [photos, preloadedImages]);



  // Autoplay functionality - pausar durante drag
  useEffect(() => {
    if (!isAutoPlaying || !inView || isDragging) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying, inView, isDragging, photos.length]);

  // Navigation functions con debounce y animaciones
  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsAutoPlaying(false);
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [photos.length, isTransitioning]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsAutoPlaying(false);
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [photos.length, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsAutoPlaying(false);
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, currentIndex]);

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
    enter: {
      x: 300,
      opacity: 0
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: {
      zIndex: 0,
      x: -300,
      opacity: 0
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
          <div className="title-decorative-line mb-6"></div>
          <p className="section-subtitle">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Mobile Carousel (original) */}
            <div className="relative overflow-hidden rounded-3xl shadow-xl md:hidden">
              <div className="relative h-96 sm:h-80">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={currentIndex}
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
            </div>

            {/* Desktop Carousel (nuevo diseño con previews laterales) */}
            <div className="hidden md:block relative">
              <div className="flex items-center justify-center space-x-4 lg:space-x-6">
                {/* Imagen previa izquierda */}
                {currentIndex > 0 && (
                  <div
                    className="relative w-32 lg:w-40 h-48 lg:h-60 rounded-2xl overflow-hidden shadow-lg cursor-pointer opacity-60 hover:opacity-80 transition-all duration-300"
                    onClick={() => goToSlide(currentIndex - 1)}
                  >
                    <Image
                      src={photos[currentIndex - 1].src}
                      alt={photos[currentIndex - 1].alt}
                      fill
                      className="object-cover select-none"
                      quality={70}
                      draggable={false}
                      unoptimized={true}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                )}

                {/* Imagen principal */}
                <div className="relative w-80 lg:w-96 h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <div 
                    key={currentIndex}
                    className="absolute inset-0 transition-opacity duration-300 ease-out"
                    style={{ opacity: isTransitioning ? 0.7 : 1 }}
                  >
                    <Image
                      src={photos[currentIndex].src}
                      alt={photos[currentIndex].alt}
                      fill
                      className="object-contain select-none bg-gradient-to-br from-gray-50 to-gray-100"
                      quality={95}
                      priority={true}
                      draggable={false}
                      unoptimized={true}
                    />
                  </div>
                  
                  {/* Navigation Buttons - Siempre visibles en desktop */}
                  <div className="absolute inset-0 flex items-center justify-between px-6 z-10">
                    <button
                      onClick={goToPrevious}
                      disabled={isTransitioning}
                      className={`bg-white/90 hover:bg-white backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 ${
                        isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="w-6 h-6 text-stone-600" />
                    </button>
                    
                    <button
                      onClick={goToNext}
                      disabled={isTransitioning}
                      className={`bg-white/90 hover:bg-white backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 ${
                        isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight className="w-6 h-6 text-stone-600" />
                    </button>
                  </div>
                </div>

                {/* Imagen previa derecha */}
                {currentIndex < photos.length - 1 && (
                  <div
                    className="relative w-32 lg:w-40 h-48 lg:h-60 rounded-2xl overflow-hidden shadow-lg cursor-pointer opacity-60 hover:opacity-80 transition-all duration-300"
                    onClick={() => goToSlide(currentIndex + 1)}
                  >
                    <Image
                      src={photos[currentIndex + 1].src}
                      alt={photos[currentIndex + 1].alt}
                      fill
                      className="object-cover select-none"
                      quality={70}
                      draggable={false}
                      unoptimized={true}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                )}
              </div>
            </div>

            {/* Indicadores elegantes con límite */}
            <div className="flex justify-center space-x-2 mt-8">
              {(() => {
                const maxVisiblePills = 5;
                const totalPhotos = photos.length;
                
                // Si hay pocas imágenes, mostrar todos los pills
                if (totalPhotos <= maxVisiblePills) {
                  return photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-300 ${
                        index === currentIndex
                          ? 'w-8 h-2 rounded-full carousel-step-active bg-stone-600'
                          : 'w-2 h-2 rounded-full carousel-step-inactive bg-stone-300 hover:bg-stone-400'
                      }`}
                      aria-label={`Ir a imagen ${index + 1}`}
                    />
                  ));
                }
                
                // Calcular el rango de pills visibles
                const halfVisible = Math.floor(maxVisiblePills / 2);
                let startIndex = Math.max(0, currentIndex - halfVisible);
                const endIndex = Math.min(totalPhotos - 1, startIndex + maxVisiblePills - 1);
                
                // Ajustar si estamos cerca del final
                if (endIndex - startIndex < maxVisiblePills - 1) {
                  startIndex = Math.max(0, endIndex - maxVisiblePills + 1);
                }
                
                const visibleIndices = [];
                for (let i = startIndex; i <= endIndex; i++) {
                  visibleIndices.push(i);
                }
                
                return (
                  <>
                    {/* Indicador de más imágenes al inicio */}
                    {startIndex > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 rounded-full bg-stone-400"></div>
                        <div className="w-1 h-1 rounded-full bg-stone-400"></div>
                        <div className="w-1 h-1 rounded-full bg-stone-400"></div>
                      </div>
                    )}
                    
                    {/* Pills visibles */}
                    {visibleIndices.map((index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 ${
                          index === currentIndex
                            ? 'w-8 h-2 rounded-full carousel-step-active bg-stone-600'
                            : 'w-2 h-2 rounded-full carousel-step-inactive bg-stone-300 hover:bg-stone-400'
                        }`}
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                    
                    {/* Indicador de más imágenes al final */}
                    {endIndex < totalPhotos - 1 && (
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 rounded-full bg-stone-400"></div>
                        <div className="w-1 h-1 rounded-full bg-stone-400"></div>
                        <div className="w-1 h-1 rounded-full bg-stone-400"></div>
                      </div>
                    )}
                  </>
                );
              })()}
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
            <h3 className="text-xl font-blockquote font-semibold mb-4">
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