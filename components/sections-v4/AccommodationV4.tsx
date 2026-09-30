'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V4Container, V4Reveal, V4Section, V4SectionHeading, v4Colors } from './ui';

export default function AccommodationV4() {
  const { t } = useTranslations('accommodation');
  const params = useParams();
  const currentLocale = params.locale as string;
  const weddingData = useAppSelector(selectCurrentWedding);

  if (!weddingData?.accommodation?.hotels?.length) return null;

  const hotels = weddingData.accommodation.hotels;

  return (
    <V4Section id="accommodation" tinted>
      <V4Container className="py-16 md:py-24 text-center">
        <V4Reveal>
          <V4SectionHeading numeral="VIII" eyebrow={t('title')} />
        </V4Reveal>

        <div className="mt-10 max-w-md mx-auto space-y-4 text-left">
          {hotels.map((hotel, index) => (
            <V4Reveal key={index} delay={index * 0.08}>
              <div className="border p-5" style={{ borderColor: 'rgba(43,42,34,.18)' }}>
                <span className="text-[17px]" style={{ color: v4Colors.ink }}>{hotel.name}</span>
                {hotel.description && (
                  <p className="mt-2 text-[14px] leading-relaxed" style={{ color: v4Colors.body }}>
                    {typeof hotel.description === 'object'
                      ? (hotel.description[currentLocale as 'es' | 'en'] || hotel.description.es)
                      : hotel.description}
                  </p>
                )}
                <a
                  href={hotel.mapsUrl || `https://maps.google.com/maps?q=${encodeURIComponent(hotel.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-[11px] font-sans tracking-[0.06em] underline"
                  style={{ color: v4Colors.ink }}
                >
                  {t('seeLocation')} →
                </a>
              </div>
            </V4Reveal>
          ))}
        </div>
      </V4Container>
    </V4Section>
  );
}
