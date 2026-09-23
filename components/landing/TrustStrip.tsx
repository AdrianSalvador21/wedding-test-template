'use client';

import React from 'react';
import { LSection, LClockIcon, LCheckIcon, LGlobeIcon, LHostingIcon } from './ui';

const items = [
  { icon: LClockIcon, label: 'Entrega en 7 días hábiles' },
  { icon: LCheckIcon, label: 'RSVP en tiempo real' },
  { icon: LGlobeIcon, label: 'Disponible en Español e Inglés' },
  { icon: LHostingIcon, label: 'Hosting incluido' },
];

export default function TrustStrip() {
  return (
    <LSection tone="ivory" className="py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap items-center justify-center md:justify-between gap-x-10 gap-y-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3.5">
            <Icon />
            <span className="text-[15px] font-semibold text-[#2B2622]">{label}</span>
          </div>
        ))}
      </div>
    </LSection>
  );
}
