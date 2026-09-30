'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V4Container, V4Reveal, V4Section, v4Colors } from './ui';

export default function AdultOnlyEventV4() {
  const { t } = useTranslations('adultOnlyEvent');
  const weddingData = useAppSelector(selectCurrentWedding);
  const params = useParams();
  const currentLocale = params.locale as string;

  if (!weddingData?.adultOnlyEvent?.enabled) return null;

  const messageData = weddingData.adultOnlyEvent.message;
  const message = typeof messageData === 'object'
    ? (messageData[currentLocale as 'es' | 'en'] || messageData.es || t('description'))
    : (messageData || t('description'));

  return (
    <V4Section id="adult-only">
      <V4Container className="py-12 md:py-16">
        <V4Reveal>
          <div
            className="flex flex-col items-center text-center gap-3 py-8 px-6 border-t border-b"
            style={{ borderColor: 'rgba(43,42,34,.22)' }}
          >
            <p className="text-[10px] font-sans tracking-[0.2em] uppercase" style={{ color: v4Colors.accent }}>
              IX — {t('title')}
            </p>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={v4Colors.ink} strokeWidth="1.3" aria-hidden="true">
              <path d="M6 3h12l-1 6a5 5 0 0 1-10 0L6 3Z" />
              <path d="M12 14v5M9 21h6" />
            </svg>
            <p className="text-[17px] leading-relaxed max-w-xs" style={{ color: v4Colors.ink }}>
              {formatTextWithLineBreaks(message)}
            </p>
          </div>
        </V4Reveal>
      </V4Container>
    </V4Section>
  );
}
