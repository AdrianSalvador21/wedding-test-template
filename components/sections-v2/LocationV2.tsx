'use client';

import { useParams } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { openExternalLink } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useTranslations } from '../../lib/translations';
import { V2Card, V2Container, V2Section, V2Stagger, V2StaggerItem, V2Title, V2PillButton } from './ui';

export default function LocationV2() {
  const { t } = useTranslations('location');
  const params = useParams();
  const currentLocale = params.locale as string;
  const { isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);

  const ceremonyVenueName = typeof weddingData?.event.ceremonyVenue?.name === 'object' && weddingData.event.ceremonyVenue.name
    ? (weddingData.event.ceremonyVenue.name[currentLocale as 'es' | 'en'] || weddingData.event.ceremonyVenue.name.es || '')
    : (weddingData?.event.ceremonyVenue?.name as unknown as string || '');

  const ceremonyVenue = ceremonyVenueName;
  const ceremonyAddress = weddingData?.event.ceremonyVenue?.address || '';
  const ceremonyUrl = weddingData?.event.ceremonyVenue?.mapsUrl || '';

  const receptionVenueName = typeof weddingData?.event.receptionVenue?.name === 'object' && weddingData.event.receptionVenue.name
    ? (weddingData.event.receptionVenue.name[currentLocale as 'es' | 'en'] || weddingData.event.receptionVenue.name.es || '')
    : (weddingData?.event.receptionVenue?.name as unknown as string || '');

  const receptionVenue = receptionVenueName;
  const receptionAddress = weddingData?.event.receptionVenue?.address || '';
  const receptionMapsUrl = weddingData?.event.receptionVenue?.mapsUrl || '';

  if (!isLoaded) {
    return (
      <V2Section id="location">
        <V2Container className="py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-[#e9ded2] rounded w-40" />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-40 bg-[#efe6dc] rounded-[28px]" />
              <div className="h-40 bg-[#efe6dc] rounded-[28px]" />
            </div>
          </div>
        </V2Container>
      </V2Section>
    );
  }

  const Card = ({
    title,
    venue,
    address,
    mapsUrl,
  }: {
    title: string;
    venue: string;
    address: string;
    mapsUrl: string;
  }) => {
    if (!venue) return null;

    return (
      <V2Card className="p-6">
        <p className="text-[11px] tracking-[0.28em] uppercase text-[#8a7c6b]">
          {title}
        </p>
        <h3 className="mt-3 text-lg md:text-xl font-serif font-normal text-[#3b342b]">
          {venue}
        </h3>
        {!!address && (
          <p className="mt-2 text-sm text-[#6f6254] leading-relaxed">
            {address}
          </p>
        )}

        <div className="mt-6">
          <V2PillButton onClick={() => openExternalLink(mapsUrl)} className="w-full px-4 py-3">
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t('directions')}
            </span>
          </V2PillButton>
        </div>
      </V2Card>
    );
  };

  return (
    <V2Section id="location">
      <V2Container className="py-12">
        <V2Stagger>
          <V2StaggerItem>
            <V2Title title={t('title')} />
          </V2StaggerItem>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            <V2StaggerItem>
              <Card title={t('ceremony')} venue={ceremonyVenue} address={ceremonyAddress} mapsUrl={ceremonyUrl} />
            </V2StaggerItem>
            <V2StaggerItem>
              <Card title={t('reception')} venue={receptionVenue} address={receptionAddress} mapsUrl={receptionMapsUrl} />
            </V2StaggerItem>
          </div>
        </V2Stagger>
      </V2Container>
    </V2Section>
  );
}
