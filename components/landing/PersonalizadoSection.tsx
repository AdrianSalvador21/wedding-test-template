'use client';

import React, { useRef, useState } from 'react';
import { fraunces, LSection, LCheckIcon, L_WRAP, L_EYEBROW, L_H2, L_LEAD } from './ui';
import { formatPrice, getPackage } from '../../lib/marketing-content';

// Lo que suma el Personalizado (spec 26): fusiona las antiguas secciones del editor y de la IA y
// agrega la invitación por invitado. Tres pestañas accesibles (flechas izquierda/derecha).
// Las demos viven solo en el navegador: no se guarda ni se envía nada.

const priceGap = getPackage('personalizado').price - getPackage('basico').price;

// ---------- Piezas comunes ----------

function DemoCard({ title, hint, children, single = false }: { title: string; hint: string; children: React.ReactNode; single?: boolean }) {
  return (
    <div
      className={`bg-white border border-[rgba(43,38,34,0.1)] rounded-[22px] md:rounded-[26px] p-[18px] md:p-[26px] shadow-[0_26px_52px_rgba(43,38,34,0.09)] grid grid-cols-1 gap-[22px] items-center ${
        single ? '' : 'md:grid-cols-[1fr_168px]'
      }`}
    >
      <div className="col-span-full flex justify-between items-center gap-2.5 pb-3.5 border-b border-[rgba(43,38,34,0.1)]">
        <b className="text-[15px] text-[#211D19]">{title}</b>
        <span className="text-[11.5px] font-extrabold bg-[#F0E6D8] text-[#8A5A32] rounded-full px-2.5 py-[5px] whitespace-nowrap">{hint}</span>
      </div>
      {children}
    </div>
  );
}

const fieldLabel = 'flex flex-col gap-[5px] text-[11.5px] font-extrabold tracking-[0.08em] uppercase text-[#6B6359]';
const fieldInput =
  'w-full font-semibold text-[14.5px] leading-[1.3] normal-case tracking-normal text-[#211D19] bg-[#FBF7F1] border-[1.5px] border-[rgba(43,38,34,0.18)] rounded-xl px-[13px] py-[11px] focus:outline-none focus:border-[#AE5730] focus:bg-white';

// Celular de vista previa con el arco de la invitación.
function PreviewPhone({ ivory = false, children }: { ivory?: boolean; children: React.ReactNode }) {
  return (
    <div className="w-[150px] md:w-[168px] aspect-[9/17.5] bg-[#1A1714] rounded-[26px] p-1.5 justify-self-center">
      <div
        aria-live="polite"
        className={`relative w-full h-full rounded-[21px] overflow-hidden flex flex-col items-center justify-center text-center px-2.5 py-3.5 gap-2 ${
          ivory ? 'bg-[#F4EEE3] text-[#3B342C]' : 'bg-[#2E3326] text-[#F3EEE4]'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-2.5 border rounded-[80px_80px_10px_10px] ${ivory ? 'border-[rgba(59,52,44,0.25)]' : 'border-[rgba(243,238,228,0.35)]'}`}
        />
        {children}
      </div>
    </div>
  );
}

const pvKicker = 'relative text-[8px] tracking-[0.22em] uppercase opacity-85';
const pvDetail = 'relative text-[9px] leading-[1.4] opacity-90 max-w-full [overflow-wrap:anywhere]';

