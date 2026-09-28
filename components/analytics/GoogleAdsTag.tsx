'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { isNotrack } from '../../lib/analytics/client';
import { resolveScope } from '../../lib/analytics/scope';

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

// Conversiones de Google Ads. Mismo alcance que PostHog (spec 11): solo se carga en
// 'marketing' | 'demo' | 'admin'. Las invitaciones reales de las parejas (scope null)
// nunca cargan el script de Google, igual que nunca se graban con PostHog.
// Sin NEXT_PUBLIC_GOOGLE_ADS_ID el componente no hace nada (desarrollo local y preview).
export default function GoogleAdsTag() {
  const pathname = usePathname();
  // Se decide en un efecto (no durante el render) para no depender de localStorage
  // en el primer render del servidor y evitar así un mismatch de hidratación.
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(Boolean(GOOGLE_ADS_ID) && Boolean(resolveScope(pathname)) && !isNotrack());
  }, [pathname]);

  if (!allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
