'use client';

import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { openExternalLink } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { useTranslations } from '../../lib/translations';

const Location = () => {
  const { t } = useTranslations('location');
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();

  // Datos dinámicos con fallbacks
  const ceremonyVenue = weddingData?.event.ceremonyVenue?.name || t('ceremony.venue');
  const ceremonyAddress = weddingData?.event.ceremonyVenue?.address || t('ceremony.address');
  const ceremonyMapsUrl = weddingData?.event.ceremonyVenue?.coordinates 
    ? `https://maps.google.com/maps?q=${weddingData.event.ceremonyVenue.coordinates.lat},${weddingData.event.ceremonyVenue.coordinates.lng}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(ceremonyVenue + ' ' + ceremonyAddress)}`;
  
  const receptionVenue = weddingData?.event.receptionVenue?.name || t('reception.venue');
  const receptionAddress = weddingData?.event.receptionVenue?.address || t('reception.address');
  const receptionMapsUrl = weddingData?.event.receptionVenue?.coordinates 
    ? `https://maps.google.com/maps?q=${weddingData.event.receptionVenue.coordinates.lat},${weddingData.event.receptionVenue.coordinates.lng}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(receptionVenue + ' ' + receptionAddress)}`;

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section 
        className="bg-white relative overflow-hidden"
        style={{
          ...getBackgroundStyle(2, '400px'),
          backgroundPosition: '-288px -321px',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '387px 953px'
        }}
      >
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto"></div>
          </div>

          {/* Ubicaciones */}
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Ceremonia */}
            <div className="text-center">
              <div className="flex justify-center items-center mb-6">
                <h3 className="text-lg md:text-xl font-body font-medium text-stone-600">{t('ceremony')}</h3>
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-base md:text-lg font-body font-semibold text-stone-700">{ceremonyVenue}</p>
                <p className="text-sm md:text-base text-gray-600 font-body">{ceremonyAddress}</p>
              </div>
              <button 
                onClick={() => openExternalLink(ceremonyMapsUrl)}
                className="inline-flex items-center text-accent hover:text-accent-dark transition-colors font-body"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t('directions')}
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Separador */}
            <div className="flex items-center justify-center">
              <div className="w-8 h-0.5 bg-accent"></div>
              <div className="w-2 h-2 bg-accent rounded-full mx-4"></div>
              <div className="w-8 h-0.5 bg-accent"></div>
            </div>

            {/* Recepción */}
            <div className="text-center">
              <div className="flex justify-center items-center mb-6">
                <h3 className="text-lg md:text-xl font-body font-medium text-stone-600">{t('reception')}</h3>
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-base md:text-lg font-body font-semibold text-stone-700">{receptionVenue}</p>
                <p className="text-sm md:text-base text-gray-600 font-body">{receptionAddress}</p>
              </div>
              <button 
                onClick={() => openExternalLink(receptionMapsUrl)}
                className="inline-flex items-center text-accent hover:text-accent-dark transition-colors font-body"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t('directions')}
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>
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
            <div className="space-y-6">
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Versión para desktop con animaciones CSS
  return (
    <section 
      id="location" 
      className="bg-white relative overflow-hidden"
      style={{
        ...getBackgroundStyle(2, '400px'),
        backgroundPosition: '-288px -321px',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '387px 953px'
      }}
    >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto"></div>
          </div>

          {/* Ubicaciones */}
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Ceremonia */}
            <div className="text-center">
              <div className="flex justify-center items-center mb-6">
                <h3 className="text-lg md:text-xl font-body font-medium text-stone-600">{t('ceremony')}</h3>
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-base md:text-lg font-body font-semibold text-stone-700">{ceremonyVenue}</p>
                <p className="text-sm md:text-base text-gray-600 font-body">{ceremonyAddress}</p>
              </div>
              <button 
                onClick={() => openExternalLink(ceremonyMapsUrl)}
                className="inline-flex items-center text-accent hover:text-accent-dark transition-colors font-body"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t('directions')}
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Separador */}
            <div className="flex items-center justify-center">
              <div className="w-8 h-0.5 bg-accent"></div>
              <div className="w-2 h-2 bg-accent rounded-full mx-4"></div>
              <div className="w-8 h-0.5 bg-accent"></div>
            </div>

            {/* Recepción */}
            <div className="text-center">
              <div className="flex justify-center items-center mb-6">
                <h3 className="text-lg md:text-xl font-body font-medium text-stone-600">{t('reception')}</h3>
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-base md:text-lg font-body font-semibold text-stone-700">{receptionVenue}</p>
                <p className="text-sm md:text-base text-gray-600 font-body">{receptionAddress}</p>
              </div>
              <button 
                onClick={() => openExternalLink(receptionMapsUrl)}
                className="inline-flex items-center text-accent hover:text-accent-dark transition-colors font-body"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t('directions')}
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location; 