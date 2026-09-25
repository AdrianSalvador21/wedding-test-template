import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import PageShell from '../../../components/marketing/PageShell';
import { CtaBand, Eyebrow, Section, SectionHead } from '../../../components/marketing/blocks';
import FaqList from '../../../components/marketing/FaqList';
import { IconBadge, type IconName } from '../../../components/marketing/icons';
import JsonLd from '../../../components/seo/JsonLd';
import { LCheckIcon, LSolidButton, LTextLink } from '../../../components/landing/ui';
import { fraunces, manrope } from '../../../lib/brand';
import { DESIGNS, PACKAGES, formatPrice, getDesign, getFaq } from '../../../lib/marketing-content';
import { pageMetadata } from '../../../lib/page-metadata';
import { breadcrumbSchema } from '../../../lib/seo-schema';
import { whatsappUrl } from '../../../lib/contact';

// Solo existen los tres diseños de DESIGNS.
export const dynamicParams = false;

export function generateStaticParams() {
  return DESIGNS.map((design) => ({ slug: design.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const design = getDesign(params.slug);
  if (!design) return {};
  return pageMetadata({
    title: `${design.h1} | Invyta`,
    description: design.metaDescription,
    path: `/disenos/${design.slug}`,
  });
}

const SHARED_FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'calendar', title: 'Bienvenida y cuenta regresiva', text: 'Un inicio personalizado y el conteo de días para tu boda.' },
  { icon: 'image', title: 'Historia y galería de fotos', text: 'Cuenta cómo se conocieron y comparte sus mejores fotos.' },
  { icon: 'pin', title: 'Cronograma y mapa', text: 'Horarios del evento y cómo llegar, en un solo lugar.' },
  { icon: 'gift', title: 'Mesa de regalos y hospedaje', text: 'Opciones de regalo y hoteles recomendados para tus invitados.' },
  { icon: 'rsvp', title: 'Confirmación en tiempo real', text: 'Cada invitado confirma desde su enlace y tú ves quién asistirá.' },
];

const EASY_SHARE = [
  'Se abre desde el navegador del celular, sin descargar apps.',
  'Un enlace único para cada invitado.',
  'Disponible en español e inglés.',
  'Entrega en 7 días hábiles.',
];

const DESIGN_FAQ = [
  '¿Puedo ver cómo se ve antes de contratar?',
  '¿Qué información necesito para empezar?',
  '¿Puedo tener mi invitación en otro idioma?',
].map(getFaq);

const STEPS = [
  { title: 'Compartes el enlace', text: 'Lo envías por WhatsApp, mensaje o correo, como cualquier otro mensaje.' },
  { title: 'Tus invitados la abren', text: 'La invitación se ve completa desde el celular, con un toque.' },
  { title: 'Confirman su asistencia', text: 'Cada confirmación aparece en tu panel en tiempo real.' },
];

export default function DesignPage({ params }: { params: { slug: string } }) {
  const design = getDesign(params.slug);
  if (!design) notFound();

  const path = `/disenos/${design.slug}`;
  const others = DESIGNS.filter((d) => d.slug !== design.slug);
  const features = [{ icon: 'star' as IconName, ...design.signature }, ...SHARED_FEATURES];
  const message = `Hola, me interesa el diseño ${design.name} de Invyta.`;

  return (
    <PageShell active="/#disenos" crumbs={[{ name: design.crumb }]}>
      <JsonLd data={breadcrumbSchema([{ name: design.crumb, path }])} />

      <section className="bg-gradient-to-b from-[#FBF7F1] to-[#F3E7D8] py-14 md:py-20" style={manrope}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          <div className="flex flex-col gap-5 items-start">
            <Eyebrow>Diseño {design.name}</Eyebrow>
            <h1 className="text-4xl md:text-5xl lg:text-[52px] leading-[1.1] tracking-tight text-[#211D19]" style={fraunces}>
              {design.h1}
            </h1>
            <p className="text-lg text-[#5A534B] leading-relaxed max-w-[560px]">{design.lead}</p>
            <div className="flex flex-wrap items-center gap-6 mt-3">
              <LSolidButton href={design.demoHref} target="_blank" variant="terracotaDark">
                Ver la demo
              </LSolidButton>
              <LTextLink href={whatsappUrl(message)} target="_blank">
                Pedir este diseño
              </LTextLink>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-[280px] h-[408px] md:w-[312px] md:h-[452px] rounded-[38px] border-[7px] border-[#211D19] overflow-hidden bg-white shadow-[0_30px_60px_rgba(33,29,25,0.18)]">
              <Image
                src={design.image}
                alt={design.imageAlt}
                fill
                priority
                sizes="(max-width: 768px) 280px, 312px"
                className="object-cover object-top"
              />
            </div>
            <span className="text-[13px] text-[#5A534B]">Demo real: ábrela desde tu celular</span>
          </div>
        </div>
      </section>

      <Section>
        <SectionHead
          eyebrow="Qué incluye"
          title={`Todo lo que trae el diseño ${design.name}`}
          text="Contenido completo del evento, listo para compartir por WhatsApp."
        />
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="bg-white border border-[rgba(43,38,34,0.1)] rounded-[20px] p-7 flex flex-col gap-2.5"
            >
              <IconBadge name={feature.icon} />
              <h3 className="text-[19px] leading-tight text-[#211D19]" style={fraunces}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#5A534B]">{feature.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="white">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="flex flex-col gap-4 items-start">
            <Eyebrow>Para tu boda</Eyebrow>
            <h2 className="text-3xl md:text-[40px] leading-[1.15] tracking-tight text-[#211D19]" style={fraunces}>
              ¿Para qué tipo de boda es?
            </h2>
            <p className="text-[17px] text-[#5A534B] leading-relaxed">{design.fit}</p>
            <p className="text-[15px] text-[#5A534B] leading-relaxed">
              El diseño {design.name} está disponible en el Paquete Básico ({formatPrice(PACKAGES[0].price)} MXN) y en el
              Personalizado ({formatPrice(PACKAGES[1].price)} MXN).{' '}
              <a href="/paquetes" className="font-bold text-[#211D19] border-b border-[#211D19]">
                Compara los paquetes
              </a>
              .
            </p>
          </div>
          <div className="bg-[#FBF7F1] border border-[rgba(43,38,34,0.1)] rounded-3xl p-8 flex flex-col gap-4">
            <h3 className="text-[22px] text-[#211D19]" style={fraunces}>
              Se comparte fácil
            </h3>
            <ul className="flex flex-col gap-3.5">
              {EASY_SHARE.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <LCheckIcon color="#AE5730" className="flex-shrink-0 mt-0.5" />
                  <span className="text-[15px] leading-snug text-[#2B2622]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="Cómo funciona" title="De tu celular al de tus invitados" />
        <ol className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3">
              <span
                className="w-12 h-12 rounded-full bg-[#AE5730] text-[#FBF7F1] flex items-center justify-center text-[22px]"
                style={fraunces}
              >
                {index + 1}
              </span>
              <h3 className="text-xl text-[#211D19]" style={fraunces}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#5A534B]">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="white">
        <SectionHead eyebrow="Más diseños" title="Conoce los otros dos estilos" />
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {others.map((other) => (
            <a
              key={other.slug}
              href={`/disenos/${other.slug}`}
              className="flex gap-5 md:gap-6 items-center bg-[#FBF7F1] border border-[rgba(43,38,34,0.1)] rounded-3xl p-5 md:p-6 transition-shadow hover:shadow-[0_20px_40px_rgba(43,38,34,0.12)]"
            >
              <div className="relative w-[100px] h-[152px] md:w-[140px] md:h-[212px] rounded-2xl overflow-hidden flex-shrink-0">
                <Image
                  src={other.image}
                  alt={other.imageAlt}
                  fill
                  sizes="140px"
                  className="object-cover object-top"
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-2xl leading-tight text-[#211D19]" style={fraunces}>
                  {other.name}
                </span>
                <span className="text-sm leading-relaxed text-[#5A534B]">{other.tagline}</span>
                <span className="text-[15px] font-bold text-[#AE5730] mt-1">Ver este diseño →</span>
              </div>
            </a>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="Dudas frecuentes" title={`Antes de elegir el diseño ${design.name}`} />
        <div className="max-w-[780px] w-full mx-auto flex flex-col gap-8">
          <FaqList items={DESIGN_FAQ} openFirst />
          <div className="text-center">
            <a
              href="/preguntas-frecuentes"
              className="text-[15px] font-bold text-[#211D19] border-b border-[#211D19] pb-0.5"
            >
              Ver todas las preguntas frecuentes →
            </a>
          </div>
        </div>
      </Section>

      <CtaBand
        title="Elige tu diseño y cuéntanos tu fecha"
        text="Te compartimos disponibilidad y los pasos para empezar. Respondemos por WhatsApp."
        button="Pedir este diseño"
        message={message}
      />
    </PageShell>
  );
}
