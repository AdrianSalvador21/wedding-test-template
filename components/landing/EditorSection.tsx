'use client';

import React, { useState } from 'react';
import { fraunces, LSection, LReveal } from './ui';
import { whatsappUrl } from '../../lib/contact';

// Demo del panel de edición (spec 15): el estado vive solo en el navegador. No se guarda ni se envía nada.
interface EditorDemo {
  names: string;
  date: string;
  venue: string;
  address: string;
}

const DEFAULTS: EditorDemo = {
  names: 'Sofía y Diego',
  date: 'Sábado 17 de octubre de 2026 · 5:00 p. m.',
  venue: 'Jardín Los Arcos',
  address: 'Camino Real 120, Chiapa de Corzo',
};

const MAX_LENGTH = 48;

const CHANGE_MESSAGE = 'Hola, quiero saber cómo funcionan los cambios visuales en el Paquete Personalizado de Invyta.';

const tabs = ['Pareja', 'Evento', 'Ubicación', 'Galería', 'Vestimenta'];

const fields: { key: keyof EditorDemo; label: string }[] = [
  { key: 'names', label: 'Nombres de la pareja' },
  { key: 'date', label: 'Fecha y hora de la ceremonia' },
  { key: 'venue', label: 'Lugar de la ceremonia' },
  { key: 'address', label: 'Dirección o enlace del mapa' },
];

const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const points = [
  {
    title: 'Nombres, fecha y horarios',
    text: 'Actualiza los datos de tu boda desde un formulario simple.',
    icon: (
      <svg {...iconProps}>
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
      </svg>
    ),
  },
  {
    title: 'Ubicación con mapa',
    text: 'Cambia el lugar y tus invitados ven la nueva ubicación.',
    icon: (
      <svg {...iconProps}>
        <path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Fotos y cronograma',
    text: 'Sube fotos nuevas y ajusta el itinerario del día.',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M21 16l-5-5-8 9" />
      </svg>
    ),
  },
];

