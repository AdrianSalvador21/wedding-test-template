'use client';

import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useWeddingImages } from '../../hooks/useWeddingImages';
import { V4Container, V4Reveal, V4Section, V4SectionHeading, v4Colors } from './ui';

export default function GalleryV4() {
  const { t } = useTranslations('gallery');
  const weddingData = useAppSelector(selectCurrentWedding);
  const { galleryImages } = useWeddingImages(weddingData?.id);

  const photos = (weddingData?.gallery?.length ? weddingData.gallery.map((g) => g.url) : galleryImages).slice(0, 9);

  if (!photos.length) return null;

  return (
    <V4Section id="gallery" tinted>
      <V4Container className="py-16 md:py-24 text-center">
        <V4Reveal>
          <V4SectionHeading numeral="III" eyebrow={t('title')} />
        </V4Reveal>

        {/* Intercalado: fila 1 foto ancho completo, fila 2 fotos, repitiendo cada 3 elementos */}
        <div className="mt-12 grid grid-cols-2 gap-2 md:gap-3">
          {photos.map((src, index) => {
            const isFullWidth = index % 3 === 0;
            return (
              <div
                key={`${src}-${index}`}
                className={`overflow-hidden ${isFullWidth ? 'col-span-2 aspect-[16/10]' : 'aspect-square'}`}
                style={{ background: v4Colors.goldLine }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Foto ${index + 1} de la boda`}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </V4Container>
    </V4Section>
  );
}
