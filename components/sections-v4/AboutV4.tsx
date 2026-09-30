'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding, selectCouple } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V4Container, V4PhotoArch, V4Reveal, V4Section, V4SectionHeading, v4Colors } from './ui';

export default function AboutV4() {
  const { t } = useTranslations('about');
  const params = useParams();
  const currentLocale = params.locale as string;
  const currentWedding = useAppSelector(selectCurrentWedding);
  const couple = useAppSelector(selectCouple);
  const { coupleImage } = useWeddingImages(currentWedding?.id);

  const quoteText = typeof couple?.quote === 'object' && couple.quote
    ? (couple.quote[currentLocale as 'es' | 'en'] || couple.quote.es || '')
    : ((couple?.quote as unknown as string) || '');

  const storyText = typeof couple?.story === 'object' && couple.story
    ? (couple.story[currentLocale as 'es' | 'en'] || couple.story.es || '')
    : ((couple?.story as unknown as string) || t('story'));

  return (
    <V4Section id="about">
      <V4Container className="py-16 md:py-24 text-center">
        <V4Reveal>
          <V4SectionHeading numeral="I" eyebrow={t('title')} />
        </V4Reveal>

        {quoteText && (
          <V4Reveal delay={0.08}>
            <p className="mt-8 text-2xl md:text-3xl italic leading-snug max-w-lg mx-auto" style={{ color: v4Colors.ink }}>
              {formatTextWithLineBreaks(quoteText)}
            </p>
          </V4Reveal>
        )}

        <V4Reveal delay={0.14}>
          <p className="mt-6 text-[15.5px] leading-[1.8] max-w-md mx-auto" style={{ color: v4Colors.body }}>
            {formatTextWithLineBreaks(storyText)}
          </p>
        </V4Reveal>

        <V4Reveal delay={0.2} className="mt-10">
          <V4PhotoArch
            label="Foto de la pareja"
            imageUrl={coupleImage}
            imageAlt={`${couple?.bride.name || 'Novia'} y ${couple?.groom.name || 'Novio'}`}
            className="w-[260px] h-[320px] mx-auto"
          />
        </V4Reveal>
      </V4Container>
    </V4Section>
  );
}
