import type { Metadata } from 'next';
import Image from 'next/image';
import PageShell from '../../components/marketing/PageShell';
import FaqList from '../../components/marketing/FaqList';
import JsonLd from '../../components/seo/JsonLd';
import { fraunces, manrope } from '../../lib/brand';
import { whatsappUrl } from '../../lib/contact';
import { ALBUM_FAQ, getDesign } from '../../lib/marketing-content';
import { pageMetadata } from '../../lib/page-metadata';
import { breadcrumbSchema, faqSchema } from '../../lib/seo-schema';

// Spec 29 — página pública del álbum de fotos de los invitados. La landing solo lleva un
// banner sin precio (AlbumBanner); aquí va el detalle, el precio y las preguntas frecuentes.

export const metadata: Metadata = pageMetadata({
  title: 'Álbum de fotos de los invitados para tu boda | Invyta',
  description:
    'Tus invitados suben sus fotos desde su invitación o con un QR en las mesas, sin app ni registro. Todas en un solo álbum con el diseño de tu invitación. $399 MXN, pago único.',
  path: '/album-de-fotos',
});

const WHATSAPP = whatsappUrl('Hola! Quiero información del álbum de fotos para mi boda.');
const jardin = getDesign('jardin-editorial')!;
const moderno = getDesign('moderno')!;
const clasico = getDesign('clasico')!;
const botanica = getDesign('botanica-editorial')!;

