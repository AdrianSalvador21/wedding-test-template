'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { openExternalLink } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { useTranslations } from '../../lib/translations';
import { LocationIcon } from '../icons';

const Location = () => {
  const { t } = useTranslations('location');
  const params = useParams();
  const currentLocale = params.locale as string;
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();

  // Datos dinámicos con fallbacks y soporte bilingüe
  const ceremonyVenueName = typeof weddingData?.event.ceremonyVenue?.name === 'object' && weddingData.event.ceremonyVenue.name
    ? (weddingData.event.ceremonyVenue.name[currentLocale as 'es' | 'en'] || weddingData.event.ceremonyVenue.name.es || '')
    : (weddingData?.event.ceremonyVenue?.name as unknown as string || '');

  const ceremonyVenue = ceremonyVenueName;
  const ceremonyAddress = weddingData?.event.ceremonyVenue?.address || '';
  const ceremonyUrl = weddingData?.event.ceremonyVenue?.mapsUrl || '';

  const receptionVenueName = typeof weddingData?.event.receptionVenue?.name === 'object' && weddingData.event.receptionVenue.name
    ? (weddingData.event.receptionVenue.name[currentLocale as 'es' | 'en'] || weddingData.event.receptionVenue.name.es || '')
    : (weddingData?.event.receptionVenue?.name as unknown as string || '');

  const receptionVenue = receptionVenueName;
  const receptionAddress = weddingData?.event.receptionVenue?.address || '';
  const receptionMapsUrl = weddingData?.event.receptionVenue?.mapsUrl || '';

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
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
          {/* Título */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center mb-6">
              <LocationIcon
                size={28}
                className="text-accent mr-3 opacity-80"
              />
              <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
            </div>
            <div className="title-decorative-line"></div>
          </motion.div>

          {/* Ubicaciones */}
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Ceremonia */}
            {ceremonyVenue && (
              <div className="text-center">
                <div className="flex justify-center items-center mb-6">
                  <h3 className="text-lg md:text-xl font-body font-medium text-stone-600">{t('ceremony')}</h3>
                </div>
                <div className="space-y-2 mb-6">
                  <p className="text-base md:text-lg font-body font-semibold text-stone-700">{ceremonyVenue}</p>
                  <p className="text-sm md:text-base text-gray-600 font-body">{ceremonyAddress}</p>
                </div>
                <button
                  onClick={() => openExternalLink(ceremonyUrl)}
                  className="inline-flex items-center text-accent hover:text-accent-dark transition-colors font-body bg-transparent text-sm"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('directions')}
                </button>
              </div>
            )}

            {/* Separador */}
            {ceremonyVenue && receptionVenue && (
              <div className="flex items-center justify-center">
                <div className="w-8 h-0.5 bg-accent"></div>
                <div className="w-2 h-2 bg-accent rounded-full mx-4"></div>
                <div className="w-8 h-0.5 bg-accent"></div>
              </div>
            )}

            {/* Recepción */}
            {receptionVenue && (
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
                  className="inline-flex items-center text-accent hover:text-accent-dark transition-colors font-body bg-transparent text-sm"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('directions')}
                </button>
              </div>
            )}
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
            <div className="flex items-center justify-center mb-6">
              <LocationIcon
                size={28}
                className="text-accent mr-3 opacity-80"
              />
              <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
            </div>
            <div className="title-decorative-line"></div>
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
                onClick={() => openExternalLink(ceremonyUrl)}
                className="inline-flex items-center text-accent hover:text-accent-dark transition-colors font-body bg-transparent"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t('directions')}
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
                className="inline-flex items-center text-accent hover:text-accent-dark transition-colors font-body bg-transparent"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t('directions')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location; 