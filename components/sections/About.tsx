'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding, selectCouple } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { AboutIcon } from '../icons';

const About = () => {
  const { t } = useTranslations('about');
  const params = useParams();
  const currentLocale = params.locale as string;
  const currentWedding = useAppSelector(selectCurrentWedding);
  const couple = useAppSelector(selectCouple);
  const { getBackgroundStyle } = useThemePatterns();
  const { coupleImage } = useWeddingImages(currentWedding?.id);

  // Datos dinámicos de la boda con soporte bilingüe
  const storyText = typeof couple?.story === 'object' && couple.story
    ? (couple.story[currentLocale as 'es' | 'en'] || couple.story.es || '')
    : (couple?.story as unknown as string || t('story'));
    
  const quoteText = typeof couple?.quote === 'object' && couple.quote
    ? (couple.quote[currentLocale as 'es' | 'en'] || couple.quote.es || '')
    : (couple?.quote as unknown as string || '');

  return (
    <section 
      id="about" 
      className="bg-gray-50 relative overflow-hidden"
      style={{
        ...getBackgroundStyle(1, '200px'),
        backgroundSize: '1273px 845px'
      }}
    >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
        {/* Título principal - manteniendo estilo original */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center mb-6">
            <AboutIcon 
              size={28} 
              className="text-accent mr-3 opacity-80" 
            />
            <h2 className="section-title text-stone-600 opacity-90">
              {t('title')}
            </h2>
          </div>
          <div className="title-decorative-line"></div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Cita romántica - centrada y elegante */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <blockquote className="text-xl md:text-2xl font-blockquote italic text-stone-600 leading-relaxed max-w-4xl mx-auto">
              &ldquo;{quoteText || 'El amor no es solo mirarse el uno al otro, sino mirar juntos en la misma dirección.'}&rdquo;
            </blockquote>
          </motion.div>

          {/* Layout mejorado: imagen más prominente sin overlay molesto */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Imagen de la pareja - SIN overlay blanco */}
            <motion.div 
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg group">
                <Image
                  src={coupleImage}
                  alt={`${couple?.bride.name || 'Novia'} y ${couple?.groom.name || 'Novio'}`}
                  width={800}
                  height={1000}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                {/* Solo una sombra sutil interior para darle profundidad */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
              </div>
            </motion.div>

            {/* Contenido de la historia - mejor spacing */}
            <motion.div 
              className="order-1 lg:order-2 space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <div className="space-y-4 text-gray-700 leading-relaxed text-base lg:text-lg">
                <p className="font-body">
                  {storyText}
                </p>
              </div>
              
              {/* Elemento decorativo sutil */}
              <div className="flex items-center space-x-3 pt-4">
                <div className="w-12 h-0.5 bg-accent"></div>
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <div className="w-12 h-0.5 bg-accent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 