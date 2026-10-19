'use client';

import { MapPin } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import {
  V2_COLORS,
  V2Container,
  V2Section,
  V2SectionHeading,
  V2SectionLayout,
  V2Stagger,
  V2StaggerItem,
  v2ButtonProps,
  v2DisplayStyle,
} from './ui';
import { useV2SectionNumber, v2Venues } from './sections';

interface Stop {
  key: string;
  label: string;
  name: string;
  address: string;
  mapsUrl: string;
}

const mapsHref = (stop: Stop) =>
  stop.mapsUrl || `https://maps.google.com/maps?q=${encodeURIComponent([stop.name, stop.address].filter(Boolean).join(' '))}`;

export default function LocationV2() {
  const { t, currentLanguage } = useTranslations('template02');
  const weddingData = useAppSelector(selectCurrentWedding);
  const number = useV2SectionNumber('location');
  const { ceremony, reception, sameVenue } = v2Venues(weddingData, currentLanguage);

  if (!ceremony && !reception) return null;

  // Si ambas sedes se llaman igual se muestran como una sola parada (spec 25).
  const stops: Stop[] = sameVenue
    ? [{ key: 'both', label: t('location.both'), ...(reception ?? ceremony)! }]
    : [
        ...(ceremony ? [{ key: 'ceremony', label: t('location.ceremony'), ...ceremony }] : []),
        ...(reception ? [{ key: 'reception', label: t('location.reception'), ...reception }] : []),
      ];

  const title = stops.length > 1 ? t('location.titleTwo') : t('location.titleOne');

  return (
    <V2Section id="location" tone="paper" bordered>
      <V2Container className="py-16 pb-[72px] lg:py-24">
        <V2SectionLayout heading={<V2SectionHeading number={number} overline={t('location.overline')} title={title} />}>
            <V2Stagger as="ol" className="m-0 flex list-none flex-col p-0 md:grid md:grid-cols-2 md:gap-x-10 lg:flex lg:flex-col">
              {stops.map((stop, index) => {
                const isLast = index === stops.length - 1;
                const filled = isLast;
                return (
                  <V2StaggerItem as="li" key={stop.key} className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-4">
                    <div className="flex flex-col items-center">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[15px]"
                        style={{
                          fontFamily: v2DisplayStyle(15).fontFamily,
                          ...(filled
                            ? { backgroundColor: V2_COLORS.ink, color: V2_COLORS.stone }
                            : { border: `1px solid ${V2_COLORS.bronze}`, color: V2_COLORS.bronze }),
                        }}
                        aria-hidden="true"
                      >
                        {stops.length > 1 ? String.fromCharCode(65 + index) : <MapPin className="h-4 w-4" strokeWidth={1.7} />}
                      </span>
                      {!isLast && (
                        <span aria-hidden="true" className="my-1.5 w-px flex-grow md:hidden lg:block" style={{ backgroundColor: V2_COLORS.rule }} />
                      )}
                    </div>
                    <div className={`flex flex-col gap-2 ${isLast ? '' : 'pb-9'}`}>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: V2_COLORS.graphite }}>
                        {stop.label}
                      </span>
                      <h3 className="m-0" style={{ ...v2DisplayStyle(26, 400, -0.025), lineHeight: 1.1 }}>
                        {stop.name}
                      </h3>
                      {stop.address && (
                        <p className="m-0 text-[15px] leading-[1.55]" style={{ color: V2_COLORS.graphite }}>
                          {stop.address}
                        </p>
                      )}
                      <a
                        href={mapsHref(stop)}
                        target="_blank"
                        rel="noopener noreferrer"
                        {...v2ButtonProps(filled ? 'primary' : 'secondary', 'sm', 'mt-2 self-start px-5 text-sm')}
                      >
                        <MapPin className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} />
                        {t('location.directions')}
                      </a>
                    </div>
                  </V2StaggerItem>
                );
              })}
            </V2Stagger>
          </V2SectionLayout>
      </V2Container>
    </V2Section>
  );
}
