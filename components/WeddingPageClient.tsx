'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../src/store/hooks';
import { fetchWeddingData } from '../src/store/slices/weddingSlice';
import WeddingTemplate from './WeddingTemplate';

interface WeddingPageClientProps {
  weddingId: string;
  guestId: string | null;
  previewFull?: boolean; // Spec 27 — ?preview=full
  previewSaveTheDate?: boolean; // Spec 27 — ?preview=save-the-date o /aparta-la-fecha
  demoGuestName?: string | null; // Spec 27 — ?invitado= en las demos de save the date
  previewEventDay?: boolean; // Spec 32 — ?preview=event-day
}

export default function WeddingPageClient({ weddingId, guestId, previewFull = false, previewSaveTheDate = false, demoGuestName = null, previewEventDay = false }: WeddingPageClientProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (weddingId) {
      dispatch(fetchWeddingData({ weddingId, guestId: guestId || undefined }));
    }
  }, [weddingId, guestId, dispatch]);

  return <WeddingTemplate guestId={guestId} weddingId={weddingId} previewFull={previewFull} previewSaveTheDate={previewSaveTheDate} demoGuestName={demoGuestName} previewEventDay={previewEventDay} />;
} 