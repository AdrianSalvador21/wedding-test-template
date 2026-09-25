'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch } from '../../store/hooks';
import { fetchWeddingData } from '../../store/slices/weddingSlice';

export default function DataInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => {
    // Solo cargar datos de boda para rutas específicas de wedding, no para la landing
    if (pathname === '/en') {
      dispatch(fetchWeddingData({ weddingId: 'maria-carlos-2025' }));
    }
    // No cargar datos para '/' ya que es la landing page
  }, [dispatch, pathname]);

  // Solución para viewport height en iOS
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Establecer altura inicial
    setViewportHeight();

    // Actualizar en resize (pero throttled para performance)
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setViewportHeight, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', setViewportHeight);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', setViewportHeight);
      clearTimeout(resizeTimer);
    };
  }, []);

  return <>{children}</>;
}
