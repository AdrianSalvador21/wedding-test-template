'use client';

import { CalendarPlus } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { buildWeddingIcs, downloadIcs, getWeddingIcsFilename } from '../../lib/calendar';
import { V2Button } from './ui';

// "Agregar al calendario" (spec 25): descarga un .ics generado solo con datos existentes.
export default function AddToCalendarButtonV2({
  variant = 'secondary',
  size = 'md',
  className = '',
}: {
  variant?: 'secondary' | 'inverse';
  size?: 'lg' | 'md';
  className?: string;
}) {
  const { t, currentLanguage } = useTranslations('template02');
  const wedding = useAppSelector(selectCurrentWedding);

  if (!wedding?.event?.date) return null;

  const handleClick = () => {
    downloadIcs(getWeddingIcsFilename(wedding, currentLanguage), buildWeddingIcs(wedding, currentLanguage));
  };

  return (
    <V2Button variant={variant} size={size} onClick={handleClick} className={className}>
      <CalendarPlus className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.6} />
      {t('hero.addToCalendar')}
    </V2Button>
  );
}