function Benefits({ title, items }: { title: string; items: { strong: string; text: string }[] }) {
  return (
    <div className="flex flex-col gap-[22px]">
      <span className="self-start text-xs font-extrabold tracking-[0.08em] uppercase text-[#AE5730] bg-white border border-[rgba(174,87,48,0.25)] px-3 py-1.5 rounded-full">
        Solo en Personalizado
      </span>
      <h3 className="text-[25px] md:text-[30px] leading-[1.12] text-[#211D19]" style={fraunces}>
        {title}
      </h3>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.strong} className="grid grid-cols-[22px_1fr] gap-3 text-[15.5px] leading-[1.5] text-[#4A433C]">
            <LCheckIcon color="#7C8363" className="mt-[3px]" />
            <span>
              <b className="text-[#211D19]">{item.strong}</b>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- 1. Edita tu invitación ----------

// Misma lógica que la demo del editor del spec 15: tope de 48 caracteres y nombres largos más chicos.
const MAX_LENGTH = 48;

const EDITOR_FIELDS = [
  { key: 'names', label: 'Nombres de la pareja', initial: 'Renata y Joaquín' },
  { key: 'date', label: 'Fecha y hora', initial: 'Sábado 14 de noviembre · 5:00 p. m.' },
  { key: 'venue', label: 'Lugar', initial: 'Jardín Casa Fresno' },
] as const;

type EditorKey = (typeof EDITOR_FIELDS)[number]['key'];

function EditorDemo() {
  const [values, setValues] = useState<Record<EditorKey, string>>({
    names: EDITOR_FIELDS[0].initial,
    date: EDITOR_FIELDS[1].initial,
    venue: EDITOR_FIELDS[2].initial,
  });
  // Un campo vacío muestra su etiqueta, para que el celular nunca quede en blanco.
  const shown = (key: EditorKey) => values[key].trim() || EDITOR_FIELDS.find((f) => f.key === key)!.label;
  const names = shown('names');
  const namesSize = names.length > 30 ? 'text-[13px]' : names.length > 18 ? 'text-[16px]' : 'text-[19px]';

  return (
    <DemoCard title="Tu panel" hint="Prueba a escribir">
      <div className="flex flex-col gap-3">
        {EDITOR_FIELDS.map((field) => (
          <label key={field.key} className={fieldLabel}>
            {field.label}
            <input
              type="text"
              value={values[field.key]}
              maxLength={MAX_LENGTH}
              onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
              className={fieldInput}
            />
          </label>
        ))}
      </div>
      <PreviewPhone>
        <span className={pvKicker}>Nos casamos</span>
        <span className={`relative ${namesSize} leading-[1.1] max-w-full [overflow-wrap:anywhere]`} style={fraunces}>
          {names}
        </span>
        <span className="relative text-[11px] italic text-[#E3C6A5] max-w-full [overflow-wrap:anywhere]" style={fraunces}>
          {shown('venue')}
        </span>
        <span className={pvDetail}>{shown('date')}</span>
        <span className="relative mt-1 border border-[rgba(243,238,228,0.6)] text-[7.5px] tracking-[0.16em] uppercase px-2 py-1.5">
          Confirmar asistencia
        </span>
      </PreviewPhone>
    </DemoCard>
  );
}

// ---------- 2. Una para cada invitado ----------

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'invitado';

function GuestDemo() {
  const [name, setName] = useState('Carlos');
  const [seats, setSeats] = useState(2);
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const guest = name.trim() || 'Invitado';
  const en = lang === 'en';

  return (
    <DemoCard title="Invitación individual" hint="Prueba con un nombre">
      <div className="flex flex-col gap-3">
        <label className={fieldLabel}>
          Nombre del invitado
          <input type="text" value={name} maxLength={MAX_LENGTH} onChange={(e) => setName(e.target.value)} className={fieldInput} />
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <label className={fieldLabel}>
            Lugares
            <select value={seats} onChange={(e) => setSeats(Number(e.target.value))} className={fieldInput}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className={fieldLabel}>
            Idioma
            <select value={lang} onChange={(e) => setLang(e.target.value as 'es' | 'en')} className={fieldInput}>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
      </div>
      <PreviewPhone ivory>
        <span className="absolute top-4 left-2 right-2 text-[7.5px] font-bold bg-[rgba(43,38,34,0.07)] text-[#6B6359] rounded-full px-1.5 py-[3px] whitespace-nowrap overflow-hidden text-ellipsis">
          invyta.me/renata-joaquin/{slugify(guest)}
        </span>
        <span className={pvKicker}>{en ? 'Hello' : 'Hola'}</span>
        <span className="relative text-[19px] leading-[1.1] max-w-full [overflow-wrap:anywhere]" style={fraunces}>
          {guest}
        </span>
        <span className="relative text-[11px] italic text-[#AE5730]" style={fraunces}>
          {en ? `We saved ${seats} ${seats === 1 ? 'seat' : 'seats'} for you` : `Te apartamos ${seats} ${seats === 1 ? 'lugar' : 'lugares'}`}
        </span>
        <span className={pvDetail}>{en ? 'Renata & Joaquín invite you to their wedding' : 'Renata y Joaquín te invitan a su boda'}</span>
        <span className="relative mt-1 border border-[#3B342C] text-[7.5px] tracking-[0.16em] uppercase px-2 py-1.5">
          {en ? 'RSVP' : 'Confirmar asistencia'}
        </span>
      </PreviewPhone>
    </DemoCard>
  );
}

// ---------- 3. Escribe con IA ----------

type Tone = 'romantico' | 'divertido' | 'elegante';
type Lang = 'es' | 'en';

const TONES: { id: Tone; label: string }[] = [
  { id: 'romantico', label: 'Romántico' },
  { id: 'divertido', label: 'Divertido' },
  { id: 'elegante', label: 'Elegante' },
];

const STORIES: Record<Tone, Record<Lang, string>> = {
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

const QUESTIONS = [
  { q: '¿Cómo se conocieron?', a: 'En una clase de historia del arte, en la universidad.' },
  { q: 'Una anécdota que los defina', a: 'Un día de lluvia le presté un paraguas y nunca me lo devolvió.' },
];

function AiDemo() {
  const [tone, setTone] = useState<Tone>('romantico');
  const [lang, setLang] = useState<Lang>('es');

  return (
    <DemoCard title="Asistente de textos" hint="Elige un tono" single>
      <div className="flex flex-col gap-3">
        {QUESTIONS.map((item) => (
          <div key={item.q} className="text-[13.5px] leading-[1.45] text-[#4A433C] bg-[#FBF7F1] rounded-xl px-3 py-2.5">
            <b className="block text-[11px] tracking-[0.08em] uppercase text-[#6B6359]">{item.q}</b>
            {item.a}
          </div>
        ))}
        <div role="group" aria-label="Tono" className="flex flex-wrap gap-1.5">
          {TONES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={tone === item.id}
              onClick={() => setTone(item.id)}
              className={`rounded-full border-[1.5px] px-3.5 py-2 text-[13px] font-bold transition-colors ${
                tone === item.id ? 'bg-[#AE5730] border-[#AE5730] text-[#FBF7F1]' : 'bg-white border-[rgba(43,38,34,0.18)] text-[#4A433C]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="bg-[#FFF8F1] border-[1.5px] border-[rgba(198,102,60,0.3)] rounded-2xl px-4 py-3.5">
          <div className="flex justify-between items-center gap-2 mb-2 text-[11.5px] font-extrabold text-[#AE5730]">
            <span>Borrador para tu historia</span>
            <span role="group" aria-label="Idioma" className="inline-flex gap-1">
              {(['es', 'en'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={lang === id}
                  onClick={() => setLang(id)}
                  className={`rounded-full border px-[9px] py-[3px] text-[11px] font-extrabold ${
                    lang === id ? 'bg-[#AE5730] border-[#AE5730] text-white' : 'bg-white border-[rgba(198,102,60,0.4)] text-[#AE5730]'
                  }`}
                >
                  {id.toUpperCase()}
                </button>
              ))}
            </span>
          </div>
          <p aria-live="polite" lang={lang} className="text-[15px] leading-[1.55] text-[#211D19]" style={fraunces}>
            {STORIES[tone][lang]}
          </p>
        </div>
        <span className="flex items-center gap-[7px] text-[12.5px] font-semibold text-[#6B6359]">
          <LCheckIcon color="#7C8363" className="flex-shrink-0" />
          Lo editas antes de guardar. Nada se publica solo.
        </span>
      </div>
    </DemoCard>
  );
}

// ---------- Pestañas ----------

const TABS = [
  {
    id: 'editar',
    label: 'Edita tu invitación',
    demo: <EditorDemo />,
    title: 'Cambia tus datos cuando quieras',
    items: [
      { strong: 'Nombres, fecha, lugares y fotos', text: ' desde un formulario simple.' },
      { strong: 'Tus invitados ven el cambio al instante', text: ', sin reenviar nada.' },
      { strong: 'Para un cambio de diseño', text: ' nos escribes por WhatsApp. En el Básico, todos los cambios los hacemos nosotros.' },
    ],
  },
  {
    id: 'invitado',
    label: 'Una para cada invitado',
    demo: <GuestDemo />,
    title: 'Cada invitado recibe la suya',
    items: [
      { strong: 'Enlace y bienvenida con su nombre.', text: ' Se siente como una invitación de verdad, no un enlace masivo.' },
      { strong: 'Lugares contados.', text: ' Nadie confirma a más personas de las que invitaste.' },
      { strong: 'Español o inglés por invitado', text: ', ideal si tienes familia o amigos fuera de México.' },
    ],
  },
  {
    id: 'ia',
    label: 'Escribe con IA',
    demo: <AiDemo />,
    title: 'Tu historia, escrita a partir de tres respuestas',
    items: [
      { strong: 'Historia y código de vestimenta', text: ' en el tono que elijas.' },
      { strong: 'Traducción al inglés', text: ' de toda tu invitación, revisada por ti.' },
      { strong: 'Itinerario, hoteles y lugares cerca', text: ', con enlace a Google Maps para verificarlos.' },
    ],
  },
];

export default function PersonalizadoSection() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = (index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <LSection id="personalizado" className="!bg-[#F5EEE4] py-16 md:py-24">
      <div className={L_WRAP}>
        <div className="flex flex-wrap justify-between items-end gap-6">
          <div className="flex flex-col gap-3.5 max-w-[640px]">
            <span className={L_EYEBROW}>Paquete Personalizado</span>
            <h2 className={`${L_H2} text-[#211D19]`} style={fraunces}>
              Tú tienes el control, <em className="italic text-[#C6663C]">incluso después de publicarla.</em>
            </h2>
          </div>
          <p className={`${L_LEAD} max-w-[380px]`}>
            Por {formatPrice(priceGap)} más que el Básico: tu propio panel, una invitación para cada invitado y un
            asistente que escribe contigo.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Lo que suma el Personalizado"
          className="mt-7 md:mt-10 flex md:inline-flex flex-wrap gap-1.5 bg-white border border-[rgba(43,38,34,0.1)] rounded-[18px] md:rounded-full p-[5px]"
        >
          {TABS.map((tab, index) => {
            const selected = index === active;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`personalizado-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`personalizado-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={`flex-auto md:flex-none rounded-[14px] md:rounded-full px-3 py-2.5 text-[13px] md:px-[18px] md:py-[11px] md:text-[14.5px] font-extrabold transition-colors ${
                  selected ? 'bg-[#211D19] text-[#FBF7F1]' : 'text-[#4A433C] hover:text-[#211D19]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {TABS.map((tab, index) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`personalizado-panel-${tab.id}`}
            aria-labelledby={`personalizado-tab-${tab.id}`}
            hidden={index !== active}
            className={`${index === active ? 'grid' : 'hidden'} mt-7 grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[30px] lg:gap-12 items-center`}
          >
            {tab.demo}
            <Benefits title={tab.title} items={tab.items} />
          </div>
        ))}
      </div>
    </LSection>
  );
}
