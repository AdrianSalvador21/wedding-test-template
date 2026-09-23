'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V3BgMotif, V3Card, V3Container, V3CornerFlourish, V3EyebrowTitle, V3Reveal, V3Section, V3Stagger, V3StaggerItem, v3Colors } from './ui';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownV3() {
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

  if (!mounted) {
    return (
      <V3Section id="countdown">
        <V3Container className="py-16 md:py-24">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-[#E7DECD] rounded w-48 mx-auto" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-fit mx-auto">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 w-[110px] bg-[#F3EDE2] rounded-[4px]" />
              ))}
            </div>
          </div>
        </V3Container>
      </V3Section>
    );
  }

  const isEventPassed = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
  const eventTime = weddingData?.event.time || '16:00';
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours, 10);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const tiles = [
    { label: t('days'), value: timeLeft.days },
    { label: t('hours'), value: timeLeft.hours },
    { label: t('minutes'), value: timeLeft.minutes },
    { label: t('seconds'), value: timeLeft.seconds },
  ];

  return (
    <V3Section id="countdown">
      <V3BgMotif patternId="v3-lp-countdown" tileSize={300} rotate={-8} />
      <V3CornerFlourish corner="top-right" width={150} height={100} opacity={0.55} />
      <V3Container className="py-16 md:py-24">
        <V3Reveal>
          <V3EyebrowTitle eyebrow={t('subtitle')} title={t('title')} />
        </V3Reveal>

        <div className="mt-14 max-w-4xl mx-auto">
          {isEventPassed ? (
            <V3Reveal>
              <V3Card className="p-10 text-center">
                <p className="font-cormorant italic text-2xl" style={{ color: v3Colors.accent }}>{t('eventPassed')}</p>
                <p className="mt-4 text-sm md:text-base text-[#6B6255] font-jost">{t('thankYou')}</p>
              </V3Card>
            </V3Reveal>
          ) : (
            <>
              <V3Stagger className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 w-fit mx-auto">
                {tiles.map((tile) => (
                  <V3StaggerItem key={tile.label}>
                    <V3Card className="px-5 py-6 md:px-7 md:py-7 text-center w-[100px] md:w-[118px]">
                      <div className="font-cormorant font-medium text-4xl md:text-[44px] leading-none text-[#34302A]">
                        {String(tile.value).padStart(2, '0')}
                      </div>
                      <div className="mt-2 font-jost text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-[#8C8172]">
                        {tile.label}
                      </div>
                    </V3Card>
                  </V3StaggerItem>
                ))}
              </V3Stagger>

              <V3Reveal delay={0.15} className="mt-10 text-center font-jost text-[#6B6255]">
                <p>
                  {weddingDate.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="mt-2">{formatTime(eventTime)}</p>
              </V3Reveal>
            </>
          )}
        </div>
      </V3Container>
    </V3Section>
  );
}
