'use client';

import React, { useState } from 'react';
import { fraunces, manrope, LSolidButton } from './ui';

const WHATSAPP_LINK = 'https://wa.me/529602460590';

// Los enlaces a secciones llevan `/` para funcionar también desde las páginas de marketing.
const links = [
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/#disenos', label: 'Diseños' },
  { href: '/#funcionalidades', label: 'Funcionalidades' },
  { href: '/paquetes', label: 'Paquetes' },
  { href: '/wedding-planners', label: 'Wedding planners' },
  { href: '/preguntas-frecuentes', label: 'Preguntas frecuentes' },
];

// `active` marca la página actual (href exacto de `links`) en las páginas de marketing.
export default function Nav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-[rgba(251,247,241,0.92)] backdrop-blur-md border-b border-[rgba(43,38,34,0.08)]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 md:h-24 flex items-center justify-between">
        <a href="/" className="text-2xl md:text-[28px] font-semibold text-[#211D19] tracking-tight" style={fraunces}>
          invyta
        </a>

        <nav aria-label="Principal" className="hidden xl:flex items-center gap-7" style={manrope}>
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
                    : 'font-medium text-[#4A433C] border-transparent hover:text-[#C6663C]'
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <LSolidButton href={WHATSAPP_LINK} target="_blank" variant="dark" className="px-6 py-3 text-[14px]">
            Crea tu invitación
          </LSolidButton>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          className="xl:hidden flex items-center justify-center w-11 h-11 -mr-2 text-[#211D19]"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          aria-label="Principal"
          className="xl:hidden bg-[#FBF7F1] border-t border-[rgba(43,38,34,0.08)] px-6 py-6 flex flex-col gap-5"
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
          <LSolidButton
            href={WHATSAPP_LINK}
            target="_blank"
            variant="dark"
            className="w-full text-[15px]"
            onClick={() => setOpen(false)}
          >
            Crea tu invitación
          </LSolidButton>
        </nav>
      )}
    </header>
  );
}
