'use client';

import React from 'react';
import Image from 'next/image';
import { fraunces, LSection, L_WRAP } from './ui';
import { getDesign } from '../../lib/marketing-content';

// Spec 29 — banner discreto del álbum de fotos de los invitados, entre "Cómo funciona"
// (GuestJourney) y PersonalizadoSection. Sin precio: el detalle vive en /album-de-fotos.
const jardin = getDesign('jardin-editorial')!;
const moderno = getDesign('moderno')!;
const TILE_POSITIONS = ['50% 20%', '30% 45%', '70% 30%', '50% 60%'];

function AlbumPhone({ className = '' }: { className?: string }) {
  return (
    <div className={`w-[170px] h-[300px] rounded-[26px] p-1.5 bg-[#0E0C0B] shadow-[0_28px_50px_rgba(0,0,0,0.28)] ${className}`}>
      <div className="w-full h-full rounded-[20px] overflow-hidden bg-[#F2EFEA] text-[#1E1C19] px-[9px] pt-4 flex flex-col gap-[7px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <span className="text-[5px] font-semibold tracking-[0.24em] uppercase text-[#7A5A3C]">Álbum de la boda</span>
        <span className="text-[18px] leading-[0.92] tracking-[-0.045em]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 400 }}>
          Renata
          <br />
          <span className="text-[#7A5A3C]">&amp;</span> Joaquín
        </span>
        <div className="grid grid-cols-2 gap-[3px]">
          {TILE_POSITIONS.map((pos) => (
            <div key={pos} className="relative rounded-[3px] overflow-hidden bg-[#D9D3C9]" style={{ aspectRatio: '5 / 7' }}>
              <Image src={moderno.image} alt="" fill sizes="80px" className="object-cover" style={{ objectPosition: pos }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UploadToast({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 bg-white rounded-[14px] px-3 py-2 shadow-[0_14px_30px_rgba(43,38,34,0.18)] ${className}`}>
      <span className="w-7 h-7 rounded-full bg-[#EEF1E6] text-[#4E5638] flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <span className="flex flex-col">
        <span className="text-xs font-semibold text-[#211D19]">Carlos subió 6 fotos</span>
        <span className="hidden md:block text-[11px] font-medium text-[#6B6359]">Hace 2 minutos</span>
      </span>
    </div>
  );
}

export default function AlbumBanner() {
  return (
    <LSection id="album-de-fotos" tone="ivory">
      <div className={`${L_WRAP} py-12 md:py-[72px]`}>
        <div className="bg-[#F6EFE4] border border-[rgba(43,38,34,0.08)] rounded-3xl md:rounded-[28px] px-[22px] py-7 md:px-14 md:py-11 flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
          <div className="flex-1 min-w-0 flex flex-col gap-3.5 md:gap-4">
            <span className="inline-flex items-center gap-2 text-[11px] md:text-xs font-semibold tracking-[0.16em] md:tracking-[0.18em] uppercase text-[#AE5730]">
              <span className="w-[18px] md:w-[22px] h-px bg-[#AE5730]" aria-hidden="true" />
              Nuevo · Álbum de los invitados
            </span>
            <h2 className="m-0 text-[28px] md:text-[38px] leading-[1.13] tracking-[-0.01em] text-[#211D19] [text-wrap:balance]" style={fraunces}>
              Las fotos que toman tus invitados, juntas en un solo álbum.
            </h2>
            <p className="m-0 text-[15px] md:text-[16.5px] leading-relaxed text-[#4A433C] max-w-[520px]">
              <span className="hidden md:inline">El día de la boda, tu invitación se convierte en el lugar para compartirlas. </span>
              Sin app y sin registro: suben desde su invitación o con un QR en las mesas.
            </p>
            <a
              href="/album-de-fotos"
              className="self-stretch md:self-start inline-flex items-center justify-center gap-2.5 md:mt-1.5 min-h-[48px] px-[22px] rounded-full border-[1.5px] border-[#211D19] text-[#211D19] no-underline text-[15px] font-semibold hover:bg-[#211D19] hover:text-[#FBF7F1] transition-colors"
            >
              Conoce el álbum de fotos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>

          <div aria-hidden="true" className="relative h-[220px] overflow-hidden md:overflow-visible md:h-[320px] md:w-[380px] md:flex-shrink-0">
            <div className="hidden md:block absolute left-[30px] top-3.5 w-[170px] h-[300px] rounded-[26px] p-1.5 bg-[#0E0C0B] shadow-[0_24px_44px_rgba(0,0,0,0.25)] -rotate-[5deg]">
              <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-[#2E3326]">
                <Image src={jardin.image} alt="" fill sizes="170px" className="object-cover" style={{ objectPosition: '50% 25%' }} />
                <span className="absolute left-2.5 bottom-3 inline-flex items-center h-[26px] px-2.5 bg-[#F4EFE3] text-[#2E3323] text-[7px] tracking-[0.18em] uppercase">
                  Comparte tus fotos
                </span>
              </div>
            </div>
            <AlbumPhone className="absolute left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-5 top-0 md:rotate-[4deg]" />
            <UploadToast className="absolute left-0 bottom-4 md:bottom-1.5" />
          </div>
        </div>
      </div>
    </LSection>
  );
}
