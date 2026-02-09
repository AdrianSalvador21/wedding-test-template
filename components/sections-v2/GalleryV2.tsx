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
import { V2Card, V2Container, V2Section, V2Stagger, V2StaggerItem, V2Title, V2PillButton } from './ui';

export default function GalleryV2() {
  const { t } = useTranslations('gallery');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { galleryImages } = useWeddingImages(weddingData?.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const { getBackgroundStyle } = useThemePatterns();

  type IdleCallbackHandle = number;

  type RequestIdleCallback = (
    callback: () => void,
    options?: {
      timeout: number;
    }
  ) => IdleCallbackHandle;

  type CancelIdleCallback = (handle: IdleCallbackHandle) => void;

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const photos = galleryImages.map((src, index) => ({
    id: index + 1,
    src,
    alt: `Foto ${index + 1} de la boda`,
  }));

  const shouldRender = photos.length > 0;
  const hashtag = weddingData?.couple.hashtag || t('hashtag');

  useEffect(() => {
    if (typeof window === 'undefined' || photos.length === 0) return;

    const preload = (src: string) => {
      if (!src || preloadedImages.has(src)) return;
      const img = document.createElement('img');
      img.onload = () => {
        setPreloadedImages((prev) => new Set([...Array.from(prev), src]));
      };
      img.src = src;
    };

    const isDesktop = window.innerWidth >= 768;
    const indicesToPreload = new Set<number>();

    indicesToPreload.add(currentIndex);
    indicesToPreload.add(currentIndex + 1);
    indicesToPreload.add(currentIndex + 2);
    indicesToPreload.add(currentIndex - 1);

    indicesToPreload.forEach((idx) => {
      const safeIndex = ((idx % photos.length) + photos.length) % photos.length;
      preload(photos[safeIndex].src);
    });

    if (isDesktop) {
      photos.forEach((p) => preload(p.src));
      return;
    }

    const remaining = photos
      .map((p) => p.src)
      .filter((src) => src && !preloadedImages.has(src));

    if (remaining.length === 0) return;

    const windowWithIdle = window as unknown as {
      requestIdleCallback?: RequestIdleCallback;
      cancelIdleCallback?: CancelIdleCallback;
    };
    const idleCb = windowWithIdle.requestIdleCallback;
    const cancelIdleCb = windowWithIdle.cancelIdleCallback;

    if (idleCb) {
      const id = idleCb(
        () => {
          remaining.forEach((src) => preload(src));
        },
        { timeout: 1500 }
      );

      return () => {
        if (cancelIdleCb) cancelIdleCb(id);
      };
    }

    const timeoutId = window.setTimeout(() => {
      remaining.forEach((src) => preload(src));
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [photos, preloadedImages, currentIndex]);

  useEffect(() => {
    if (!isAutoPlaying || !inView || isDragging || photos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, inView, isDragging, photos.length]);

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

  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: { zIndex: 0, x: -300, opacity: 0 },
  };

  const getPhoto = (index: number) => {
    if (photos.length === 0) return null;
    const safeIndex = ((index % photos.length) + photos.length) % photos.length;
    return photos[safeIndex];
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <V2Section
      id="gallery"
      className="relative overflow-hidden"
      style={{
        ...getBackgroundStyle(2, '240px'),
        backgroundSize: '585px 401px',
        backgroundRepeat: 'repeat',
        backgroundPosition: '166% 11%'
      }}
    >
      <V2Container className="py-12">
        <V2Stagger>
          <V2StaggerItem>
            <V2Title title={t('title')} subtitle={t('subtitle')} />
          </V2StaggerItem>

          <V2StaggerItem>
            <div ref={ref}>
              <div className="mt-10 max-w-6xl mx-auto">
                <div className="relative">
                  {/* Mobile carousel */}
                  <div className="relative md:hidden">
                    <div className="relative h-96 sm:h-80 overflow-visible">
                      <div className="absolute inset-0 pointer-events-none select-none">
                        {photos.length > 1 && (
                          <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-[1.25deg] scale-[0.985] opacity-70">
                            <div className="relative h-full w-full rounded-[22px] overflow-hidden shadow-lg bg-white">
                              <Image
                                src={getPhoto(currentIndex + 1)!.src}
                                alt={getPhoto(currentIndex + 1)!.alt}
                                fill
                                className="object-cover"
                                quality={60}
                                draggable={false}
                              />
                              <div className="absolute inset-0 bg-[#fbf7f1]/45" />
                            </div>
                          </div>
                        )}

                        {photos.length > 2 && (
                          <div className="absolute inset-0 translate-x-6 translate-y-6 rotate-[2.25deg] scale-[0.97] opacity-40">
                            <div className="relative h-full w-full rounded-[22px] overflow-hidden shadow-md bg-white">
                              <Image
                                src={getPhoto(currentIndex + 2)!.src}
                                alt={getPhoto(currentIndex + 2)!.alt}
                                fill
                                className="object-cover"
                                quality={55}
                                draggable={false}
                              />
                              <div className="absolute inset-0 bg-[#fbf7f1]/55" />
                            </div>
                          </div>
                        )}
                      </div>

                      <AnimatePresence initial={false}>
                        <motion.div
                          key={currentIndex}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                          }}
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.1}
                          onDragStart={() => setIsDragging(true)}
                          onDragEnd={handleDragEnd}
                          className="absolute inset-0 cursor-grab active:cursor-grabbing"
                        >
                          <div className="relative h-full w-full rounded-[22px] overflow-hidden shadow-xl bg-white">
                            <Image
                              src={photos[currentIndex].src}
                              alt={photos[currentIndex].alt}
                              fill
                              className="object-cover select-none"
                              quality={90}
                              priority={currentIndex === 0}
                              draggable={false}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Desktop carousel */}
                  <div className="hidden md:block relative">
                    <div className="flex items-center justify-center space-x-4 lg:space-x-6">
                      {currentIndex > 0 && (
                        <div
                          className="relative w-32 lg:w-40 h-48 lg:h-60 rounded-[22px] overflow-hidden cursor-pointer opacity-60 hover:opacity-80 transition-opacity"
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
                          <div className="absolute inset-0 bg-[#fbf7f1]/30" />
                        </div>
                      )}

                      <div className="relative w-80 lg:w-96 h-96 lg:h-[500px] rounded-[28px] overflow-hidden border border-[#e7dccf] bg-white">
                        <div
                          key={currentIndex}
                          className="absolute inset-0 transition-opacity duration-300 ease-out"
                          style={{ opacity: isTransitioning ? 0.7 : 1 }}
                        >
                          <Image
                            src={photos[currentIndex].src}
                            alt={photos[currentIndex].alt}
                            fill
                            className="object-contain select-none bg-[#fbf7f1]"
                            quality={95}
                            priority={true}
                            draggable={false}
                            unoptimized={true}
                          />
                        </div>

                        <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                          <button
                            onClick={goToPrevious}
                            disabled={isTransitioning}
                            className={`rounded-full w-11 h-11 flex items-center justify-center transition-opacity border border-[#e7dccf] bg-white/80 hover:opacity-90 ${
                              isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            aria-label="Imagen anterior"
                          >
                            <ChevronLeft className="w-5 h-5 text-[#6f6254]" />
                          </button>

                          <button
                            onClick={goToNext}
                            disabled={isTransitioning}
                            className={`rounded-full w-11 h-11 flex items-center justify-center transition-opacity border border-[#e7dccf] bg-white/80 hover:opacity-90 ${
                              isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            aria-label="Imagen siguiente"
                          >
                            <ChevronRight className="w-5 h-5 text-[#6f6254]" />
                          </button>
                        </div>
                      </div>

                      {currentIndex < photos.length - 1 && (
                        <div
                          className="relative w-32 lg:w-40 h-48 lg:h-60 rounded-[22px] overflow-hidden cursor-pointer opacity-60 hover:opacity-80 transition-opacity"
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
                          <div className="absolute inset-0 bg-[#fbf7f1]/30" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Indicators */}
                <div className="flex justify-center space-x-2 mt-8">
                  {(() => {
                    const maxVisiblePills = 5;
                    const totalPhotos = photos.length;

                    if (totalPhotos <= maxVisiblePills) {
                      return photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`transition-all duration-300 ${
                            index === currentIndex
                              ? 'w-8 h-2 rounded-full bg-[#b79a7a]'
                              : 'w-2 h-2 rounded-full bg-[#dccab7] hover:bg-[#cbb398]'
                          }`}
                          aria-label={`Ir a imagen ${index + 1}`}
                        />
                      ));
                    }

                    const halfVisible = Math.floor(maxVisiblePills / 2);
                    let startIndex = Math.max(0, currentIndex - halfVisible);
                    const endIndex = Math.min(totalPhotos - 1, startIndex + maxVisiblePills - 1);

                    if (endIndex - startIndex < maxVisiblePills - 1) {
                      startIndex = Math.max(0, endIndex - maxVisiblePills + 1);
                    }

                    const visibleIndices = [];
                    for (let i = startIndex; i <= endIndex; i++) visibleIndices.push(i);

                    return (
                      <>
                        {startIndex > 0 && (
                          <div className="flex items-center space-x-1">
                            <div className="w-1 h-1 rounded-full bg-[#cbb398]" />
                            <div className="w-1 h-1 rounded-full bg-[#cbb398]" />
                            <div className="w-1 h-1 rounded-full bg-[#cbb398]" />
                          </div>
                        )}
                        {visibleIndices.map((index) => (
                          <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all duration-300 ${
                              index === currentIndex
                                ? 'w-8 h-2 rounded-full bg-[#b79a7a]'
                                : 'w-2 h-2 rounded-full bg-[#dccab7] hover:bg-[#cbb398]'
                            }`}
                            aria-label={`Ir a imagen ${index + 1}`}
                          />
                        ))}
                        {endIndex < totalPhotos - 1 && (
                          <div className="flex items-center space-x-1">
                            <div className="w-1 h-1 rounded-full bg-[#cbb398]" />
                            <div className="w-1 h-1 rounded-full bg-[#cbb398]" />
                            <div className="w-1 h-1 rounded-full bg-[#cbb398]" />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </V2StaggerItem>

          <V2StaggerItem>
            <div className="mt-10">
              <V2Card className="p-8 md:p-10 text-center">
                <h3 className="font-serif text-xl text-[#3b342b]">{t('shareMessage')}</h3>
                <p className="mt-4 text-sm md:text-base text-[#6f6254]">
                  {t('cameraMessage')} <span className="font-medium text-[#3b342b]">{hashtag}</span> {t('hashtagPrompt')}
                </p>
                <div className="mt-6 flex justify-center">
                  <V2PillButton onClick={() => {}} className="pointer-events-none select-none">
                    <span className="inline-flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      {hashtag}
                    </span>
                  </V2PillButton>
                </div>
              </V2Card>
            </div>
          </V2StaggerItem>
        </V2Stagger>
      </V2Container>
    </V2Section>
  );
}
