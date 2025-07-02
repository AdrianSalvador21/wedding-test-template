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
    // Si estamos en la página principal (no en una ruta de wedding específica)
    // cargamos los datos por defecto
    if (pathname === '/' || pathname === '/en') {
      dispatch(fetchWeddingData('maria-carlos-2025'));
    }
  }, [dispatch, pathname]);

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
