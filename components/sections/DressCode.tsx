'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { DressCodeIcon } from '../icons';

const DressCode = () => {
  const { t } = useTranslations('dressCode');
  const params = useParams();
  const currentLocale = params.locale as string;
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();

  // Datos dinámicos con fallbacks y soporte bilingüe
  const dressCodeData = weddingData?.event.dressCode;
  const dressCodeStyle = typeof dressCodeData?.style === 'object' && dressCodeData.style
    ? (dressCodeData.style[currentLocale as 'es' | 'en'] || dressCodeData.style.es || '')
    : (dressCodeData?.style as unknown as string || '');
    
  const dressCodeDescription = typeof dressCodeData?.description === 'object' && dressCodeData.description
    ? (dressCodeData.description[currentLocale as 'es' | 'en'] || dressCodeData.description.es || '')
    : (dressCodeData?.description as unknown as string || '');

  // No mostrar si no hay información de dress code
  if (!dressCodeStyle && !dressCodeDescription) {
    return null;
  }

  // Usar fallbacks de traducción solo para mostrar
  const displayStyle = dressCodeStyle || t('style.name');
  const displayDescription = dressCodeDescription || t('style.description');

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section 
        className="bg-white relative overflow-hidden"
        style={{
          ...getBackgroundStyle(4, '400px'),
          backgroundSize: '506px 260px'
        }}
      >
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
          {/* Título */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <DressCodeIcon 
                size={28} 
                className="text-accent mr-3 opacity-80" 
              />
              <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
            </div>
            <div className="title-decorative-line mb-6"></div>
            <div className="text-xl font-body font-medium text-accent mb-4">{displayStyle}</div>
            <p className="section-subtitle max-w-2xl mx-auto">
              {displayDescription}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  // Versión para desktop con animaciones
      return (
      <section 
        className="bg-white relative overflow-hidden"
        style={{
          ...getBackgroundStyle(4, '400px'),
          backgroundSize: '506px 260px'
        }}
          >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Título */}
          <div className="text-center mb-12">
            <motion.div 
              className="flex items-center justify-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <DressCodeIcon 
                size={28} 
                className="text-accent mr-3 opacity-80" 
              />
              <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
            </motion.div>
            <motion.div 
              className="w-16 h-0.5 bg-accent mx-auto mb-6"
              initial={{ width: 0 }}
              whileInView={{ width: 64 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            ></motion.div>
            <motion.div 
              className="text-2xl font-body font-medium text-accent mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            >
              {displayStyle}
            </motion.div>
            <motion.p 
              className="section-subtitle max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            >
              {displayDescription}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DressCode; 