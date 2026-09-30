'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V4Container, V4Reveal, V4Section, V4SectionHeading, v4Colors } from './ui';

export default function TimelineV4() {
  const { t } = useTranslations('timeline');
  const params = useParams();
  const currentLocale = params.locale as string;
  const weddingData = useAppSelector(selectCurrentWedding);

  if (!weddingData?.timeline?.length) return null;

  const events = weddingData.timeline.map((event) => ({
    time: event.time,
    title:
      typeof event.title === 'object' && event.title
        ? (event.title[currentLocale as 'es' | 'en'] || event.title.es || '')
        : ((event.title as unknown as string) || ''),
    description:
      typeof event.description === 'object' && event.description
        ? (event.description[currentLocale as 'es' | 'en'] || event.description.es || '')
        : ((event.description as unknown as string) || ''),
  }));

  return (
    <V4Section id="timeline" dark>
      <V4Container className="py-16 md:py-24">
        <V4Reveal>
          <V4SectionHeading numeral="V" eyebrow={t('title')} light />
        </V4Reveal>

        <div className="mt-14 max-w-sm mx-auto">
          {events.map((event, index) => (
            <V4Reveal key={index} delay={index * 0.06}>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="w-2 h-2 rounded-full" style={{ background: v4Colors.gold }} />
                  {index < events.length - 1 && (
                    <span className="flex-1 w-px mt-1" style={{ background: 'rgba(244,239,227,.25)' }} />
                  )}
                </div>
                <div className={index < events.length - 1 ? 'pb-8' : ''}>
                  <p className="text-[10px] font-sans tracking-[0.2em] uppercase" style={{ color: v4Colors.gold }}>{event.time}</p>
                  <p className="text-xl mt-0.5">{event.title}</p>
                  {event.description && (
                    <p className="mt-1 text-sm" style={{ color: 'rgba(244,239,227,.75)' }}>{event.description}</p>
                  )}
                </div>
              </div>
            </V4Reveal>
          ))}
        </div>
      </V4Container>
    </V4Section>
  );
}
