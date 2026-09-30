'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V4Container, V4Reveal, V4Section, V4SectionHeading, v4Colors } from './ui';

export default function DressCodeV4() {
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
    <V4Section id="dresscode">
      <V4Container className="py-16 md:py-24 text-center">
        <V4Reveal>
          <V4SectionHeading numeral="VI" eyebrow={t('title')} />
        </V4Reveal>

        {dressCodeStyle && (
          <V4Reveal delay={0.08}>
            <h2 className="mt-4 text-3xl md:text-4xl uppercase" style={{ color: v4Colors.ink }}>
              {dressCodeStyle}
            </h2>
          </V4Reveal>
        )}

        {dressCodeDescription && (
          <V4Reveal delay={0.12}>
            <p className="mt-5 text-[15px] leading-[1.7] max-w-md mx-auto" style={{ color: v4Colors.body }}>
              {formatTextWithLineBreaks(dressCodeDescription)}
            </p>
          </V4Reveal>
        )}
      </V4Container>
    </V4Section>
  );
}
