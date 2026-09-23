'use client';

import { Camera } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { V3BgMotif, V3Container, V3CornerFlourish, V3EyebrowTitle, V3PillButton, V3Reveal, V3Section, V3Stagger, V3StaggerItem } from './ui';

export default function GalleryV3() {
  const { t } = useTranslations('gallery');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { galleryImages } = useWeddingImages(weddingData?.id);

  const photos = (weddingData?.gallery?.length ? weddingData.gallery.map((g) => g.url) : galleryImages).slice(0, 6);
  const hashtag = weddingData?.couple.hashtag || t('hashtag');

  if (!photos.length) return null;

  return (
    <V3Section id="gallery" tinted>
      <V3BgMotif patternId="v3-lp-gallery" tileSize={220} rotate={10} />
      <V3CornerFlourish corner="top-right" width={150} height={100} opacity={0.55} />
      <V3Container className="py-16 md:py-24">
        <V3Reveal>
          <V3EyebrowTitle eyebrow={t('title')} title={t('everyMomentCounts')} />
        </V3Reveal>

        <V3Stagger className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
          {photos.map((src, index) => (
            <V3StaggerItem key={`${src}-${index}`}>
              <div className="v3-gallery-item relative overflow-hidden rounded-[4px] h-[180px] md:h-[230px] bg-[#E7DECD]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Foto ${index + 1} de la boda`}
                  className="v3-gallery-zoom absolute inset-0 w-full h-full object-cover transition-transform duration-500"
                />
                <div className="v3-gallery-caption absolute inset-x-0 bottom-0 px-4 py-3 font-jost text-[11px] text-[#F5EFE3] opacity-0 transition-opacity duration-300" style={{ background: 'linear-gradient(transparent, rgba(30,26,20,0.55))' }}>
                  {t('caption')}
                </div>
              </div>
            </V3StaggerItem>
          ))}
        </V3Stagger>

        <V3Reveal delay={0.15} className="mt-12 text-center">
          <p className="font-jost text-sm text-[#6B6255] mb-5">
            {t('cameraMessage')} <span className="font-medium text-[#34302A]">{hashtag}</span> {t('hashtagPrompt')}
          </p>
          <V3PillButton className="pointer-events-none select-none">
            <Camera className="w-4 h-4" />
            {hashtag}
          </V3PillButton>
        </V3Reveal>
      </V3Container>
    </V3Section>
  );
}
