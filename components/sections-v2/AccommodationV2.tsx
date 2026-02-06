'use client';

import { MapPin } from 'lucide-react';
import { useParams } from 'next/navigation';
import { openExternalLink } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { useTranslations } from '../../lib/translations';
import { V2Card, V2Container, V2Section, V2Stagger, V2StaggerItem, V2Title, V2PillButton } from './ui';

export default function AccommodationV2() {
  const { t } = useTranslations('accommodation');
  const { isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();
  const params = useParams();
  const currentLocale = params.locale as string;

  if (!weddingData?.accommodation?.hotels?.length) {
    return null;
  }

  const accommodationOptions = weddingData.accommodation.hotels;

  if (!isLoaded) {
    return (
      <V2Section id="accommodation">
        <V2Container className="py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#efe6dc] rounded w-64 mx-auto" />
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <div className="h-44 bg-[#f3ece4] rounded-[28px]" />
              <div className="h-44 bg-[#f3ece4] rounded-[28px]" />
            </div>
          </div>
        </V2Container>
      </V2Section>
    );
  }

  return (
    <V2Section
      id="accommodation"
      className="relative overflow-hidden"
      style={{
        ...getBackgroundStyle(2, '240px'),
        backgroundSize: '400px 500px',
        backgroundRepeat: 'repeat',
        backgroundPosition: '-304px -136px'
      }}
    >
      <V2Container className="py-12">
        <V2Stagger>
          <V2StaggerItem>
            <V2Title title={t('title')} subtitle={t('subtitle')} />
          </V2StaggerItem>

          <div className="mt-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
            {accommodationOptions.map((hotel, index) => (
              <V2StaggerItem key={index}>
                <V2Card className="p-6">
                  <h3 className="font-serif text-lg text-[#3b342b] leading-snug">
                    {hotel.name}
                  </h3>

                  {hotel.description && (
                    <p className="mt-3 text-sm text-[#6f6254] leading-relaxed">
                      {typeof hotel.description === 'object'
                        ? (hotel.description[currentLocale as 'es' | 'en'] || hotel.description.es)
                        : hotel.description}
                    </p>
                  )}

                  <div className="mt-6">
                    <V2PillButton
                      onClick={() => openExternalLink(`https://maps.google.com/maps?q=${encodeURIComponent(hotel.name)}`)}
                      className="w-full"
                    >
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {t('seeLocation')}
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
