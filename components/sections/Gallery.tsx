'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Camera } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';

const Gallery = () => {
  const { t } = useTranslations('gallery');
  const weddingData = useAppSelector(selectCurrentWedding);
  const [isMobile, setIsMobile] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Datos dinámicos con fallbacks
  const photos = weddingData?.gallery?.length ? weddingData.gallery.map(img => ({
    src: img.url,
    alt: img.alt,
    cols: img.cols || 1,
    rows: img.rows || 1
  })) : [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Momento romántico de la pareja",
      title: "Amor verdadero",
      cols: 1,
      rows: 1
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1470219556762-1771e7f9427d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Preparativos de la boda",
      title: "Preparándose para el gran día",
      cols: 1,
      rows: 1
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Ceremonia de boda",
      title: "Momento especial",
      cols: 1,
      rows: 1
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1525258370847-a2d17115dbaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Anillos de matrimonio",
      title: "Unidos por siempre",
      cols: 1,
      rows: 1
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Celebración de boda",
      title: "Felicidad compartida",
      cols: 1,
      rows: 1
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Recepción de boda",
      title: "Celebrando juntos",
      cols: 1,
      rows: 1
    }
  ];

  const hashtag = weddingData?.couple.hashtag || t('hashtag');

  // Versión sin animaciones para móvil
  if (isMobile) {
    return (
      <section className="py-12 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-16">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
            <p className="section-subtitle">
              {t('subtitle')}
            </p>
          </div>

          {/* Grid de fotos simplificado para móvil */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl shadow-lg h-64"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    quality={60}
                    loading={index > 2 ? "lazy" : "eager"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mensaje especial */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
              <h3 className="text-2xl font-heading font-semibold text-primary mb-4">
                {t('everyMomentCounts')}
              </h3>
              <p className="text-text leading-relaxed mb-6">
                {t('memoryDescription')}
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-px bg-accent" />
                <Camera className="w-6 h-6 text-accent" />
                <div className="w-12 h-px bg-accent" />
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center mt-12">
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
    <section ref={ref} className="py-12 bg-gradient-to-br from-light via-white to-light">
      <div className="section-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Título */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
            <p className="section-subtitle">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Grid de fotos */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {photos.map((photo, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  className={`relative overflow-hidden rounded-2xl shadow-lg md:hover:shadow-xl transition-shadow duration-300 group cursor-pointer
                    ${photo.cols === 2 ? 'col-span-2' : 'col-span-1'}
                    ${photo.rows === 2 ? 'row-span-2' : 'row-span-1'}
                  `}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    quality={60}
                    loading={index > 4 ? "lazy" : "eager"}
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mensaje especial */}
          <motion.div variants={itemVariants} className="text-center mt-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
              <h3 className="text-2xl font-heading font-semibold text-primary mb-4">
                {t('everyMomentCounts')}
              </h3>
              <p className="text-text leading-relaxed mb-6">
                {t('memoryDescription')}
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-px bg-accent" />
                <Camera className="w-6 h-6 text-accent" />
                <div className="w-12 h-px bg-accent" />
              </div>
            </div>
          </motion.div>

          {/* Call to action */}
          <motion.div variants={itemVariants} className="text-center mt-12">
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
        </motion.div>
      </div>
    </section>
  );
};

export default Gallery; 