export default function EditorSection() {
  const [demo, setDemo] = useState<EditorDemo>(DEFAULTS);

  // Un campo vacío deja ver el valor de ejemplo en gris, para que el celular nunca quede en blanco.
  const shown = (key: keyof EditorDemo) => {
    const value = demo[key].trim();
    return { text: value || DEFAULTS[key], isDefault: !value };
  };
  const names = shown('names');
  const date = shown('date');
  const venue = shown('venue');
  const address = shown('address');
  const grey = (isDefault: boolean) => (isDefault ? 'opacity-45' : '');
  // Los nombres largos bajan de tamaño para no salirse del celular (máximo 48 caracteres).
  const namesSize = names.text.length > 30 ? 'text-[15px]' : names.text.length > 18 ? 'text-[20px]' : 'text-[26px]';

  return (
    <LSection id="editor" tone="sand" border className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <LReveal className="lg:order-2 flex flex-col gap-5 items-start">
          <span className="inline-flex items-center bg-[rgba(174,87,48,0.1)] text-[#8E4222] text-xs font-bold tracking-[0.08em] uppercase px-4 py-2 rounded-full">
            Exclusivo Paquete Personalizado
          </span>
          <h2 className="text-[32px] md:text-[46px] leading-[1.1] tracking-tight text-[#211D19]" style={fraunces}>
            Cambia lo que necesites, <em className="font-normal text-[#AE5730]">cuando lo necesites.</em>
          </h2>
          <p className="text-[15.5px] md:text-[18px] leading-relaxed text-[#5A534B]">
            Desde tu panel editas nombres, fecha, lugares, cronograma y fotos. Para tus datos no dependes de nadie.
          </p>
          <ul className="flex flex-col gap-4 mt-1.5">
            {points.map((point) => (
              <li key={point.title} className="flex items-start gap-4">
                <span className="w-11 h-11 md:w-12 md:h-12 rounded-[14px] bg-[#F0E6D8] text-[#AE5730] flex items-center justify-center flex-shrink-0">
                  {point.icon}
                </span>
                <div>
                  <h3 className="text-lg md:text-xl text-[#211D19]" style={fraunces}>
                    {point.title}
                  </h3>
                  <p className="text-sm md:text-[15px] leading-relaxed text-[#5A534B] mt-1">{point.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-[15px] leading-relaxed text-[#4A433C]">
            ¿Quieres un cambio visual?{' '}
            <a href={whatsappUrl(CHANGE_MESSAGE)} target="_blank" rel="noopener noreferrer" className="font-extrabold text-[#AE5730] hover:text-[#8E4222]">
              Escríbenos por WhatsApp
            </a>{' '}
            y lo vemos juntos.
          </p>
          <a href="#paquetes" className="text-[15px] font-extrabold text-[#AE5730] hover:text-[#8E4222]">
            Ver Paquete Personalizado →
          </a>
        </LReveal>

        <LReveal className="lg:order-1">
          <div className="bg-white border border-[rgba(43,38,34,0.1)] rounded-3xl p-5 md:p-7 shadow-[0_24px_48px_rgba(43,38,34,0.1)] flex flex-col gap-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[15px] md:text-base font-extrabold text-[#211D19]">Editor de tu invitación</span>
              <span className="bg-[#F0E6D8] text-[#8A5A32] text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                Ejemplo ilustrativo
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" aria-hidden="true">
              {tabs.map((tab, index) => (
                <span
                  key={tab}
                  className={`rounded-full px-4 py-2 text-[13px] font-bold whitespace-nowrap ${
                    index === 0
                      ? 'bg-[#211D19] text-[#FBF7F1]'
                      : 'border-[1.5px] border-[rgba(43,38,34,0.25)] text-[#211D19]'
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
              <div className="flex flex-col gap-3.5">
                {fields.map((field) => (
                  <label
                    key={field.key}
                    className="flex flex-col gap-1.5 text-xs font-extrabold tracking-[0.06em] uppercase text-[#5A534B]"
                  >
                    {field.label}
                    <input
                      type="text"
                      value={demo[field.key]}
                      maxLength={MAX_LENGTH}
                      onChange={(event) => setDemo((prev) => ({ ...prev, [field.key]: event.target.value }))}
                      className="min-h-[48px] rounded-xl border-[1.5px] border-[rgba(43,38,34,0.2)] bg-white px-3.5 text-[15px] font-semibold normal-case tracking-normal text-[#211D19] focus:border-[#AE5730] focus:outline-none focus:ring-2 focus:ring-[rgba(174,87,48,0.25)]"
                    />
                  </label>
                ))}
                <p className="text-[13px] leading-relaxed text-[#5A534B] mt-1">
                  Escribe y mira cómo cambia el celular. En tu panel real, la invitación se actualiza al guardar.
                </p>
              </div>

              <div className="flex flex-col items-center gap-2.5">
                <span className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#5A534B]">Así se ve</span>
                <div
                  aria-live="polite"
                  className="w-[176px] h-[330px] box-border border-[6px] border-[#211D19] rounded-[28px] bg-[#FBF7F1] flex flex-col items-center justify-center gap-2.5 text-center px-3.5 overflow-hidden shadow-[0_18px_36px_rgba(43,38,34,0.18)]"
                >
                  <span className="text-[8px] font-extrabold tracking-[0.24em] text-[#8A5A32]">NUESTRA BODA</span>
                  <span
                    className={`${namesSize} leading-[1.1] italic text-[#211D19] max-w-full [overflow-wrap:anywhere] ${grey(names.isDefault)}`}
                    style={fraunces}
                  >
                    {names.text}
                  </span>
                  <span className="w-9 h-px bg-[#AE5730]" />
                  <span className={`text-[10px] leading-[1.4] text-[#4A433C] max-w-full [overflow-wrap:anywhere] ${grey(date.isDefault)}`}>
                    {date.text}
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold text-[#211D19] max-w-full ${grey(venue.isDefault)}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#AE5730" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
                      <path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <span className="[overflow-wrap:anywhere]">{venue.text}</span>
                  </span>
                  <span className={`text-[9px] leading-[1.4] text-[#5A534B] max-w-full [overflow-wrap:anywhere] ${grey(address.isDefault)}`}>
                    {address.text}
                  </span>
                  <span className="mt-2 border border-[#211D19] px-3 py-1.5 text-[7px] font-extrabold tracking-[0.14em] text-[#211D19]">
                    CONFIRMAR ASISTENCIA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </LReveal>
      </div>
    </LSection>
  );
}
