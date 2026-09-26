import type { Metadata } from 'next';
import PageShell from '../../components/marketing/PageShell';
import { Chip, CtaBand, PageHero, Section, SectionHead } from '../../components/marketing/blocks';
import FaqList from '../../components/marketing/FaqList';
import JsonLd from '../../components/seo/JsonLd';
import { LCheckIcon, LSolidButton, LXIcon } from '../../components/landing/ui';
import { fraunces } from '../../lib/brand';
import { whatsappUrl } from '../../lib/contact';
import { formatPrice, getFaq, getPackage, type PackageContent } from '../../lib/marketing-content';
import { pageMetadata } from '../../lib/page-metadata';
import { breadcrumbSchema, packagesSchema } from '../../lib/seo-schema';

const basico = getPackage('basico');
const personalizado = getPackage('personalizado');

export const metadata: Metadata = pageMetadata({
  title: 'Precios de invitaciones digitales para boda | Invyta',
  description: `Precios de invitaciones digitales para boda: Básico ${formatPrice(basico.price)} MXN y Personalizado ${formatPrice(personalizado.price)} MXN. Qué incluye cada paquete y en cuántos días se entrega.`,
  path: '/paquetes',
});

// true = incluido, false = no incluido, string = texto propio de cada paquete.
type Cell = boolean | string;
const COMPARISON: [string, Cell, Cell][] = [
  ['Enlace único para compartir', true, true],
  ['Confirmación de asistencia y lista de confirmados', true, true],
  ['Cronograma, mapa, código de vestimenta, mesa de regalos y hospedaje', true, true],
  ['Cambios de contenido', 'Los gestiona Invyta', 'Los haces tú desde tu panel'],
  ['Personalización por invitado: enlace, bienvenida, idioma y canción', false, true],
  ['Asistente con IA', false, true],
  ['Soporte extendido 7 días antes del evento', false, true],
];

const NEEDS = [
  'Fecha y hora de tu boda',
  'Lugar y ubicación',
  'Lista de invitados',
  'Fotos para tu galería',
  'Código de vestimenta',
];

const PRICE_FAQ = [
  '¿Cuánto tarda la entrega?',
  '¿Cuántas invitaciones puedo enviar?',
  '¿Cuánto tiempo estará activa mi invitación?',
].map(getFaq);

function CellView({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-2">
        <LCheckIcon color="#AE5730" />
        <span className="sr-only">Incluido</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-2 text-[#A79E92]">
        <LXIcon />
        <span className="text-[13px]">No incluido</span>
      </span>
    );
  }
  return <span className="text-sm leading-snug text-[#2B2622]">{value}</span>;
}

