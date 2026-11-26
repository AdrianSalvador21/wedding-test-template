'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V2_COLORS, V2_FONTS, v2ButtonProps } from './ui';
import { v2DateLocale, v2Fill, v2WeddingDate } from './sections';
import { albumPhase, type AlbumPhase } from '../../lib/album';
import { albumHref } from '../album/AlbumFab';
import { useEventDayReopen } from '../eventDay/EventDayContext';
import { QrIcon, TableIcon } from '../eventDay/EventDayReopenButton';

const DAY_MS = 24 * 60 * 60 * 1000;

// Píldora fija "Confirmar" (spec 25): aparece al salir del hero y desaparece al llegar al RSVP.
// Lee la posición de #hero y #rsvp en cada scroll porque RSVPV2 cambia de marcado según su estado.
// Spec 29 — con el álbum de fotos activado, desde el día de la boda el botón "Confirmar" se cambia
// por "Comparte tus fotos" (o "Ver álbum" cuando cierra la subida), con las mismas reglas de aparición.
export default function StickyConfirmBarV2() {
  const { t, currentLanguage } = useTranslations('template02');
  const { t: tAlbum } = useTranslations('album');
  const { t: tEventDay } = useTranslations('eventDay');
  // Spec 32 — con el pase del día del evento cerrado, el lado izquierdo de la barra lo vuelve a abrir.
  const eventDay = useEventDayReopen();
  const weddingData = useAppSelector(selectCurrentWedding);
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [album, setAlbum] = useState<{ phase: AlbumPhase; guestId: string | null } | null>(null);
  useEffect(() => {
    if (!weddingData) return;
    // La fase depende de la hora y el invitado viene de la URL: se leen en el cliente.
    setAlbum({ phase: albumPhase(weddingData), guestId: new URLSearchParams(window.location.search).get('guest') });
  }, [weddingData]);
  const albumActive = album?.phase === 'open' || album?.phase === 'closed';
  const showConfirm = weddingData?.showConfirmCta !== false || albumActive || !!eventDay;

  useEffect(() => {
    if (!showConfirm) return;
    // Spec 29 — con el álbum activo la barra es el acceso a las fotos: se ve desde que se abre
    // la invitación y no se oculta al llegar al RSVP.
    if (albumActive || eventDay) {
      setVisible(true);
      return;
    }
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
  }, [showConfirm, albumActive, eventDay]);

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
            {eventDay ? (
              <button
                type="button"
                data-track-action="event_day_reopen"
                onClick={eventDay.reopen}
                className="-ml-3.5 flex h-12 min-w-0 cursor-pointer items-center gap-2.5 rounded-full border-0 px-3.5 text-left"
                style={{ backgroundColor: V2_COLORS.stone, color: V2_COLORS.ink, fontFamily: V2_FONTS.body }}
              >
                {eventDay.kind === 'mesa' ? <TableIcon color={V2_COLORS.bronze} /> : <span style={{ color: V2_COLORS.bronze, display: 'flex' }}><QrIcon /></span>}
                <span className="flex min-w-0 flex-col gap-px">
                  <span className="truncate text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: V2_COLORS.graphite }}>
                    {eventDay.kind === 'mesa' ? tEventDay('reopen') : eventDay.kind === 'pase' ? tEventDay('myPass') : tEventDay('myQr')}
                  </span>
                  {eventDay.kind === 'qr' ? (
                    <span className="truncate text-sm font-semibold">{tEventDay('forReception')}</span>
                  ) : (
                    eventDay.tableName && <span className="truncate text-sm font-semibold">{eventDay.tableName}</span>
                  )}
                </span>
              </button>
            ) : (
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-[13px] font-semibold">
                  {weddingData.couple.bride.name} &amp; {weddingData.couple.groom.name}
                </span>
                <span className="truncate text-xs" style={{ color: V2_COLORS.graphite }}>
                  {album?.phase === 'open' ? tAlbum('todayIsTheDay') : countdown ? `${shortDate} · ${countdown}` : shortDate}
                </span>
              </div>
            )}
            {albumActive && album ? (
              <a data-track-action="album_open" href={albumHref(weddingData.id, currentLanguage, album.guestId)} {...v2ButtonProps('primary', 'sm', 'h-12 shrink-0 gap-2 px-5 text-sm')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14.5 4h-5L7.5 6.5H4a1 1 0 0 0-1 1V19a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7.5a1 1 0 0 0-1-1h-3.5z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
                {album.phase === 'open' ? tAlbum('shareCta') : tAlbum('viewAlbumCta')}
              </a>
            ) : (
              <a href="#rsvp" onClick={goToRsvp} {...v2ButtonProps('primary', 'sm', 'h-12 shrink-0 px-5 text-sm')}>
                {t('sticky.confirm')}
              </a>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
