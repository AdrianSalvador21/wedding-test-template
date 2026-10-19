'use client';

import React, { useEffect, useState } from 'react';
import { fraunces, manrope, LButton } from './ui';
import { QUOTE_WHATSAPP_MESSAGE, whatsappUrl } from '../../lib/contact';
import { depositLabel, formatPrice, getPackage } from '../../lib/marketing-content';

const basico = getPackage('basico');

// Barra fija inferior (spec 26), solo en móvil y solo en la landing. Aparece cuando el hero
// (#inicio) sale de la pantalla, para no repetir su botón en el primer pantallazo.
// LandingPage deja al final un espacio de su altura para que no tape el pie.
export default function StickyCtaBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('inicio');
    if (!hero || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-track-location="barra-movil"
      aria-hidden={!visible}
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 bg-[rgba(255,255,255,0.97)] backdrop-blur-[8px] border-t border-[rgba(43,38,34,0.1)] shadow-[0_-10px_24px_rgba(43,38,34,0.08)] px-4 pt-[11px] pb-[calc(11px+env(safe-area-inset-bottom,0px))] transition-[transform,visibility] duration-300 ${
        visible ? 'translate-y-0 visible' : 'translate-y-full invisible'
      }`}
    >
      <span className="text-[19px] leading-[1.1] text-[#211D19]" style={fraunces}>
        Desde {formatPrice(basico.price)} {basico.currency}
        <small className="block mt-0.5 text-[11.5px] font-bold text-[#6B6359]" style={manrope}>
          {depositLabel} para empezar · resto al entregar
        </small>
      </span>
      <LButton href={whatsappUrl(QUOTE_WHATSAPP_MESSAGE)} external className="!px-4 !py-3 !text-sm">
        Cotizar
      </LButton>
    </div>
  );
}

// Altura aproximada de la barra (botón de 38 px + 22 px de relleno + borde), para el espacio final.
export const STICKY_BAR_SPACE = 'h-[calc(64px+env(safe-area-inset-bottom,0px))]';
