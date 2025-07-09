'use client';

import React from 'react';
import { useTranslations } from '../../lib/translations';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { getFloralBackgroundStyle } from '../../lib/floral-patterns';

const DressCode = () => {
  const { t } = useTranslations('dressCode');
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);

  // Datos dinámicos con fallbacks
  const dressCodeData = weddingData?.event.dressCode;
  const dressCodeStyle = dressCodeData?.style || t('style.name');
  const dressCodeDescription = dressCodeData?.description || t('style.description');

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section 
        className="bg-white relative overflow-hidden"
        style={{
          ...getFloralBackgroundStyle(4, '400px'),
          backgroundSize: '506px 260px'
        }}
      >
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-6"></div>
            <div className="text-xl font-body font-medium text-accent mb-4">{dressCodeStyle}</div>
            <p className="section-subtitle max-w-2xl mx-auto">
              {dressCodeDescription}
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
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
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
        ...getFloralBackgroundStyle(4, '400px'),
        backgroundSize: '506px 260px'
      }}
          >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-12 animation-delay-200">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-6"></div>
            <div className="text-2xl font-body font-medium text-accent mb-6">{dressCodeStyle}</div>
            <p className="section-subtitle max-w-2xl mx-auto">
              {dressCodeDescription}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DressCode; 