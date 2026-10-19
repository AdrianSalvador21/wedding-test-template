'use client';

import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V2_COLORS, V2Container, V2Section, V2SectionHeading, V2SectionLayout, v2DisplayStyle } from './ui';
import { useV2SectionNumber, v2Localized } from './sections';

export default function DressCodeV2() {
  const { t, currentLanguage } = useTranslations('template02');
  const { t: tDress } = useTranslations('dressCode');
  const weddingData = useAppSelector(selectCurrentWedding);
  const number = useV2SectionNumber('dresscode');

  const dressCodeData = weddingData?.event.dressCode;
  const dressCodeStyle = v2Localized(dressCodeData?.style, currentLanguage);
  const dressCodeDescription = v2Localized(dressCodeData?.description, currentLanguage);

  if (!dressCodeStyle && !dressCodeDescription) {
    return null;
  }

  const displayStyle = dressCodeStyle || tDress('style.name');
  const displayDescription = dressCodeDescription || tDress('style.description');

  return (
    <V2Section
      id="dresscode"
      tone="paper"
      bordered
      style={{ borderBottom: `1px solid ${V2_COLORS.rule}` }}
    >
      <V2Container className="py-16 pb-[72px] lg:py-24">
        <V2SectionLayout heading={<V2SectionHeading number={number} overline={t('dressCode.overline')} />}>
            <div className="flex items-end gap-4">
              <h2
                className="m-0 flex-grow text-[48px] lg:text-[64px]"
                style={{ ...v2DisplayStyle(48, 300, -0.045), fontSize: undefined, lineHeight: 0.98 }}
              >
                {formatTextWithLineBreaks(displayStyle)}
              </h2>
              <svg
                width="64"
                height="96"
                viewBox="0 0 64 96"
                fill="none"
                stroke={V2_COLORS.bronzeLight}
                strokeWidth="1.2"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0"
              >
                <path d="M32 6c-4 0-6 3-6 6 0 4 6 5 6 9v4L6 44h52L32 25" />
                <path d="M14 52h36l4 38H10z" />
              </svg>
            </div>
            <p
              className="m-0 pt-5 text-base leading-[1.7]"
              style={{ borderTop: `1px solid ${V2_COLORS.rule}`, color: V2_COLORS.graphite }}
            >
              {formatTextWithLineBreaks(displayDescription)}
            </p>
          </V2SectionLayout>
      </V2Container>
    </V2Section>
  );
}
