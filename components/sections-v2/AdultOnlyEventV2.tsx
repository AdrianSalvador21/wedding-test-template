'use client';

import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V2_COLORS, V2Container, V2Reveal, V2Section, v2DisplayStyle } from './ui';
import { v2Localized } from './sections';

// Aviso "Solo adultos" de template-02: va justo antes del RSVP (spec 25), sin número de sección.
export default function AdultOnlyEventV2() {
  const { t, currentLanguage } = useTranslations('template02');
  const { t: tAdult } = useTranslations('adultOnlyEvent');
  const weddingData = useAppSelector(selectCurrentWedding);

  if (!weddingData?.adultOnlyEvent?.enabled) {
    return null;
  }

  const message = v2Localized(weddingData.adultOnlyEvent.message, currentLanguage) || tAdult('description');

  return (
    <V2Section id="adult-only">
      <V2Container className="py-14 pb-12 lg:py-16">
        <V2Reveal>
          <div
            className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-4 rounded-md p-5 lg:mx-auto lg:max-w-[760px] lg:gap-x-6 lg:p-7"
            style={{ border: `1px solid ${V2_COLORS.rule}`, backgroundColor: V2_COLORS.paper }}
          >
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ ...v2DisplayStyle(22, 400, -0.02), border: `1px solid ${V2_COLORS.bronze}`, color: V2_COLORS.bronze }}
              aria-hidden="true"
            >
              +18
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: V2_COLORS.graphite }}>
                {t('adultOnly.title')}
              </h2>
              <p className="m-0 text-[15px] leading-normal">{formatTextWithLineBreaks(message)}</p>
            </div>
          </div>
        </V2Reveal>
      </V2Container>
    </V2Section>
  );
}
