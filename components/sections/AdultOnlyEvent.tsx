'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { AdultOnlyIcon } from '../icons';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { T1SectionTitle } from './ui';

const AdultOnlyEvent = () => {
  const { t } = useTranslations('adultOnlyEvent');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();
  const params = useParams();
  const currentLocale = params.locale as string;

  // Si no está habilitado, no mostrar la sección
  if (!weddingData?.adultOnlyEvent?.enabled) {
    return null;
  }

  // Usar mensaje personalizado o el del servicio de traducciones
  const messageData = weddingData.adultOnlyEvent.message;
  const message = typeof messageData === 'object' 
    ? (messageData[currentLocale as 'es' | 'en'] || messageData.es || t('description'))
    : (messageData || t('description'));


  return (
    <section 
      className="bg-gray-50 relative overflow-hidden"
      style={getBackgroundStyle(2, '180px')}
    >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
        {/* Título */}
        <T1SectionTitle icon={<AdultOnlyIcon size={24} />} title={t('title')} />

        {/* Contenido principal */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Mensaje principal */}
          <motion.p 
            className="section-subtitle mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            {formatTextWithLineBreaks(message)}
          </motion.p>

          {/* Elemento decorativo sutil */}
          <motion.div 
            className="flex items-center justify-center space-x-3"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          >
            <div className="w-12 h-0.5" style={{ background: '#c9a86a' }}></div>
            <div className="w-2 h-2 rounded-full" style={{ background: '#c9a86a' }}></div>
            <div className="w-12 h-0.5" style={{ background: '#c9a86a' }}></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AdultOnlyEvent; 