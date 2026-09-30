import type { Metadata } from 'next';
import PageShell from '../../components/marketing/PageShell';
import { CtaBand, PageHero, Section, SectionHead } from '../../components/marketing/blocks';
import FaqList from '../../components/marketing/FaqList';
import { IconBadge, type IconName } from '../../components/marketing/icons';
import JsonLd from '../../components/seo/JsonLd';
import { LCheckIcon, LSolidButton } from '../../components/landing/ui';
import { fraunces } from '../../lib/brand';
import { whatsappUrl } from '../../lib/contact';
import { getFaq } from '../../lib/marketing-content';
import { pageMetadata } from '../../lib/page-metadata';
import { breadcrumbSchema } from '../../lib/seo-schema';

export const metadata: Metadata = pageMetadata({
  title: 'Invitaciones digitales para wedding planners | Invyta',
  description:
    'Invitaciones digitales para wedding planners: una invitación y un panel de invitados por cada cliente, entrega en 7 días hábiles y atención por WhatsApp.',
  path: '/wedding-planners',
});

const REASONS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'users',
    title: 'Todas tus bodas, un solo login',
    text: 'Entra a tu cuenta y ve cada boda de tus clientes: su invitación, sus invitados confirmados y sus mesas, todo junto.',
  },
  { icon: 'doc', title: 'Una invitación por cliente', text: 'Cada boda tiene su propia invitación y su propio panel de invitados.' },
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
        intro="Una invitación para cada cliente y un panel donde ves todas tus bodas con un solo inicio de sesión, sin rehacer trabajo."
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
