'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { V3BgMotif, V3Branch, V3Monogram, V3PhotoArch, V3PillButton, v3Colors } from './ui';

interface HeroV3Props {
  overlayVisible: boolean;
}

export default function HeroV3({ overlayVisible }: HeroV3Props) {
  const { t } = useTranslations('hero');
  const params = useParams();
  const currentLocale = (params.locale as string) || 'es';
  const weddingData = useAppSelector(selectCurrentWedding);
  const { heroImage } = useWeddingImages(weddingData?.id);

  const brideName = weddingData?.couple.bride.name || 'María';
  const groomName = weddingData?.couple.groom.name || 'Carlos';
  const weddingDate = weddingData?.event.date ? new Date(weddingData.event.date) : new Date('2025-11-21T16:00:00');

  const receptionVenue = weddingData?.event.receptionVenue;
  const venueName = typeof receptionVenue?.name === 'object' && receptionVenue.name
    ? (receptionVenue.name[currentLocale as 'es' | 'en'] || receptionVenue.name.es || '')
    : ((receptionVenue?.name as unknown as string) || t('location'));

  const formattedDate = weddingDate.toLocaleDateString(currentLocale === 'en' ? 'en-US' : 'es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const hidden = overlayVisible;

  return (
    <section
      className="relative overflow-hidden bg-[#FAF6EF] text-[#34302A] min-h-screen flex flex-col md:flex-row"
      aria-hidden={hidden}
    >
      {/* Columna de texto */}
      <div className="order-2 md:order-1 relative w-full md:w-[56%] flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-24 py-20 md:py-0 overflow-hidden">
        <V3BgMotif patternId="v3-lp-hero" tileSize={320} rotate={6} className="hidden md:block" />
        <V3Branch className="hidden md:block absolute -left-4 -top-2" />

        <motion.p
          className="font-jost text-[11px] md:text-[13px] font-medium tracking-[0.34em] uppercase mb-6"
          style={{ color: v3Colors.accent }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: hidden ? 0 : 1, y: hidden ? 20 : 0 }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: hidden ? 0 : 0.2 }}
        >
          {t('ourWedding')}
        </motion.p>

        <div>
          <motion.span
            className="block font-cormorant italic font-medium text-5xl md:text-6xl lg:text-[76px] leading-[1.03]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hidden ? 0 : 1, y: hidden ? 20 : 0 }}
            transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: hidden ? 0 : 0.5 }}
          >
            {brideName}
          </motion.span>
          <motion.span
            className="block font-cormorant italic font-normal text-3xl md:text-4xl my-1"
            style={{ color: v3Colors.accent }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hidden ? 0 : 1, y: hidden ? 20 : 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: hidden ? 0 : 0.75 }}
          >
            &amp;
          </motion.span>
          <motion.span
            className="block font-cormorant italic font-medium text-5xl md:text-6xl lg:text-[76px] leading-[1.03]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hidden ? 0 : 1, y: hidden ? 20 : 0 }}
            transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: hidden ? 0 : 1 }}
          >
            {groomName}
          </motion.span>
        </div>

        <motion.svg
          width="150"
          height="14"
          viewBox="0 0 150 14"
          fill="none"
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: hidden ? 0 : 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: hidden ? 0 : 1.35 }}
          aria-hidden="true"
        >
          <path d="M2,7 C40,2 110,2 148,7" stroke={v3Colors.accent} strokeWidth="1.4" />
        </motion.svg>

        <motion.div
          className="flex flex-wrap items-center gap-x-4 gap-y-2 font-jost text-sm md:text-[15px] text-[#6B6255] mt-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: hidden ? 0 : 1, y: hidden ? 20 : 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: hidden ? 0 : 1.75 }}
        >
          <span className="inline-flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: v3Colors.accent }} />
            {formattedDate}
          </span>
          <span className="w-1 h-1 rounded-full bg-[#C8BBA4]" />
          <span className="inline-flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: v3Colors.accent }} />
            {venueName}
          </span>
        </motion.div>

        {weddingData?.showConfirmCta !== false && (
          <motion.div
            className="mt-11"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hidden ? 0 : 1, y: hidden ? 20 : 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: hidden ? 0 : 2 }}
          >
            <V3PillButton href="#rsvp">
              {t('cta')}
              <ArrowRight className="w-4 h-4" />
            </V3PillButton>
          </motion.div>
        )}

        <motion.div
          className="hidden md:flex flex-col items-start gap-2 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: hidden ? 0 : 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: hidden ? 0 : 2.3 }}
        >
          <span className="font-jost text-[11px] tracking-[0.22em] uppercase text-[#9A8F7C]">{t('scrollDown')}</span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4" style={{ color: v3Colors.accent }} />
          </motion.div>
        </motion.div>
      </div>

      {/* Separador */}
      <div
        className="hidden md:block w-px"
        style={{ background: `linear-gradient(#FAF6EF, ${v3Colors.accent}59 20%, ${v3Colors.accent}59 80%, #FAF6EF)` }}
      />

      {/* Panel fotográfico */}
      <div className="order-1 md:order-2 relative w-full h-[360px] md:h-auto md:flex-1 px-8 pt-10 md:p-10">
        <V3PhotoArch
          label="Fotografía de los novios"
          imageUrl={heroImage}
          imageAlt={weddingData?.heroImage?.alt || `${brideName} y ${groomName}`}
          className="h-full w-full max-w-md mx-auto md:max-w-none"
        />

        <V3Branch
          mirrored
          width={180}
          height={120}
          className="hidden md:block absolute -right-4 -bottom-2"
        />

        <motion.div
          className="absolute left-1/2 -translate-x-1/2 -bottom-11 md:left-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-10"
          initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
          animate={{
            opacity: hidden ? 0 : 1,
            scale: hidden ? 0.7 : 1,
            rotate: hidden ? -10 : 0,
          }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: hidden ? 0 : 0.35 }}
        >
          <V3Monogram initials={<>{brideName.charAt(0)}<span style={{ color: v3Colors.accent }}>&amp;</span>{groomName.charAt(0)}</>} size={116} />
        </motion.div>
      </div>
    </section>
  );
}
