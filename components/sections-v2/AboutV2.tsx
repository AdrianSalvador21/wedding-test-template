'use client';

import Image from 'next/image';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding, selectCouple } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V2_COLORS, V2Container, V2Section, V2SectionHeading, V2SectionLayout, v2DisplayStyle } from './ui';
import { useV2SectionNumber, v2Fill, v2Localized } from './sections';

export default function AboutV2() {
  const { t, currentLanguage } = useTranslations('template02');
  const { t: tAbout } = useTranslations('about');
  const currentWedding = useAppSelector(selectCurrentWedding);
  const couple = useAppSelector(selectCouple);
  const { coupleImage } = useWeddingImages(currentWedding?.id);
  const number = useV2SectionNumber('about');

  const storyText = v2Localized(couple?.story, currentLanguage) || tAbout('story');
  const quoteText = v2Localized(couple?.quote, currentLanguage);
  const brideName = couple?.bride.name || '';
  const groomName = couple?.groom.name || '';

  return (
    <V2Section id="about">
      <V2Container className="py-[72px] pb-16 lg:py-24">
          <V2SectionLayout
            heading={
              <div className="flex flex-col gap-9">
                <V2SectionHeading number={number} overline={t('about.overline')} title={t('about.title')} />
                {quoteText && (
                  <blockquote className="m-0 flex flex-col gap-3">
                    <span aria-hidden="true" style={{ ...v2DisplayStyle(72, 300), lineHeight: 0.6, color: V2_COLORS.bronze }}>
                      &ldquo;
                    </span>
                    <p className="m-0 text-[28px] lg:text-[32px]" style={{ ...v2DisplayStyle(28, 300, -0.025), fontSize: undefined, lineHeight: 1.2 }}>
                      {formatTextWithLineBreaks(quoteText)}
                    </p>
                  </blockquote>
                )}
              </div>
            }
          >
            {/* Foto de pareja enmarcada por los anillos */}
            <div className="relative mx-auto flex h-[380px] w-full max-w-[380px] items-center justify-center lg:h-[460px] lg:max-w-[460px]">
              <svg
                viewBox="0 0 380 380"
                fill="none"
                stroke={V2_COLORS.bronzeLight}
                strokeWidth="1"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full"
              >
                <circle cx="190" cy="190" r="186" opacity=".55" />
                <circle cx="190" cy="190" r="168" opacity=".35" />
              </svg>
              <div className="relative h-[300px] w-[300px] overflow-hidden rounded-full lg:h-[364px] lg:w-[364px]">
                {coupleImage && (
                  <Image
                    src={coupleImage}
                    alt={v2Fill(t('about.photoAlt'), { bride: brideName, groom: groomName })}
                    fill
                    sizes="(min-width: 1024px) 364px, 300px"
                    className="object-cover"
                    style={{ objectPosition: '55% 30%' }}
                  />
                )}
              </div>
              {couple?.hashtag && (
                <span
                  className="absolute bottom-[26px] right-2 flex h-9 items-center rounded-full px-[14px] text-xs font-semibold tracking-[0.04em]"
                  style={{ backgroundColor: V2_COLORS.ink, color: V2_COLORS.stone }}
                >
                  {couple.hashtag}
                </span>
              )}
            </div>

            <p className="m-0 text-base leading-[1.75]" style={{ color: V2_COLORS.graphite }}>
              {formatTextWithLineBreaks(storyText)}
            </p>
          </V2SectionLayout>
      </V2Container>
    </V2Section>
  );
}
