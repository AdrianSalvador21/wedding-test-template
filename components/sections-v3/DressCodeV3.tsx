'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V3BgMotif, V3Card, V3Container, V3CornerFlourish, V3EyebrowTitle, V3IconWrap, V3Reveal, V3Section, v3Colors } from './ui';

export default function DressCodeV3() {
  const { t } = useTranslations('dressCode');
  const params = useParams();
  const currentLocale = params.locale as string;
  const weddingData = useAppSelector(selectCurrentWedding);

  const dressCodeData = weddingData?.event.dressCode;
  const dressCodeStyle = typeof dressCodeData?.style === 'object' && dressCodeData.style
    ? (dressCodeData.style[currentLocale as 'es' | 'en'] || dressCodeData.style.es || '')
    : ((dressCodeData?.style as unknown as string) || '');
  const dressCodeDescription = typeof dressCodeData?.description === 'object' && dressCodeData.description
    ? (dressCodeData.description[currentLocale as 'es' | 'en'] || dressCodeData.description.es || '')
    : ((dressCodeData?.description as unknown as string) || '');

  if (!dressCodeStyle && !dressCodeDescription) return null;

  return (
    <V3Section id="dresscode">
      <V3BgMotif patternId="v3-lp-dresscode" tileSize={270} rotate={-10} />
      <V3CornerFlourish corner="top-right" width={140} height={92} opacity={0.5} />
      <V3Container className="py-16 md:py-24">
        <V3Reveal>
          <V3EyebrowTitle title={t('title')} />
        </V3Reveal>

        <V3Reveal delay={0.1} className="mt-14 max-w-2xl mx-auto">
          <V3Card className="p-8 md:p-10 text-center">
            <V3IconWrap className="mx-auto mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M6 4l6 4 6-4M6 4v9a6 6 0 0 0 12 0V4" />
              </svg>
            </V3IconWrap>
            {dressCodeStyle && (
              <p className="font-cormorant italic text-2xl" style={{ color: v3Colors.ink }}>
                {formatTextWithLineBreaks(dressCodeStyle)}
              </p>
            )}
            {dressCodeDescription && (
              <p className="mt-4 font-jost text-sm md:text-[15px] leading-relaxed text-[#6B6255]">
                {formatTextWithLineBreaks(dressCodeDescription)}
              </p>
            )}
          </V3Card>
        </V3Reveal>
      </V3Container>
    </V3Section>
  );
}
