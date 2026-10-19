import React from 'react';
import { fraunces } from '../../lib/brand';
import { PAYMENT, depositLabel } from '../../lib/marketing-content';

// "Así pagas" + "Así trabajamos" (spec 26), compartido por la landing y /paquetes.
// Sin estado: se renderiza también desde el Server Component de /paquetes.

const steps = [
  {
    title: 'Escríbenos y aparta tu fecha',
    text: `Nos cuentas de tu boda por WhatsApp, eliges diseño y apartas con ${depositLabel}.`,
  },
  {
    title: 'Armamos tu invitación',
    text: 'Con tus datos y fotos. Revisas y pides ajustes las veces que quieras.',
  },
  {
    title: 'Liquidas y la compartes',
    text: 'En 7 días hábiles la tienes lista. Pagas el resto y la mandas por WhatsApp.',
  },
];

export default function PaymentAndProcess() {
  return (
    <div>
      <div className="mt-[22px] grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto] items-center gap-5 bg-white border border-[rgba(43,38,34,0.1)] rounded-[20px] p-4 md:px-6 md:py-[18px]">
        <span className="w-[46px] h-[46px] rounded-[14px] bg-[#EEF1E6] text-[#5B6342] flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20M6 15h4" />
          </svg>
        </span>
        <div>
          <b className="text-base text-[#211D19]">Así pagas</b>
          <p className="text-[14.5px] text-[#6B6359]">
            {depositLabel} de anticipo por {PAYMENT.method} para empezar. El resto, cuando recibes tu invitación
            terminada.
          </p>
        </div>
        <span className="col-span-full md:col-span-1 text-[26px] md:text-[32px] text-[#AE5730] whitespace-nowrap" style={fraunces}>
          {depositLabel} para empezar
        </span>
      </div>

      <div className="mt-[52px] md:mt-[72px] flex items-center gap-3.5">
        <span className="h-px flex-1 bg-[rgba(43,38,34,0.18)]" />
        <b className="text-[12.5px] font-extrabold tracking-[0.2em] uppercase text-[#AE5730]">Así trabajamos</b>
        <span className="h-px flex-1 bg-[rgba(43,38,34,0.18)]" />
      </div>
      <ol className="mt-7 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-[22px]">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4 items-start">
            <span
              className={`flex-shrink-0 w-11 h-11 rounded-full text-[#FBF7F1] text-[19px] flex items-center justify-center ${
                index === steps.length - 1 ? 'bg-[#AE5730]' : 'bg-[#211D19]'
              }`}
              style={fraunces}
            >
              {index + 1}
            </span>
            <div>
              <h3 className="text-xl leading-[1.25] mb-1 text-[#211D19]" style={fraunces}>
                {step.title}
              </h3>
              <p className="text-[14.5px] leading-[1.5] text-[#6B6359]">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
