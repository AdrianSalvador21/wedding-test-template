'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { isNotrack } from '../../lib/analytics/client';
import { resolveScope } from '../../lib/analytics/scope';

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

// Etiqueta base de Google Ads. Solo se carga en 'marketing' | 'demo' | 'admin'. Las invitaciones
// reales de las parejas ('invitation') y las rutas fuera de alcance nunca cargan el script de
// Google Ads (spec 31). Las conversiones se importan desde GA4 (`generate_lead`, `sign_up`).
// Firebase Analytics usa su propio `invytaGtag` / `invytaDataLayer`: este script no lo pisa, y
// tampoco redefine un `gtag` existente.
// Sin NEXT_PUBLIC_GOOGLE_ADS_ID el componente no hace nada (desarrollo local y preview).
export default function GoogleAdsTag() {
  const pathname = usePathname();
  // Se decide en un efecto (no durante el render) para no depender de localStorage
  // en el primer render del servidor y evitar así un mismatch de hidratación.
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const scope = resolveScope(pathname);
    setAllowed(Boolean(GOOGLE_ADS_ID) && Boolean(scope) && scope !== 'invitation' && !isNotrack());
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
          window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
          window.gtag('js', new Date());
          window.gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
