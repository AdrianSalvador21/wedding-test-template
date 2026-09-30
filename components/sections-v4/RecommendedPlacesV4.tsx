'use client';

import { useParams } from 'next/navigation';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useTranslations } from '../../lib/translations';
import { RecommendedPlace } from '../../src/types/wedding';
import { V4Container, V4Reveal, V4Section, V4SectionHeading, v4Colors } from './ui';

export default function RecommendedPlacesV4() {
  const { t } = useTranslations('recommendedPlaces');
  const weddingData = useAppSelector(selectCurrentWedding);
  const params = useParams();
  const currentLocale = params.locale as string;

  if (weddingData?.showRecommendedPlaces === false) return null;

  let places: RecommendedPlace[] = [];
  if (weddingData?.accommodation?.recommendedPlaces?.length) {
    places = weddingData.accommodation.recommendedPlaces as RecommendedPlace[];
  } else if (Array.isArray(weddingData?.recommendedPlaces) && weddingData.recommendedPlaces.length > 0) {
    places = weddingData.recommendedPlaces as RecommendedPlace[];
  } else if (
    weddingData?.recommendedPlaces &&
    typeof weddingData.recommendedPlaces === 'object' &&
    'places' in weddingData.recommendedPlaces &&
    weddingData.recommendedPlaces.enabled &&
    weddingData.recommendedPlaces.places?.length
  ) {
    places = weddingData.recommendedPlaces.places;
  }

  if (!places.length) return null;

  const getMapsUrl = (place: RecommendedPlace) => {
    if (place.mapsUrl) return place.mapsUrl;
    if (place.coordinates) {
      return `https://maps.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(place.name + (place.address ? ' ' + place.address : ''))}`;
  };

  return (
    <V4Section id="recommended-places" tinted>
      <V4Container className="py-16 md:py-24 text-center">
        <V4Reveal>
          <V4SectionHeading numeral="X" eyebrow={t('title')} />
        </V4Reveal>

        <div className="mt-10 max-w-md mx-auto space-y-4 text-left">
          {places.map((place, index) => (
            <V4Reveal key={place.id} delay={index * 0.08}>
              <div className="border p-5" style={{ borderColor: 'rgba(43,42,34,.18)' }}>
                <a
                  href={getMapsUrl(place)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[17px] hover:underline"
                  style={{ color: v4Colors.ink }}
                >
                  {place.name}
                </a>
                {place.description && (
                  <p className="mt-2 text-[14px] leading-relaxed" style={{ color: v4Colors.body }}>
                    {typeof place.description === 'object'
                      ? (place.description[currentLocale as 'es' | 'en'] || place.description.es)
                      : place.description}
                  </p>
                )}
              </div>
            </V4Reveal>
          ))}
        </div>
      </V4Container>
    </V4Section>
  );
}
