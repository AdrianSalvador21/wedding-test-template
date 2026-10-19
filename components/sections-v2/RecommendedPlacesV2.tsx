'use client';

import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { RecommendedPlace } from '../../src/types/wedding';
import { V2_COLORS, V2Container, V2Section, V2SectionHeading, V2SectionLayout, V2Stagger, V2StaggerItem, v2DisplayStyle } from './ui';
import { useV2SectionNumber, v2Fill, v2Localized, v2RecommendedPlaces } from './sections';

const getMapsUrl = (place: RecommendedPlace) => {
  if (place.mapsUrl) return place.mapsUrl;
  if (place.coordinates) {
    return `https://maps.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent([place.name, place.address].filter(Boolean).join(' '))}`;
};

const pad = (n: number) => String(n).padStart(2, '0');

export default function RecommendedPlacesV2() {
  const { t, currentLanguage } = useTranslations('template02');
  const weddingData = useAppSelector(selectCurrentWedding);
  const number = useV2SectionNumber('places');
  const places = v2RecommendedPlaces(weddingData);

  if (!places.length) {
    return null;
  }

  return (
    <V2Section id="recommended-places" bordered>
      <V2Container className="py-16 pb-[72px] lg:py-24">
        <V2SectionLayout heading={<V2SectionHeading number={number} overline={t('places.overline')} title={t('places.title')} />}>
            <V2Stagger as="ol" className="m-0 list-none p-0" style={{ borderTop: `1px solid ${V2_COLORS.rule}` }}>
              {places.map((place, index) => {
                const description = v2Localized(place.description, currentLanguage);
                return (
                  <V2StaggerItem as="li" key={place.id || `${place.name}-${index}`} style={{ borderBottom: `1px solid ${V2_COLORS.rule}` }}>
                    <a
                      href={getMapsUrl(place)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={v2Fill(t('places.open'), { name: place.name })}
                      className="grid grid-cols-[36px_minmax(0,1fr)_20px] items-start gap-x-3 py-[18px] no-underline transition-opacity hover:opacity-80"
                      style={{ color: V2_COLORS.ink }}
                    >
                      <span className="pt-[3px] text-[15px]" style={{ fontFamily: v2DisplayStyle(15).fontFamily, color: V2_COLORS.bronze }} aria-hidden="true">
                        {pad(index + 1)}
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="text-[17px] font-semibold">{place.name}</span>
                        {description && (
                          <span className="text-sm leading-normal" style={{ color: V2_COLORS.graphite }}>
                            {description}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight className="mt-[3px] h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.8} />
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
