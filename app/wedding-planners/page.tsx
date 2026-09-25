import type { Metadata } from 'next';
import PageShell from '../../components/marketing/PageShell';
import { CtaBand, PageHero, Section, SectionHead } from '../../components/marketing/blocks';
import FaqList from '../../components/marketing/FaqList';
import { IconBadge, type IconName } from '../../components/marketing/icons';
import JsonLd from '../../components/seo/JsonLd';
import { LCheckIcon, LSolidButton } from '../../components/landing/ui';
import { fraunces } from '../../lib/brand';
import { whatsappUrl } from '../../lib/contact';
import { PACKAGES, formatPrice, getFaq } from '../../lib/marketing-content';
import { pageMetadata } from '../../lib/page-metadata';
import { breadcrumbSchema } from '../../lib/seo-schema';

export const metadata: Metadata = pageMetadata({
  title: 'Invitaciones digitales para wedding planners | Invyta',
  description:
    'Invitaciones digitales para wedding planners: una invitación y un panel de invitados por cada cliente, entrega en 7 días hábiles y atención por WhatsApp.',
  path: '/wedding-planners',
});

const REASONS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'doc', title: 'Una invitación por cliente', text: 'Cada boda tiene su propia invitación y su propio panel de invitados.' },
  {
    icon: 'users',
    title: 'Gestión de invitados',
    text: 'Con el paquete Personalizado, tú o tu cliente editan la invitación y controlan las confirmaciones desde el panel.',
  },
  { icon: 'clock', title: 'Tiempos claros', text: 'Entrega en 7 días hábiles y hosting incluido hasta 15 días después del evento.' },
  { icon: 'chat', title: 'Atención directa', text: 'Hablas con nosotros por WhatsApp, sin intermediarios.' },
];

const PLANNER_FAQ = [
  '¿Puedo contratar Invyta si soy wedding planner?',
  '¿Puedo ver cómo se ve antes de contratar?',
  '¿Cuánto tarda la entrega?',
  '¿Cuántas invitaciones puedo enviar?',
].map(getFaq);

const STEPS = [
  { title: 'Nos cuentas', text: 'Cuántas bodas manejas y para qué fechas.' },
  { title: 'Eligen el diseño', text: 'Cada cliente escoge entre Clásico, Moderno y Botánica Editorial.' },
  { title: 'Reunimos los datos', text: 'Fecha, lugar, lista de invitados, fotos y código de vestimenta de cada boda.' },
  { title: 'Entregamos', text: 'En 7 días hábiles, con confirmaciones en tiempo real.' },
];

const CLIENT_GETS = [
  'Cronograma y mapa del evento',
  'Código de vestimenta',
  'Mesa de regalos y hospedaje recomendado',
  'Música elegida por la pareja',
  'Confirmación de asistencia en tiempo real',
  'Disponible en español e inglés',
];

export default function WeddingPlannersPage() {
  const message = 'Hola, soy wedding planner y quiero saber cómo trabajan con Invyta.';

  return (
    <PageShell active="/wedding-planners" crumbs={[{ name: 'Wedding planners' }]}>
      <JsonLd data={breadcrumbSchema([{ name: 'Wedding planners', path: '/wedding-planners' }])} />

      <PageHero
        eyebrow="Para wedding planners"
        title="Invitaciones digitales para wedding planners"
        intro="Una invitación para cada cliente, con el mismo cuidado y sin rehacer trabajo."
      >
        <div className="mt-3">
          <LSolidButton href={whatsappUrl(message)} target="_blank" variant="terracotaDark">
            Cuéntanos cuántas bodas manejas
          </LSolidButton>
        </div>
      </PageHero>

      <Section>
        <SectionHead eyebrow="Por qué Invyta" title="Pensado para quien organiza varias bodas" />
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {REASONS.map((reason) => (
            <li
              key={reason.title}
              className="bg-white border border-[rgba(43,38,34,0.1)] rounded-[20px] p-7 flex flex-col gap-3"
            >
              <IconBadge name={reason.icon} />
              <h3 className="text-xl leading-tight text-[#211D19]" style={fraunces}>
                {reason.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#5A534B]">{reason.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="white">
        <SectionHead eyebrow="Cómo trabajamos" title="De la primera conversación a la entrega" />
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3">
              <span
                className="w-12 h-12 rounded-full bg-[#AE5730] text-[#FBF7F1] flex items-center justify-center text-[22px]"
                style={fraunces}
              >
                {index + 1}
              </span>
              <h3 className="text-xl leading-tight text-[#211D19]" style={fraunces}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#5A534B]">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="flex flex-col gap-4 items-start">
            <SectionHead
              center={false}
              eyebrow="Para tus clientes"
              title="Lo que recibe cada pareja"
              text="Tus clientes comparten un solo enlace por WhatsApp y sus invitados abren la invitación desde el celular, sin descargar ninguna aplicación. Cada invitado recibe su propio enlace y las confirmaciones aparecen en tiempo real."
            />
          </div>
          <ul className="bg-white border border-[rgba(43,38,34,0.1)] rounded-3xl p-8 flex flex-col gap-3.5">
            {CLIENT_GETS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <LCheckIcon color="#AE5730" className="flex-shrink-0 mt-0.5" />
                <span className="text-[15px] leading-snug text-[#2B2622]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="white">
        <SectionHead
          eyebrow="Paquetes"
          title="Dos paquetes, sin costo extra por invitación"
          text="Cuéntanos cuántas bodas manejas y te explicamos cómo lo organizamos."
        />
        <div className="grid md:grid-cols-2 gap-6">
          {PACKAGES.map((pkg) => (
            <a
              key={pkg.id}
              href="/paquetes"
              className={`flex items-center justify-between gap-6 bg-[#FBF7F1] rounded-[20px] px-7 py-6 transition-shadow hover:shadow-[0_20px_40px_rgba(43,38,34,0.12)] ${
                pkg.id === 'personalizado' ? 'border-2 border-[#AE5730]' : 'border border-[rgba(43,38,34,0.1)]'
              }`}
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-2xl leading-tight text-[#211D19]" style={fraunces}>
                  {pkg.name}
                </span>
                <span className="text-sm text-[#5A534B]">{pkg.forWho}</span>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-[32px] leading-none text-[#211D19]" style={fraunces}>
                  {formatPrice(pkg.price)} <span className="text-sm font-semibold text-[#5A534B]">{pkg.currency}</span>
                </span>
                <span className="text-sm font-bold text-[#AE5730]">Ver qué incluye →</span>
              </div>
            </a>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="Dudas frecuentes" title="Antes de escribirnos" />
        <div className="max-w-[780px] w-full mx-auto">
          <FaqList items={PLANNER_FAQ} openFirst />
        </div>
      </Section>

      <CtaBand
        title="Cuéntanos cuántas bodas manejas"
        text="Te explicamos cómo lo organizamos para tus clientes. Respondemos por WhatsApp."
        button="Escríbenos por WhatsApp"
        message={message}
      />
    </PageShell>
  );
}
