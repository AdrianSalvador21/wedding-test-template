import React from 'react';
import { fraunces, manrope } from '../../lib/brand';
import { LSolidButton } from '../landing/ui';
import { whatsappUrl } from '../../lib/contact';

// Bloques de las páginas de marketing (spec 10). Server Components: el contenido
// llega completo en el HTML inicial (sin animaciones de aparición que lo oculten).

export function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <span
      className={`block text-[13px] font-bold tracking-[3px] uppercase text-[#AE5730] ${center ? 'text-center' : ''}`}
    >
      {children}
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-[#F0E6D8] text-[#8A5A32] text-xs font-bold tracking-wide uppercase px-3.5 py-1.5 rounded-full">
      {children}
    </span>
  );
}

// Encabezado de la página: eyebrow + h1 + introducción sobre el degradado marfil.
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-gradient-to-b from-[#FBF7F1] to-[#F3E7D8] py-14 md:py-20" style={manrope}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-5 items-start">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1
          className="text-4xl md:text-5xl lg:text-[52px] leading-[1.1] tracking-tight text-[#211D19] max-w-[900px]"
          style={fraunces}
        >
          {title}
        </h1>
        <p className="text-lg text-[#5A534B] leading-relaxed max-w-[640px]">{intro}</p>
        {children}
      </div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  text,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-3.5 ${center ? 'items-center text-center' : 'items-start'}`}>
      {eyebrow && <Eyebrow center={center}>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl md:text-[40px] leading-[1.15] tracking-tight text-[#211D19]" style={fraunces}>
        {title}
      </h2>
      {text && <p className="text-base md:text-[17px] text-[#5A534B] leading-relaxed max-w-[620px]">{text}</p>}
    </div>
  );
}

export function Section({
  children,
  tone = 'ivory',
  id,
}: {
  children: React.ReactNode;
  tone?: 'ivory' | 'white';
  id?: string;
}) {
  return (
    <section id={id} className={`${tone === 'white' ? 'bg-white' : 'bg-[#FBF7F1]'} py-16 md:py-20`} style={manrope}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-10">{children}</div>
    </section>
  );
}

// Banda final con llamada a WhatsApp.
export function CtaBand({
  title,
  text,
  button,
  message,
}: {
  title: string;
  text: string;
  button: string;
  message?: string;
}) {
  return (
    <section className="bg-[#AE5730] text-[#FBF7F1] py-16 md:py-20" style={manrope}>
      <div className="max-w-3xl mx-auto px-6 flex flex-col items-center gap-4 text-center">
        <h2 className="text-3xl md:text-[38px] leading-[1.15]" style={fraunces}>
          {title}
        </h2>
        <p className="text-base leading-relaxed max-w-[560px]">{text}</p>
        <div className="mt-2">
          <LSolidButton href={whatsappUrl(message)} target="_blank" variant="ivoryDark">
            {button}
          </LSolidButton>
        </div>
      </div>
    </section>
  );
}
