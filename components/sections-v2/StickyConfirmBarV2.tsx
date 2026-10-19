'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V2_COLORS, V2_FONTS, v2ButtonProps } from './ui';
import { v2DateLocale, v2Fill, v2WeddingDate } from './sections';

const DAY_MS = 24 * 60 * 60 * 1000;

// Píldora fija "Confirmar" (spec 25): aparece al salir del hero y desaparece al llegar al RSVP.
// Lee la posición de #hero y #rsvp en cada scroll porque RSVPV2 cambia de marcado según su estado.
export default function StickyConfirmBarV2() {
  const { t, currentLanguage } = useTranslations('template02');
  const weddingData = useAppSelector(selectCurrentWedding);
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const showConfirm = weddingData?.showConfirmCta !== false;

  useEffect(() => {
    if (!showConfirm) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = document.getElementById('hero');
      const rsvp = document.getElementById('rsvp');
      const heroGone = hero ? hero.getBoundingClientRect().bottom <= 0 : false;
      const rsvpAhead = rsvp ? rsvp.getBoundingClientRect().top > window.innerHeight : true;
      setVisible(heroGone && rsvpAhead);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [showConfirm]);

  if (!showConfirm || !weddingData) return null;

  const date = v2WeddingDate(weddingData);
  const shortDate = date.toLocaleDateString(v2DateLocale(currentLanguage), { day: 'numeric', month: 'short' }).replace('.', '');
  const daysLeft = Math.ceil((date.getTime() - Date.now()) / DAY_MS);
  const countdown =
    daysLeft > 1 ? v2Fill(t('sticky.daysLeft'), { count: daysLeft }) : daysLeft === 1 ? t('sticky.dayLeft') : daysLeft === 0 ? t('sticky.today') : '';

  const goToRsvp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('rsvp');
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-[520px]"
          style={{ fontFamily: V2_FONTS.body }}
        >
          <div
            className="flex h-16 items-center justify-between gap-3 rounded-full pl-[22px] pr-2 shadow-[0_12px_30px_-14px_rgba(30,28,25,0.35)]"
            style={{ backgroundColor: V2_COLORS.paper, border: `1px solid ${V2_COLORS.rule}`, color: V2_COLORS.ink }}
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[13px] font-semibold">
                {weddingData.couple.bride.name} &amp; {weddingData.couple.groom.name}
              </span>
              <span className="truncate text-xs" style={{ color: V2_COLORS.graphite }}>
                {countdown ? `${shortDate} · ${countdown}` : shortDate}
              </span>
            </div>
            <a href="#rsvp" onClick={goToRsvp} {...v2ButtonProps('primary', 'sm', 'h-12 shrink-0 px-5 text-sm')}>
              {t('sticky.confirm')}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
