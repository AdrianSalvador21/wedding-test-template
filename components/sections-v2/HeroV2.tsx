'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { V2_COLORS, V2_FONTS, V2Rings, v2ButtonProps, v2DisplayStyle } from './ui';
import { v2DateLocale, v2FormatLongDate, v2FormatTime, v2Initials, v2Venues, v2WeddingDate } from './sections';
import MusicToggleV2 from './MusicToggleV2';
import AddToCalendarButtonV2 from './AddToCalendarButtonV2';

interface HeroV2Props {
  overlayVisible: boolean;
}

function DateSeal({ date, locale, size }: { date: Date; locale: string; size: 'sm' | 'lg' }) {
  const month = date.toLocaleDateString(v2DateLocale(locale), { month: 'short' }).replace('.', '').toUpperCase();
  const year = size === 'lg' ? String(date.getFullYear()) : String(date.getFullYear()).slice(-2);
  const day = String(date.getDate()).padStart(2, '0');
  const inner = size === 'lg' ? 148 : 104;
  return (
    <div
      className="flex flex-col items-center justify-center gap-0.5 rounded-full"
      style={{ width: inner, height: inner, border: `1px solid ${V2_COLORS.bronze}` }}
    >
      <span style={v2DisplayStyle(size === 'lg' ? 56 : 40, 300, -0.05)} className="leading-none">
        {day}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] lg:text-[11px] lg:tracking-[0.24em]" style={{ color: V2_COLORS.bronze }}>
        {month} · {year}
      </span>
    </div>
  );
}

