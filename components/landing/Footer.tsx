'use client';

import React from 'react';
import { fraunces, LSection } from './ui';

export default function Footer() {
  return (
    <LSection tone="charcoal">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid md:grid-cols-[1.4fr_1fr_1fr] gap-10">
        <div className="flex flex-col gap-3">
          <span className="text-[26px]" style={fraunces}>
            invyta
          </span>
          <span className="text-sm text-[#A79E92] max-w-xs leading-relaxed">
            Invitaciones digitales para tu día especial.
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-[#FBF7F1]">Producto</span>
          <a href="#como-funciona" className="text-sm text-[#A79E92] hover:text-white transition-colors">
            Cómo funciona
          </a>
          <a href="#disenos" className="text-sm text-[#A79E92] hover:text-white transition-colors">
            Diseños
          </a>
          <a href="#paquetes" className="text-sm text-[#A79E92] hover:text-white transition-colors">
            Paquetes
          </a>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-[#FBF7F1]">Contacto</span>
          <span className="text-sm text-[#A79E92]">hola@invyta.me</span>
          <span className="text-sm text-[#A79E92]">+52 960 246 0590</span>
        </div>
      </div>
      <div className="border-t border-[rgba(251,247,241,0.1)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 text-center text-sm text-[#A79E92]">
          &copy; 2025 Invyta. Todos los derechos reservados.
        </div>
      </div>
    </LSection>
  );
}
