'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V2Card, V2Container, V2Section, V2Stagger, V2StaggerItem, V2Title } from './ui';

export default function AdultOnlyEventV2() {
  const { t } = useTranslations('adultOnlyEvent');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();
  const params = useParams();
  const currentLocale = params.locale as string;

  if (!weddingData?.adultOnlyEvent?.enabled) {
    return null;
  }

  const messageData = weddingData.adultOnlyEvent.message;
  const message = typeof messageData === 'object'
    ? (messageData[currentLocale as 'es' | 'en'] || messageData.es || t('description'))
    : (messageData || t('description'));

  return (
    <V2Section
      id="adult-only"
      className="relative overflow-hidden"
      style={getBackgroundStyle(2, '180px')}
    >
      <V2Container className="py-12">
        <V2Stagger>
          <V2StaggerItem>
            <V2Title title={t('title')} />
          </V2StaggerItem>

          <V2StaggerItem>
            <div className="mt-10 max-w-3xl mx-auto">
              <V2Card className="p-8 md:p-10 text-center">
                <p className="text-base md:text-base text-[#6f6254] leading-relaxed">
                  {formatTextWithLineBreaks(message)}
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="h-px w-24 bg-[#d7c2a5]" />
                </div>
              </V2Card>
            </div>
          </V2StaggerItem>
        </V2Stagger>
      </V2Container>
    </V2Section>
  );
}
