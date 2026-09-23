'use client';

import { useParams } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { openExternalLink } from '@/lib/utils';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V3BgMotif, V3Card, V3Container, V3CornerFlourish, V3EyebrowTitle, V3PillButton, V3Reveal, V3Section } from './ui';

export default function LocationV3() {
  const { t } = useTranslations('location');
  const params = useParams();
  const currentLocale = params.locale as string;
  const weddingData = useAppSelector(selectCurrentWedding);

  const ceremonyVenueName = typeof weddingData?.event.ceremonyVenue?.name === 'object' && weddingData.event.ceremonyVenue.name
    ? (weddingData.event.ceremonyVenue.name[currentLocale as 'es' | 'en'] || weddingData.event.ceremonyVenue.name.es || '')
    : ((weddingData?.event.ceremonyVenue?.name as unknown as string) || '');
  const ceremonyAddress = weddingData?.event.ceremonyVenue?.address || '';
  const ceremonyUrl = weddingData?.event.ceremonyVenue?.mapsUrl || '';

  const receptionVenueName = typeof weddingData?.event.receptionVenue?.name === 'object' && weddingData.event.receptionVenue.name
    ? (weddingData.event.receptionVenue.name[currentLocale as 'es' | 'en'] || weddingData.event.receptionVenue.name.es || '')
    : ((weddingData?.event.receptionVenue?.name as unknown as string) || '');
  const receptionAddress = weddingData?.event.receptionVenue?.address || '';
  const receptionMapsUrl = weddingData?.event.receptionVenue?.mapsUrl || '';

  const venues = [
    { title: t('ceremony'), venue: ceremonyVenueName, address: ceremonyAddress, mapsUrl: ceremonyUrl },
    { title: t('reception'), venue: receptionVenueName, address: receptionAddress, mapsUrl: receptionMapsUrl },
  ].filter((v) => v.venue);

  if (!venues.length) return null;

  return (
    <V3Section id="location" tinted>
      <V3BgMotif patternId="v3-lp-location" tileSize={230} rotate={12} />
      <V3CornerFlourish corner="bottom-left" width={140} height={92} opacity={0.5} />
      <V3Container className="py-16 md:py-24">
        <V3Reveal>
          <V3EyebrowTitle title={t('title')} />
        </V3Reveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {venues.map((v) => (
            <V3Reveal key={v.title}>
              <V3Card className="p-8 text-center h-full flex flex-col">
                <p className="font-jost text-[11px] tracking-[0.24em] uppercase text-[#8C8172]">{v.title}</p>
                <h3 className="mt-3 font-cormorant italic text-2xl text-[#34302A]">{v.venue}</h3>
                {v.address && <p className="mt-2 font-jost text-sm text-[#6B6255]">{v.address}</p>}
                <div className="flex justify-center mt-auto pt-6">
                  <V3PillButton onClick={() => openExternalLink(v.mapsUrl)}>
                    <MapPin className="w-4 h-4" />
                    {t('directions')}
                  </V3PillButton>
                </div>
              </V3Card>
            </V3Reveal>
          ))}
        </div>
      </V3Container>
    </V3Section>
  );
}
