'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition } from 'framer-motion';
import type { WeddingData } from '../src/types/wedding';
import { useTranslations, type Language } from '../lib/translations';
import { useWeddingImages } from '../hooks/useWeddingImages';
import { buildGoogleCalendarUrl, buildWeddingIcs, downloadIcs, getWeddingIcsFilename } from '../lib/calendar';
import { v2FormatLongDate, v2Localized } from './sections-v2/sections';
import { SITE } from '../lib/site';
import { isDemoId } from '../lib/analytics/demos';
import { imageSourceId } from '../lib/save-the-date-demos';
import InvitationLoading from './InvitationLoading';

// Spec 27 — pantalla "Aparta la fecha". Un solo componente con 4 estilos (uno por template); el
// diseño de referencia es el canvas https://claude.ai/artifact/LiEhf11s8WD9GUVYbMsM2M. Solo muestra
// foto, nombres, fecha, lugar, cuenta regresiva, mensaje, calendario y "Invitación formal
// próximamente": nunca RSVP, navegación ni música.

type TemplateKey = 'template-01' | 'template-02' | 'template-03' | 'template-04';

interface SaveTheDateProps {
  wedding: WeddingData;
  guestName?: string | null;
}

type Bezier = [number, number, number, number];
const EASE_OUT: Bezier = [0.2, 0.7, 0.2, 1];
const EASE_IN_OUT: Bezier = [0.65, 0, 0.35, 1];

const CalendarIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="1" />
    <path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <path d="M11 18h2" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
  </svg>
);
const Chevron = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

// ---------- Datos ----------

function useCountdown(date: Date | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!date) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [date]);
  if (!date) return null;
  const diff = date.getTime() - now;
  if (diff <= 0) return null;
  const minutes = Math.floor(diff / 60_000);
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor((minutes % 1440) / 60),
    minutes: minutes % 60,
  };
}

const pad2 = (n: number) => String(n).padStart(2, '0');

// La foto llega en dos pasos (/api/wedding-images y luego el JPG), así que puede aparecer antes,
// durante o después de la animación de apertura. Se precarga y decodifica antes de pintar la
// pantalla para que la apertura siempre arranque con la foto. Si tarda más de `timeoutMs` o falla,
// se muestra la pantalla de todos modos: nadie debe quedarse atorado en la carga.
function useImageReady(src: string, timeoutMs: number): boolean {
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), timeoutMs);
    return () => clearTimeout(id);
  }, [timeoutMs]);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const done = () => {
      if (!cancelled) setReadySrc(src);
    };
    const img = new Image();
    img.onload = () => {
      img.decode().catch(() => undefined).then(done);
    };
    img.onerror = done;
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return timedOut || (!!src && readySrc === src);
}

// ---------- Animación ----------

// Con "reducir movimiento" se pasa `initial={false}`: framer pinta directo el estado final.
function useMotionHelpers() {
  const reduce = !!useReducedMotion();
  const up = (delay: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1, delay, ease: EASE_OUT },
        };
  const custom = (from: TargetAndTransition, to: TargetAndTransition, delay: number, duration: number, ease: Bezier = EASE_OUT) =>
    reduce
      ? { initial: false as const, animate: to }
      : { initial: from, animate: to, transition: { duration, delay, ease } };
  return { reduce, up, custom };
}

