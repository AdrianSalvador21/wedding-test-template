'use client';

import React, { useState } from 'react';
import { fraunces, LSection, LReveal, LStagger, LStaggerItem } from './ui';

const WHATSAPP_LINK_IA =
  'https://wa.me/529602460590?text=Hola!%20Me%20interesa%20el%20Paquete%20Personalizado%20con%20IA%20de%20Invyta.';

type Tone = 'romantico' | 'divertido' | 'elegante';
type Lang = 'es' | 'en';

const tones: { id: Tone; label: string }[] = [
  { id: 'romantico', label: 'Romántico' },
  { id: 'divertido', label: 'Divertido' },
  { id: 'elegante', label: 'Elegante' },
];

const langs: { id: Lang; label: string }[] = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'English' },
];

const stories: Record<Tone, Record<Lang, string>> = {
  romantico: {
    es: 'Nos conocimos en una clase de historia del arte, rodeados de cuadros que hablaban de amor sin saber que el nuestro apenas comenzaba. Un día de lluvia, un paraguas prestado nos acercó, y nunca fue devuelto. Hoy, años después, seguimos caminando bajo el mismo cielo y queremos compartir contigo el día en que decimos «para siempre».',
    en: 'We met in an art history class, surrounded by paintings that spoke of love before ours had even begun. One rainy day, a borrowed umbrella brought us together, and it was never returned. Years later, we still walk under the same sky, and we want to share with you the day we say “forever.”',
  },
  divertido: {
    es: 'Todo empezó en clase de historia del arte, donde ninguno de los dos iba por el arte. Un día llovía, alguien prestó un paraguas y, spoiler: nunca se devolvió. Años después nos casamos y el paraguas sigue desaparecido, pero nosotros ya nos encontramos. Ven a celebrarlo con nosotros.',
    en: 'It all started in art history class, where neither of us was there for the art. One rainy day someone lent an umbrella and, spoiler alert, it was never returned. Years later we are getting married, and the umbrella is still missing, but we found each other. Come celebrate with us.',
  },
  elegante: {
    es: 'Nuestros caminos se cruzaron en un aula de historia del arte. Una tarde de lluvia, un paraguas compartido dio inicio a una conversación que continúa hasta hoy. Con la alegría de quienes han encontrado su lugar, los invitamos a acompañarnos en el día más importante de nuestras vidas.',
    en: 'Our paths crossed in an art history classroom. One rainy afternoon, a shared umbrella began a conversation that continues to this day. With the joy of those who have found their place, we invite you to join us on the most important day of our lives.',
  },
};

const sparkle = 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z';

const capabilities = [
  {
    title: 'Historia de amor',
    text: 'Responde tres preguntas y recibe tu historia lista para la invitación, en español e inglés.',
    icon: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />,
  },
  {
    title: 'Traducción a inglés',
    text: 'Traduce cada texto de tu invitación y revisa el resultado antes de aplicarlo.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9z" />
      </>
    ),
  },
  {
    title: 'Itinerario sugerido',
    text: 'De 3 a 5 momentos del día a partir de la hora de tu ceremonia, listos para editar.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
  },
  {
    title: 'Hoteles y lugares cerca',
    text: 'Ideas de dónde hospedarse, comer y qué hacer cerca de tu recepción, con enlace a Google Maps.',
    icon: (
      <>
        <path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  },
  {
    title: 'Código de vestimenta',
    text: 'Describe cómo deben vestir tus invitados, con el tono de tu boda.',
    icon: <path d="M12 6a2 2 0 10-2-2M12 6v2l8 6a1 1 0 01-.6 1.8H4.6A1 1 0 014 14l8-6" />,
  },
];

