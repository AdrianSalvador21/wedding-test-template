'use client';

import React from 'react';
import { fraunces, LSection, LClockIcon, LGlobeIcon } from './ui';
import { formatPrice, getPackage } from '../../lib/marketing-content';

const basico = getPackage('basico');

const UsersIcon = ({ color = '#AE5730' }: { color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

// Precio en el primer pantallazo (spec 15). El monto sale de PACKAGES, nunca escrito a mano.
const items = [
  { icon: UsersIcon, label: 'Sin costo por invitado' },
  { icon: LClockIcon, label: 'Entrega en 7 días hábiles' },
  { icon: LGlobeIcon, label: 'Hosting hasta 15 días después del evento' },
];

const TagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#AE5730" strokeWidth="1.8" aria-hidden="true">
    <path d="M12 2H2v10l9.3 9.3a2 2 0 002.8 0l7.2-7.2a2 2 0 000-2.8z" />
    <circle cx="7" cy="7" r="1.5" />
  </svg>
);

export default function PriceStrip() {
  return (
    <LSection id="precio" tone="white" border className="py-6 border-b">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.25fr] items-center gap-x-8 gap-y-5">
        <div className="col-span-2 lg:col-span-1 flex items-center gap-3.5 pb-4 lg:pb-0 border-b lg:border-b-0 border-[rgba(43,38,34,0.08)]">
          <span className="w-12 h-12 rounded-[14px] bg-[#F0E6D8] flex items-center justify-center flex-shrink-0">
            <TagIcon />
          </span>
          <span className="text-2xl leading-tight text-[#211D19]" style={fraunces}>
            Desde {formatPrice(basico.price)} {basico.currency}
          </span>
        </div>
        {items.map(({ icon: Icon, label }, index) => (
          <div
            key={label}
            className={`flex items-center gap-3 lg:border-l lg:border-[rgba(43,38,34,0.1)] lg:pl-7 ${
              index === items.length - 1 ? 'col-span-2 lg:col-span-1' : ''
            }`}
          >
            <Icon color="#AE5730" />
            <span className="text-[14px] md:text-[15px] font-bold text-[#2B2622] leading-snug">{label}</span>
          </div>
        ))}
      </div>
    </LSection>
  );
}
