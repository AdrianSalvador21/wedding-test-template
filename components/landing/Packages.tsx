'use client';

import React from 'react';
import { fraunces, LSection, L_WRAP, L_EYEBROW, L_H2, L_LEAD } from './ui';
import PackagesComparison from './PackagesComparison';
import PaymentAndProcess from './PaymentAndProcess';

// Paquetes de la landing (spec 26): la misma comparativa y el mismo bloque de pago que /paquetes.
export default function Packages() {
  return (
    <LSection id="paquetes" className="!bg-[linear-gradient(180deg,#FBF7F1_0%,#F3EADD_100%)] py-16 md:py-24">
      <div className={L_WRAP}>
        <div className="flex flex-col items-center gap-3.5 max-w-[720px] mx-auto text-center">
          <span className={L_EYEBROW}>Paquetes y precios</span>
          <h2 className={`${L_H2} text-[#211D19]`} style={fraunces}>
            Dos paquetes, <em className="italic text-[#C6663C]">precio fijo.</em>
          </h2>
          <p className={L_LEAD}>Sin costo por invitado ni suscripciones. Lo que ves es lo que pagas.</p>
        </div>
        <div className="mt-9 md:mt-[52px]">
          <PackagesComparison />
        </div>
        <PaymentAndProcess />
      </div>
    </LSection>
  );
}
