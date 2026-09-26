'use client';

import React from 'react';
import { fraunces, LSection } from './ui';
import { DESIGNS } from '../../lib/marketing-content';
import { SITE } from '../../lib/site';

const linkClass = 'text-sm text-[#A79E92] hover:text-white transition-colors';

export default function Footer() {
  return (
    <LSection tone="charcoal">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10">
        <div className="flex flex-col gap-3">
          <span className="text-[26px]" style={fraunces}>
            invyta
          </span>
          <span className="text-sm text-[#A79E92] max-w-xs leading-relaxed">
            Invitaciones digitales para tu día especial.
          </span>
        </div>
        <nav aria-label="Producto" className="flex flex-col gap-3">
          <span className="text-sm font-bold text-[#FBF7F1]">Producto</span>
          <a href="/#disenos" className={linkClass}>
            Diseños
          </a>
          <a href="/paquetes" className={linkClass}>
            Paquetes
          </a>
          <a href="/wedding-planners" className={linkClass}>
            Wedding planners
          </a>
          <a href="/preguntas-frecuentes" className={linkClass}>
            Preguntas frecuentes
          </a>
        </nav>
        <nav aria-label="Diseños" className="flex flex-col gap-3">
          <span className="text-sm font-bold text-[#FBF7F1]">Diseños</span>
          {DESIGNS.map((design) => (
            <a key={design.slug} href={`/disenos/${design.slug}`} className={linkClass}>
              {design.name}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-[#FBF7F1]">Contacto</span>
          <a href={`mailto:${SITE.email}`} className={linkClass}>
            {SITE.email}
          </a>
          <a href="tel:+529602460590" className={linkClass}>
            {SITE.phone}
          </a>
          <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>
            Instagram: @invyta.me
          </a>
        </div>
      </div>
      <div className="border-t border-[rgba(251,247,241,0.1)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 text-center text-sm text-[#A79E92]">
          &copy; {new Date().getFullYear()} Invyta. Todos los derechos reservados.
          {' · '}
          <a href="/aviso-de-privacidad" className="hover:text-white transition-colors underline underline-offset-2">
            Aviso de privacidad
          </a>
        </div>
      </div>
    </LSection>
  );
}
