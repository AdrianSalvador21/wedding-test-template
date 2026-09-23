'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V3Card, V3Container, V3CornerFlourish, V3Divider, V3EyebrowTitle, V3Reveal, V3Section } from './ui';

export default function AdultOnlyEventV3() {
  const { t } = useTranslations('adultOnlyEvent');
  const weddingData = useAppSelector(selectCurrentWedding);
  const params = useParams();
  const currentLocale = params.locale as string;

  if (!weddingData?.adultOnlyEvent?.enabled) return null;

  const messageData = weddingData.adultOnlyEvent.message;
  const message = typeof messageData === 'object'
    ? (messageData[currentLocale as 'es' | 'en'] || messageData.es || t('description'))
    : (messageData || t('description'));

  return (
    <V3Section id="adult-only" tinted>
      <V3CornerFlourish corner="bottom-right" width={140} height={92} opacity={0.5} />
      <V3Container className="py-16 md:py-24">
        <V3Reveal>
          <V3EyebrowTitle title={t('title')} />
        </V3Reveal>

        <V3Reveal delay={0.1} className="mt-12 max-w-2xl mx-auto">
          <V3Card className="p-8 md:p-10 text-center">
            <p className="font-jost text-sm md:text-[15px] leading-relaxed text-[#6B6255]">
              {formatTextWithLineBreaks(message)}
            </p>
            <V3Divider className="mt-8" />
          </V3Card>
        </V3Reveal>
      </V3Container>
    </V3Section>
  );
}
