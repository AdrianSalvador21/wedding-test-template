'use client';

import { MapPin } from 'lucide-react';
import { useParams } from 'next/navigation';
import { openExternalLink } from '@/lib/utils';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { useTranslations } from '../../lib/translations';
import { RecommendedPlace } from '../../src/types/wedding';
import { V2Card, V2Container, V2Section, V2Stagger, V2StaggerItem, V2Title, V2PillButton } from './ui';

export default function RecommendedPlacesV2() {
  const { t } = useTranslations('recommendedPlaces');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();
  const params = useParams();
  const currentLocale = params.locale as string;

  if (weddingData?.showRecommendedPlaces === false) {
    return null;
  }

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

  if (!places.length) {
    return null;
  }

  const getMapsUrl = (place: RecommendedPlace) => {
    if (place.coordinates) {
      return `https://maps.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(place.name + ' ' + place.address)}`;
  };

  return (
    <V2Section
      id="recommended-places"
      className="relative overflow-hidden"
      style={{
        ...getBackgroundStyle(3, '400px'),
        backgroundPosition: '100px -200px',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '500px 800px'
      }}
    >
      <V2Container className="py-12">
        <V2Stagger>
          <V2StaggerItem>
            <V2Title
              title={t('title')}
              subtitle={(
                <>
                  <div>{t('subtitle')}</div>
                  <div className="mt-2">{t('description')}</div>
                </>
              )}
            />
          </V2StaggerItem>

          <div className="mt-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
            {places.map((place) => (
              <V2StaggerItem key={place.id}>
                <V2Card className="p-6">
                  <h3 className="font-serif text-lg text-[#3b342b]">
                    {place.name}
                  </h3>
                  <p className="mt-3 text-sm text-[#6f6254] leading-relaxed">
                    {typeof place.description === 'object'
                      ? (place.description[currentLocale as 'es' | 'en'] || place.description.es)
                      : place.description}
                  </p>

                  <div className="mt-6">
                    <V2PillButton onClick={() => openExternalLink(getMapsUrl(place))} className="w-full">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {t('button')}
                      </span>
                    </V2PillButton>
                  </div>
                </V2Card>
              </V2StaggerItem>
            ))}
          </div>
        </V2Stagger>
      </V2Container>
    </V2Section>
  );
}