const EYEBROW = 'text-[12.5px] font-semibold tracking-[0.2em] uppercase text-[#AE5730]';
const H2 = 'm-0 text-[28px] md:text-[42px] leading-[1.13] text-[#211D19] [text-wrap:balance]';
const WRAP = 'max-w-[1260px] mx-auto px-5 md:px-10';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2.5 min-h-[54px] px-[26px] rounded-full bg-[#AE5730] text-[#FBF7F1] no-underline text-[15.5px] font-semibold shadow-[0_12px_26px_rgba(174,87,48,0.28)] hover:bg-[#9A4B28] transition-colors';

const WITHOUT = [
  'Las fotos quedan repartidas en decenas de chats de WhatsApp.',
  'Llegan comprimidas, borrosas o nunca llegan.',
  'Tienes que pedirlas una por una, semanas después.',
  'Los mejores momentos de tus invitados nunca los ves.',
];
const WITH_ALBUM = [
  'Todas en un solo lugar, con el nombre de quien la tomó.',
  'Con calidad para verlas en grande o imprimirlas en tamaño postal.',
  'Llegan desde la misma noche de la boda.',
  'Las descargas todas juntas cuando quieras.',
];
const STEPS = [
  { n: '01', title: 'Lo agregas a tu invitación', body: 'Nos escribes por WhatsApp y lo activamos ese mismo día. Tú eliges el modo del álbum desde tu panel.' },
  { n: '02', title: 'Llega el gran día', body: 'Tu invitación muestra "Comparte tus fotos" y pones el QR en las mesas.' },
  { n: '03', title: 'Tus invitados suben', body: 'Desde su celular, sin descargar nada ni crear cuenta. Hasta 30 fotos cada invitación, durante 3 semanas.' },
  { n: '04', title: 'Tú te quedas con todo', body: 'Ves cada foto con el nombre de quien la subió y descargas todo en ZIP.' },
];
const CONTROL = [
  { n: '1', title: 'Decides qué se ve', body: 'Oculta o borra cualquier foto al momento.' },
  { n: '2', title: 'Solo para tus invitados', body: 'Entra quien tiene el link de tu boda o el QR de las mesas.' },
  { n: '3', title: 'Tres semanas para compartir', body: 'Hasta 30 fotos por invitación, desde el día de la boda.' },
  { n: '4', title: 'Dos años para descargarlas', body: 'Las fotos se guardan 2 años desde tu boda.' },
];
const INCLUDES = [
  'Álbum con el diseño de tu invitación',
  'Botón "Comparte tus fotos" en la invitación',
  'QR imprimible para las mesas',
  'Álbum abierto o cámara desechable',
  'Descarga de todas las fotos en ZIP',
];
const TEMPLATES = [
  { name: 'Clásico', image: clasico.image },
  { name: 'Moderno', image: moderno.image },
  { name: 'Botánica', image: botanica.image },
  { name: 'Jardín', image: jardin.image },
];
const TILES = ['50% 20%', '30% 45%', '70% 30%', '50% 60%', '40% 35%'];

const Check = ({ color = '#5B6342' }: { color?: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0 mt-[3px]">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

function HeroPhones() {
  return (
    <div aria-hidden="true" className="relative h-[360px] md:h-[520px]">
      <div className="absolute left-[4%] top-12 md:top-16 w-[160px] h-[310px] md:w-[220px] md:h-[440px] rounded-[26px] md:rounded-[32px] p-[5px] md:p-[7px] bg-[#0E0C0B] shadow-[0_28px_52px_rgba(0,0,0,0.28)] -rotate-[6deg]">
        <div className="relative w-full h-full rounded-[21px] md:rounded-[26px] overflow-hidden bg-[#2E3326]">
          <Image src={jardin.image} alt="" fill sizes="220px" className="object-cover" style={{ objectPosition: '50% 22%' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(20,22,14,0.7)]" />
          <span className="absolute left-3 bottom-3.5 inline-flex items-center h-[26px] md:h-[30px] px-2.5 bg-[#F4EFE3] text-[#2E3323] text-[6.5px] md:text-[7.5px] tracking-[0.18em] uppercase">
            Comparte tus fotos
          </span>
        </div>
      </div>
      <div className="absolute right-[4%] top-0 w-[170px] h-[330px] md:w-[230px] md:h-[460px] rounded-[26px] md:rounded-[32px] p-[5px] md:p-[7px] bg-[#0E0C0B] shadow-[0_34px_60px_rgba(0,0,0,0.32)] rotate-[4deg]">
        <div className="w-full h-full rounded-[21px] md:rounded-[26px] overflow-hidden bg-[#F4EFE3] flex flex-col">
          <div className="bg-[#2E3323] text-[#F4EFE3] px-2.5 pt-6 pb-4 flex flex-col items-center gap-1 text-center">
            <span className="text-[6px] md:text-[6.5px] tracking-[0.24em] uppercase text-[#C9A98C]">Álbum de la boda</span>
            <span className="text-[13px] md:text-base tracking-[0.06em] uppercase leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              Renata <span className="text-[10px] italic normal-case text-[#C9A98C]">y</span> Joaquín
            </span>
          </div>
          <div className="p-2 md:p-2.5 flex flex-col gap-2">
            <div className="h-6 md:h-7 bg-[#2E3323] text-[#F4EFE3] flex items-center justify-center text-[6.5px] md:text-[7px] tracking-[0.2em] uppercase">Subir fotos</div>
            <div className="grid grid-cols-2 gap-1">
              {TILES.map((pos, i) => (
                <div key={pos} className={`relative overflow-hidden bg-[#DDD3BD] ${i % 3 === 0 ? 'col-span-2' : ''}`} style={{ aspectRatio: i % 3 === 0 ? '16 / 10' : '1 / 1' }}>
                  <Image src={jardin.image} alt="" fill sizes="120px" className="object-cover" style={{ objectPosition: pos }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-[18%] bottom-0 z-[3] flex items-center gap-2.5 bg-white rounded-2xl px-3.5 py-2.5 shadow-[0_16px_36px_rgba(43,38,34,0.2)]">
        <span className="w-8 h-8 rounded-full bg-[#EEF1E6] text-[#4E5638] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span className="flex flex-col">
          <span className="text-[13px] font-semibold text-[#211D19]">Carlos subió 6 fotos</span>
          <span className="text-[11.5px] font-medium text-[#6B6359]">Hace 2 minutos</span>
        </span>
      </div>
    </div>
  );
}

export default function AlbumDeFotosPage() {
  return (
    <PageShell active="/album-de-fotos" crumbs={[{ name: 'Álbum de fotos' }]}>
      <JsonLd data={[breadcrumbSchema([{ name: 'Álbum de fotos', path: '/album-de-fotos' }]), faqSchema(ALBUM_FAQ)]} />
      <div style={manrope} className="text-[#2B2622]">
        <section data-track-location="hero" className={`${WRAP} pt-8 pb-16 md:pt-12 md:pb-[88px] grid lg:grid-cols-2 gap-10 lg:gap-12 items-center`}>
          <div className="flex flex-col gap-5 md:gap-[22px]">
            <span className={`inline-flex items-center gap-2.5 ${EYEBROW}`}>
              <span className="w-[26px] h-px bg-[#AE5730]" aria-hidden="true" />
              Álbum de fotos de los invitados
            </span>
            <h1 className="m-0 text-[36px] md:text-[58px] leading-[1.05] tracking-[-0.02em] text-[#211D19] [text-wrap:balance]" style={fraunces}>
              Las fotos que tu fotógrafo no va a tomar, en un solo álbum.
            </h1>
            <p className="m-0 text-base md:text-lg leading-relaxed text-[#4A433C] max-w-[540px]">
              Tus invitados toman fotos toda la noche desde su mesa. Con el álbum de Invyta llegan a ti el mismo día, con buena calidad y sin perseguir a nadie por WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3 pt-1.5">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={BTN_PRIMARY}>
                <WhatsAppIcon />
                Pregúntanos por WhatsApp
              </a>
              <a href="#como-funciona" className="inline-flex items-center min-h-[54px] px-6 rounded-full border-[1.5px] border-[#211D19] text-[#211D19] no-underline text-[15.5px] font-semibold hover:bg-[#211D19] hover:text-[#FBF7F1] transition-colors">
                Ver cómo funciona
              </a>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#4A433C]">
              {['Sin app', 'Sin registro', 'Con el diseño de tu invitación'].map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5">
                  <Check />
                  {c}
                </span>
              ))}
            </div>
          </div>
          <HeroPhones />
        </section>

        <section className="bg-white border-y border-[rgba(43,38,34,0.08)]">
          <div className={`${WRAP} py-14 md:py-[88px] flex flex-col gap-8 md:gap-10`}>
            <div className="max-w-[720px] flex flex-col gap-3.5">
              <span className={EYEBROW}>El problema</span>
              <h2 className={H2} style={fraunces}>
                Después de la boda, las mejores fotos están en el celular de alguien más.
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              <div className="bg-[#F6EFE4] rounded-[22px] p-6 md:p-8 flex flex-col gap-4">
                <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#6B6359]">Sin álbum</span>
                {WITHOUT.map((w) => (
                  <div key={w} className="flex gap-3 items-start text-[15px] md:text-base leading-normal text-[#4A433C]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A89C8E" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true" className="flex-shrink-0 mt-[3px]">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    {w}
                  </div>
                ))}
              </div>
              <div className="bg-[#211D19] text-[#FBF7F1] rounded-[22px] p-6 md:p-8 flex flex-col gap-4">
                <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#E7A57F]">Con el álbum de Invyta</span>
                {WITH_ALBUM.map((w) => (
                  <div key={w} className="flex gap-3 items-start text-[15px] md:text-base font-medium leading-normal">
                    <Check color="#A9C08A" />
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className={`${WRAP} scroll-mt-[90px] py-14 md:py-24 flex flex-col gap-9 md:gap-11`}>
          <div className="max-w-[720px] flex flex-col gap-3.5">
            <span className={EYEBROW}>Cómo funciona</span>
            <h2 className={H2} style={fraunces}>
              Tu invitación se convierte en el álbum, el mismo día de la boda.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col gap-3 pt-5 border-t-[1.5px] border-[#211D19]">
                <span className="text-[34px] leading-none text-[#AE5730]" style={fraunces}>
                  {s.n}
                </span>
                <span className="text-lg font-semibold text-[#211D19]">{s.title}</span>
                <span className="text-[15px] leading-relaxed text-[#4A433C]">{s.body}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#F6EFE4]">
          <div className={`${WRAP} py-14 md:py-24 flex flex-col gap-8 md:gap-10`}>
            <div className="max-w-[720px] flex flex-col gap-3.5">
              <span className={EYEBROW}>Dos maneras de vivirlo</span>
              <h2 className={H2} style={fraunces}>
                Tú eliges cómo se comparten las fotos.
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              <div className="bg-white rounded-[22px] p-6 md:p-8 flex flex-col gap-2.5">
                <span className="text-[22px] md:text-[26px] text-[#211D19]" style={fraunces}>
                  Álbum abierto
                </span>
                <span className="text-[15px] md:text-[15.5px] leading-relaxed text-[#4A433C]">
                  Cada foto aparece en el álbum en cuanto se sube. Tus invitados ven la boda desde todos los ángulos, en tiempo real.
                </span>
              </div>
              <div className="bg-white rounded-[22px] p-6 md:p-8 flex flex-col gap-2.5">
                <span className="text-[22px] md:text-[26px] text-[#211D19]" style={fraunces}>
                  Cámara desechable
                </span>
                <span className="text-[15px] md:text-[15.5px] leading-relaxed text-[#4A433C]">
                  Como las de antes: cada invitado ve solo sus fotos y el álbum completo se abre al día siguiente de la boda. Una sorpresa para todos.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={`${WRAP} py-14 md:py-24 grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-8 lg:gap-14 items-center`}>
          <div className="flex flex-col gap-3.5">
            <span className={EYEBROW}>Con el diseño de tu invitación</span>
            <h2 className={H2} style={fraunces}>
              No es otra app: es tu boda, con tus colores.
            </h2>
            <p className="m-0 text-base md:text-[17px] leading-relaxed text-[#4A433C]">
              El álbum toma las tipografías, los colores y los detalles del diseño que elegiste. Incluso el QR para las mesas sale con el estilo de tu invitación.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-3.5">
            {TEMPLATES.map((t) => (
              <div key={t.name} className="rounded-2xl overflow-hidden bg-white border border-[rgba(43,38,34,0.08)]">
                <div className="relative h-[120px] md:h-[150px]">
                  <Image src={t.image} alt={`Diseño ${t.name}`} fill sizes="(min-width: 640px) 160px, 45vw" className="object-cover object-top" />
                </div>
                <div className="px-3 py-2.5 text-[13px] font-semibold text-[#4A433C]">{t.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border-y border-[rgba(43,38,34,0.08)]">
          <div className={`${WRAP} py-14 md:py-24 grid lg:grid-cols-2 gap-10 lg:gap-14 items-start`}>
            <div className="flex flex-col gap-5 md:gap-[22px]">
              <span className={EYEBROW}>Tú tienes el control</span>
              <h2 className={H2} style={fraunces}>
                Todo pasa por tu panel.
              </h2>
              {CONTROL.map((c) => (
                <div key={c.n} className="flex gap-3.5 items-start">
                  <span className="w-9 h-9 flex-shrink-0 rounded-full bg-[#F6EFE4] text-[#AE5730] flex items-center justify-center text-[15px]" style={fraunces}>
                    {c.n}
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-[17px] font-semibold text-[#211D19]">{c.title}</span>
                    <span className="text-[15px] leading-normal text-[#4A433C]">{c.body}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#F6EFE4] rounded-[26px] p-6 md:p-10 flex flex-col gap-5 md:gap-[22px]">
              <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#6B6359]">Precio</span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-[52px] md:text-[64px] leading-none text-[#211D19]" style={fraunces}>
                  $399
                </span>
                <span className="text-base md:text-[17px] font-semibold text-[#4A433C]">MXN · pago único</span>
              </div>
              <p className="m-0 text-[15px] md:text-[15.5px] leading-normal text-[#4A433C]">
                Se agrega a cualquier invitación con diseño de Invyta (paquete Básico o Personalizado).
              </p>
              <div className="flex flex-col gap-[11px] border-t border-[rgba(43,38,34,0.12)] pt-5">
                {INCLUDES.map((i) => (
                  <span key={i} className="flex gap-2.5 items-start text-[15px] font-medium text-[#2B2622]">
                    <Check />
                    {i}
                  </span>
                ))}
              </div>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={BTN_PRIMARY}>
                <WhatsAppIcon />
                Agregarlo a mi invitación
              </a>
            </div>
          </div>
        </section>

        <section className={`${WRAP} py-14 md:py-24 grid lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-8 lg:gap-14`}>
          <div className="flex flex-col gap-3.5">
            <span className={EYEBROW}>Preguntas frecuentes</span>
            <h2 className={H2} style={fraunces}>
              Lo que nos preguntan del álbum.
            </h2>
            <p className="m-0 text-base leading-relaxed text-[#4A433C]">
              ¿Tienes otra duda?{' '}
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-[#AE5730] font-semibold">
                Escríbenos por WhatsApp
              </a>
              .
            </p>
          </div>
          <FaqList items={ALBUM_FAQ} openFirst soft />
        </section>

        <section data-track-location="cta" className="bg-[#211D19] text-[#FBF7F1]">
          <div className={`${WRAP} py-14 md:py-[88px] pb-28 md:pb-[88px] flex flex-wrap items-center justify-between gap-7`}>
            <h2 className="m-0 max-w-[680px] text-[28px] md:text-[42px] leading-[1.14]" style={fraunces}>
              Que ningún momento se quede en el celular de alguien más.
            </h2>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={`${BTN_PRIMARY} hidden md:inline-flex`}>
              <WhatsAppIcon />
              Pregúntanos por WhatsApp
            </a>
          </div>
        </section>

        <div className="md:hidden fixed left-0 right-0 bottom-0 z-40 px-4 pt-3 pb-5 bg-[rgba(251,247,241,0.97)] border-t border-[rgba(43,38,34,0.1)] shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={`${BTN_PRIMARY} w-full min-h-[50px]`}>
            <WhatsAppIcon />
            Pregúntanos por WhatsApp
          </a>
        </div>
      </div>
    </PageShell>
  );
}