export default function HeroV2({ overlayVisible }: HeroV2Props) {
  const { t, currentLanguage } = useTranslations('template02');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { heroImage } = useWeddingImages(weddingData?.id);
  const reduceMotion = useReducedMotion();
  const [monogramExists, setMonogramExists] = useState(false);
  const { ref: heroRef, inView: heroInView } = useInView({ initialInView: true });

  useEffect(() => {
    const checkMonogram = async () => {
      if (!weddingData?.id) return;
      try {
        const response = await fetch(`/assets/wedding-images/${weddingData.id}/monogram.svg`, { method: 'HEAD' });
        setMonogramExists(response.ok);
      } catch {
        setMonogramExists(false);
      }
    };
    checkMonogram();
  }, [weddingData?.id]);

  const brideName = weddingData?.couple.bride.name || 'María';
  const groomName = weddingData?.couple.groom.name || 'Carlos';
  const initials = v2Initials(weddingData);
  const weddingDate = v2WeddingDate(weddingData);
  const time = v2FormatTime(weddingData?.event.time);
  const { ceremony, reception } = v2Venues(weddingData, currentLanguage);
  const placeName = ceremony?.name || reception?.name || '';
  const showConfirm = weddingData?.showConfirmCta !== false;
  const heroImageAlt = weddingData?.heroImage?.alt || `${brideName} & ${groomName}`;

  const show = !overlayVisible;
  const reveal = (delay: number, y = 16): MotionProps =>
    reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: show ? 1 : 0 }, transition: { duration: 0.3, delay: show ? delay / 2 : 0 } }
      : {
          initial: { opacity: 0, y },
          animate: { opacity: show ? 1 : 0, y: show ? 0 : y },
          transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: show ? delay : 0 },
        };

  const scrollToRsvp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('rsvp');
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const facts: { label: string; value: string; wide?: boolean }[] = [
    { label: t('hero.date'), value: v2FormatLongDate(weddingDate, currentLanguage) },
    ...(time ? [{ label: t('hero.time'), value: time }] : []),
    ...(placeName ? [{ label: t('hero.place'), value: placeName, wide: true }] : []),
  ];

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative lg:grid lg:min-h-[max(720px,calc(100vh-80px))] lg:grid-cols-2"
      style={{ backgroundColor: V2_COLORS.stone, color: V2_COLORS.ink, fontFamily: V2_FONTS.body }}
    >
      {/* Foto */}
      <div className="relative h-[560px] overflow-hidden lg:h-auto">
        {heroImage && (
          <motion.img
            src={heroImage}
            alt={heroImageAlt}
            className="absolute inset-0 block h-full w-full object-cover"
            style={{ objectPosition: 'center 28%' }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
            animate={reduceMotion ? { opacity: show ? 1 : 0 } : { opacity: show ? 1 : 0, scale: show ? 1 : 1.04 }}
            transition={{ duration: reduceMotion ? 0.3 : 1.2, ease: [0.19, 1, 0.22, 1] }}
          />
        )}
        <div className="absolute left-4 top-4">
          {monogramExists && weddingData?.id ? (
            <div
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full"
              style={{ border: '1px solid rgba(255,255,255,0.7)', backgroundColor: 'rgba(30,28,25,0.25)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/wedding-images/${weddingData.id}/monogram.svg`}
                alt={t('hero.monogramAlt')}
                className="h-8 w-8 object-contain"
              />
            </div>
          ) : (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm"
              style={{
                border: '1px solid rgba(255,255,255,0.7)',
                backgroundColor: 'rgba(30,28,25,0.25)',
                color: V2_COLORS.white,
                fontFamily: V2_FONTS.display,
                letterSpacing: '0.02em',
              }}
              aria-hidden="true"
            >
              {initials.bride}·{initials.groom}
            </div>
          )}
        </div>
      </div>

      {/* Botón de música: sobre la foto mientras se ve el hero, fijo arriba a la derecha después */}
      <MusicToggleV2 pinned={!heroInView} />

      {/* Sello de fecha (móvil): montado sobre el borde inferior de la foto */}
      <motion.div
        className="absolute right-6 top-[500px] flex h-[120px] w-[120px] items-center justify-center rounded-full lg:hidden"
        style={{ backgroundColor: V2_COLORS.stone }}
        {...reveal(0.55)}
      >
        <DateSeal date={weddingDate} locale={currentLanguage} size="sm" />
      </motion.div>

      {/* Panel de texto */}
      <div className="relative flex flex-col gap-7 px-6 pt-9 lg:justify-between lg:gap-12 lg:px-[72px] lg:pb-16 lg:pt-[72px]">
        <motion.div className="absolute right-16 top-16 hidden lg:block" {...reveal(0.55)}>
          <DateSeal date={weddingDate} locale={currentLanguage} size="lg" />
        </motion.div>

        <motion.p
          className="m-0 flex items-center gap-[10px] text-[11px] font-semibold uppercase tracking-[0.24em] lg:text-xs lg:tracking-[0.26em]"
          style={{ color: V2_COLORS.bronze }}
          {...reveal(0.1)}
        >
          <V2Rings width={34} strokeWidth={1.6} />
          <span>{t('hero.weWed')}</span>
        </motion.p>

        <motion.h1
          className="m-0 break-words text-[clamp(52px,18vw,72px)] lg:text-[clamp(88px,8.9vw,128px)]"
          style={{ ...v2DisplayStyle(72, 400, -0.045), fontSize: undefined, lineHeight: 0.9 }}
          {...reveal(0.25, 24)}
        >
          {brideName}
          <br />
          <span style={{ color: V2_COLORS.bronze }}>&amp;</span> {groomName}
        </motion.h1>

        <motion.div className="flex flex-col gap-7 lg:gap-8" {...reveal(0.45)}>
          <dl
            className="m-0 grid grid-cols-2 border-t border-[#D9D3C9] lg:flex"
          >
            {facts.map((fact, index) => {
              // Móvil: fecha | hora en una fila y el lugar a todo el ancho debajo.
              // Escritorio: las tres en una fila separadas por filetes verticales.
              const pairedWithTime = !fact.wide && !!time;
              const mobileSpan = pairedWithTime ? '' : 'col-span-2';
              const mobileDivider = pairedWithTime && index === 0 ? 'border-r border-[#D9D3C9] pr-4' : pairedWithTime ? 'pl-4' : '';
              const desktop = `lg:flex-1 ${index > 0 ? 'lg:border-l lg:border-[#D9D3C9] lg:pl-5' : 'lg:pl-0'} ${
                index < facts.length - 1 ? 'lg:pr-5' : 'lg:pr-0'
              } ${index === 0 ? 'lg:border-r-0' : ''}`;
              return (
                <div key={fact.label} className={`border-b border-[#D9D3C9] py-4 lg:py-5 ${mobileSpan} ${mobileDivider} ${desktop}`}>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: V2_COLORS.graphite }}>
                    {fact.label}
                  </dt>
                  <dd className="m-0 mt-1.5 text-[15px] font-medium leading-snug lg:mt-2 lg:text-base">{fact.value}</dd>
                </div>
              );
            })}
          </dl>

          <div className="flex flex-col gap-[10px] lg:flex-row lg:flex-wrap lg:gap-3">
            {showConfirm && (
              <a href="#rsvp" onClick={scrollToRsvp} {...v2ButtonProps('primary', 'lg', 'w-full lg:w-auto lg:px-8')}>
                {t('hero.confirm')}
                <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.8} />
              </a>
            )}
            <AddToCalendarButtonV2 size="md" className="w-full lg:h-14 lg:w-auto lg:px-7" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
