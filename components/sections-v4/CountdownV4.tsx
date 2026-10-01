'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V4BgMotif, V4Container, V4CornerFlourish, V4Reveal, V4Section, V4SectionHeading, V4Stagger, V4StaggerItem, v4Colors } from './ui';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownV4() {
  const { t, currentLanguage } = useTranslations('countdown');
  const weddingData = useAppSelector(selectCurrentWedding);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const weddingDate = useMemo(() => {
    return weddingData?.event.date ? new Date(weddingData.event.date) : new Date('2025-11-21T16:00:00');
  }, [weddingData?.event.date]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const tick = () => {
      const distance = weddingDate.getTime() - Date.now();
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / 86400000),
          hours: Math.floor((distance % 86400000) / 3600000),
          minutes: Math.floor((distance % 3600000) / 60000),
          seconds: Math.floor((distance % 60000) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  const isEventPassed = mounted && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  const tiles = [
    { label: t('days'), value: timeLeft.days },
    { label: t('hours'), value: timeLeft.hours },
    { label: t('minutes'), value: timeLeft.minutes },
    { label: t('seconds'), value: timeLeft.seconds },
  ];

  const receptionVenue = weddingData?.event.receptionVenue;
  const currentLocale = currentLanguage as 'es' | 'en';
  const venueName = typeof receptionVenue?.name === 'object' && receptionVenue.name
    ? (receptionVenue.name[currentLocale] || receptionVenue.name.es || '')
    : ((receptionVenue?.name as unknown as string) || '');

  return (
    <V4Section id="countdown" dark>
      <V4BgMotif patternId="v4-lp-countdown" tileSize={300} rotate={-8} light />
      <V4CornerFlourish corner="top-right" width={150} height={100} opacity={0.4} light />
      <V4Container className="py-16 md:py-24 text-center">
        <V4Reveal>
          <V4SectionHeading numeral="II" eyebrow={t('subtitle')} light />
        </V4Reveal>

        {mounted && !isEventPassed && (
          <>
            <V4Stagger className="mt-10 grid grid-cols-4 gap-2 md:gap-4 w-fit mx-auto">
              {tiles.map((tile) => (
                <V4StaggerItem key={tile.label}>
                  <div className="w-[76px] md:w-[104px] text-center">
                    <div className="text-3xl md:text-5xl leading-none">{String(tile.value).padStart(2, '0')}</div>
                    <div className="mt-2 text-[9px] md:text-[10px] font-sans tracking-[0.22em] uppercase" style={{ color: v4Colors.gold }}>
                      {tile.label}
                    </div>
                  </div>
                </V4StaggerItem>
              ))}
            </V4Stagger>

            {venueName && (
              <V4Reveal delay={0.15} className="mt-8 text-[11px] font-sans tracking-[0.2em] uppercase" >
                <span style={{ color: v4Colors.gold }}>{t('title')} {venueName}</span>
              </V4Reveal>
            )}
          </>
        )}

        {mounted && isEventPassed && (
          <V4Reveal delay={0.1} className="mt-10">
            <p className="text-2xl italic" style={{ color: v4Colors.gold }}>{t('eventPassed')}</p>
            <p className="mt-3 text-sm font-sans" style={{ color: 'rgba(244,239,227,.7)' }}>{t('thankYou')}</p>
          </V4Reveal>
        )}
      </V4Container>
    </V4Section>
  );
}
