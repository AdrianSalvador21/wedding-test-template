'use client';

import React, { useState } from 'react';
import { fraunces, manrope, LButton, L_WRAP } from './ui';
import { QUOTE_WHATSAPP_MESSAGE, whatsappUrl } from '../../lib/contact';

const QUOTE_LINK = whatsappUrl(QUOTE_WHATSAPP_MESSAGE);

// Los enlaces a secciones llevan `/` para funcionar también desde las páginas de marketing.
const links = [
  { href: '/#disenos', label: 'Diseños' },
  { href: '/#experiencia-invitado', label: 'Cómo funciona' },
  { href: '/paquetes', label: 'Precios' },
  { href: '/wedding-planners', label: 'Planners' },
  { href: '/preguntas-frecuentes', label: 'Preguntas' },
  { href: '/login', label: 'Entrar' },
];

// Altura de la barra: 62 px y 76 px desde lg. PageShell y el hero dejan ese espacio arriba.
// `active` marca la página actual (href exacto de `links`) en las páginas de marketing.
export default function Nav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-[rgba(251,247,241,0.93)] backdrop-blur-[10px] border-b border-[rgba(43,38,34,0.1)]">
      <div className={`${L_WRAP} h-[62px] lg:h-[76px] flex items-center justify-between gap-5`}>
        <a href="/" className="text-2xl lg:text-[28px] font-semibold text-[#211D19] tracking-[-0.02em]" style={fraunces}>
          invyta
        </a>

        <nav aria-label="Principal" className="hidden lg:flex items-center gap-7" style={manrope}>
          {links.map((link) => {
            const isActive = link.href === active;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`text-[15px] py-1.5 border-b-2 transition-colors ${
                  isActive
                    ? 'font-bold text-[#AE5730] border-[#AE5730]'
                    : 'font-semibold text-[#4A433C] border-transparent hover:text-[#AE5730]'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
        <div className="hidden lg:block" style={manrope}>
          <LButton href={QUOTE_LINK} external variant="dark" size="sm">
            Cotiza por WhatsApp
          </LButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          className="lg:hidden flex items-center justify-center w-11 h-11 -mr-2 text-[#211D19]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          aria-label="Principal"
          className="lg:hidden bg-[#FBF7F1] border-t border-[rgba(43,38,34,0.08)] px-5 py-6 flex flex-col gap-5"
          style={manrope}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={link.href === active ? 'page' : undefined}
              className={`text-base ${link.href === active ? 'font-bold text-[#AE5730]' : 'font-medium text-[#2B2622]'}`}
            >
              {link.label}
            </a>
          ))}
          <LButton href={QUOTE_LINK} external variant="dark" className="w-full text-[15px]">
            Cotiza por WhatsApp
          </LButton>
        </nav>
      )}
    </header>
  );
}
