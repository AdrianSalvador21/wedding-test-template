'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Check, MessageCircle, Plus, X } from 'lucide-react';
import { whatsappUrl } from '../../../lib/contact';
import { track } from '../../../lib/analytics/client';
import { formatAlbumDate, uploadOpensAt } from '../../../lib/album';
import { ALBUM_PANEL_FAQ, ALBUM_PRICE, ALBUM_STANDALONE_PANEL_FAQ, getDesign } from '../../../lib/marketing-content';
import { SOFT_EASE } from '../../marketing/FaqList';

// Spec 29 — página de venta de la sección "Fotos" cuando el álbum no está activado: encabezado con
// demostración, aviso con la fecha real de la boda, sin/con, 3 pasos, precio con preguntas
// frecuentes y cierre. Sin testimonios ni cifras de uso (no hay reseñas reales).

const DAY_MS = 24 * 60 * 60 * 1000;
const demoImage = getDesign('moderno')?.image || '';
const TILE_POSITIONS = ['50% 20%', '30% 45%', '70% 30%', '50% 60%'];
const TILE_NAMES = ['Carlos', 'Los Ortega', 'Sofía R.', 'Pablo'];

const WITHOUT = [
  'Las fotos quedan repartidas en decenas de chats de WhatsApp',
  'Llegan comprimidas, borrosas o nunca llegan',
  'Tienes que pedirlas una por una después de la boda',
];
const WITH_ALBUM = [
  'Todas en un solo lugar, con el nombre de quien la tomó',
  'Con calidad para verlas en grande o imprimirlas en tamaño postal',
  'Las descargas todas juntas en tu dispositivo cuando quieras',
];
// Spec 30 — en una boda gratis (álbum sin invitación) cambian el precio, cómo entran los
// invitados y lo que incluye.
const steps = (price: number, standalone: boolean) => [
  { n: '01', title: 'Lo activamos', body: `Nos escribes por WhatsApp, pagas $${price} y queda listo ese mismo día. El álbum se abre solo el día de tu boda.` },
  standalone
    ? { n: '02', title: 'Tus invitados suben fotos', body: 'Entran con el QR de las mesas o con el link que les mandes por WhatsApp desde tu lista de invitados. Sin app y sin registro.' }
    : { n: '02', title: 'Tus invitados suben fotos', body: 'Desde su invitación, con el botón "Comparte tus fotos", o escaneando el QR de las mesas. Sin app y sin registro.' },
  { n: '03', title: 'Tú te quedas con todo', body: 'Ves cada foto con el nombre de quien la subió, ocultas o borras lo que no quieras y las descargas todas juntas en tu dispositivo cuando quieras.' },
];
const STANDALONE_INCLUDES = [
  'Álbum con el estilo que elijas: Clásico, Moderno, Botánica o Jardín',
  'Link personal para cada invitado, listo para mandar por WhatsApp',
  'QR imprimible para las mesas',
  'Modo álbum abierto o cámara desechable',
  'Las descargas todas juntas en tu dispositivo cuando quieras',
];
const INCLUDES = [
  'Álbum con el diseño de tu invitación',
  'Botón "Comparte tus fotos" en la invitación',
  'QR imprimible para las mesas',
  'Modo álbum abierto o cámara desechable',
  'Las descargas todas juntas en tu dispositivo cuando quieras',
];

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => <MessageCircle style={{ width: size, height: size }} aria-hidden="true" />;

