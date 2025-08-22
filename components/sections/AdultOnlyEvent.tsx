'use client';

import React from 'react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';

const AdultOnlyEvent = () => {
  const { t } = useTranslations('adultOnlyEvent');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();

  // Si no está habilitado, no mostrar la sección
  if (!weddingData?.adultOnlyEvent?.enabled) {
    return null;
  }

  // Usar mensaje personalizado o el del servicio de traducciones
  const message = weddingData.adultOnlyEvent.message || t('description');

  return (
    <section 
      className="bg-gray-50 relative overflow-hidden"
      style={getBackgroundStyle(2, '180px')}
    >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
        {/* Título */}
        <div className="text-center mb-12">
          <h2 className="section-title text-stone-600 opacity-90 mb-4">{t('title')}</h2>
          <div className="w-16 h-0.5 bg-accent mx-auto"></div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Mensaje principal */}
          <p className="section-subtitle mb-8">
            {message}
          </p>

          {/* Elemento decorativo sutil */}
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-0.5 bg-accent"></div>
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <div className="w-12 h-0.5 bg-accent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdultOnlyEvent; 