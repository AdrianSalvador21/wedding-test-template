'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import ReduxProvider from '../src/components/providers/ReduxProvider';
import { useEffect } from 'react';
import { useAppDispatch } from '../src/store/hooks';
import { fetchWeddingData } from '../src/store/slices/weddingSlice';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

function DataInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => {
    // Solo cargar datos de boda para rutas específicas de wedding, no para la landing
    if (pathname === '/en') {
      dispatch(fetchWeddingData('maria-carlos-2025'));
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ReduxProvider>
          <DataInitializer>
            {children}
          </DataInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}