function HeroPhones() {
  return (
    <div aria-hidden="true" className="relative h-[470px]">
      <div className="absolute left-2 top-[30px] w-[214px] h-[430px] rounded-[34px] border-[7px] border-[#2A2724] bg-[#F2EFEA] overflow-hidden -rotate-[4deg] shadow-[0_24px_50px_rgba(0,0,0,0.45)] text-[#1E1C19]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={demoImage} alt="" className="w-full h-[210px] object-cover" style={{ objectPosition: 'center 20%' }} />
        <div className="px-3.5 pt-3.5 flex flex-col gap-1.5">
          <span className="text-[6.5px] font-semibold tracking-[0.24em] uppercase text-[#7A5A3C]">Hoy nos casamos</span>
          <span className="text-[30px] leading-[0.92] tracking-[-0.045em]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 400 }}>
            Renata
            <br />
            <span className="text-[#7A5A3C]">&amp;</span> Joaquín
          </span>
        </div>
        <div className="absolute left-2 right-2 bottom-2.5 h-[38px] rounded-full bg-[#FBFAF7] border border-[#D9D3C9] flex items-center justify-between pl-3 pr-1">
          <span className="text-[6.5px] font-semibold">Hoy es el día</span>
          <span className="h-[30px] px-2.5 rounded-full bg-[#1E1C19] text-[#F2EFEA] flex items-center text-[7.5px] font-semibold">Comparte tus fotos</span>
        </div>
      </div>
      <div className="absolute right-0 top-0 w-[214px] h-[430px] rounded-[34px] border-[7px] border-[#2A2724] bg-[#F2EFEA] overflow-hidden rotate-[3deg] shadow-[0_28px_60px_rgba(0,0,0,0.5)] text-[#1E1C19]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="px-3 pt-[18px] pb-2.5 flex flex-col gap-2">
          <span className="flex items-center gap-[5px] text-[6px] font-semibold tracking-[0.24em] uppercase text-[#7A5A3C]">
            <span className="w-2.5 h-px bg-[#7A5A3C]" />
            Álbum de la boda
          </span>
          <span className="text-2xl leading-[0.92] tracking-[-0.045em]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 400 }}>
            Renata
            <br />
            <span className="text-[#7A5A3C]">&amp;</span> Joaquín
          </span>
          <div className="h-[26px] rounded-full bg-[#1E1C19] text-[#F2EFEA] flex items-center justify-center text-[7.5px] font-semibold">Subir fotos</div>
        </div>
        <div className="px-3 grid grid-cols-2 gap-1">
          {TILE_POSITIONS.map((pos, i) => (
            <div key={pos} className="relative rounded-[4px] overflow-hidden bg-[#D9D3C9]" style={{ aspectRatio: '5 / 7' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={demoImage} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: pos }} />
              <span className="absolute left-1 bottom-1 text-[5.5px] font-semibold text-white bg-[rgba(20,18,15,0.55)] px-[5px] py-px rounded-full">{TILE_NAMES[i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute left-[150px] bottom-1.5 flex items-center gap-2.5 bg-white text-[#0A0A0A] rounded-[14px] px-3.5 py-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
        <span className="w-8 h-8 rounded-full bg-[rgba(21,128,61,0.12)] text-[#15803D] flex items-center justify-center">
          <Check className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <span className="flex flex-col">
          <span className="text-xs font-semibold">Carlos subió 6 fotos</span>
          <span className="text-[11px] font-medium text-[#71717A]">Hace 2 minutos</span>
        </span>
      </div>
    </div>
  );
}

export default function AlbumSalesPanel({ weddingId, eventDate, standalone = false }: { weddingId: string; eventDate?: string; standalone?: boolean }) {
  const price = standalone ? ALBUM_PRICE.standalone : ALBUM_PRICE.withInvitation;
  const href = whatsappUrl(
    standalone
      ? `Hola! Quiero activar el álbum de fotos sin invitación de mi boda "${weddingId}".`
      : `Hola! Quiero activar el álbum de fotos de mi boda "${weddingId}".`
  );
  const onCta = () => track('album_activation_cta_click', { standalone });
  const STEPS = steps(price, standalone);
  const includes = standalone ? STANDALONE_INCLUDES : INCLUDES;
  const faq = standalone ? ALBUM_STANDALONE_PANEL_FAQ : ALBUM_PANEL_FAQ;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Días que faltan: se calculan en el cliente para no desfasar el HTML del servidor.
  const [countdown, setCountdown] = useState<{ date: string; days: number } | null>(null);
  useEffect(() => {
    const opens = uploadOpensAt({ event: { date: eventDate } });
    if (!opens) return;
    const days = Math.ceil((opens.getTime() - Date.now()) / DAY_MS);
    if (days > 0) setCountdown({ date: formatAlbumDate(opens, 'es'), days });
  }, [eventDate]);

  const cta = 'inline-flex items-center justify-center gap-2.5 min-h-[52px] px-6 rounded-[10px] font-semibold text-[15px] no-underline transition-colors';

  return (
    <div className="px-4 sm:px-10 pt-6 sm:pt-8 pb-32 md:pb-14 flex flex-col gap-6 max-w-[1180px]">
      <section className="relative overflow-hidden bg-[#141210] text-white rounded-[20px] p-6 sm:p-10 lg:p-12 grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 items-center">
        <div className="flex flex-col gap-5">
          <span className="self-start inline-flex items-center gap-2 text-xs font-semibold tracking-[0.04em] px-3 py-1.5 rounded-full text-[#F2B99A] bg-[rgba(198,102,60,0.18)]">
            Álbum de fotos de tus invitados
          </span>
          <h2 className="m-0 text-[30px] sm:text-[44px] font-semibold leading-[1.08] tracking-[-0.025em]">Las fotos de tu boda que tu fotógrafo no va a tomar.</h2>
          <p className="m-0 text-[15px] sm:text-[17px] leading-relaxed text-[#D4D4D8] max-w-[520px]">
            Tus invitados toman fotos toda la noche desde su mesa. Con el álbum llegan a ti en un solo lugar, con buena calidad y sin perseguir a nadie por WhatsApp.
            {standalone && <span className="text-white font-semibold"> No necesitas invitación con nosotros.</span>}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href={href} target="_blank" rel="noopener noreferrer" onClick={onCta} className={`${cta} bg-[#AE5730] hover:bg-[#8F4524] text-white shadow-[0_10px_28px_rgba(174,87,48,0.45)] w-full sm:w-auto`}>
              <WhatsAppIcon />
              Activar mi álbum · ${price}
            </a>
            <a href="#album-como-funciona" className={`${cta} hidden sm:inline-flex border border-[rgba(255,255,255,0.25)] text-white hover:bg-[rgba(255,255,255,0.06)]`}>
              Ver cómo funciona
            </a>
          </div>
          <div className="flex flex-wrap gap-x-[18px] gap-y-1.5 text-[13px] font-medium text-[#A1A1AA]">
            {['Pago único', 'Sin app para tus invitados', 'Listo el mismo día'].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#4ADE80]" strokeWidth={2.6} />
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden lg:block">
          <HeroPhones />
        </div>
      </section>

      {countdown && (
        <section className="bg-white border border-[rgba(174,87,48,0.25)] rounded-2xl px-4 sm:px-[22px] py-4 flex items-start sm:items-center gap-4">
          <span className="w-11 h-11 flex-shrink-0 rounded-xl bg-[rgba(198,102,60,0.1)] text-[#AE5730] flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </span>
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold text-[#0A0A0A]">
              Su boda es el {countdown.date}: {countdown.days === 1 ? 'falta 1 día' : `faltan ${countdown.days} días`}.
            </span>
            <span className="text-[13px] font-medium text-[#52525B]">Actívalo con tiempo para imprimir el QR junto con los centros de mesa y avisar a tus invitados.</span>
          </div>
          <a href={href} target="_blank" rel="noopener noreferrer" onClick={onCta} className="hidden sm:inline flex-shrink-0 text-sm font-semibold text-[#AE5730] hover:text-[#8F4524] no-underline">
            Activar ahora →
          </a>
        </section>
      )}

      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#F4F4F5] rounded-2xl p-6 flex flex-col gap-3.5">
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#71717A]">Sin álbum</span>
          {WITHOUT.map((w) => (
            <div key={w} className="flex gap-2.5 items-start text-sm font-medium text-[#52525B] leading-snug">
              <X className="h-4 w-4 text-[#A1A1AA] flex-shrink-0 mt-0.5" strokeWidth={2.4} />
              {w}
            </div>
          ))}
        </div>
        <div className="bg-white border-[1.5px] border-[#AE5730] rounded-2xl p-6 flex flex-col gap-3.5 shadow-[0_12px_30px_-18px_rgba(174,87,48,0.6)]">
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#AE5730]">Con el álbum de Invyta</span>
          {WITH_ALBUM.map((w) => (
            <div key={w} className="flex gap-2.5 items-start text-sm font-semibold text-[#0A0A0A] leading-snug">
              <Check className="h-4 w-4 text-[#15803D] flex-shrink-0 mt-0.5" strokeWidth={2.6} />
              {w}
            </div>
          ))}
        </div>
      </section>

      <section id="album-como-funciona" className="scroll-mt-6 bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 sm:p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#71717A]">Cómo funciona</span>
          <h3 className="m-0 text-[20px] sm:text-[26px] font-semibold tracking-[-0.015em] text-[#0A0A0A]">Listo en 3 pasos, sin que tus invitados descarguen nada</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col gap-3 p-5 rounded-[14px] bg-[#FAFAFA]">
              <span className="text-[28px] font-semibold tracking-[-0.02em] text-[#AE5730]">{s.n}</span>
              <span className="text-base font-semibold text-[#0A0A0A]">{s.title}</span>
              <span className="text-sm font-medium text-[#52525B] leading-relaxed">{s.body}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-4 items-start">
        <div className="bg-white border-[1.5px] border-[#0A0A0A] rounded-[20px] p-6 sm:p-7 flex flex-col gap-[18px]">
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#71717A]">Pago único por boda</span>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            {!standalone && (
              <s className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] leading-none text-[#A1A1AA]" aria-label={`Antes $${ALBUM_PRICE.standalone}`}>
                ${ALBUM_PRICE.standalone}
              </s>
            )}
            <span className="text-[44px] sm:text-[52px] font-semibold tracking-[-0.03em] leading-none text-[#0A0A0A]">${price}</span>
            <span className="text-base font-semibold text-[#52525B]">MXN</span>
          </div>
          {!standalone && (
            <span className="self-start -mt-2 text-[13px] font-semibold text-[#AE5730] bg-[rgba(198,102,60,0.08)] rounded-lg px-2.5 py-1.5">
              Precio especial por tener tu invitación con Invyta.
            </span>
          )}
          <div className="flex flex-col gap-2.5">
            {includes.map((i) => (
              <span key={i} className="flex gap-2.5 items-start text-sm font-medium text-[#27272A] leading-snug">
                <Check className="h-4 w-4 text-[#15803D] flex-shrink-0 mt-0.5" strokeWidth={2.6} />
                {i}
              </span>
            ))}
          </div>
          <a href={href} target="_blank" rel="noopener noreferrer" onClick={onCta} className={`${cta} bg-[#AE5730] hover:bg-[#8F4524] text-white`}>
            <WhatsAppIcon />
            Activar por WhatsApp
          </a>
          <span className="text-[12.5px] font-medium text-[#71717A] text-center">Nos escribes, pagas y lo activamos ese mismo día.</span>
        </div>

        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[20px] p-6 sm:p-7 flex flex-col">
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#71717A] pb-2">Preguntas frecuentes</span>
          {faq.map((q, i) => {
            const open = openFaq === i;
            return (
              <div key={q.question} className="border-t border-[rgba(0,0,0,0.08)] py-3.5">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex justify-between items-center gap-3 text-left text-[15px] font-semibold text-[#0A0A0A]"
                >
                  {q.question}
                  <Plus className={`h-4 w-4 text-[#71717A] flex-shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? 'rotate-45' : ''}`} />
                </button>
                <div
                  role="region"
                  style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: `grid-template-rows 480ms ${SOFT_EASE}` }}
                >
                  <div style={{ overflow: 'hidden', minHeight: 0 }}>
                    <p
                      className="m-0 pt-2.5 text-sm font-medium text-[#52525B] leading-relaxed"
                      style={{
                        opacity: open ? 1 : 0,
                        transform: open ? 'translateY(0)' : 'translateY(-6px)',
                        transition: `opacity 360ms ease ${open ? '120ms' : '0ms'}, transform 480ms ${SOFT_EASE}`,
                      }}
                    >
                      {q.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#AE5730] text-white rounded-[20px] px-6 sm:px-10 py-8 sm:py-9 flex flex-wrap items-center justify-between gap-5">
        <div className="flex flex-col gap-1.5 max-w-[620px]">
          <h3 className="m-0 text-[22px] sm:text-[28px] font-semibold tracking-[-0.02em] leading-tight">Que ningún momento se quede en el celular de alguien más.</h3>
          <span className="text-[15px] font-medium text-[#FBE3D6]">
            {!standalone && <s className="text-[#F2B99A] mr-1.5">${ALBUM_PRICE.standalone}</s>}${price} MXN · pago único · listo el mismo día
          </span>
        </div>
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onCta} className={`${cta} bg-white text-[#8F4524] hover:bg-[#FBF7F1]`}>
          <WhatsAppIcon />
          Activar mi álbum
        </a>
      </section>

      <div className="md:hidden fixed left-0 right-0 bottom-0 z-30 px-4 pt-3 pb-5 bg-white border-t border-[rgba(0,0,0,0.08)] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-[#0A0A0A]">
            {!standalone && <s className="text-[13px] text-[#A1A1AA] mr-1">${ALBUM_PRICE.standalone}</s>}${price} MXN
          </span>
          <span className="text-[11.5px] font-medium text-[#71717A]">Pago único</span>
        </div>
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onCta} className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] rounded-[10px] bg-[#AE5730] text-white no-underline text-sm font-semibold">
          <WhatsAppIcon size={16} />
          Activar por WhatsApp
        </a>
      </div>
    </div>
  );
}
