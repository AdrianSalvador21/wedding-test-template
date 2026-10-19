'use client';

import React from 'react';
import Image from 'next/image';
import { fraunces, LSection, LButton, L_WRAP, L_H2 } from './ui';
import { getDesign } from '../../lib/marketing-content';

// Experiencia del invitado (spec 26): del WhatsApp a la lista de confirmados en 4 pasos.
// Reemplaza "Cómo funciona" y la maqueta de "Qué incluye". El invitado de ejemplo es Carlos.
const jardin = getDesign('jardin-editorial')!;

function MiniPhone({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="relative z-[1] w-full max-w-[220px] aspect-[9/17.5] mx-auto bg-[#0E0C0B] rounded-[24px] md:rounded-[30px] p-[5px] md:p-[7px] shadow-[0_24px_44px_rgba(0,0,0,0.4)]">
      <div
        className={`relative w-full h-full rounded-[19px] md:rounded-[24px] overflow-hidden flex flex-col text-[9px] md:text-[11px] leading-[1.35] ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

function WhatsAppScreen() {
  return (
    <MiniPhone className="bg-[#EFE7DE]">
      <div className="bg-[#1F6E52] text-white flex items-center gap-2 px-2.5 pt-7 pb-[9px]">
        <span className="w-[26px] h-[26px] rounded-full bg-[#F0E6D8] text-[#7C4A2A] text-[10px] flex items-center justify-center" style={fraunces}>
          R&amp;J
        </span>
        <div>
          <b className="block text-[11.5px]">Carlos</b>
          <small className="text-[9px] opacity-85">en línea</small>
        </div>
      </div>
      <div className="flex-1 px-2 py-3 flex flex-col gap-1.5 justify-end">
        <span className="self-center bg-[rgba(255,255,255,0.8)] text-[9px] text-[#54656F] rounded-md px-2 py-0.5">Hoy</span>
        <div className="self-end max-w-[92%] bg-[#D9FDD3] rounded-[9px_2px_9px_9px] p-1 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
          <div className="bg-[#CFEBC9] rounded-md overflow-hidden">
            <div className="relative h-[58px] md:h-[78px]">
              <Image src={jardin.image} alt="" fill sizes="200px" className="object-cover" style={{ objectPosition: '50% 35%' }} />
            </div>
            <div className="px-[7px] pt-[5px] pb-1.5">
              <b className="block text-[10.5px] text-[#111]">Renata y Joaquín · 14 nov</b>
              <small className="text-[9px] text-[#4B5A55]">invyta.me</small>
            </div>
          </div>
          <div className="px-[5px] pt-[5px] pb-0.5 text-[10.5px] text-[#111]">¡Hola, Carlos! Te compartimos nuestra invitación 💛</div>
          <div className="text-right text-[8.5px] text-[#667781] px-[5px] pb-0.5">
            10:42 <i className="not-italic text-[#53BDEB]">✓✓</i>
          </div>
        </div>
      </div>
    </MiniPhone>
  );
}

function InvitationScreen() {
  return (
    <MiniPhone className="bg-[#2E3326]">
      <Image src={jardin.image} alt="" fill sizes="220px" className="object-cover object-top" />
      <span className="absolute top-8 left-1/2 -translate-x-1/2 bg-[rgba(251,247,241,0.95)] text-[#211D19] rounded-full px-3 py-1.5 text-[10px] font-extrabold whitespace-nowrap shadow-[0_6px_14px_rgba(0,0,0,0.25)]">
        Bienvenido, Carlos
      </span>
    </MiniPhone>
  );
}

function RsvpScreen() {
  const option = 'rounded-[10px] border-[1.5px] px-[7px] py-1.5 md:px-2.5 md:py-2 font-bold text-[9.5px] md:text-[11px] flex items-center gap-[7px]';
  return (
    <MiniPhone className="bg-[#FBF7F1] text-[#211D19] pt-[26px] px-[9px] pb-[9px] gap-1.5 md:pt-[34px] md:px-3.5 md:pb-3.5 md:gap-[9px]">
      <h4 className="text-[15px] md:text-xl leading-[1.1] text-center" style={fraunces}>
        ¿Nos acompañas?
      </h4>
      <span className="text-center text-[10.5px] font-bold text-[#6B6359]">Carlos · 2 lugares</span>
      <span className={`${option} border-[#5B6342] bg-[#EEF1E6] text-[#3F4630]`}>
        <span className="w-3 h-3 rounded-full border-[1.5px] border-current bg-[#5B6342] shadow-[inset_0_0_0_2px_#EEF1E6] flex-shrink-0" />
        Sí, ahí estaré
      </span>
      <span className={`${option} border-[rgba(43,38,34,0.18)] bg-white`}>
        <span className="w-3 h-3 rounded-full border-[1.5px] border-current flex-shrink-0" />
        No podré asistir
      </span>
      <span className="hidden md:block text-[9.5px] text-[#6B6359] font-bold mt-0.5">¿Alguna restricción alimentaria?</span>
      <span className="hidden md:block border border-[rgba(43,38,34,0.15)] rounded-lg px-[9px] py-[7px] bg-white text-[10.5px]">Ninguna</span>
      <span className="mt-auto bg-[#211D19] text-[#FBF7F1] rounded-full p-[9px] text-center font-extrabold text-[11px]">Enviar respuesta</span>
    </MiniPhone>
  );
}

const panelRows = [
  { name: 'Carlos', detail: '2 personas', status: 'Confirmó', isNew: true },
  { name: 'Familia Ortega', detail: '4 personas', status: 'Confirmó' },
  { name: 'Lucía y Marcos', detail: '1 vegetariano', status: 'Confirmó' },
  { name: 'Tío Ramón', detail: '1 persona', status: 'Pendiente' },
];

const panelStats = [
  { label: 'Sí', value: 45, className: 'bg-[#EEF1E6] text-[#4E5638]' },
  { label: 'Pend.', value: 11, className: 'bg-[#F6EEDC] text-[#7A5B1E]' },
  { label: 'No', value: 4, className: 'bg-[#F2E4DE] text-[#8A3B22]' },
];

function PanelScreen() {
  return (
    <MiniPhone className="bg-[#FBF7F1] text-[#211D19] pt-[26px] px-2 pb-2 gap-2 md:pt-8 md:px-[11px] md:pb-[11px]">
      <span className="font-extrabold text-xs">Tus confirmaciones</span>
      <div className="grid grid-cols-3 gap-[5px]">
        {panelStats.map((stat) => (
          <div key={stat.label} className={`rounded-lg px-1.5 py-[5px] text-[8px] font-extrabold tracking-[0.06em] uppercase ${stat.className}`}>
            {stat.label}
            <b className="block text-[13px] md:text-[17px] font-normal tracking-normal" style={fraunces}>
              {stat.value}
            </b>
          </div>
        ))}
      </div>
      <div>
        {panelRows.map((row) => (
          <div
            key={row.name}
            className={`flex justify-between items-center gap-1.5 py-[7px] ${
              row.isNew ? 'bg-[#EEF1E6] rounded-lg px-1.5' : 'px-0.5 border-t border-[rgba(43,38,34,0.08)]'
            }`}
          >
            <div>
              <b className="block text-[10.5px]">{row.name}</b>
              <small className="hidden md:inline text-[9px] text-[#6B6359]">{row.detail}</small>
            </div>
            <div className="text-right">
              <span
                className={`text-[8.5px] font-extrabold rounded-full px-[7px] py-[3px] whitespace-nowrap ${
                  row.isNew
                    ? 'bg-[#5B6342] text-white'
                    : row.status === 'Pendiente'
                      ? 'bg-[#F6EEDC] text-[#7A5B1E]'
                      : 'bg-[#EEF1E6] text-[#4E5638]'
                }`}
              >
                {row.status}
              </span>
              {row.isNew && <span className="block text-[8px] text-[#3E9B6B] font-extrabold mt-0.5">ahora</span>}
            </div>
          </div>
        ))}
      </div>
    </MiniPhone>
  );
}

const steps = [
  { label: 'WhatsApp', title: 'Le llega como cualquier mensaje', text: 'Un enlace con vista previa. Nada que descargar.', screen: <WhatsAppScreen /> },
  { label: 'Invitación', title: 'La abre y ve todo', text: 'Música, fecha, mapa, cronograma, vestimenta y regalos.', screen: <InvitationScreen /> },
  { label: 'Confirmación', title: 'Confirma en un toque', text: 'Cuántas personas van y si tienen alguna restricción.', screen: <RsvpScreen /> },
  { label: 'Tu lista', title: 'Aparece en tu lista', text: 'En tiempo real. Ya no persigues a nadie para saber si viene.', screen: <PanelScreen /> },
];

export default function GuestJourney() {
  return (
    <LSection id="experiencia-invitado" tone="charcoal" className="py-16 md:py-24">
      <div className={L_WRAP}>
        <div className="flex flex-col items-center gap-3.5 max-w-[720px] mx-auto text-center">
          <span className="text-[12.5px] font-extrabold tracking-[0.2em] uppercase text-[#E3A483]">Así la vive tu invitado</span>
          <h2 className={L_H2} style={fraunces}>
            Del WhatsApp a tu lista de confirmados, <em className="italic text-[#C6663C]">en menos de un minuto.</em>
          </h2>
          <p className="text-base md:text-[17.5px] leading-[1.6] text-[#CFC6BA]">
            Sin apps, sin registros y sin formularios largos. Si sabe abrir un mensaje, sabe usarla.
          </p>
        </div>

        <div className="relative mt-10 md:mt-14">
          <span
            aria-hidden="true"
            className="hidden lg:block absolute top-[210px] left-[12%] right-[12%] h-px bg-[repeating-linear-gradient(90deg,rgba(227,164,131,0.45)_0_8px,transparent_8px_16px)]"
          />
          <ol className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-[34px] md:gap-7">
          {steps.map((step, index) => (
            <li key={step.label} className="relative flex flex-col gap-3.5">
              {step.screen}
              <span className="flex items-center gap-2.5 font-extrabold text-xs tracking-[0.14em] uppercase text-[#E3A483]">
                <i className="not-italic w-7 h-7 rounded-full bg-[#AE5730] text-[#FBF7F1] flex items-center justify-center text-[15px] tracking-normal" style={fraunces}>
                  {index + 1}
                </i>
                {step.label}
              </span>
              <h3 className="text-[17px] md:text-[21px] leading-[1.2]" style={fraunces}>
                {step.title}
              </h3>
              <p className="text-[13px] md:text-sm leading-[1.5] text-[#CFC6BA]">{step.text}</p>
            </li>
          ))}
          </ol>
        </div>

        <div className="mt-10 md:mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-center">
          <LButton href={jardin.demoHref} external variant="light" className="w-full sm:w-auto">
            Ábrela como invitado
          </LButton>
          <p className="basis-full text-sm text-[#A79E92]">La bienvenida con nombre es del Paquete Personalizado.</p>
        </div>
      </div>
    </LSection>
  );
}