function PackageCard({ pkg, featured }: { pkg: PackageContent; featured: boolean }) {
  const message = `Hola, me interesa el ${pkg.name} de Invyta.`;
  return (
    <article
      data-track-package={pkg.id}
      className={`flex flex-col bg-white rounded-3xl p-8 md:p-10 ${
        featured ? 'border-2 border-[#AE5730]' : 'border border-[rgba(43,38,34,0.1)]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[28px] md:text-3xl text-[#211D19]" style={fraunces}>
          {pkg.name}
        </h2>
        {featured && <Chip>Con panel y asistente con IA</Chip>}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl md:text-[56px] leading-none text-[#211D19]" style={fraunces}>
          {formatPrice(pkg.price)}
        </span>
        <span className="text-base font-semibold text-[#5A534B]">{pkg.currency}</span>
      </div>
      <p className="mt-2.5 text-[15px] text-[#5A534B]">{pkg.forWho}</p>
      <div className="h-px bg-[rgba(43,38,34,0.1)] my-6" />
      <ul className="flex flex-col gap-4">
        {pkg.groups.map((group) => (
          <li key={group.title} className="flex items-start gap-3">
            <LCheckIcon color="#AE5730" className="flex-shrink-0 mt-1" />
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-[15px] font-bold text-[#211D19]">
                {group.title}
                {group.isNew && (
                  <span className="bg-[#AE5730] text-[#FBF7F1] text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full">
                    Nuevo
                  </span>
                )}
              </span>
              <span className="text-sm leading-relaxed text-[#5A534B]">{group.text}</span>
            </div>
          </li>
        ))}
      </ul>
      {pkg.notIncluded && (
        <div className="mt-auto pt-6">
          <div className="flex items-start gap-3 bg-[#FBF7F1] border border-[rgba(43,38,34,0.1)] rounded-2xl px-4 py-4">
            <LXIcon className="flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed text-[#5A534B]">
              <span className="font-bold text-[#211D19]">No incluye: </span>
              {pkg.notIncluded}
            </p>
          </div>
        </div>
      )}
      <div className={pkg.notIncluded ? 'mt-5' : 'mt-auto pt-7'}>
        <LSolidButton
          href={whatsappUrl(message)}
          target="_blank"
          variant={featured ? 'terracotaDark' : 'dark'}
          className="w-full sm:w-auto"
        >
          {featured ? 'Quiero el Personalizado' : 'Quiero el Básico'}
        </LSolidButton>
      </div>
    </article>
  );
}

export default function PaquetesPage() {
  return (
    <PageShell active="/paquetes" crumbs={[{ name: 'Paquetes' }]}>
      <JsonLd data={[breadcrumbSchema([{ name: 'Paquetes', path: '/paquetes' }]), packagesSchema()]} />

      <PageHero
        eyebrow="Paquetes y precios"
        title="Precios de invitaciones digitales para boda"
        intro="Dos paquetes con precio fijo, sin costo extra por cada invitación que envíes. Elige el que mejor se adapte a tu boda."
      >
        <div className="flex flex-wrap gap-2.5 mt-1">
          <Chip>Entrega en 7 días hábiles</Chip>
          <Chip>Hosting hasta 15 días después del evento</Chip>
          <Chip>Invitaciones sin límite</Chip>
        </div>
      </PageHero>

      <Section>
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <PackageCard pkg={basico} featured={false} />
          <PackageCard pkg={personalizado} featured />
        </div>
      </Section>

      <Section tone="white">
        <SectionHead
          eyebrow="Comparativa"
          title="Qué incluye cada paquete"
          text="El Paquete Básico es para bodas tradicionales y Invyta gestiona los cambios de contenido. El Personalizado suma un panel para que edites tú, un asistente con IA, personalización por invitado y soporte extendido durante los 7 días previos al evento."
        />
        <div className="overflow-x-auto rounded-[20px] border border-[rgba(43,38,34,0.1)]">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <caption className="sr-only">Comparativa entre el Paquete Básico y el Paquete Personalizado</caption>
            <thead>
              <tr className="bg-[#FBF7F1] text-sm text-[#211D19]">
                <th scope="col" className="px-6 py-4 font-bold">
                  Característica
                </th>
                <th scope="col" className="px-6 py-4 font-bold">
                  Básico · {formatPrice(basico.price)} MXN
                </th>
                <th scope="col" className="px-6 py-4 font-bold">
                  Personalizado · {formatPrice(personalizado.price)} MXN
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([label, a, b]) => (
                <tr key={label} className="border-t border-[rgba(43,38,34,0.1)]">
                  <th scope="row" className="px-6 py-4 text-[15px] font-normal leading-snug text-[#2B2622]">
                    {label}
                  </th>
                  <td className="px-6 py-4">
                    <CellView value={a} />
                  </td>
                  <td className="px-6 py-4">
                    <CellView value={b} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section>
        <SectionHead
          eyebrow="Para empezar"
          title="Qué necesitamos de ti"
          text="Con esta información armamos tu invitación y la entregamos en 7 días hábiles."
        />
        <ol className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
          {NEEDS.map((need, index) => (
            <li
              key={need}
              className="bg-white border border-[rgba(43,38,34,0.1)] rounded-[20px] px-5 py-6 flex flex-col gap-3"
            >
              <span className="text-3xl leading-none text-[#AE5730]" style={fraunces}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-[15px] font-semibold leading-snug text-[#211D19]">{need}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="white">
        <SectionHead eyebrow="Dudas de precio" title="Antes de elegir" />
        <div className="max-w-[780px] w-full mx-auto flex flex-col gap-8">
          <FaqList items={PRICE_FAQ} openFirst />
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
        title="¿Para qué fecha es tu boda?"
        text="Cuéntanos tu fecha y te compartimos disponibilidad. Respondemos por WhatsApp."
        button="Escríbenos por WhatsApp"
        message="Hola, quiero cotizar una invitación digital de boda con Invyta."
      />
    </PageShell>
  );
}
