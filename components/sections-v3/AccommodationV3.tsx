'use client';

import { useParams } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { openExternalLink } from '@/lib/utils';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V3BgMotif, V3Card, V3Container, V3CornerFlourish, V3EyebrowTitle, V3PillButton, V3Reveal, V3Section, V3Stagger, V3StaggerItem } from './ui';

export default function AccommodationV3() {
  const { t } = useTranslations('accommodation');
  const params = useParams();
  const currentLocale = params.locale as string;
  const weddingData = useAppSelector(selectCurrentWedding);

  if (!weddingData?.accommodation?.hotels?.length) return null;

  const hotels = weddingData.accommodation.hotels;

  return (
    <V3Section id="accommodation" tinted>
      <V3BgMotif patternId="v3-lp-accommodation" tileSize={280} rotate={-9} />
      <V3CornerFlourish corner="top-right" width={140} height={92} opacity={0.5} />
      <V3Container className="py-16 md:py-24">
        <V3Reveal>
          <V3EyebrowTitle eyebrow={t('subtitle')} title={t('title')} />
        </V3Reveal>

        <V3Stagger className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {hotels.map((hotel, index) => (
            <V3StaggerItem key={index}>
              <V3Card className="p-7 h-full flex flex-col">
                <h3 className="font-cormorant italic text-xl text-[#34302A] leading-snug">{hotel.name}</h3>
                {hotel.description && (
                  <p className="mt-3 font-jost text-sm text-[#6B6255] leading-relaxed">
                    {typeof hotel.description === 'object'
                      ? (hotel.description[currentLocale as 'es' | 'en'] || hotel.description.es)
                      : hotel.description}
                  </p>
                )}
                <div className="pt-6 mt-auto">
                  <V3PillButton
                    onClick={() => openExternalLink(`https://maps.google.com/maps?q=${encodeURIComponent(hotel.name)}`)}
                    className="w-full justify-center"
                  >
                    <MapPin className="w-4 h-4" />
                    {t('seeLocation')}
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
