'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useMusicControl } from '../MusicControlContext';
import { V2_COLORS, V2_FONTS, V2Overline, V2Rings, v2ButtonProps, v2DisplayStyle } from './ui';
import { v2Fill } from './sections';

// Bienvenida al invitado de template-02 (spec 25). Solo vista: InvitationOverlay sigue resolviendo
// el invitado (Firebase o demo) y le pasa los valores ya calculados.
export interface InvitationOverlayV2Props {
  isVisible: boolean;
  guestName: string;
  allowedGuests: number;
  showGuestCount: boolean;
  specialMessage: string | null;
  brideName: string;
  groomName: string;
  date: Date;
  onOpen: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function InvitationOverlayV2({
  isVisible,
  guestName,
  allowedGuests,
  showGuestCount,
  specialMessage,
  brideName,
  groomName,
  date,
  onOpen,
}: InvitationOverlayV2Props) {
  const { t } = useTranslations('template02');
  const reduceMotion = useReducedMotion();
  const music = useMusicControl();
  const openButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible) openButtonRef.current?.focus({ preventScroll: true });
  }, [isVisible]);

  const dateLabel = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  const reserved =
    allowedGuests === 1 ? t('overlay.reservedOne') : v2Fill(t('overlay.reservedMany'), { count: allowedGuests });

  const fadeUp = (delay: number): MotionProps =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: 'easeOut', delay },
        };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invitation-overlay-v2-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5 }}
          className="fixed inset-0 z-[60] overflow-hidden"
          style={{ backgroundColor: V2_COLORS.ink, color: V2_COLORS.stone, fontFamily: V2_FONTS.body }}
        >
          <V2Rings
            width={620}
            strokeWidth={0.18}
            double
            color={V2_COLORS.bronzeOnInk}
            className="pointer-events-none absolute left-1/2 top-[13%] -translate-x-[58%] opacity-50"
          />

          <div className="relative mx-auto flex h-full w-full max-w-[440px] flex-col px-7 pb-8 pt-7">
            <div
              className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: V2_COLORS.mutedOnInk }}
            >
              <span>
                {brideName} &amp; {groomName}
              </span>
              <span>{dateLabel}</span>
            </div>

            <div className="flex flex-grow flex-col justify-center gap-[22px]">
              <motion.div {...fadeUp(0.15)}>
                <V2Overline label={t('overlay.invitationFor')} onInk />
              </motion.div>
              <motion.h1
                id="invitation-overlay-v2-title"
                className="m-0 break-words"
                style={v2DisplayStyle(52, 300, -0.04)}
                {...fadeUp(0.3)}
              >
                {guestName}
              </motion.h1>
              {showGuestCount && (
                <motion.p
                  className="m-0 inline-flex h-9 items-center gap-[10px] self-start rounded-full px-4 text-[13px] font-medium"
                  style={{ border: `1px solid ${V2_COLORS.ruleOnInk}` }}
                  {...fadeUp(0.45)}
                >
                  <Users className="h-4 w-4" aria-hidden="true" style={{ color: V2_COLORS.bronzeOnInk }} strokeWidth={1.6} />
                  {reserved}
                </motion.p>
              )}
              {specialMessage && (
                <motion.blockquote
                  className="m-0 mt-2 pt-5 text-[17px] leading-relaxed"
                  style={{ borderTop: `1px solid ${V2_COLORS.ruleOnInk}`, color: V2_COLORS.lightOnInk }}
                  {...fadeUp(0.6)}
                >
                  &ldquo;{specialMessage}&rdquo;
                </motion.blockquote>
              )}
            </div>

            <motion.div className="flex flex-col gap-[14px]" {...fadeUp(0.75)}>
              <button ref={openButtonRef} type="button" onClick={onOpen} {...v2ButtonProps('inverse', 'lg', 'w-full')}>
                {t('overlay.open')}
                <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.8} />
              </button>
              {music.available && (
                <p className="m-0 text-center text-xs" style={{ color: V2_COLORS.mutedOnInk }}>
                  {t('overlay.musicHint')}
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
