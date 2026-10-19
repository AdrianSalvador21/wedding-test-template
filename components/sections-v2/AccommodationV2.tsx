'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V2_COLORS, V2Container, V2Section, V2SectionHeading, V2SectionLayout, V2Stagger, V2StaggerItem, v2DisplayStyle } from './ui';
import { useV2SectionNumber, v2Localized } from './sections';

export default function AccommodationV2() {
  const { t, currentLanguage } = useTranslations('template02');
  const weddingData = useAppSelector(selectCurrentWedding);
  const number = useV2SectionNumber('accommodation');

  if (!weddingData?.accommodation?.hotels?.length) {
    return null;
  }

  const hotels = weddingData.accommodation.hotels;

  return (
    <V2Section id="accommodation" tone="paper" bordered>
      <V2Container className="py-16 lg:py-24">
        <V2SectionLayout
            heading={<V2SectionHeading number={number} overline={t('accommodation.overline')} title={t('accommodation.title')} />}
          >
            <V2Stagger className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
              {hotels.map((hotel, index) => {
                const description = v2Localized(hotel.description, currentLanguage);
                const href = hotel.mapsUrl || `https://maps.google.com/maps?q=${encodeURIComponent(hotel.name)}`;
                return (
                  <V2StaggerItem
                    as="article"
                    key={hotel.id || `${hotel.name}-${index}`}
                    className="flex flex-col gap-[10px] rounded-md p-5"
                    style={{ border: `1px solid ${V2_COLORS.rule}`, backgroundColor: V2_COLORS.white }}
                  >
                    <h3 className="m-0" style={{ ...v2DisplayStyle(22, 400, -0.02), lineHeight: 1.15 }}>
                      {hotel.name}
                    </h3>
                    {description && (
                      <p className="m-0 text-sm leading-[1.55]" style={{ color: V2_COLORS.graphite }}>
                        {description}
                      </p>
                    )}
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex min-h-11 items-center gap-2 self-start text-sm font-semibold no-underline hover:opacity-80"
                      style={{ color: V2_COLORS.bronze }}
                    >
                      {t('accommodation.seeLocation')}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.8} />
                    </a>
                  </V2StaggerItem>
                );
              })}
            </V2Stagger>
          </V2SectionLayout>
      </V2Container>
    </V2Section>
  );
}