// Foto: entra acercándose y luego queda con un acercamiento muy lento (CSS, en un contenedor aparte
// para no pelear con el transform de framer).
function Photo({ src, alt, delay = 0, style, className = '', objectPosition = '50% 30%' }: { src: string; alt: string; delay?: number; style?: CSSProperties; className?: string; objectPosition?: string }) {
  const { custom } = useMotionHelpers();
  if (!src) return null;
  return (
    <div className={`std-drift absolute inset-0 overflow-hidden ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        style={{ objectPosition }}
        {...custom({ scale: 1.14 }, { scale: 1 }, delay, 2.8)}
      />
    </div>
  );
}

// ---------- Selector de calendario ----------

interface SheetTheme {
  bg: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  scrim: string;
  radius: string; // radio superior de la hoja en móvil
  optionRadius: string;
  titleStyle: CSSProperties;
  bodyFont: string;
  numbered?: boolean; // Moderno: filas numeradas con filetes
  archIcon?: boolean; // Jardín: ícono en arco
  cancelStyle: CSSProperties;
}

function CalendarPicker({
  wedding,
  locale,
  theme,
  dateLabel,
  buttonClassName,
  buttonStyle,
  iconSize,
}: {
  wedding: WeddingData;
  locale: Language;
  theme: SheetTheme;
  dateLabel: string;
  buttonClassName: string;
  buttonStyle: CSSProperties;
  iconSize?: number;
}) {
  const { t } = useTranslations('saveTheDate');
  const [open, setOpen] = useState(false);
  const reduceMotion = !!useReducedMotion();
  // En móvil es una hoja que sube desde abajo; en escritorio, un menú bajo el botón (md = 768 px).
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  const sheetMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.15 } }
    : isDesktop
      ? { initial: { opacity: 0, y: 8, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.28, ease: EASE_OUT } }
      : { initial: { opacity: 0, y: 48 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: EASE_OUT } };
  const wrapRef = useRef<HTMLDivElement>(null);
  // En móvil, un toque puede generar un segundo clic que cae sobre el fondo recién abierto y lo
  // cerraría al instante: se ignoran los cierres por fuera durante un momento tras abrir.
  const openedAt = useRef(0);
  const openPicker = () => {
    openedAt.current = Date.now();
    setOpen(true);
  };
  const closeFromOutside = () => {
    if (Date.now() - openedAt.current > 350) setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) closeFromOutside();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  const addToPhone = () => {
    downloadIcs(getWeddingIcsFilename(wedding, locale), buildWeddingIcs(wedding, locale));
    setOpen(false);
  };
  const googleUrl = () => {
    // El evento debe llevar al link de la invitación, no a la vista previa ni a la demo con nombre.
    const url = new URL(window.location.href);
    url.searchParams.delete('preview');
    url.searchParams.delete('vista');
    url.searchParams.delete('invitado');
    url.pathname = url.pathname.replace(/\/aparta-la-fecha\/?$/, '');
    return buildGoogleCalendarUrl(wedding, locale, url.toString());
  };

  const option = (index: number, icon: ReactNode, title: string, hint: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      data-track-action="calendar"
      className="flex w-full items-center gap-3.5 text-left"
      style={
        theme.numbered
          ? { minHeight: 68, padding: '14px 0', background: 'transparent', borderTop: `1px solid ${theme.border}`, borderBottom: index === 2 ? `1px solid ${theme.border}` : undefined, color: theme.text, fontFamily: theme.bodyFont }
          : { minHeight: 66, padding: '12px 16px', background: '#FFFFFF', border: `1px solid ${theme.border}`, borderRadius: theme.optionRadius, color: theme.text, fontFamily: theme.bodyFont }
      }
    >
      {theme.numbered ? (
        <span className="w-[22px] text-[11px] font-semibold" style={{ color: theme.accent }}>{pad2(index)}</span>
      ) : (
        <span
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center"
          style={{ border: `1px solid ${theme.border}`, borderRadius: theme.archIcon ? '999px 999px 0 0' : '50%', color: theme.accent }}
        >
          {icon}
        </span>
      )}
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-medium">{title}</span>
        <span className="text-xs" style={{ color: theme.muted }}>{hint}</span>
      </span>
      <Chevron color={theme.accent} />
    </button>
  );

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => (open ? closeFromOutside() : openPicker())} className={buttonClassName} style={buttonStyle}>
        <CalendarIcon size={iconSize} />
        {t('addToCalendar')}
      </button>
      <AnimatePresence>
      {open && (
        <motion.div
          key="calendar-picker"
          className="fixed inset-0 z-50 flex flex-col md:absolute md:inset-auto md:left-1/2 md:top-full md:mt-3 md:w-[360px] md:-translate-x-1/2"
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: 'easeOut' }}
        >
          <motion.button
            type="button"
            aria-label={t('close')}
            onClick={closeFromOutside}
            className="absolute inset-0 md:hidden"
            style={{ background: theme.scrim }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.35, ease: 'easeOut' }}
          />
          <motion.div
            {...sheetMotion}
            role="dialog"
            aria-label={t('addToCalendar')}
            className="relative mt-auto flex flex-col gap-3 px-5 pb-7 pt-4 md:mt-0 md:rounded-none md:pb-5 md:shadow-xl"
            style={{ background: theme.bg, color: theme.text, borderTopLeftRadius: theme.radius, borderTopRightRadius: theme.radius, textAlign: theme.numbered ? 'left' : 'center' }}
          >
            {!theme.numbered && <div className="mx-auto h-1 w-9 rounded-full md:hidden" style={{ background: theme.border }} />}
            <div className="flex flex-col gap-0.5">
              <p className="m-0" style={theme.titleStyle}>{t('addToCalendar')}</p>
              <p className="m-0 text-[13px]" style={{ color: theme.muted, fontFamily: theme.bodyFont }}>{dateLabel}</p>
            </div>
            <div className={theme.numbered ? 'flex flex-col' : 'flex flex-col gap-3'}>
              {option(1, <PhoneIcon />, t('calendarPhone'), t('calendarPhoneHint'), addToPhone)}
              {option(2, <GlobeIcon />, t('calendarGoogle'), t('calendarGoogleHint'), () => {
                window.open(googleUrl(), '_blank', 'noopener,noreferrer');
                setOpen(false);
              })}
            </div>
            <button type="button" onClick={() => setOpen(false)} className="h-12" style={theme.cancelStyle}>
              {t('cancel')}
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Pantalla ----------

export default function SaveTheDate({ wedding, guestName }: SaveTheDateProps) {
  const { t, currentLanguage } = useTranslations('saveTheDate');
  const locale = currentLanguage;
  const { heroImage } = useWeddingImages(imageSourceId(wedding.id));
  const { up, custom, reduce } = useMotionHelpers();
  const [veilDone, setVeilDone] = useState(false);
  const photoReady = useImageReady(heroImage, 6000);
  const { t: tTemplate } = useTranslations('template');

  const templateId = (['template-01', 'template-02', 'template-03', 'template-04'].includes(wedding.template?.id || '')
    ? wedding.template?.id
    : 'template-01') as TemplateKey;

  const bride = wedding.couple?.bride?.name || '';
  const groom = wedding.couple?.groom?.name || '';
  const rawDate = wedding.event?.date ? new Date(wedding.event.date) : null;
  const date = rawDate && !Number.isNaN(rawDate.getTime()) ? rawDate : null;
  const countdown = useCountdown(date);
  const showCalendar = !!countdown; // sin fecha o con fecha pasada no hay cuenta ni calendario
  const dateLabel = date ? v2FormatLongDate(date, locale) : '';
  const place = (wedding.saveTheDate?.place || '').trim();
  const message = v2Localized(wedding.saveTheDate?.message, locale).trim();
  const title = guestName ? t('titleGuest').split('{name}').join(guestName) : t('title');
  const photoAlt = `${bride} & ${groom}`;
  const initials = `${bride.charAt(0)}&${groom.charAt(0)}`;
  const brandHref = `${SITE.url}/?src=${isDemoId(wedding.id) ? 'demo' : 'invitacion'}`;

  const footer = (bg: string, color: string, font: string, border?: string) => (
    <div className="relative flex h-9 items-center justify-center md:h-11" style={{ background: bg, borderTop: border }}>
      <a href={brandHref} target="_blank" rel="noopener noreferrer" className="text-lg no-underline hover:opacity-80" style={{ color, fontFamily: font }}>
        invyta
      </a>
      {/* Spec 31 — el save the date se mide: el aviso de privacidad queda al alcance del invitado. */}
      <a
        href={`${SITE.url}/aviso-de-privacidad`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-4 text-[11px] no-underline opacity-70 hover:opacity-100"
        style={{ color, fontFamily: font }}
      >
        {locale === 'en' ? 'Privacy' : 'Privacidad'}
      </a>
    </div>
  );

  const countdownCells = countdown
    ? [
        { value: String(countdown.days), label: t('countdown.days') },
        { value: pad2(countdown.hours), label: t('countdown.hours') },
        { value: pad2(countdown.minutes), label: t('countdown.minutes') },
      ]
    : [];

  const driftCss = (
    <style>{`@keyframes stdDrift{from{transform:scale(1)}to{transform:scale(1.06)}}.std-drift{animation:stdDrift 22s 2.8s ease-in-out infinite alternate}@media (prefers-reduced-motion: reduce){.std-drift{animation:none}}`}</style>
  );

  // Misma pantalla de carga que mientras llegan los datos: la apertura empieza ya con la foto lista.
  if (!photoReady) return <InvitationLoading message={tTemplate('loading')} />;

  // ----- Clásico (template-01) -----
  if (templateId === 'template-01') {
    const gold = '#c9a86a';
    const cormorant = "'Cormorant Garamond', serif";
    const delay = (i: number) => 1.3 + i * 0.15;
    const seal = (size: number, inner: number, font: number) => (
      <div className="flex items-center justify-center rounded-full" style={{ width: size, height: size, border: `1px solid ${gold}` }}>
        <div className="flex items-center justify-center rounded-full" style={{ width: inner, height: inner, border: '1px solid rgba(201,168,106,0.55)', fontFamily: cormorant, fontStyle: 'italic', fontSize: font, color: gold }}>
          {initials}
        </div>
      </div>
    );
    return (
      <div data-template-id="template-01" className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-hidden text-white" style={{ background: '#2a2119', fontFamily: "'Jost', sans-serif" }}>
        {driftCss}
        <Photo src={heroImage} alt={photoAlt} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(24,17,10,0.58) 0%, rgba(24,17,10,0.73) 48%, rgba(24,17,10,0.86) 100%)' }} />
        <main className="relative flex flex-1 flex-col items-center justify-center gap-[18px] px-7 py-12 text-center md:gap-[22px] md:py-16">
          <motion.div {...up(delay(0))}><div className="md:hidden">{seal(70, 60, 22)}</div><div className="hidden md:block">{seal(84, 72, 26)}</div></motion.div>
          <motion.p {...up(delay(1))} className="m-0 text-xs font-light uppercase tracking-[0.4em] text-white/90 md:text-sm">{title}</motion.p>
          <motion.div {...up(delay(2))} className="flex w-[220px] items-center gap-2.5 md:w-[320px]" aria-hidden="true">
            <div className="h-px flex-1 bg-white/40" />
            <div className="h-1.5 w-1.5 rotate-45" style={{ border: `1px solid ${gold}` }} />
            <div className="h-px flex-1 bg-white/40" />
          </motion.div>
          <motion.h1 {...up(delay(3))} className="m-0 flex flex-col items-center font-normal leading-none md:flex-row md:flex-wrap md:items-baseline md:justify-center md:gap-x-7">
            <span className="text-[72px] md:text-[120px]" style={{ fontFamily: "'Allura', cursive", textShadow: '2px 2px 6px rgba(0,0,0,0.6)' }}>{bride}</span>
            <span className="my-0.5 text-[34px] italic md:text-[60px]" style={{ fontFamily: cormorant, color: '#e7e1d8' }}>&amp;</span>
            <span className="text-[72px] md:text-[120px]" style={{ fontFamily: "'Allura', cursive", textShadow: '2px 2px 6px rgba(0,0,0,0.6)' }}>{groom}</span>
          </motion.h1>
          <motion.div {...up(delay(4))} className="flex flex-col items-center gap-1.5 md:gap-2">
            {dateLabel && <p className="m-0 text-[23px] font-medium md:text-[30px]" style={{ fontFamily: cormorant }}>{dateLabel}</p>}
            {place && <p className="m-0 text-[11px] uppercase tracking-[0.22em] md:text-[13px]" style={{ color: gold }}>{place}</p>}
          </motion.div>
          {message && (
            <motion.p {...up(delay(5))} className="m-0 max-w-[290px] text-[17px] italic leading-snug text-white/90 md:max-w-[520px] md:text-[21px]" style={{ fontFamily: cormorant }}>{message}</motion.p>
          )}
          {showCalendar && (
            <motion.div {...up(delay(6))} className="flex flex-col items-center gap-[18px] md:flex-row md:flex-wrap md:justify-center md:gap-7">
              <div className="grid w-[264px] grid-cols-3 gap-2 md:w-[300px] md:gap-2.5">
                {countdownCells.map((c) => (
                  <div key={c.label} className="flex flex-col items-center gap-0.5 py-2.5" style={{ border: '1px solid rgba(201,168,106,0.7)' }}>
                    <span className="text-[28px] leading-none md:text-[34px]" style={{ fontFamily: cormorant }}>{c.value}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] md:text-[11px]" style={{ color: gold }}>{c.label}</span>
                  </div>
                ))}
              </div>
              <CalendarPicker
                wedding={wedding}
                locale={locale}
                dateLabel={dateLabel}
                buttonClassName="inline-flex h-12 items-center gap-2.5 px-[26px] text-xs font-medium uppercase tracking-[0.2em] text-white md:h-14 md:px-[34px] md:text-[13px]"
                buttonStyle={{ background: 'transparent', border: `1.5px solid ${gold}`, fontFamily: "'Jost', sans-serif" }}
                theme={{
                  bg: '#faf8f5', text: '#5a4a3a', muted: '#6b5b4f', border: '#d9c6a8', accent: '#8B5E34', scrim: 'rgba(20,14,8,0.6)', radius: '0px', optionRadius: '0px',
                  titleStyle: { fontFamily: cormorant, fontSize: 26, fontWeight: 500 }, bodyFont: "'Jost', sans-serif",
                  cancelStyle: { background: 'transparent', color: '#5a4a3a', fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' },
                }}
              />
            </motion.div>
          )}
        </main>
        {footer('#5a4a3a', '#ffffff', cormorant)}
        {!reduce && !veilDone && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
            style={{ background: '#2a2119' }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 0.95, duration: 0.75, ease: 'easeOut' }}
            onAnimationComplete={() => setVeilDone(true)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: EASE_OUT }}>
              {seal(120, 104, 36)}
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  }

  // ----- Moderno (template-02) -----
  if (templateId === 'template-02') {
    const C = { stone: '#F2EFEA', paper: '#FBFAF7', ink: '#1E1C19', graphite: '#57524B', rule: '#D9D3C9', bronze: '#7A5A3C', bronzeLight: '#B79A7A' };
    const display = "'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif";
    const body = "'Plus Jakarta Sans', sans-serif";
    const label = 'text-[10px] font-semibold uppercase tracking-[0.2em] md:text-[11px]';
    const rings = (outer: number, inner: number, children: ReactNode, light = false) => (
      <div className="flex items-center justify-center rounded-full" style={{ width: outer, height: outer, border: `1px solid ${light ? 'rgba(255,255,255,0.7)' : C.bronzeLight}`, background: light ? 'rgba(30,28,25,0.25)' : undefined }}>
        <div className="flex flex-col items-center justify-center rounded-full" style={{ width: inner, height: inner, border: `1px solid ${light ? 'rgba(255,255,255,0.7)' : C.bronze}`, color: light ? '#FFFFFF' : C.bronze }}>
          {children}
        </div>
      </div>
    );
    const spin = (delay: number) => custom({ opacity: 0, rotate: -120, scale: 0.6 }, { opacity: 1, rotate: 0, scale: 1 }, delay, 1.4);
    return (
      <div data-template-id="template-02" className="flex min-h-screen min-h-[100dvh] flex-col" style={{ background: C.stone, color: C.ink, fontFamily: body }}>
        {driftCss}
        <main className="flex flex-1 flex-col lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-[18px] px-6 pb-8 pt-[26px] lg:justify-center lg:gap-[30px] lg:px-[clamp(24px,6vw,96px)] lg:py-16">
            <motion.div {...up(0.1)} className="flex items-center justify-between">
              <p className="m-0 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] lg:gap-3 lg:text-xs lg:tracking-[0.26em]" style={{ color: C.bronze }}>
                <span className="h-px w-[22px] lg:w-8" style={{ background: C.bronze }} />
                {title}
              </p>
              <motion.div className="lg:hidden" {...spin(0.3)}>
                {rings(44, 32, <span className="text-[9px] font-bold tracking-[0.12em]">{initials.replace('&', '·')}</span>)}
              </motion.div>
            </motion.div>
            <motion.h1
              className="m-0 break-words text-[66px] font-normal leading-[0.9] tracking-[-0.045em] lg:text-[clamp(72px,8.9vw,128px)]"
              style={{ fontFamily: display }}
              {...custom({ opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }, 0.3, 1.2)}
            >
              {bride}
              <br />&amp; {groom}
            </motion.h1>
            {heroImage && (
              <motion.div className="relative h-[240px] overflow-hidden rounded-[5px] lg:hidden" {...custom({ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }, 0.6, 1.4, EASE_IN_OUT)}>
                {/* Franja horizontal en móvil: centra a la pareja en vertical (50% 52%). */}
                <Photo src={heroImage} alt={photoAlt} delay={0.6} objectPosition="50% 52%" />
              </motion.div>
            )}
            <motion.dl {...up(1.1)} className="m-0 flex flex-wrap" style={{ borderTop: `1px solid ${C.rule}` }}>
              {dateLabel && (
                <div className="flex-[1_1_140px] py-3 pr-3 lg:py-[18px] lg:pr-6" style={{ borderBottom: `1px solid ${C.rule}` }}>
                  <dt className={label} style={{ color: C.graphite }}>{t('date')}</dt>
                  <dd className="m-0 mt-1.5 text-sm font-medium leading-snug lg:mt-2 lg:text-base">{dateLabel}</dd>
                </div>
              )}
              {place && (
                <div className="flex-[1_1_140px] py-3 pl-3.5 lg:px-6 lg:py-[18px]" style={{ borderBottom: `1px solid ${C.rule}`, borderLeft: `1px solid ${C.rule}` }}>
                  <dt className={label} style={{ color: C.graphite }}>{t('place')}</dt>
                  <dd className="m-0 mt-1.5 text-sm font-medium leading-snug lg:mt-2 lg:text-base">{place}</dd>
                </div>
              )}
            </motion.dl>
            {showCalendar && (
              <motion.div {...up(1.25)} className="grid grid-cols-3 lg:max-w-[420px]">
                {countdownCells.map((c, i) => (
                  <div key={c.label} className="flex flex-col gap-0.5" style={{ borderRight: i < 2 ? `1px solid ${C.rule}` : undefined, paddingLeft: i ? 14 : 0, paddingRight: 10 }}>
                    <span className="text-4xl font-light leading-none tracking-[-0.03em]" style={{ fontFamily: display }}>{c.value}</span>
                    <span className={label} style={{ color: C.graphite }}>{c.label}</span>
                  </div>
                ))}
              </motion.div>
            )}
            {message && <motion.p {...up(1.4)} className="m-0 text-[15px] leading-relaxed lg:max-w-[520px] lg:text-[17px]" style={{ color: C.graphite }}>{message}</motion.p>}
            <motion.div {...up(1.55)} className="flex flex-col gap-[18px] lg:flex-row lg:flex-wrap lg:items-center lg:gap-6">
              {showCalendar && (
                <CalendarPicker
                  wedding={wedding}
                  locale={locale}
                  dateLabel={dateLabel}
                  buttonClassName="inline-flex h-[52px] w-full items-center justify-center gap-2.5 text-sm font-semibold lg:h-14 lg:w-auto lg:px-[30px] lg:text-[15px]"
                  buttonStyle={{ background: C.ink, color: C.paper, fontFamily: body }}
                  theme={{
                    bg: C.paper, text: C.ink, muted: C.graphite, border: C.rule, accent: C.bronze, scrim: 'rgba(30,28,25,0.55)', radius: '0px', optionRadius: '0px',
                    titleStyle: { fontFamily: display, fontSize: 30, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.05 }, bodyFont: body, numbered: true,
                    cancelStyle: { background: 'transparent', border: `1px solid ${C.ink}`, color: C.ink, fontFamily: body, fontSize: 14, fontWeight: 600, marginTop: 6 },
                  }}
                />
              )}
            </motion.div>
          </div>
          {heroImage && (
            <motion.div className="relative hidden min-h-[520px] lg:block lg:flex-[1_1_420px]" {...custom({ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }, 0.2, 1.6, EASE_IN_OUT)}>
              <Photo src={heroImage} alt={photoAlt} delay={0.2} />
              {date && (
                <motion.div className="absolute bottom-8 left-8" {...spin(1.2)}>
                  {rings(
                    112,
                    88,
                    <>
                      <span className="text-2xl leading-none" style={{ fontFamily: display }}>{`${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}`}</span>
                      <span className="mt-0.5 text-[10px] font-semibold tracking-[0.22em]">{date.getFullYear()}</span>
                    </>,
                    true
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </main>
        {footer(C.ink, C.paper, display)}
      </div>
    );
  }

  // ----- Botánica Editorial (template-03) -----
  if (templateId === 'template-03') {
    const C = { paper: '#FAF6EF', ink: '#34302A', terracotta: '#A4572F', sage: '#85906E', frame: '#C8BBA4', muted: '#6B6255', pill: '#F1EADD', sand: '#E7DECD' };
    const cormorant = "'Cormorant Garamond', serif";
    const sprig = (className: string, delay: number, flip = false) => (
      <svg width="120" height="150" viewBox="0 0 120 150" fill="none" stroke={C.sage} strokeWidth="1.1" strokeLinecap="round" aria-hidden="true" className={className} style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
        {['M20 148 C 40 110, 52 70, 50 10', 'M47 40 C 30 34, 22 22, 24 10 C 38 14, 46 26, 47 40Z', 'M49 70 C 66 62, 74 48, 72 36 C 58 40, 50 54, 49 70Z', 'M44 96 C 26 92, 16 80, 16 68 C 30 70, 42 82, 44 96Z', 'M36 122 C 52 118, 62 106, 62 94 C 48 96, 38 108, 36 122Z'].map((d) => (
          <motion.path key={d} d={d} {...custom({ pathLength: 0 }, { pathLength: 1 }, delay, 2.8, [0.2, 0.6, 0.3, 1] as Bezier)} />
        ))}
      </svg>
    );
    const arch = (
      <motion.div
        className="relative mx-auto box-border h-[252px] w-[214px] p-2 lg:h-auto lg:w-[min(100%,420px)] lg:p-3"
        style={{ border: `1px solid ${C.frame}`, borderRadius: '999px 999px 0 0' }}
        {...custom({ clipPath: 'inset(100% 0 0 0)', opacity: 0.3 }, { clipPath: 'inset(0% 0 0 0)', opacity: 1 }, 0.25, 1.6, EASE_IN_OUT)}
      >
        <div className="relative h-full w-full overflow-hidden lg:aspect-[5/6.4]" style={{ borderRadius: '999px 999px 0 0' }}>
          <Photo src={heroImage} alt={photoAlt} delay={0.25} />
        </div>
      </motion.div>
    );
    return (
      <div data-template-id="template-03" className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-hidden" style={{ background: C.paper, color: C.ink, fontFamily: "'Jost', sans-serif" }}>
        {driftCss}
        {sprig('absolute left-[-18px] top-[300px] opacity-85 lg:bottom-16 lg:top-auto lg:h-[230px] lg:w-[180px]', 0.8)}
        {sprig('absolute right-[-18px] top-[300px] opacity-85 lg:hidden', 0.9, true)}
        <main className="relative flex flex-1 flex-col items-center gap-4 px-7 pb-8 pt-[30px] text-center lg:flex-row-reverse lg:items-center lg:justify-center lg:gap-12 lg:px-[clamp(24px,7vw,120px)] lg:py-16 lg:text-left">
          <div className="hidden lg:flex lg:flex-[1_1_360px] lg:justify-center">{arch}</div>
          <div className="flex flex-col items-center gap-4 lg:min-w-0 lg:flex-[999_1_520px] lg:items-start lg:gap-[26px]">
            <motion.p {...up(0.1)} className="m-0 text-[11px] font-medium uppercase tracking-[0.34em] lg:text-[13px]" style={{ color: C.terracotta }}>{title}</motion.p>
            <div className="lg:hidden">{arch}</div>
            <motion.h1 {...up(1)} className="m-0 flex flex-col items-center font-medium italic leading-[1.02] lg:block" style={{ fontFamily: cormorant }}>
              <span className="text-[50px] lg:text-[84px]">{bride}</span>
              <span className="text-[28px] font-normal lg:mx-3 lg:text-[44px]" style={{ color: C.sage }}>{locale === 'en' ? '&' : 'y'}</span>
              <span className="text-[50px] lg:block lg:text-[84px]">{groom}</span>
            </motion.h1>
            <motion.div {...up(1.15)} className="flex flex-col items-center gap-1 text-[15px] lg:flex-row lg:flex-wrap lg:gap-x-4 lg:text-[17px]" style={{ color: C.muted }}>
              {dateLabel && <span>{dateLabel}</span>}
              {place && (
                <span className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full" style={{ background: C.frame }} />
                  {place}
                  <span className="h-1 w-1 rounded-full lg:hidden" style={{ background: C.frame }} />
                </span>
              )}
            </motion.div>
            {message && (
              <motion.p {...up(1.3)} className="m-0 max-w-[290px] text-lg italic leading-snug lg:max-w-[480px] lg:text-[23px]" style={{ fontFamily: cormorant }}>{message}</motion.p>
            )}
            {showCalendar && (
              <motion.div {...up(1.45)} className="flex flex-col items-center gap-4 lg:flex-row lg:flex-wrap lg:gap-5">
                <div className="flex items-baseline gap-[18px] rounded-full px-[22px] py-2.5 lg:gap-[22px] lg:px-7 lg:py-3" style={{ background: C.pill }}>
                  {countdownCells.map((c) => (
                    <span key={c.label} className="flex items-baseline gap-1.5">
                      <span className="text-[28px] font-medium lg:text-[34px]" style={{ fontFamily: cormorant }}>{c.value}</span>
                      <span className="text-xs lg:text-[13px]" style={{ color: C.muted }}>{c.label}</span>
                    </span>
                  ))}
                </div>
                <CalendarPicker
                  wedding={wedding}
                  locale={locale}
                  dateLabel={dateLabel}
                  iconSize={17}
                  buttonClassName="inline-flex h-[50px] items-center gap-2.5 rounded-full px-7 text-sm font-medium tracking-[0.04em] text-white lg:h-[54px] lg:px-[30px] lg:text-[15px]"
                  buttonStyle={{ background: C.terracotta, fontFamily: "'Jost', sans-serif" }}
                  theme={{
                    bg: C.paper, text: C.ink, muted: C.muted, border: C.sand, accent: C.terracotta, scrim: 'rgba(52,48,42,0.5)', radius: '28px', optionRadius: '18px',
                    titleStyle: { fontFamily: cormorant, fontStyle: 'italic', fontSize: 28, fontWeight: 500 }, bodyFont: "'Jost', sans-serif",
                    cancelStyle: { background: 'transparent', color: C.muted, fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 500 },
                  }}
                />
              </motion.div>
            )}
          </div>
        </main>
        {footer(C.ink, C.paper, cormorant)}
      </div>
    );
  }

  // ----- Jardín Editorial (template-04) -----
  const C = { olive: '#2E3323', paper: '#F4EFE3', gold: '#C9A98C', goldLine: '#B7AD90', copper: '#8E5534', muted: '#5E6152', body: '#3A3830' };
  const georgia = "Georgia, 'Times New Roman', serif";
  const sans = "'Helvetica Neue', Arial, sans-serif";
  const line = (origin: 'left' | 'right') => (
    <motion.span
      className="block h-px w-9 lg:w-12"
      style={{ background: C.goldLine, originX: origin === 'left' ? 0 : 1 }}
      {...custom({ scaleX: 0 }, { scaleX: 1 }, 0.1, 1.1, EASE_IN_OUT)}
    />
  );
  return (
    <div data-template-id="template-04" className="flex min-h-screen min-h-[100dvh] flex-col" style={{ background: C.olive, fontFamily: georgia }}>
      {driftCss}
      <main className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-col items-center gap-3 px-6 pt-6 text-center lg:flex-[1_1_440px] lg:justify-center lg:gap-[18px] lg:px-8 lg:py-14" style={{ color: C.paper }}>
          <div className="flex items-center gap-3 lg:gap-3.5" style={{ color: C.gold }}>
            {line('right')}
            <motion.span className="text-[15px] tracking-[0.1em] lg:text-[17px]" {...up(0.2)}>I</motion.span>
            {line('left')}
          </div>
          <motion.p {...up(0.5)} className="m-0 text-[11px] uppercase tracking-[0.24em] lg:text-xs" style={{ fontFamily: sans, color: C.gold }}>{title}</motion.p>
          <motion.div
            className="mt-1 box-border h-[246px] w-[206px] p-[7px] lg:h-auto lg:w-[320px] lg:max-w-full lg:p-2.5"
            style={{ border: `1px solid ${C.goldLine}`, borderRadius: '999px 999px 0 0' }}
            {...custom({ clipPath: 'inset(100% 0 0 0)', opacity: 0.3 }, { clipPath: 'inset(0% 0 0 0)', opacity: 1 }, 0.6, 1.6, EASE_IN_OUT)}
          >
            <div className="relative h-full w-full overflow-hidden lg:aspect-[5/6]" style={{ borderRadius: '999px 999px 0 0' }}>
              <Photo src={heroImage} alt={photoAlt} delay={0.6} />
            </div>
          </motion.div>
          <motion.h1 {...up(1.3)} className="m-0 mt-1 flex flex-col items-center font-normal leading-[1.12] lg:block lg:text-[52px] lg:uppercase lg:tracking-[0.06em]">
            <span className="text-[38px] uppercase tracking-[0.06em] lg:text-[52px]">{bride}</span>
            <span className="text-xl italic lg:mx-2 lg:text-[26px] lg:normal-case lg:tracking-normal" style={{ color: C.gold }}>{locale === 'en' ? '&' : 'y'}</span>
            <span className="text-[38px] uppercase tracking-[0.06em] lg:text-[52px]">{groom}</span>
          </motion.h1>
        </div>
        <motion.div
          className="mt-[18px] flex flex-1 flex-col items-center gap-3.5 px-[26px] pb-8 pt-[22px] text-center lg:mt-0 lg:min-w-0 lg:flex-[999_1_520px] lg:items-start lg:justify-center lg:gap-7 lg:px-[clamp(24px,6vw,104px)] lg:py-16 lg:text-left"
          style={{ background: C.paper, color: C.olive }}
          {...custom({ opacity: 0, y: 60 }, { opacity: 1, y: 0 }, 1.6, 1.1)}
        >
          <motion.div {...up(2)} className="flex flex-col items-center gap-1 lg:items-start lg:gap-2">
            <p className="m-0 hidden text-[11px] uppercase tracking-[0.24em] lg:block" style={{ fontFamily: sans, color: C.muted }}>{t('saveThisDay')}</p>
            {dateLabel && <p className="m-0 text-[19px] lg:text-[40px] lg:leading-tight">{dateLabel}</p>}
            {place && <p className="m-0 text-[11px] uppercase tracking-[0.22em] lg:text-[13px]" style={{ fontFamily: sans, color: C.copper }}>{place}</p>}
          </motion.div>
          {showCalendar && (
            <motion.div {...up(2.15)} className="grid w-full grid-cols-3 lg:max-w-[480px]" style={{ borderTop: `1px solid ${C.goldLine}`, borderBottom: `1px solid ${C.goldLine}` }}>
              {countdownCells.map((c, i) => (
                <div key={c.label} className="flex flex-col items-center gap-0.5 py-2.5 lg:py-4" style={{ borderRight: i < 2 ? `1px solid ${C.goldLine}` : undefined }}>
                  <span className="text-[28px] leading-none lg:text-[38px]">{c.value}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] lg:text-[11px]" style={{ fontFamily: sans, color: C.muted }}>{c.label}</span>
                </div>
              ))}
            </motion.div>
          )}
          {message && <motion.p {...up(2.3)} className="m-0 max-w-[300px] text-base italic leading-relaxed lg:max-w-[480px] lg:text-xl" style={{ color: C.body }}>{message}</motion.p>}
          <motion.div {...up(2.45)} className="flex flex-col items-center gap-3.5 lg:flex-row lg:flex-wrap lg:gap-6">
            {showCalendar && (
              <CalendarPicker
                wedding={wedding}
                locale={locale}
                dateLabel={dateLabel}
                iconSize={16}
                buttonClassName="inline-flex h-12 items-center gap-2.5 px-6 text-xs uppercase tracking-[0.2em] lg:h-[54px] lg:px-[30px]"
                buttonStyle={{ background: C.olive, color: C.paper, fontFamily: sans }}
                theme={{
                  bg: C.paper, text: C.olive, muted: C.muted, border: C.goldLine, accent: C.copper, scrim: 'rgba(46,51,35,0.6)', radius: '0px', optionRadius: '0px', archIcon: true,
                  titleStyle: { fontFamily: georgia, fontSize: 22, letterSpacing: '0.06em', textTransform: 'uppercase' }, bodyFont: georgia,
                  cancelStyle: { background: C.olive, color: C.paper, fontFamily: sans, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' },
                }}
              />
            )}
          </motion.div>
        </motion.div>
      </main>
      {footer(C.olive, C.paper, georgia, '1px solid rgba(183,173,144,0.3)')}
    </div>
  );
}
