'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '../src/store/hooks';
import { fetchWeddingData } from '../src/store/slices/weddingSlice';
import WeddingTemplate from './WeddingTemplate';

interface WeddingPageClientProps {
  weddingId: string;
  guestId: string | null;
}

export default function WeddingPageClient({ weddingId, guestId }: WeddingPageClientProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (weddingId) {
      dispatch(fetchWeddingData(weddingId));
    }
  }, [weddingId, dispatch]);

  return <WeddingTemplate guestId={guestId} />;
} 