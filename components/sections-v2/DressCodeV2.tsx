'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V2Card, V2Container, V2Section, V2Title } from './ui';

export default function DressCodeV2() {
  const { t } = useTranslations('dressCode');
  const params = useParams();
  const currentLocale = params.locale as string;
  const { isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);

  const dressCodeData = weddingData?.event.dressCode;
  const dressCodeStyle = typeof dressCodeData?.style === 'object' && dressCodeData.style
    ? (dressCodeData.style[currentLocale as 'es' | 'en'] || dressCodeData.style.es || '')
    : (dressCodeData?.style as unknown as string || '');

  const dressCodeDescription = typeof dressCodeData?.description === 'object' && dressCodeData.description
    ? (dressCodeData.description[currentLocale as 'es' | 'en'] || dressCodeData.description.es || '')
    : (dressCodeData?.description as unknown as string || '');

  if (!dressCodeStyle && !dressCodeDescription) {
    return null;
  }

  const displayStyle = dressCodeStyle || t('style.name');
  const displayDescription = dressCodeDescription || t('style.description');

  if (!isLoaded) {
    return (
      <V2Section id="dresscode">
        <V2Container className="py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-[#e9ded2] rounded w-40" />
            <div className="h-10 bg-[#efe6dc] rounded w-80" />
            <div className="h-4 bg-[#efe6dc] rounded w-full max-w-2xl" />
          </div>
        </V2Container>
      </V2Section>
    );
  }

  return (
    <V2Section id="dresscode">
      <V2Container className="py-12">
        <V2Title title={t('title')} />

        <div className="mt-10 max-w-3xl mx-auto">
          <V2Card className="p-8 md:p-10">
            <div className="inline-flex items-center rounded-full border border-[#eadfd3] bg-white px-5 py-2 text-sm text-[#6f6254]">
              <span className="h-2 w-2 rounded-full bg-[#b79a7a] mr-2" />
              <span className="font-serif">{formatTextWithLineBreaks(displayStyle)}</span>
            </div>
            <p className="mt-6 text-sm md:text-base leading-relaxed text-[#6f6254]">
              {formatTextWithLineBreaks(displayDescription)}
            </p>
          </V2Card>
        </div>
      </V2Container>
    </V2Section>
  );
}
