'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding, selectCouple } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V3Container, V3CornerFlourish, V3EyebrowTitle, V3PhotoArch, V3Reveal, V3Section } from './ui';

export default function AboutV3() {
  const { t } = useTranslations('about');
  const params = useParams();
  const currentLocale = params.locale as string;
  const currentWedding = useAppSelector(selectCurrentWedding);
  const couple = useAppSelector(selectCouple);
  const { coupleImage } = useWeddingImages(currentWedding?.id);

  const storyText = typeof couple?.story === 'object' && couple.story
    ? (couple.story[currentLocale as 'es' | 'en'] || couple.story.es || '')
    : ((couple?.story as unknown as string) || t('story'));

  return (
    <V3Section id="about">
      <V3CornerFlourish corner="bottom-left" width={150} height={98} opacity={0.55} />
      <V3Container className="py-16 md:py-24">
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center max-w-6xl mx-auto">
          <V3Reveal direction="left" className="w-full md:flex-[0_0_380px]">
            <V3PhotoArch
              label="Foto de la pareja"
              imageUrl={coupleImage}
              imageAlt={`${couple?.bride.name || 'Novia'} y ${couple?.groom.name || 'Novio'}`}
              archClassName="rounded-[6px]"
              className="h-[320px] md:h-[440px]"
            />
          </V3Reveal>

          <V3Reveal direction="right" delay={0.1} className="w-full md:flex-1">
            <V3EyebrowTitle title={t('title')} align="left" />
            <p className="mt-6 font-jost text-[15.5px] leading-[1.8] text-[#6B6255]">
              {formatTextWithLineBreaks(storyText)}
            </p>
          </V3Reveal>
        </div>
      </V3Container>
    </V3Section>
  );
}
