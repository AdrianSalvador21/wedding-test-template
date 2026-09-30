'use client';

import { useParams } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { openExternalLink } from '@/lib/utils';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V4Button, V4Container, V4Reveal, V4Section, V4SectionHeading, v4Colors } from './ui';

export default function LocationV4() {
  const { t } = useTranslations('location');
  const params = useParams();
  const currentLocale = params.locale as string;
  const weddingData = useAppSelector(selectCurrentWedding);

  const ceremonyVenue = weddingData?.event.ceremonyVenue;
  const ceremonyName = typeof ceremonyVenue?.name === 'object' && ceremonyVenue.name
    ? (ceremonyVenue.name[currentLocale as 'es' | 'en'] || ceremonyVenue.name.es || '')
    : ((ceremonyVenue?.name as unknown as string) || '');

  const receptionVenue = weddingData?.event.receptionVenue;
  const receptionName = typeof receptionVenue?.name === 'object' && receptionVenue.name
    ? (receptionVenue.name[currentLocale as 'es' | 'en'] || receptionVenue.name.es || '')
    : ((receptionVenue?.name as unknown as string) || '');

  const venues = [
    { key: 'ceremony', label: t('ceremony'), name: ceremonyName, address: ceremonyVenue?.address, mapsUrl: ceremonyVenue?.mapsUrl },
    { key: 'reception', label: t('reception'), name: receptionName, address: receptionVenue?.address, mapsUrl: receptionVenue?.mapsUrl },
  ].filter((v) => v.name);

  if (!venues.length) return null;

  const weddingDate = weddingData?.event.date ? new Date(weddingData.event.date) : undefined;
  const formattedDate = weddingDate
    ? weddingDate.toLocaleDateString(currentLocale === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
    : '';

  return (
    <V4Section id="location">
      <V4Container className="py-16 md:py-24 text-center">
        <V4Reveal>
          <V4SectionHeading numeral="IV" eyebrow={t('title')} />
        </V4Reveal>

        {formattedDate && (
          <V4Reveal delay={0.05}>
            <p className="mt-6 text-sm tracking-[0.1em]" style={{ color: v4Colors.body }}>{formattedDate}</p>
          </V4Reveal>
        )}

        <div className="mt-10 space-y-10 max-w-sm mx-auto">
          {venues.map((venue) => (
            <V4Reveal key={venue.key} delay={0.1}>
              <p className="text-[11px] font-sans tracking-[0.2em] uppercase" style={{ color: v4Colors.accent }}>
                {venue.label}
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl uppercase leading-tight" style={{ color: v4Colors.ink }}>
                {venue.name}
              </h2>
              {venue.address && (
                <p className="mt-2 italic text-[15px]" style={{ color: v4Colors.body }}>{venue.address}</p>
              )}
              {venue.mapsUrl && (
                <div className="mt-5">
                  <V4Button onClick={() => openExternalLink(venue.mapsUrl as string)}>
                    <MapPin className="w-3.5 h-3.5" />
                    {t('directions')}
                  </V4Button>
                </div>
              )}
            </V4Reveal>
          ))}
        </div>
      </V4Container>
    </V4Section>
  );
}
