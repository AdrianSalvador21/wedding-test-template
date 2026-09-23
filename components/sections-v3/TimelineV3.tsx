'use client';

import { useParams } from 'next/navigation';
import { Heart, Wine, UtensilsCrossed, Music, MapPin, Camera, Users, type LucideIcon } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V3BgMotif, V3Card, V3Container, V3CornerFlourish, V3EyebrowTitle, V3IconRings, V3Reveal, V3Section, v3Colors } from './ui';

const iconMap: Record<string, LucideIcon> = {
  MapPin,
  Heart,
  Music,
  Utensils: UtensilsCrossed,
  Users,
  Wine,
  Camera,
};

const iconPool: LucideIcon[] = [MapPin, Wine, UtensilsCrossed, Music];

export default function TimelineV3() {
  const { t } = useTranslations('timeline');
  const params = useParams();
  const currentLocale = params.locale as string;
  const weddingData = useAppSelector(selectCurrentWedding);

  if (!weddingData?.timeline?.length) return null;

  const events = weddingData.timeline.map((event, index) => ({
    time: event.time,
    title:
      typeof event.title === 'object' && event.title
        ? (event.title[currentLocale as 'es' | 'en'] || event.title.es || '')
        : ((event.title as unknown as string) || ''),
    description:
      typeof event.description === 'object' && event.description
        ? (event.description[currentLocale as 'es' | 'en'] || event.description.es || '')
        : ((event.description as unknown as string) || ''),
    Icon: (event.icon && iconMap[event.icon as string]) || iconPool[index % iconPool.length],
    isCeremony: event.icon === 'Heart' || event.isHighlight,
  }));

  return (
    <V3Section id="timeline">
      <V3BgMotif patternId="v3-lp-timeline" tileSize={300} rotate={12} />
      <V3CornerFlourish corner="top-left" width={150} height={98} opacity={0.55} />
      <V3CornerFlourish corner="bottom-right" width={130} height={84} opacity={0.4} />
      <V3Container className="py-16 md:py-24">
        <V3Reveal>
          <V3EyebrowTitle eyebrow={t('subtitle')} title={t('title')} />
        </V3Reveal>

        <div className="mt-14 max-w-xl mx-auto relative">
          <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-1.5 bottom-8 w-px" style={{ background: `${v3Colors.accent}48` }} />

          <div className="space-y-10">
            {events.map((event, index) => (
              <V3Reveal key={index} direction="left" delay={index * 0.06} className="relative flex gap-6 pl-0 md:justify-center">
                <div
                  className="w-12 h-12 rounded-full bg-[#FAF6EF] border flex items-center justify-center flex-none z-10"
                  style={{ borderColor: v3Colors.accent }}
                >
                  {event.isCeremony ? (
                    <span style={{ color: v3Colors.accent }}>
                      <V3IconRings size={20} />
                    </span>
                  ) : (
                    <event.Icon className="w-5 h-5" style={{ color: v3Colors.accent }} />
                  )}
                </div>
                <div>
                  <p className="font-jost text-xs tracking-[0.16em] uppercase" style={{ color: v3Colors.accent }}>
                    {event.time}
                  </p>
                  <h3 className="font-cormorant italic text-xl md:text-2xl text-[#34302A] mt-0.5">{event.title}</h3>
                  {event.description && (
                    <p className="mt-1 font-jost text-sm text-[#8C8172]">{event.description}</p>
                  )}
                </div>
              </V3Reveal>
            ))}
          </div>
        </div>

        {weddingData.event.receptionVenue?.name && (
          <V3Reveal delay={0.1} className="mt-14 max-w-xl mx-auto">
            <V3Card className="p-6 text-center">
              <p className="font-jost text-xs tracking-[0.14em] uppercase text-[#8C8172]">{t('additionalInfo.title')}</p>
              <p className="mt-2 font-jost text-sm text-[#6B6255]">{t('additionalInfo.arriveEarly')}</p>
            </V3Card>
          </V3Reveal>
        )}
      </V3Container>
    </V3Section>
  );
}
