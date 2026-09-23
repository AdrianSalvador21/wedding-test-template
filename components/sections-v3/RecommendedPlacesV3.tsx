'use client';

import { useParams } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { openExternalLink } from '@/lib/utils';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useTranslations } from '../../lib/translations';
import { RecommendedPlace } from '../../src/types/wedding';
import { V3BgMotif, V3Card, V3Container, V3CornerFlourish, V3EyebrowTitle, V3PillButton, V3Reveal, V3Section, V3Stagger, V3StaggerItem } from './ui';

export default function RecommendedPlacesV3() {
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
    if (place.coordinates) {
      return `https://maps.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(place.name + ' ' + place.address)}`;
  };

  return (
    <V3Section id="recommended-places">
      <V3BgMotif patternId="v3-lp-recplaces" tileSize={260} rotate={7} />
      <V3CornerFlourish corner="top-left" width={140} height={92} opacity={0.5} />
      <V3Container className="py-16 md:py-24">
        <V3Reveal>
          <V3EyebrowTitle eyebrow={t('subtitle')} title={t('title')} />
          <p className="mt-4 font-jost text-sm text-[#6B6255] max-w-xl mx-auto">{t('description')}</p>
        </V3Reveal>

        <V3Stagger className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {places.map((place) => (
            <V3StaggerItem key={place.id}>
              <V3Card className="p-7 h-full flex flex-col">
                <h3 className="font-cormorant italic text-xl text-[#34302A]">{place.name}</h3>
                <p className="mt-3 font-jost text-sm text-[#6B6255] leading-relaxed">
                  {typeof place.description === 'object'
                    ? (place.description[currentLocale as 'es' | 'en'] || place.description.es)
                    : place.description}
                </p>
                <div className="pt-6 mt-auto">
                  <V3PillButton onClick={() => openExternalLink(getMapsUrl(place))} className="w-full justify-center">
                    <MapPin className="w-4 h-4" />
                    {t('button')}
                  </V3PillButton>
                </div>
              </V3Card>
            </V3StaggerItem>
          ))}
        </V3Stagger>
      </V3Container>
    </V3Section>
  );
}
