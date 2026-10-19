'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { V2_COLORS, V2Container, V2CopyButton, V2Reveal, V2Section, V2SectionHeading, v2DisplayStyle } from './ui';
import { useV2SectionNumber, v2Fill } from './sections';

const pad = (n: number) => String(n).padStart(2, '0');

export default function GalleryV2() {
  const { t } = useTranslations('template02');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { galleryImages } = useWeddingImages(weddingData?.id);
  const number = useV2SectionNumber('gallery');
  const stripRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const photos = galleryImages.filter(Boolean);
  const total = photos.length;
  const hashtag = weddingData?.couple.hashtag;

  // Paso entre tarjetas = ancho de la primera tarjeta + gap del contenedor.
  const getStep = useCallback(() => {
    const strip = stripRef.current;
    const first = strip?.firstElementChild as HTMLElement | null;
    if (!strip || !first) return 0;
    const gap = parseFloat(getComputedStyle(strip).columnGap || '0') || 0;
    return first.getBoundingClientRect().width + gap;
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const onScroll = () => {
      const step = getStep();
      if (!step) return;
      const atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4;
      setCurrent(atEnd ? total - 1 : Math.min(total - 1, Math.max(0, Math.round(strip.scrollLeft / step))));
    };
    strip.addEventListener('scroll', onScroll, { passive: true });
    return () => strip.removeEventListener('scroll', onScroll);
  }, [getStep, total]);

  const goTo = (index: number) => {
    const strip = stripRef.current;
    const step = getStep();
    if (!strip || !step) return;
    const target = Math.min(total - 1, Math.max(0, index));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    strip.scrollTo({ left: target * step, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (total === 0) {
    return null;
  }

  const navButton = (enabled: boolean, filled: boolean): React.CSSProperties =>
    filled && enabled
      ? { backgroundColor: V2_COLORS.ink, border: `1px solid ${V2_COLORS.ink}`, color: V2_COLORS.stone }
      : { backgroundColor: 'transparent', border: `1px solid ${V2_COLORS.rule}`, color: V2_COLORS.graphite, opacity: enabled ? 1 : 0.5 };

  return (
    <V2Section id="gallery">
      <div className="flex flex-col gap-7 py-[72px] lg:gap-10 lg:py-24">
        <V2Container>
          <V2Reveal>
            <V2SectionHeading number={number} overline={t('gallery.overline')} title={t('gallery.title')} />
          </V2Reveal>
        </V2Container>

        <div
          ref={stripRef}
          className="flex snap-x snap-mandatory scroll-pl-6 gap-3 overflow-x-auto pl-6 pr-6 [scrollbar-width:none] md:scroll-pl-12 md:pl-12 md:pr-12 lg:gap-4 xl:scroll-pl-[calc((100vw-1200px)/2+48px)] xl:pl-[calc((100vw-1200px)/2+48px)] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carousel"
          aria-label={t('gallery.title')}
          tabIndex={0}
        >
          {photos.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative h-[400px] w-[286px] shrink-0 snap-start overflow-hidden rounded-[4px] lg:h-[500px] lg:w-[360px]"
              aria-roledescription="slide"
              aria-label={v2Fill(t('gallery.counterLabel'), { current: index + 1, total })}
            >
              <V2Reveal className="absolute inset-0" delay={Math.min(index, 3) * 0.1}>
                <Image
                  src={src}
                  alt={v2Fill(t('gallery.photoAlt'), { n: index + 1 })}
                  fill
                  sizes="(min-width: 1024px) 360px, 286px"
                  className="select-none object-cover"
                  draggable={false}
                  priority={index === 0}
                />
              </V2Reveal>
            </div>
          ))}
        </div>

        <V2Container>
          <V2Reveal className="flex flex-col gap-7" delay={0.2}>
          <div className="flex items-center gap-4">
            <span
              className="min-w-[58px] text-[15px]"
              style={{ fontFamily: v2DisplayStyle(15).fontFamily, letterSpacing: '0.02em' }}
              aria-live="polite"
            >
              {pad(current + 1)} / {pad(total)}
            </span>
            <div className="relative h-0.5 flex-grow" style={{ backgroundColor: V2_COLORS.rule }} aria-hidden="true">
              <span
                className="absolute left-0 top-0 h-0.5 transition-[width] duration-300"
                style={{ width: `${((current + 1) / total) * 100}%`, backgroundColor: V2_COLORS.ink }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goTo(current - 1)}
                disabled={current === 0}
                aria-label={t('gallery.previous')}
                className="flex h-11 w-11 items-center justify-center rounded-full disabled:cursor-not-allowed"
                style={navButton(current > 0, false)}
              >
                <ChevronLeft className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.7} />
              </button>
              <button
                type="button"
                onClick={() => goTo(current + 1)}
                disabled={current >= total - 1}
                aria-label={t('gallery.next')}
                className="flex h-11 w-11 items-center justify-center rounded-full disabled:cursor-not-allowed"
                style={navButton(current < total - 1, true)}
              >
                <ChevronRight className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.7} />
              </button>
            </div>
          </div>

          {hashtag && (
            <div
              className="flex items-center justify-between gap-3 rounded-md px-5 py-[18px] lg:max-w-[560px]"
              style={{ border: `1px solid ${V2_COLORS.rule}` }}
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[13px]" style={{ color: V2_COLORS.graphite }}>
                  {t('gallery.sharePrompt')}
                </span>
                <span className="break-all" style={v2DisplayStyle(20, 400, -0.02)}>
                  {hashtag}
                </span>
              </div>
              <V2CopyButton
                value={hashtag}
                label={t('gallery.copyHashtag')}
                copiedLabel={t('gallery.copied')}
                ariaLabel={t('gallery.copyHashtag')}
                iconOnly
              />
            </div>
          )}
          </V2Reveal>
        </V2Container>
      </div>
    </V2Section>
  );
}