const guarantees = [
  {
    title: 'Tú tienes el control',
    text: 'Todo llega como borrador. Nada se guarda ni se publica hasta que das clic en Guardar.',
    icon: (
      <>
        <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    title: 'Incluido en tu paquete',
    text: 'Sin suscripción ni cobros por uso. Cada función trae sus generaciones incluidas.',
    icon: <path d={sparkle} />,
  },
  {
    title: 'Revisas antes de agregar',
    text: 'Los lugares sugeridos traen enlace a Google Maps para que verifiques que existen.',
    icon: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
];

export default function AiSection() {
  const [tone, setTone] = useState<Tone>('romantico');
  const [lang, setLang] = useState<Lang>('es');

  return (
    <LSection id="ia" tone="charcoal" className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12 md:gap-14">
        <LReveal className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E3A483" strokeWidth="2">
              <path d={sparkle} />
            </svg>
            <span className="text-xs md:text-[13px] font-bold tracking-[2.5px] md:tracking-[3px] uppercase text-[#E3A483]">
              Exclusivo Paquete Personalizado
            </span>
          </div>
          <h2 className="text-[34px] md:text-5xl leading-[1.1] tracking-tight" style={fraunces}>
            Tu invitación se escribe sola.
            <br />
            <em className="text-[#E3A483]">Tú solo la revisas.</em>
          </h2>
          <p className="text-[15.5px] md:text-[17px] leading-relaxed text-[#D8CFC4] max-w-[640px]">
            Responde tres preguntas y el editor redacta tu historia en español e inglés. También traduce, arma tu
            itinerario y sugiere lugares para tus invitados. Tú decides qué se queda.
          </p>
        </LReveal>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-stretch">
          <LReveal className="lg:flex-[0_0_55%] min-w-0">
            <div className="h-full bg-[#FBF7F1] text-[#2B2622] rounded-[20px] md:rounded-3xl p-5 md:p-8 shadow-[0_32px_64px_rgba(0,0,0,0.35)] flex flex-col gap-3.5 md:gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-[30px] h-[30px] rounded-[9px] bg-[#F5F3FF] flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2">
                      <path d={sparkle} />
                    </svg>
                  </div>
                  <span className="text-sm md:text-[15px] font-bold">Redactor de textos con IA</span>
                </div>
                <span className="bg-[#F0E6D8] text-[#8A5A32] text-[11px] md:text-xs font-bold px-2.5 md:px-3 py-1.5 rounded-full whitespace-nowrap">
                  Ejemplo ilustrativo
                </span>
              </div>
              <div className="h-px bg-[rgba(43,38,34,0.1)]" />

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] md:text-xs font-bold tracking-[1.5px] uppercase text-[#5A534B]">
                  ¿Cómo se conocieron?
                </span>
                <div className="bg-white border border-[rgba(43,38,34,0.14)] rounded-xl px-3.5 py-3 text-sm md:text-[14.5px] leading-normal">
                  En una clase de historia del arte, en la universidad.
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] md:text-xs font-bold tracking-[1.5px] uppercase text-[#5A534B]">
                  Una anécdota que los defina
                </span>
                <div className="bg-white border border-[rgba(43,38,34,0.14)] rounded-xl px-3.5 py-3 text-sm md:text-[14.5px] leading-normal">
                  Un día de lluvia le presté un paraguas y nunca me lo devolvió.
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[11px] md:text-xs font-bold tracking-[1.5px] uppercase text-[#5A534B]">Tono</span>
                  <span className="text-xs text-[#5A534B]">Elige uno y míralo cambiar</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {tones.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={tone === t.id}
                      onClick={() => setTone(t.id)}
                      className={`min-h-[44px] px-5 md:px-[22px] rounded-full border text-[13.5px] md:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] ${
                        tone === t.id
                          ? 'bg-[#6D28D9] border-[#6D28D9] text-white'
                          : 'bg-white border-[rgba(43,38,34,0.25)] text-[#2B2622] hover:border-[#6D28D9]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-4 md:px-5 md:py-[18px] flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#EDE9FE] text-[#5B21B6] text-[11px] md:text-xs font-bold px-2.5 md:px-3 py-1.5 rounded-full whitespace-nowrap">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5B21B6" strokeWidth="2.4">
                      <path d={sparkle} />
                    </svg>
                    Generado con IA
                  </span>
                  <div className="flex gap-1.5 md:gap-2">
                    {langs.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        aria-pressed={lang === l.id}
                        onClick={() => setLang(l.id)}
                        className={`min-h-[44px] px-3.5 md:px-[18px] rounded-full border text-[12.5px] md:text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] ${
                          lang === l.id
                            ? 'bg-[#6D28D9] border-[#6D28D9] text-white'
                            : 'bg-transparent border-[#C4B5FD] text-[#5B21B6] hover:bg-[#EDE9FE]'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <p
                  lang={lang}
                  aria-live="polite"
                  className="min-h-[300px] md:min-h-[180px] text-base md:text-[17px] leading-[1.65] text-[#2B2622]"
                  style={fraunces}
                >
                  {stories[tone][lang]}
                </p>
              </div>

              <div className="flex items-start gap-2 text-[12.5px] md:text-[13px] leading-normal text-[#5A534B]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C8363" strokeWidth="2.4" className="flex-shrink-0 mt-px">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Lo editas antes de guardar. Nada se publica solo.</span>
              </div>
            </div>
          </LReveal>

          <LStagger className="flex flex-col gap-3 md:gap-3.5 lg:flex-1 min-w-0">
            {capabilities.map((cap) => (
              <LStaggerItem key={cap.title} className="lg:flex-1 flex">
                <div className="w-full flex items-start lg:items-center gap-3.5 md:gap-[18px] p-[18px] md:px-6 md:py-5 bg-[#2B2622] border border-[rgba(251,247,241,0.1)] rounded-[18px] md:rounded-[20px]">
                  <div className="flex-shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-[11px] md:rounded-xl bg-[rgba(227,164,131,0.14)] flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E3A483" strokeWidth="1.8">
                      {cap.icon}
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[19px] md:text-xl" style={fraunces}>
                      {cap.title}
                    </span>
                    <span className="text-sm leading-[1.55] text-[#D8CFC4]">{cap.text}</span>
                  </div>
                </div>
              </LStaggerItem>
            ))}
          </LStagger>
        </div>

        <LStagger className="grid md:grid-cols-3 gap-6 md:gap-10 border-t border-[rgba(251,247,241,0.14)] pt-8 md:pt-10">
          {guarantees.map((item) => (
            <LStaggerItem key={item.title} className="flex flex-col gap-1.5 md:gap-2">
              <div className="flex items-center gap-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E3A483" strokeWidth="1.8">
                  {item.icon}
                </svg>
                <span className="text-lg md:text-[19px]" style={fraunces}>
                  {item.title}
                </span>
              </div>
              <span className="text-sm leading-relaxed text-[#D8CFC4]">{item.text}</span>
            </LStaggerItem>
          ))}
        </LStagger>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-5 md:gap-8 text-center">
          <a
            href={WHATSAPP_LINK_IA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full bg-[#AE5730] hover:bg-[#8F4626] text-[#FBF7F1] text-base font-semibold transition-colors"
          >
            Quiero mi invitación con IA
          </a>
          <a
            href="#paquetes"
            className="self-center text-[15px] font-bold text-[#FBF7F1] border-b border-[#FBF7F1] pb-0.5 w-fit"
          >
            Ver el Paquete Personalizado →
          </a>
        </div>
      </div>
    </LSection>
  );
}
