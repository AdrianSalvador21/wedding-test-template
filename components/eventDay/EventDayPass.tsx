'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useReducedMotion, type TargetAndTransition } from 'framer-motion';
import type { EventDayConfig, FirebaseGuest, WeddingData } from '../../src/types/wedding';
import { useTranslations } from '../../lib/translations';
import { albumPhase, ALBUM_TIME_ZONE } from '../../lib/album';
import { albumHref } from '../album/AlbumFab';
import { SITE } from '../../lib/site';
import type { EventDayPassData, EventDayPerson } from '../../hooks/useEventDayPass';
import EventDayFloorPlan, { hasPlacedTables, type FloorPlanTheme } from './EventDayFloorPlan';

// Spec 32 — pase del invitado el día de la boda. Se abre ANTES de la invitación (encima de ella) y
// "Ver invitación" lo cierra. Un estilo por template, tomado de SaveTheDate.tsx y albumThemes.ts;
// diseño de referencia: https://claude.ai/artifact/Nw2hnnHYqKFG3qiHiJ4962.

type TemplateKey = 'template-01' | 'template-02' | 'template-03' | 'template-04';

const fill = (text: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((acc, [k, v]) => acc.split(`{${k}}`).join(String(v)), text);

const cormorant = "'Cormorant Garamond', serif";
const jost = "'Jost', sans-serif";
const lora = "'Lora', serif";
const bricolage = "'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif";
const jakarta = "'Plus Jakarta Sans', sans-serif";
const georgia = "Georgia, 'Times New Roman', serif";
const helvetica = "'Helvetica Neue', Arial, sans-serif";
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CameraIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.5 4h-5L7.5 6.5H4a1 1 0 0 0-1 1V19a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7.5a1 1 0 0 0-1-1h-3.5z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

const PLAN_THEMES: Record<TemplateKey, FloorPlanTheme> = {
  'template-01': {
    frame: 'rgba(201,168,106,0.45)', frameFill: 'rgba(255,255,255,0.03)',
    fixtureFill: 'rgba(201,168,106,0.08)', fixtureStroke: 'rgba(201,168,106,0.55)', fixtureText: 'rgba(255,255,255,0.7)', labelFont: jost,
    tableFill: 'transparent', tableStroke: 'rgba(201,168,106,0.6)', tableText: 'rgba(255,255,255,0.75)', numberFont: cormorant,
    highlightFill: '#c9a86a', highlightText: '#2a2119', highlightRing: '#c9a86a', youLabel: '#c9a86a',
    segTrack: { border: '1px solid rgba(201,168,106,0.6)' },
    segActive: { background: '#c9a86a', color: '#2a2119', fontFamily: jost, fontSize: 11, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase' },
    segIdle: { background: 'transparent', color: 'rgba(255,255,255,0.85)', fontFamily: jost, fontSize: 11, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase' },
    hint: { fontFamily: cormorant, fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.78)' },
  },
  'template-02': {
    fixtureFill: '#F2EFEA', fixtureStroke: '#D9D3C9', fixtureText: '#57524B', labelFont: jakarta,
    tableFill: '#FBFAF7', tableStroke: '#B9B2A7', tableText: '#57524B', numberFont: bricolage,
    highlightFill: '#7A5A3C', highlightText: '#FBFAF7', highlightRing: '#7A5A3C', youLabel: '',
    segTrack: { border: '1px solid #D9D3C9', borderRadius: 999 },
    segActive: { background: '#1E1C19', color: '#FBFAF7', borderRadius: 999, fontFamily: jakarta, fontSize: 13, fontWeight: 600 },
    segIdle: { background: 'transparent', color: '#57524B', borderRadius: 999, fontFamily: jakarta, fontSize: 13, fontWeight: 600 },
    hint: { fontFamily: jakarta, fontSize: 12, lineHeight: 1.5, color: '#57524B' },
  },
  'template-03': {
    fixtureFill: '#F1EADD', fixtureStroke: '#C8BBA4', fixtureText: '#6B6255', fixtureRadius: 14, labelFont: jost,
    tableFill: '#FAF6EF', tableStroke: '#C8BBA4', tableText: '#6B6255', numberFont: cormorant, numberItalic: true,
    highlightFill: '#A4572F', highlightText: '#FAF6EF', highlightRing: '#A4572F', ringDash: '3 4', youLabel: '#A4572F',
    segTrack: { background: '#F1EADD', borderRadius: 999 },
    segActive: { background: '#A4572F', color: '#FAF6EF', borderRadius: 999, fontFamily: jost, fontSize: 13, fontWeight: 500, letterSpacing: '0.04em' },
    segIdle: { background: 'transparent', color: '#6B6255', borderRadius: 999, fontFamily: jost, fontSize: 13, fontWeight: 500, letterSpacing: '0.04em' },
    hint: { fontFamily: cormorant, fontStyle: 'italic', fontSize: 16, color: '#6B6255' },
  },
  'template-04': {
    frame: '#B7AD90',
    fixtureFill: '#EBE4D3', fixtureStroke: '#B7AD90', fixtureText: '#5E6152', labelFont: helvetica,
    tableFill: '#F4EFE3', tableStroke: '#B7AD90', tableText: '#5E6152', numberFont: georgia,
    highlightFill: '#2E3323', highlightText: '#F4EFE3', highlightRing: '#8E5534', youLabel: '#8E5534',
    segTrack: { border: '1px solid #B7AD90' },
    segActive: { background: '#2E3323', color: '#F4EFE3', fontFamily: helvetica, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' },
    segIdle: { background: 'transparent', color: '#5E6152', fontFamily: helvetica, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' },
    hint: { fontFamily: georgia, fontStyle: 'italic', fontSize: 14, color: '#3A3830' },
  },
};

// Mientras el pase está abierto la invitación de abajo no debe hacer scroll (mismo truco que
// InvitationOverlay: en iOS Safari no basta con overflow hidden en <body>).
function useLockBodyScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const prev = { h: html.style.overflow, o: body.style.overflow, p: body.style.position, t: body.style.top, w: body.style.width };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    return () => {
      html.style.overflow = prev.h;
      body.style.overflow = prev.o;
      body.style.position = prev.p;
      body.style.top = prev.t;
      body.style.width = prev.w;
      const behavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = behavior;
    };
  }, []);
}

interface Props {
  wedding: WeddingData;
  guest: FirebaseGuest;
  guestUrlId: string; // el valor de ?guest= de la URL, para el link del álbum
  data: EventDayPassData;
  config: EventDayConfig;
  onClose: () => void;
}

export default function EventDayPass({ wedding, guest, guestUrlId, data, config, onClose }: Props) {
  const { t, currentLanguage } = useTranslations('eventDay');
  const { t: tAlbum } = useTranslations('album');
  const reduce = useReducedMotion();
  useLockBodyScroll();

  // Apertura (una sola vez): cada diseño entra con su gesto propio, como el save the date (sello,
  // máscara, arco o filetes), y luego aparecen en cascada la mesa, el plano y los botones. Solo se
  // animan opacity, transform y clip-path. Con "reducir movimiento" todo aparece completo.
  const enter = (delay: number, from: TargetAndTransition, to: TargetAndTransition, duration = 0.8) =>
    reduce ? {} : { initial: from, animate: to, transition: { delay, duration, ease: EASE_OUT } };
  const up = (step: number) => enter(0.2 + step * 0.13, { opacity: 0, y: 18 }, { opacity: 1, y: 0 });
  const mask = (delay: number) =>
    enter(delay, { opacity: 0, y: 34, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }, 1.1);
  const archReveal = (delay: number) =>
    enter(delay, { opacity: 0.3, clipPath: 'inset(100% 0 0 0)' }, { opacity: 1, clipPath: 'inset(0% 0 0 0)' }, 1.4);
  const seal = (delay: number) => enter(delay, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1 }, 1.0);
  const grow = (delay: number) => enter(delay, { scaleX: 0 }, { scaleX: 1 }, 1.0);

  // La fase del álbum depende de la hora: se calcula en el cliente, igual que AlbumFab.
  const [phase, setPhase] = useState<ReturnType<typeof albumPhase> | null>(null);
  useEffect(() => setPhase(albumPhase(wedding)), [wedding]);

  const templateId = (['template-01', 'template-02', 'template-03', 'template-04'].includes(wedding.template?.id || '')
    ? wedding.template?.id
    : 'template-01') as TemplateKey;
  const locale = currentLanguage;
  const bride = wedding.couple?.bride?.name || '';
  const groom = wedding.couple?.groom?.name || '';
  const initials = `${bride.charAt(0)}&${groom.charAt(0)}`;
  const joiner = templateId === 'template-03' || templateId === 'template-04' ? (locale === 'en' ? '&' : 'y') : '&';
  const rawDate = wedding.event?.date ? new Date(wedding.event.date) : null;
  const shortDate = rawDate && !Number.isNaN(rawDate.getTime())
    ? rawDate.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', { weekday: 'long', day: 'numeric', month: 'long', timeZone: ALBUM_TIME_ZONE })
    : '';
  const greeting = fill(t('greeting'), { name: guest.name });

  const people = data.people;
  const titular = people[0];
  const heroTable = titular?.table?.name || null;
  const showTable = config.showTable && !data.loading && people.length > 0;
  const showList = showTable && people.length > 1;
  const showPlan = config.showFloorPlan && !data.loading && hasPlacedTables(data.tables, data.highlightedTableIds);
  const showAlbum = config.showAlbum && (phase === 'open' || phase === 'closed');
  const albumLabel = phase === 'open' ? tAlbum('shareCta') : tAlbum('viewAlbumCta');
  const albumLink = albumHref(wedding.id, locale, guestUrlId);
  const personLabel = (p: EventDayPerson) => p.name || fill(t('companion'), { n: p.seatIndex });
  const brandHref = `${SITE.url}/?src=invitacion`;

  const planLabels = {
    aria: t('floorPlanAria'),
    you: t('yourTable'),
    near: t('planNear'),
    whole: t('planWhole'),
    nearHint: t('planNearHint'),
    wholeHint: t('planWholeHint'),
  };
  const plan = () =>
    showPlan ? (
      <EventDayFloorPlan
        tables={data.tables}
        fixtures={data.fixtures}
        highlightedTableIds={data.highlightedTableIds}
        theme={PLAN_THEMES[templateId]}
        labels={planLabels}
      />
    ) : null;

  const footer = (bg: string, color: string, font: string, border?: string) => (
    <div className="relative flex h-9 flex-shrink-0 items-center justify-center lg:h-11" style={{ background: bg, borderTop: border }}>
      <a href={brandHref} target="_blank" rel="noopener noreferrer" className="text-lg no-underline hover:opacity-80" style={{ color, fontFamily: font }}>
        invyta
      </a>
      <a href={`${SITE.url}/aviso-de-privacidad`} target="_blank" rel="noopener noreferrer" className="absolute right-4 text-[11px] no-underline opacity-70 hover:opacity-100" style={{ color, fontFamily: font }}>
        {locale === 'en' ? 'Privacy' : 'Privacidad'}
      </a>
    </div>
  );

  const shell = (bg: string, color: string, font: string, children: ReactNode) => (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={t('yourTable')}
      data-template-id={templateId}
      className="fixed inset-0 z-[60] overflow-y-auto"
      style={{ background: bg, color, fontFamily: font, overscrollBehavior: 'contain' }}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="flex min-h-full flex-col">{children}</div>
    </motion.div>
  );

  const rows = (opts: { border: string; nameStyle: CSSProperties; tableStyle: CSSProperties; noTableStyle: CSSProperties; pad: string; first?: boolean }) =>
    people.map((p, i) => (
      <div
        key={p.seatIndex}
        className={`flex ${p.table ? 'items-baseline justify-between gap-3' : 'flex-col gap-1'} ${opts.pad}`}
        style={{ borderTop: i === 0 && !opts.first ? undefined : `1px solid ${opts.border}` }}
      >
        <span style={opts.nameStyle}>{personLabel(p)}</span>
        {p.table ? <span style={opts.tableStyle}>{p.table.name}</span> : <span style={opts.noTableStyle}>{t('noTable')}</span>}
      </div>
    ));

  // ----- Clásico (template-01) -----
  if (templateId === 'template-01') {
    const gold = '#c9a86a';
    return shell('#2a2119', '#ffffff', jost, (
      <>
        <main className="flex flex-1 flex-col items-center gap-[22px] px-6 pb-7 pt-10 text-center lg:flex-row lg:items-center lg:justify-center lg:gap-[72px] lg:px-24 lg:py-12">
          <div className="flex w-full max-w-[460px] flex-col items-center gap-[22px] lg:gap-5">
            <motion.div {...seal(0.1)} className="flex h-16 w-16 items-center justify-center rounded-full lg:h-[72px] lg:w-[72px]" style={{ border: `1px solid ${gold}` }}>
              <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full text-xl italic lg:h-[62px] lg:w-[62px] lg:text-[22px]" style={{ border: '1px solid rgba(201,168,106,0.55)', fontFamily: cormorant, color: gold }}>{initials}</div>
            </motion.div>
            <motion.div {...up(1)} className="flex flex-col items-center gap-2.5">
              <p className="m-0 text-xs font-light uppercase tracking-[0.4em] text-white/90 lg:text-[13px]">{t('today')}</p>
              <div aria-hidden="true" className="flex w-[200px] items-center gap-2.5">
                <div className="h-px flex-1 bg-white/40" />
                <div className="h-1.5 w-1.5 rotate-45" style={{ border: `1px solid ${gold}` }} />
                <div className="h-px flex-1 bg-white/40" />
              </div>
              <p className="m-0 text-[44px] leading-[1.1] lg:text-[52px]" style={{ fontFamily: "'Allura', cursive", textShadow: '2px 2px 6px rgba(0,0,0,0.6)' }}>
                {bride} <span className="text-[26px] italic lg:text-[30px]" style={{ fontFamily: cormorant, color: '#e7e1d8' }}>&amp;</span> {groom}
              </p>
            </motion.div>
            <motion.h1 {...up(2)} className="m-0 text-[32px] font-medium leading-[1.1] lg:text-4xl" style={{ fontFamily: cormorant }}>{greeting}</motion.h1>
            {showTable && (
              <motion.section {...up(3)} aria-label={t('yourTable')} className="box-border flex w-full flex-col items-center gap-1 px-5 pb-2 pt-[22px]" style={{ border: '1px solid rgba(201,168,106,0.7)' }}>
                <p className="m-0 text-[11px] uppercase tracking-[0.28em]" style={{ color: gold }}>{t('yourTable')}</p>
                {heroTable ? (
                  <p className="m-0 text-[58px] font-medium leading-none lg:text-[56px]" style={{ fontFamily: cormorant }}>{heroTable}</p>
                ) : (
                  <p className="m-0 pb-4 pt-1 text-xl italic" style={{ fontFamily: cormorant }}>{t('noTable')}</p>
                )}
                {showList && (
                  <div className="mt-3.5 flex w-full flex-col text-left">
                    {rows({
                      border: 'rgba(201,168,106,0.35)', pad: 'py-3', first: true,
                      nameStyle: { fontSize: 14 },
                      tableStyle: { fontFamily: cormorant, fontSize: 19, color: '#e7e1d8' },
                      noTableStyle: { fontFamily: cormorant, fontStyle: 'italic', fontSize: 16, color: 'rgba(255,255,255,0.78)' },
                    })}
                  </div>
                )}
              </motion.section>
            )}
            <motion.div {...up(5)} className="w-full">
            <Actions
              className="mt-1 flex w-full flex-col gap-3 lg:flex-row"
              album={showAlbum ? { href: albumLink, label: albumLabel, style: { height: 52, background: '#8B5E34', color: '#FFF7EC', border: '1.5px solid #8B5E34', fontFamily: lora, fontSize: 11.5, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' } } : null}
              view={{ label: t('viewInvitation'), onClick: onClose, style: { height: 50, background: 'transparent', border: `1.5px solid ${gold}`, color: '#ffffff', fontFamily: jost, fontSize: 12, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase' } }}
            />
            </motion.div>
          </div>
          {showPlan && (
            <motion.section {...up(4)} aria-label={t('floorPlan')} className="flex w-full max-w-[600px] flex-col items-center gap-3 lg:flex-1 lg:gap-4">
              <p className="m-0 text-[11px] uppercase tracking-[0.28em] lg:text-xs" style={{ color: gold }}>{t('floorPlan')}</p>
              {plan()}
            </motion.section>
          )}
        </main>
        {footer('#5a4a3a', '#ffffff', cormorant)}
      </>
    ));
  }

  // ----- Moderno (template-02) -----
  if (templateId === 'template-02') {
    const C = { stone: '#F2EFEA', paper: '#FBFAF7', ink: '#1E1C19', graphite: '#57524B', rule: '#D9D3C9', bronze: '#7A5A3C', bronzeLight: '#B79A7A' };
    const label = 'text-[10px] font-semibold uppercase tracking-[0.2em] lg:text-[11px]';
    const primary = !showAlbum; // si no hay fotos, "Ver invitación" pasa a ser el botón principal
    return shell(C.stone, C.ink, jakarta, (
      <>
        <main className="flex flex-1 flex-col lg:flex-row">
          <div className={`box-border flex flex-col gap-[22px] px-6 pb-7 pt-[26px] lg:justify-center lg:gap-[26px] lg:py-12 lg:pl-20 lg:pr-14 ${showPlan ? 'lg:w-[560px] lg:flex-shrink-0' : 'lg:mx-auto lg:w-[640px]'}`}>
            <motion.div {...up(0)} className="flex items-center justify-between">
              <p className="m-0 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] lg:gap-3 lg:text-xs lg:tracking-[0.26em]" style={{ color: C.bronze }}>
                <span className="h-px w-[22px] lg:w-8" style={{ background: C.bronze }} />
                {t('today')}
              </p>
              <div className="flex h-11 w-11 items-center justify-center rounded-full lg:hidden" style={{ border: `1px solid ${C.bronzeLight}` }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-semibold tracking-[0.12em]" style={{ border: `1px solid ${C.bronze}`, color: C.bronze }}>{initials.replace('&', '·')}</div>
              </div>
            </motion.div>
            <div className="flex flex-col gap-2.5 lg:gap-3">
              <motion.h1 {...mask(0.25)} className="m-0 break-words text-[58px] font-normal leading-[0.92] tracking-[-0.045em] lg:text-[84px] lg:leading-[0.9]" style={{ fontFamily: bricolage }}>{greeting}</motion.h1>
              <motion.p {...up(3)} className="m-0 text-sm lg:text-base" style={{ color: C.graphite }}>
                {fill(t('weddingOf'), { couple: `${bride} & ${groom}` })}{shortDate ? ` · ${shortDate}` : ''}
              </motion.p>
            </div>
            {showTable && (
              <motion.section {...up(4)} aria-label={t('yourTable')} className="flex flex-col" style={{ borderTop: `1px solid ${C.rule}` }}>
                <div className="flex items-end justify-between gap-3 pb-[18px] pt-4" style={{ borderBottom: `1px solid ${C.rule}` }}>
                  <div className="flex flex-col gap-1.5">
                    <span className={label} style={{ color: C.graphite }}>{t('yourTable')}</span>
                    {heroTable ? (
                      <span className="text-[64px] font-light leading-[0.9] tracking-[-0.04em] lg:text-[72px]" style={{ fontFamily: bricolage }}>{heroTable}</span>
                    ) : (
                      <span className="text-[30px] font-normal leading-[1.05] tracking-[-0.03em]" style={{ fontFamily: bricolage }}>{t('noTable')}</span>
                    )}
                  </div>
                  {showList && <span className="flex-shrink-0 text-xs font-semibold lg:text-[13px]" style={{ color: C.bronze }}>{fill(t('people'), { count: people.length })}</span>}
                </div>
                {showList && (
                  <dl className="m-0 flex flex-col">
                    {people.map((p) => (
                      <div key={p.seatIndex} className={`flex ${p.table ? 'justify-between gap-3' : 'flex-col gap-1'} py-[13px]`} style={{ borderBottom: `1px solid ${C.rule}` }}>
                        <dt className="text-sm font-medium lg:text-[15px]">{personLabel(p)}</dt>
                        {p.table ? (
                          <dd className="m-0 text-sm font-semibold lg:text-[15px]">{p.table.name}</dd>
                        ) : (
                          <dd className="m-0 text-[13px] lg:text-sm" style={{ color: C.graphite }}>{t('noTable')}</dd>
                        )}
                      </div>
                    ))}
                  </dl>
                )}
              </motion.section>
            )}
            {showPlan && (
              <motion.section {...up(5)} aria-label={t('floorPlan')} className="flex flex-col gap-3 rounded-[5px] p-4 lg:hidden" style={{ background: C.paper, border: `1px solid ${C.rule}` }}>
                <PlanLegend label={label} graphite={C.graphite} bronze={C.bronze} title={t('floorPlan')} you={t('yourTable')} />
                {plan()}
              </motion.section>
            )}
            <motion.div {...up(6)} className="w-full">
            <Actions
              className="flex flex-col gap-2.5 lg:flex-row lg:gap-3"
              album={showAlbum ? { href: albumLink, label: albumLabel, iconSize: 17, className: 'lg:px-7', style: { height: 56, background: C.ink, color: C.stone, borderRadius: 999, fontFamily: jakarta, fontSize: 15, fontWeight: 600 } } : null}
              view={{
                label: t('viewInvitation'), onClick: onClose, className: 'lg:px-7',
                style: primary
                  ? { height: 56, background: C.ink, border: 0, borderRadius: 999, color: C.stone, fontFamily: jakarta, fontSize: 15, fontWeight: 600 }
                  : { height: 52, background: 'transparent', border: `1px solid ${C.ink}`, borderRadius: 999, color: C.ink, fontFamily: jakarta, fontSize: 14, fontWeight: 600 },
              }}
            />
            </motion.div>
          </div>
          {showPlan && (
            <motion.section {...enter(0.35, { opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, clipPath: 'inset(0 0 0% 0)' }, 1.4)} aria-label={t('floorPlan')} className="box-border hidden flex-1 flex-col justify-center gap-4 px-16 py-10 lg:flex" style={{ background: C.paper, borderLeft: `1px solid ${C.rule}` }}>
              <PlanLegend label={label} graphite={C.graphite} bronze={C.bronze} title={t('floorPlan')} you={t('yourTable')} />
              <div className="mx-auto w-full max-w-[620px]">{plan()}</div>
            </motion.section>
          )}
        </main>
        {footer(C.ink, C.paper, bricolage)}
      </>
    ));
  }

  // ----- Botánica Editorial (template-03) -----
  if (templateId === 'template-03') {
    const C = { paper: '#FAF6EF', ink: '#34302A', terracotta: '#A4572F', sage: '#85906E', frame: '#C8BBA4', muted: '#6B6255', pill: '#F1EADD', sand: '#E7DECD' };
    return shell(C.paper, C.ink, jost, (
      <>
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <Sprig className="absolute left-[-22px] top-[150px] opacity-85 lg:bottom-16 lg:left-[-18px] lg:top-auto lg:h-[230px] lg:w-[180px]" color={C.sage} />
          <Sprig className="absolute right-[-22px] top-[150px] opacity-85 lg:hidden" color={C.sage} flip />
          <main className="relative flex flex-1 flex-col items-center gap-[18px] px-6 pb-7 pt-[30px] text-center lg:flex-row lg:items-center lg:justify-center lg:gap-14 lg:py-10 lg:pl-28 lg:pr-[88px] lg:text-left">
            <div className="flex w-full max-w-[500px] flex-col items-center gap-[18px] lg:items-start lg:gap-[22px]">
              <motion.p {...up(0)} className="m-0 text-[11px] font-medium uppercase tracking-[0.34em] lg:text-[13px]" style={{ color: C.terracotta }}>{t('today')}</motion.p>
              <div className="flex flex-col items-center gap-[18px] lg:flex-col-reverse lg:items-start lg:gap-1.5">
                <motion.p {...up(2)} className="m-0 text-[22px] font-medium italic lg:text-2xl" style={{ fontFamily: cormorant }}>
                  {bride} <span className="font-normal" style={{ color: C.sage }}>{joiner}</span> {groom}
                </motion.p>
                <motion.h1 {...up(1)} className="m-0 text-[44px] font-medium italic leading-[1.02] lg:text-[64px]" style={{ fontFamily: cormorant }}>{greeting}</motion.h1>
              </div>
              {showTable && (
                <div className="flex w-full flex-col items-center gap-[18px] lg:flex-row lg:items-stretch lg:gap-5">
                  <motion.div {...archReveal(0.45)} className="box-border h-[220px] w-[200px] flex-shrink-0 p-2 lg:h-[196px] lg:w-[168px] lg:p-[7px]" style={{ border: `1px solid ${C.frame}`, borderRadius: '999px 999px 0 0' }}>
                    <div className="box-border flex h-full w-full flex-col items-center justify-end gap-1 px-3 pb-[30px] text-center lg:pb-6" style={{ borderRadius: '999px 999px 0 0', background: C.pill }}>
                      <span className="text-xs uppercase tracking-[0.2em] lg:text-[11px]" style={{ color: C.muted }}>{t('yourTable')}</span>
                      {heroTable ? (
                        <span className="text-[56px] font-medium italic leading-none lg:text-[46px]" style={{ fontFamily: cormorant }}>{heroTable}</span>
                      ) : (
                        <span className="text-lg italic leading-snug" style={{ fontFamily: cormorant }}>{t('noTable')}</span>
                      )}
                    </div>
                  </motion.div>
                  {showList && (
                    <motion.section {...up(4)} aria-label={t('yourTable')} className="box-border flex w-full flex-col justify-center rounded-[18px] px-[18px] py-1.5 text-left lg:flex-1 lg:py-1" style={{ background: C.pill }}>
                      {rows({
                        border: C.sand, pad: 'py-3 lg:py-[11px]',
                        nameStyle: { fontSize: 15 },
                        tableStyle: { fontFamily: cormorant, fontStyle: 'italic', fontWeight: 500, fontSize: 20 },
                        noTableStyle: { fontFamily: cormorant, fontStyle: 'italic', fontSize: 17, color: C.muted },
                      })}
                    </motion.section>
                  )}
                </div>
              )}
              {showPlan && (
                <motion.section {...up(5)} aria-label={t('floorPlan')} className="box-border flex w-full flex-col items-center gap-2.5 rounded-[28px] px-3.5 pb-3.5 pt-[18px] lg:hidden" style={{ border: `1px solid ${C.sand}` }}>
                  <p className="m-0 text-[22px] font-medium italic" style={{ fontFamily: cormorant }}>{t('floorPlan')}</p>
                  {plan()}
                </motion.section>
              )}
              <motion.div {...up(6)} className="w-full lg:w-auto">
              <Actions
                className="flex w-full flex-col gap-2.5 lg:w-auto lg:flex-row lg:gap-3"
                album={showAlbum ? { href: albumLink, label: albumLabel, className: 'lg:px-[30px]', style: { height: 52, background: C.terracotta, color: C.paper, borderRadius: 999, fontFamily: jost, fontSize: 13, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' } } : null}
                view={{ label: t('viewInvitation'), onClick: onClose, className: 'lg:px-[30px]', style: { height: 50, background: 'transparent', border: `1px solid ${C.terracotta}`, borderRadius: 999, color: C.terracotta, fontFamily: jost, fontSize: 14, fontWeight: 500, letterSpacing: '0.04em' } }}
              />
              </motion.div>
            </div>
            {showPlan && (
              <motion.section {...up(4)} aria-label={t('floorPlan')} className="box-border hidden flex-1 flex-col items-center gap-3 rounded-[28px] px-7 py-6 lg:flex" style={{ border: `1px solid ${C.sand}`, background: '#FFFDF8' }}>
                <p className="m-0 text-[26px] font-medium italic" style={{ fontFamily: cormorant }}>{t('floorPlan')}</p>
                <div className="w-full max-w-[560px]">{plan()}</div>
              </motion.section>
            )}
          </main>
        </div>
        {footer(C.ink, C.paper, cormorant)}
      </>
    ));
  }

  // ----- Jardín Editorial (template-04) -----
  const C = { olive: '#2E3323', paper: '#F4EFE3', gold: '#C9A98C', goldLine: '#B7AD90', copper: '#8E5534', muted: '#5E6152', body: '#3A3830', arch: '#3A4030' };
  const smallCaps: CSSProperties = { fontFamily: helvetica, letterSpacing: '0.24em', textTransform: 'uppercase' };
  return shell(C.olive, C.paper, georgia, (
    <>
      <main className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-col items-center gap-3 px-6 pt-[26px] text-center lg:w-[440px] lg:flex-shrink-0 lg:justify-center lg:gap-4 lg:px-8 lg:py-12">
          <div className="flex items-center gap-3 lg:gap-3.5">
            <motion.span {...grow(0.1)} className="block h-px w-9 lg:w-12" style={{ background: C.goldLine, originX: 1 }} />
            <motion.p {...up(0)} className="m-0 text-[11px] lg:text-xs" style={{ ...smallCaps, color: C.gold }}>{t('today')}</motion.p>
            <motion.span {...grow(0.1)} className="block h-px w-9 lg:w-12" style={{ background: C.goldLine, originX: 0 }} />
          </div>
          <motion.p {...up(1)} className="m-0 text-xl uppercase tracking-[0.06em] lg:text-2xl">
            {bride} <span className="mx-2 italic normal-case tracking-normal lg:mx-2.5" style={{ color: C.gold }}>{joiner}</span> {groom}
          </motion.p>
          <motion.h1 {...up(2)} className="m-0 mt-1 text-[34px] font-normal leading-[1.12] lg:hidden">{greeting}</motion.h1>
          {showTable && (
            <motion.div {...archReveal(0.5)} className="mt-1.5 box-border h-[236px] w-[232px] p-2 lg:mt-2 lg:h-[300px] lg:w-[288px] lg:p-2.5" style={{ border: `1px solid ${C.goldLine}`, borderRadius: '999px 999px 0 0' }}>
              <div className="box-border flex h-full w-full flex-col items-center justify-end gap-2 px-6 pb-8 lg:gap-2.5 lg:px-8 lg:pb-11" style={{ borderRadius: '999px 999px 0 0', background: C.arch }}>
                <span className="text-[11px] lg:text-xs" style={{ ...smallCaps, color: C.gold }}>{t('yourTable')}</span>
                {heroTable ? (
                  <span className="text-[38px] uppercase leading-none tracking-[0.06em] lg:text-5xl">{heroTable}</span>
                ) : (
                  <span className="text-base italic leading-snug">{t('noTable')}</span>
                )}
              </div>
            </motion.div>
          )}
        </div>
        <motion.div {...enter(0.9, { opacity: 0, y: 60 }, { opacity: 1, y: 0 }, 1.1)} className="mt-[18px] flex flex-1 flex-col items-center gap-[22px] px-6 pb-7 pt-[22px] text-center lg:mt-0 lg:flex-row lg:items-center lg:gap-12 lg:py-12 lg:pl-16 lg:pr-[72px] lg:text-left" style={{ background: C.paper, color: C.olive }}>
          <div className="flex w-full flex-col gap-[22px] lg:w-[360px] lg:flex-shrink-0 lg:gap-6">
            <h1 className="m-0 hidden text-[44px] font-normal leading-[1.1] lg:block">{greeting}</h1>
            {showList && (
              <section aria-label={t('yourTable')} className="flex w-full flex-col text-left" style={{ borderTop: `1px solid ${C.goldLine}`, borderBottom: `1px solid ${C.goldLine}` }}>
                {rows({
                  border: 'rgba(183,173,144,0.55)', pad: 'py-4 lg:py-[17px]',
                  nameStyle: { fontSize: 16 },
                  tableStyle: { ...smallCaps, fontSize: 11, letterSpacing: '0.2em', color: C.copper },
                  noTableStyle: { fontStyle: 'italic', fontSize: 15, color: C.body },
                })}
              </section>
            )}
            {showPlan && (
              <section aria-label={t('floorPlan')} className="flex w-full flex-col items-center gap-3 lg:hidden">
                <p className="m-0 text-[11px]" style={{ ...smallCaps, color: C.muted }}>{t('floorPlan')}</p>
                {plan()}
              </section>
            )}
            <Actions
              className="flex w-full flex-col gap-2.5 lg:[&>*]:flex-none"
              album={showAlbum ? { href: albumLink, label: albumLabel, iconSize: 17, style: { height: 48, background: C.olive, color: C.paper, fontFamily: helvetica, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' } } : null}
              view={{ label: t('viewInvitation'), onClick: onClose, style: { height: 48, background: 'transparent', border: `1px solid ${C.olive}`, color: C.olive, fontFamily: helvetica, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' } }}
            />
          </div>
          {showPlan && (
            <section aria-label={t('floorPlan')} className="hidden flex-1 flex-col items-center gap-3.5 lg:flex">
              <p className="m-0 text-[11px]" style={{ ...smallCaps, color: C.muted }}>{t('floorPlan')}</p>
              <div className="w-full max-w-[420px]">{plan()}</div>
            </section>
          )}
        </motion.div>
      </main>
      {footer(C.olive, C.paper, georgia, '1px solid rgba(183,173,144,0.3)')}
    </>
  ));
}

function Actions({
  className,
  album,
  view,
}: {
  className: string;
  album: { href: string; label: string; style: CSSProperties; className?: string; iconSize?: number } | null;
  view: { label: string; onClick: () => void; style: CSSProperties; className?: string };
}) {
  return (
    <div className={className}>
      {album && (
        <a
          data-track-action="album_open"
          href={album.href}
          className={`flex items-center justify-center gap-2.5 no-underline lg:flex-1 ${album.className || ''}`}
          style={album.style}
        >
          <CameraIcon size={album.iconSize} />
          {album.label}
        </a>
      )}
      <button
        type="button"
        data-track-action="event_day_view_invitation"
        onClick={view.onClick}
        className={`flex cursor-pointer items-center justify-center lg:flex-1 ${view.className || ''}`}
        style={view.style}
      >
        {view.label}
      </button>
    </div>
  );
}

function PlanLegend({ label, graphite, bronze, title, you }: { label: string; graphite: string; bronze: string; title: string; you: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={label} style={{ color: graphite }}>{title}</span>
      <span className="flex items-center gap-1.5 text-[11px] font-semibold lg:gap-2 lg:text-[13px]" style={{ color: bronze }}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: bronze }} />
        {you}
      </span>
    </div>
  );
}

function Sprig({ className, color, flip = false }: { className: string; color: string; flip?: boolean }) {
  return (
    <svg width="120" height="150" viewBox="0 0 120 150" fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round" aria-hidden="true" className={className} style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
      {['M20 148 C 40 110, 52 70, 50 10', 'M47 40 C 30 34, 22 22, 24 10 C 38 14, 46 26, 47 40Z', 'M49 70 C 66 62, 74 48, 72 36 C 58 40, 50 54, 49 70Z', 'M44 96 C 26 92, 16 80, 16 68 C 30 70, 42 82, 44 96Z', 'M36 122 C 52 118, 62 106, 62 94 C 48 96, 38 108, 36 122Z'].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
