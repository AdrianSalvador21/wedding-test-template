'use client';

import React, { useState } from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { track } from '../../../lib/analytics/client';
import { ALBUM_STYLE_IDS, type AlbumStyleId } from '../../../lib/album';

// Spec 30 — "Estilo del álbum" en bodas gratis (álbum sin invitación): la pareja elige con qué
// diseño ven sus invitados el álbum y el QR con diseño. Se puede cambiar cuando quiera; las fotos
// no se tocan. Las miniaturas copian el encabezado real de cada template (components/album).

const STYLE_NAMES: Record<AlbumStyleId, string> = {
  'template-01': 'Clásico',
  'template-02': 'Moderno',
  'template-03': 'Botánica',
  'template-04': 'Jardín',
};

const Branch = ({ mirrored = false }: { mirrored?: boolean }) => (
  <svg
    width="46"
    height="58"
    viewBox="0 0 120 150"
    fill="none"
    stroke="#85906E"
    strokeWidth={2}
    strokeLinecap="round"
    aria-hidden="true"
    className="absolute top-[30px] opacity-85"
    style={{ [mirrored ? 'right' : 'left']: -6, transform: mirrored ? 'scaleX(-1)' : undefined }}
  >
    <path d="M20 148 C 40 110, 52 70, 50 10" />
    <path d="M47 40 C 30 34, 22 22, 24 10 C 38 14, 46 26, 47 40Z" />
    <path d="M49 70 C 66 62, 74 48, 72 36 C 58 40, 50 54, 49 70Z" />
  </svg>
);

function StylePreview({ style, names }: { style: AlbumStyleId; names: { bride: string; groom: string } }) {
  const { bride, groom } = names;
  const eyebrow = 'Álbum de la boda';
  if (style === 'template-01') {
    return (
      <div className="h-[150px] rounded-lg overflow-hidden bg-[#2a2119] text-white flex flex-col items-center justify-center gap-1.5 px-2 text-center">
        <span className="text-[7px] tracking-[0.4em] uppercase" style={{ fontFamily: "'Lora', serif" }}>{eyebrow}</span>
        <span className="text-[28px] leading-none truncate max-w-full" style={{ fontFamily: "'Allura', cursive" }}>
          {bride} &amp; {groom}
        </span>
        <span className="flex items-center gap-1.5 w-[90px]">
          <span className="flex-1 h-px bg-[rgba(255,255,255,0.4)]" />
          <span className="w-[5px] h-[5px] rotate-45 border border-[#c9a86a]" />
          <span className="flex-1 h-px bg-[rgba(255,255,255,0.4)]" />
        </span>
      </div>
    );
  }
  if (style === 'template-02') {
    return (
      <div className="h-[150px] rounded-lg overflow-hidden bg-[#F2EFEA] text-[#1E1C19] px-4 py-[18px] flex flex-col gap-2.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <span className="flex items-center gap-1.5 text-[7px] font-semibold tracking-[0.24em] uppercase text-[#7A5A3C]">
          <span className="w-3 h-px bg-[#7A5A3C]" />
          {eyebrow}
        </span>
        <span className="text-[28px] leading-[0.9] tracking-[-0.045em] truncate" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 400 }}>
          {bride}
          <br />
          <span className="text-[#7A5A3C]">&amp;</span> {groom}
        </span>
      </div>
    );
  }
  if (style === 'template-03') {
    return (
      <div className="relative h-[150px] rounded-lg overflow-hidden bg-[#FAF6EF] text-[#34302A] flex flex-col items-center justify-center gap-1.5 px-6 text-center" style={{ fontFamily: "'Jost', sans-serif" }}>
        <Branch />
        <Branch mirrored />
        <span className="text-[7px] font-medium tracking-[0.34em] uppercase text-[#B5643A]">{eyebrow}</span>
        <span className="text-[24px] leading-none italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
          {bride} <span className="text-[17px] text-[#B5643A]">&amp;</span> {groom}
        </span>
      </div>
    );
  }
  return (
    <div className="h-[150px] rounded-lg overflow-hidden bg-[#2E3323] text-[#F4EFE3] flex flex-col items-center justify-center gap-1 px-2 text-center" style={{ fontFamily: 'Georgia, serif' }}>
      <span className="text-[7px] tracking-[0.24em] uppercase text-[#C9A98C]" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>{eyebrow}</span>
      <span className="text-[17px] tracking-[0.06em] uppercase truncate max-w-full">{bride}</span>
      <span className="text-[11px] italic text-[#C9A98C]">y</span>
      <span className="text-[17px] tracking-[0.06em] uppercase truncate max-w-full">{groom}</span>
    </div>
  );
}

export default function AlbumStyleCard({
  style,
  names,
  albumHref,
  disabled,
  onChange,
}: {
  style: AlbumStyleId;
  names: { bride: string; groom: string };
  albumHref: string;
  disabled: boolean;
  onChange: (style: AlbumStyleId) => Promise<void>;
}) {
  const [saving, setSaving] = useState<AlbumStyleId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (next: AlbumStyleId) => {
    if (next === style || saving) return;
    setSaving(next);
    setNotice(null);
    setError(null);
    try {
      await onChange(next);
      track('album_style_changed', { style: next });
      setNotice(`Listo. Tu álbum ya se ve con el estilo ${STYLE_NAMES[next]}.`);
    } catch {
      setError('No pudimos cambiar el estilo. Inténtalo de nuevo.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">Estilo del álbum</span>
          <span className="text-[13px] font-medium text-[#3F3F46] leading-normal">
            Así ven tus invitados el álbum y el QR con diseño. Puedes cambiarlo cuando quieras; las fotos no se tocan.
          </span>
        </div>
        <a href={albumHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#AE5730] hover:text-[#8F4524] no-underline">
          Ver mi álbum
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {notice && (
        <div role="status" className="flex items-center gap-2.5 bg-[#F0FDF4] border border-[rgba(21,128,61,0.2)] rounded-xl px-4 py-3 text-sm font-semibold text-[#14532D]">
          <Check className="h-4 w-4" strokeWidth={2.6} />
          {notice}
        </div>
      )}
      {error && (
        <span role="alert" className="text-[12.5px] font-semibold text-[#B91C1C]">
          {error}
        </span>
      )}

      <div role="radiogroup" aria-label="Estilo del álbum" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ALBUM_STYLE_IDS.map((id) => {
          const on = id === style;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={disabled || saving !== null}
              onClick={() => void pick(id)}
              className={`text-left p-2 rounded-[14px] flex flex-col gap-2.5 transition-colors disabled:cursor-not-allowed ${
                on ? 'border-2 border-[#AE5730] bg-[rgba(198,102,60,0.04)] shadow-[0_10px_24px_-14px_rgba(174,87,48,0.7)]' : 'border border-[rgba(0,0,0,0.1)] bg-white hover:bg-[#FAFAFA]'
              } ${saving === id ? 'opacity-60' : ''}`}
            >
              <StylePreview style={id} names={names} />
              <span className={`flex items-center justify-between px-1 pb-1 text-sm font-semibold ${on ? 'text-[#AE5730]' : 'text-[#0A0A0A]'}`}>
                {STYLE_NAMES[id]}
                {on && (
                  <span className="w-[22px] h-[22px] rounded-full bg-[#AE5730] text-white flex items-center justify-center">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
