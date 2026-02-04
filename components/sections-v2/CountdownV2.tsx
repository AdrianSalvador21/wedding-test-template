'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { V2Card, V2Container, V2Section, V2Title } from './ui';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownV2() {
  const { t, currentLanguage } = useTranslations('countdown');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();
  const [mounted, setMounted] = useState(false);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const weddingDate = useMemo(() => {
    return weddingData?.event.date ? new Date(weddingData.event.date) : new Date('2025-11-21T16:00:00');
  }, [weddingData?.event.date]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  if (!mounted) {
    return (
      <V2Section id="countdown" className="-mt-px">
        <V2Container className="pt-0 pb-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#efe6dc] rounded w-64 mx-auto" />
            <div className="flex items-stretch justify-center gap-3 max-w-3xl mx-auto">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-[82px] bg-[#f3ece4] rounded-[22px]"
                />
              ))}
            </div>
          </div>
        </V2Container>
      </V2Section>
    );
  }

  const isEventPassed = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
  const eventTime = weddingData?.event.time || '16:00';

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <V2Section
      id="countdown"
      className="relative overflow-hidden -mt-px"
      style={{
        ...getBackgroundStyle(1, '200px'),
        backgroundSize: '1388px 909px'
      }}
    >
      <V2Container className="pt-0 pb-12">
        <V2Title title={t('subtitle')} />

        <div className="mt-10 max-w-4xl mx-auto">
          {isEventPassed ? (
            <V2Card className="p-10 text-center">
              <p className="font-serif text-2xl text-[#b79a7a]">{t('eventPassed')}</p>
              <p className="mt-4 text-sm md:text-base text-[#6f6254]">{t('thankYou')}</p>
            </V2Card>
          ) : (
            <>
              <div className="flex items-stretch justify-center gap-3">
                {([
                  { label: t('days'), value: timeLeft.days },
                  { label: t('hours'), value: timeLeft.hours },
                  { label: t('minutes'), value: timeLeft.minutes },
                  { label: t('seconds'), value: timeLeft.seconds },
                ] as const).map((item) => (
                  <V2Card key={item.label} className="px-4 py-4 text-center w-[82px] rounded-[22px]">
                    <div className="text-2xl md:text-3xl font-serif font-light text-[#3b342b] leading-none">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="mt-2 text-[10px] tracking-[0.26em] uppercase text-[#8a7c6b]">
                      {item.label}
                    </div>
                  </V2Card>
                ))}
              </div>

              <div className="mt-10 text-center">
                <p className="text-base md:text-base text-[#6f6254]">
                  {weddingDate.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="mt-2 text-base md:text-base text-[#6f6254]">
                  {formatTime(eventTime)}
                </p>
              </div>
            </>
          )}
        </div>
      </V2Container>
    </V2Section>
  );
}
