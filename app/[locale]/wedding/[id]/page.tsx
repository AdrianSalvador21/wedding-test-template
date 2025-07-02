'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch } from '../../../../src/store/hooks';
import { fetchWeddingData } from '../../../../src/store/slices/weddingSlice';
import WeddingTemplate from '../../../../components/WeddingTemplate';

export default function WeddingPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const weddingId = params.id as string;

  useEffect(() => {
    if (weddingId) {
      dispatch(fetchWeddingData(weddingId));
    }
  }, [weddingId, dispatch]);

  return <WeddingTemplate />;
}
