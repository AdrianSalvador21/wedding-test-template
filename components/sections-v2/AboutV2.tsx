'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding, selectCouple } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V2Container, V2Section, V2Stagger, V2StaggerItem, V2Title } from './ui';

export default function AboutV2() {
  const { t } = useTranslations('about');
  const params = useParams();
  const currentLocale = params.locale as string;
  const currentWedding = useAppSelector(selectCurrentWedding);
  const couple = useAppSelector(selectCouple);
  const { getBackgroundStyle } = useThemePatterns();
  const { coupleImage } = useWeddingImages(currentWedding?.id);

  const storyText = typeof couple?.story === 'object' && couple.story
    ? (couple.story[currentLocale as 'es' | 'en'] || couple.story.es || '')
    : (couple?.story as unknown as string || t('story'));

  const quoteText = typeof couple?.quote === 'object' && couple.quote
    ? (couple.quote[currentLocale as 'es' | 'en'] || couple.quote.es || '')
    : (couple?.quote as unknown as string || '');

  return (
    <V2Section
      id="about"
      className="relative overflow-hidden"
      style={{
        ...getBackgroundStyle(1, '200px'),
        backgroundSize: '1273px 845px'
      }}
    >
      <V2Container className="py-12">
        <V2Stagger>
          <V2StaggerItem>
            <V2Title title={t('title')} />
          </V2StaggerItem>

          <div className="mt-10 max-w-5xl mx-auto">
            {quoteText && (
              <V2StaggerItem>
                <blockquote className="text-center font-serif italic text-[#6f6254] text-lg md:text-xl leading-relaxed px-2 md:px-10">
                  &ldquo;{formatTextWithLineBreaks(quoteText)}&rdquo;
                </blockquote>
              </V2StaggerItem>
            )}

            <V2StaggerItem>
              <div className="mt-10 flex justify-center">
                <div className="h-px w-24 bg-[#d7c2a5]" />
              </div>
            </V2StaggerItem>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <V2StaggerItem className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-[28px] border border-[#e7dccf] bg-white">
                  <Image
                    src={coupleImage}
                    alt={`${couple?.bride.name || 'Novia'} y ${couple?.groom.name || 'Novio'}`}
                    width={900}
                    height={1100}
                    className="object-cover w-full h-full"
                  />
                </div>
              </V2StaggerItem>

              <V2StaggerItem className="lg:col-span-7">
                <p className="text-base md:text-base text-[#6f6254] leading-relaxed text-center">
                  {formatTextWithLineBreaks(storyText)}
                </p>
                <div className="mt-10 flex justify-center">
                  <div className="h-px w-24 bg-[#d7c2a5]" />
                </div>
              </V2StaggerItem>
            </div>
          </div>
        </V2Stagger>
      </V2Container>
    </V2Section>
  );
}
