'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V2_COLORS, V2_FONTS, V2Rings, v2ButtonProps, v2DisplayStyle } from './ui';
import type { V2VisibleSection } from './sections';

// Barra superior de escritorio (≥1024 px, no fija) con anclas a las secciones visibles (spec 25).
export default function DesktopNavV2({ sections }: { sections: V2VisibleSection[] }) {
  const { t } = useTranslations('template02');
  const weddingData = useAppSelector(selectCurrentWedding);
  const reduceMotion = useReducedMotion();
  const showConfirm = weddingData?.showConfirmCta !== false;

  const links = sections.filter((s) => !(showConfirm && s.key === 'rsvp'));

  const scrollTo = (anchorId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(anchorId);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <nav
      aria-label={t('nav.label')}
      className="hidden min-h-20 flex-wrap items-center justify-between gap-x-6 gap-y-3 px-12 py-4 lg:flex"
      style={{ backgroundColor: V2_COLORS.stone, color: V2_COLORS.ink, borderBottom: `1px solid ${V2_COLORS.rule}`, fontFamily: V2_FONTS.body }}
    >
      <div className="flex items-center gap-3">
        <V2Rings width={42} strokeWidth={1.6} color={V2_COLORS.bronze} />
        <span style={v2DisplayStyle(20, 400, -0.02)}>
          {weddingData?.couple.bride.name} &amp; {weddingData?.couple.groom.name}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium">
        {links.map((section) => (
          <a
            key={section.key}
            href={`#${section.anchorId}`}
            onClick={scrollTo(section.anchorId)}
            className="flex min-h-11 items-center gap-1 no-underline hover:opacity-70"
            style={{ color: V2_COLORS.ink }}
          >
            <span style={{ color: V2_COLORS.bronze }}>{section.number}</span> {t(`nav.${section.key}`)}
          </a>
        ))}
        {showConfirm && (
          <a href="#rsvp" onClick={scrollTo('rsvp')} {...v2ButtonProps('primary', 'sm', 'px-[22px] text-[13px]')}>
            {t('hero.confirm')}
          </a>
        )}
      </div>
    </nav>
  );
}
