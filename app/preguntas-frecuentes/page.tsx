import type { Metadata } from 'next';
import PageShell from '../../components/marketing/PageShell';
import { CtaBand, PageHero } from '../../components/marketing/blocks';
import FaqList from '../../components/marketing/FaqList';
import JsonLd from '../../components/seo/JsonLd';
import { fraunces, manrope } from '../../lib/brand';
import { FAQ_ITEMS, groupFaq } from '../../lib/marketing-content';
import { pageMetadata } from '../../lib/page-metadata';
import { breadcrumbSchema, faqSchema } from '../../lib/seo-schema';

export const metadata: Metadata = pageMetadata({
  title: 'Preguntas frecuentes de invitaciones digitales | Invyta',
  description:
    'Respuestas sobre invitaciones digitales para boda: precio, tiempo de entrega, confirmación de asistencia, idiomas y asistente con IA.',
  path: '/preguntas-frecuentes',
});

const groups = groupFaq(FAQ_ITEMS);

export default function PreguntasFrecuentesPage() {
  return (
    <PageShell active="/preguntas-frecuentes" crumbs={[{ name: 'Preguntas frecuentes' }]}>
      <JsonLd
        data={[breadcrumbSchema([{ name: 'Preguntas frecuentes', path: '/preguntas-frecuentes' }]), faqSchema(FAQ_ITEMS)]}
      />

      <PageHero
        eyebrow="Preguntas frecuentes"
        title="Preguntas frecuentes de invitaciones digitales"
        intro="Todo lo que necesitas saber antes de crear tu invitación de boda."
      />

      <section className="bg-[#FBF7F1] py-14 md:py-20" style={manrope}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-[260px_minmax(0,1fr)] gap-10 lg:gap-16 items-start">
          <nav aria-label="Temas" className="lg:sticky lg:top-32 flex flex-wrap lg:flex-col gap-2">
            <span className="hidden lg:block text-xs font-bold tracking-[2px] uppercase text-[#5A534B] px-4 pb-2">
              Temas
            </span>
            {groups.map((group, index) => (
              <a
                key={group.group}
                href={`#tema-${index}`}
                className="inline-flex items-center min-h-[44px] px-4 rounded-full lg:rounded-xl border border-[rgba(43,38,34,0.1)] lg:border-transparent bg-white lg:bg-transparent text-[15px] font-semibold lg:font-medium text-[#211D19] hover:bg-[#F0E6D8]"
              >
                {group.group}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-12">
            {groups.map((group, index) => (
              <section key={group.group} id={`tema-${index}`} aria-labelledby={`tema-${index}-titulo`} className="scroll-mt-32">
                <h2
                  id={`tema-${index}-titulo`}
                  className="text-[26px] leading-tight text-[#211D19] mb-5"
                  style={fraunces}
                >
                  {group.group}
                </h2>
                <FaqList items={group.items} openFirst />
              </section>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="¿Te quedó alguna duda?"
        text="Escríbenos y te respondemos por WhatsApp."
        button="Escríbenos por WhatsApp"
        message="Hola, tengo una duda sobre las invitaciones digitales de Invyta."
      />
    </PageShell>
  );
}
