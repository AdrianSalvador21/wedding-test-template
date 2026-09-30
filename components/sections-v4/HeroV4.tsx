'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { v4Colors } from './ui';

interface HeroV4Props {
  overlayVisible: boolean;
}

export default function HeroV4({ overlayVisible }: HeroV4Props) {
  const { t } = useTranslations('hero');
  const params = useParams();
  const currentLocale = (params.locale as string) || 'es';
  const weddingData = useAppSelector(selectCurrentWedding);
  const { heroImage } = useWeddingImages(weddingData?.id);

  const brideName = weddingData?.couple.bride.name || 'María';
  const groomName = weddingData?.couple.groom.name || 'Carlos';
  const weddingDate = weddingData?.event.date ? new Date(weddingData.event.date) : new Date('2025-11-21T16:00:00');

  const receptionVenue = weddingData?.event.receptionVenue;
  const venueLocation = typeof receptionVenue?.name === 'object' && receptionVenue.name
    ? (receptionVenue.name[currentLocale as 'es' | 'en'] || receptionVenue.name.es || '')
    : ((receptionVenue?.name as unknown as string) || t('location'));

  const formattedDate = weddingDate
    .toLocaleDateString(currentLocale === 'en' ? 'en-US' : 'es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();

  const hidden = overlayVisible;

  return (
    <section id="top" className="relative overflow-hidden min-h-screen font-georgia" aria-hidden={hidden}>
      {heroImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImage}
          alt={`${brideName} y ${groomName}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '50% 22%' }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(20,22,14,.12) 0%, rgba(20,22,14,.06) 35%, rgba(20,22,14,.62) 100%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: 36,
          left: 28,
          right: 28,
          bottom: 36,
          border: '1px solid rgba(244,239,227,.55)',
          borderRadius: '9999px 9999px 4px 4px',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-end px-6 pb-16 text-center" style={{ color: v4Colors.paper }}>
        <motion.p
          className="text-[11px] font-sans tracking-[0.24em] uppercase mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: hidden ? 0 : 1, y: hidden ? 16 : 0 }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: hidden ? 0 : 0.2 }}
        >
          {t('subtitle')}
        </motion.p>

        <motion.h1
          className="text-4xl md:text-6xl leading-[1.15] uppercase tracking-wide"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: hidden ? 0 : 1, y: hidden ? 16 : 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: hidden ? 0 : 0.5 }}
        >
          {brideName}
        </motion.h1>
        <motion.div
          className="italic text-lg md:text-xl my-1"
          style={{ color: v4Colors.gold }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: hidden ? 0 : 1, y: hidden ? 16 : 0 }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: hidden ? 0 : 0.75 }}
        >
          y
        </motion.div>
        <motion.h1
          className="text-4xl md:text-6xl leading-[1.15] uppercase tracking-wide mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: hidden ? 0 : 1, y: hidden ? 16 : 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: hidden ? 0 : 1 }}
        >
          {groomName}
        </motion.h1>

        <motion.p
          className="italic text-base md:text-lg mb-3"
          style={{ color: v4Colors.gold }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: hidden ? 0 : 1, y: hidden ? 16 : 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: hidden ? 0 : 1.3 }}
        >
          {venueLocation}
        </motion.p>

        <motion.p
          className="text-[11px] font-sans tracking-[0.22em] uppercase"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: hidden ? 0 : 1, y: hidden ? 16 : 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: hidden ? 0 : 1.5 }}
        >
          {formattedDate}
        </motion.p>

        <motion.div
          className="flex flex-col items-center gap-2 mt-9"
          initial={{ opacity: 0 }}
          animate={{ opacity: hidden ? 0 : 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: hidden ? 0 : 1.9 }}
        >
          <span className="text-[10px] font-sans tracking-[0.24em] uppercase" style={{ color: v4Colors.gold }}>
            {t('scrollDown')}
          </span>
          <motion.div
            className="w-px h-4"
            style={{ background: 'rgba(244,239,227,.6)' }}
            animate={{ scaleY: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </section>
  );
}
