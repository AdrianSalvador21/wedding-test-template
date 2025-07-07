'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '../../../../src/store/hooks';
import { fetchWeddingData } from '../../../../src/store/slices/weddingSlice';
import WeddingTemplate from '../../../../components/WeddingTemplate';

export default function WeddingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const weddingId = params.id as string;
  const guestId = searchParams.get('guest');

  useEffect(() => {
    if (weddingId) {
      dispatch(fetchWeddingData(weddingId));
    }
  }, [weddingId, dispatch]);

  return <WeddingTemplate guestId={guestId} />;
}
