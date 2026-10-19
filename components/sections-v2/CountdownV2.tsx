'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import {
  V2_COLORS,
  V2Container,
  V2Overline,
  V2Reveal,
  V2Rings,
  V2Section,
  V2Stagger,
  V2StaggerItem,
  v2DisplayStyle,
} from './ui';
import { v2Fill, v2FormatSentenceDate, v2FormatTime, v2WeddingDate } from './sections';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeTimeLeft(target: Date): TimeLeft | null {
  const distance = target.getTime() - Date.now();
  if (distance <= 0) return null;
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function CountdownV2() {
  const { t, currentLanguage } = useTranslations('template02');
  const weddingData = useAppSelector(selectCurrentWedding);
  const weddingDate = useMemo(() => v2WeddingDate(weddingData), [weddingData]);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(computeTimeLeft(weddingDate));
    const timer = setInterval(() => setTimeLeft(computeTimeLeft(weddingDate)), 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  const time = v2FormatTime(weddingData?.event.time);
  const sentenceDate = v2FormatSentenceDate(weddingDate, currentLanguage);
  const forDate = time
    ? v2Fill(t('countdown.forDate'), { date: sentenceDate, time })
    : `${sentenceDate.charAt(0).toUpperCase()}${sentenceDate.slice(1)}.`;

  const cells = timeLeft
    ? [
        { value: timeLeft.days, short: t('countdown.days'), long: t('countdown.days') },
        { value: timeLeft.hours, short: t('countdown.hours'), long: t('countdown.hours') },
        { value: timeLeft.minutes, short: t('countdown.minutes'), long: t('countdown.minutesLong') },
        { value: timeLeft.seconds, short: t('countdown.seconds'), long: t('countdown.secondsLong') },
      ]
    : [];

  const isPassed = mounted && !timeLeft;

  return (
    <V2Section id="countdown" tone="ink" className="mt-14 lg:mt-0">
      <V2Rings
        width={360}
        strokeWidth={0.25}
        color={V2_COLORS.bronzeOnInk}
        className="pointer-events-none absolute -right-[150px] -top-10 opacity-45 lg:-left-[200px] lg:-top-[120px] lg:right-auto lg:h-[440px] lg:w-[760px]"
      />
      <V2Container className="py-14 pb-16 lg:py-[88px]">
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-end lg:gap-16">
            <V2Reveal className="flex flex-col gap-5 lg:col-span-5">
              <V2Overline label={t('countdown.overline')} onInk />
              <h2 className="m-0 whitespace-pre-line text-[38px] lg:text-[56px]" style={{ ...v2DisplayStyle(38, 300, -0.035), fontSize: undefined, lineHeight: 1.05 }}>
                {isPassed ? t('countdown.passedTitle') : t('countdown.title')}
              </h2>
              <p className="m-0 hidden text-base lg:block" style={{ color: V2_COLORS.mutedOnInk }}>
                {isPassed ? t('countdown.passedText') : forDate}
              </p>
            </V2Reveal>

            <div className="lg:col-span-7">
              {!isPassed && (
                <V2Stagger
                  role="timer"
                  aria-label={
                    timeLeft
                      ? v2Fill(t('countdown.timerLabel'), {
                          days: timeLeft.days,
                          hours: timeLeft.hours,
                          minutes: timeLeft.minutes,
                        })
                      : undefined
                  }
                  className="grid grid-cols-4"
                  style={{ borderTop: `1px solid ${V2_COLORS.ruleOnInk}`, borderBottom: `1px solid ${V2_COLORS.ruleOnInk}` }}
                >
                  {(cells.length ? cells : Array.from({ length: 4 }, () => null)).map((cell, index) => (
                    <V2StaggerItem
                      key={index}
                      aria-hidden="true"
                      className={`flex flex-col gap-1.5 py-5 lg:gap-2.5 lg:py-7 ${index > 0 ? 'pl-[14px] lg:pl-7' : ''}`}
                      style={index < 3 ? { borderRight: `1px solid ${V2_COLORS.ruleOnInk}` } : undefined}
                    >
                      <span
                        className="text-[46px] leading-none lg:text-[96px]"
                        style={{
                          ...v2DisplayStyle(46, 300, -0.045),
                          fontSize: undefined,
                          lineHeight: 1,
                          color: index === 3 ? V2_COLORS.bronzeOnInk : undefined,
                        }}
                      >
                        {cell ? pad(cell.value) : '--'}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.16em] lg:text-xs lg:tracking-[0.18em]" style={{ color: V2_COLORS.mutedOnInk }}>
                        <span className="lg:hidden">{cell?.short}</span>
                        <span className="hidden lg:inline">{cell?.long}</span>
                      </span>
                    </V2StaggerItem>
                  ))}
                </V2Stagger>
              )}
              <V2Reveal delay={0.3}>
                <p className={`m-0 text-[15px] leading-relaxed lg:hidden ${isPassed ? '' : 'mt-8'}`} style={{ color: V2_COLORS.mutedOnInk }}>
                  {isPassed ? t('countdown.passedText') : forDate}
                </p>
              </V2Reveal>
            </div>
          </div>
      </V2Container>
    </V2Section>
  );
}
