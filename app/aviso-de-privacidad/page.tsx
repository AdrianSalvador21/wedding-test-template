import type { Metadata } from 'next';
import PageShell from '../../components/marketing/PageShell';
import { PageHero, Section } from '../../components/marketing/blocks';
import { fraunces } from '../../lib/brand';
import { pageMetadata } from '../../lib/page-metadata';
import { SITE } from '../../lib/site';

// Aviso de la medición del sitio (specs 11 y 31). No es una página de captación: lleva `noindex`
// y no está en MARKETING_PAGES (no entra al sitemap).
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Aviso de privacidad | Invyta',
    description: 'Qué medimos en invyta.me, para qué, qué no medimos y cómo desactivar la medición en tu dispositivo.',
    path: '/aviso-de-privacidad',
  }),
  robots: { index: false, follow: true },
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl md:text-[28px] leading-[1.2] text-[#211D19]" style={fraunces}>
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-base text-[#5A534B] leading-relaxed">{children}</div>
    </div>
  );
}

export default function PrivacyNoticePage() {
  return (
    <PageShell active="" crumbs={[{ name: 'Aviso de privacidad' }]}>
      <PageHero
        eyebrow="Privacidad"
        title="Aviso de privacidad"
        intro="Medimos cómo se usa este sitio para mejorarlo. Aquí explicamos qué medimos, qué no y cómo desactivarlo."
      />

      <Section tone="white">
        <div className="max-w-3xl flex flex-col gap-10">
          <Block title="Quién es responsable">
            <p>
              Invyta ({SITE.url.replace('https://', '')}). Para cualquier duda sobre este aviso escribe a{' '}
              <a href={`mailto:${SITE.email}`} className="font-bold text-[#AE5730] underline">
                {SITE.email}
              </a>
              .
            </p>
          </Block>

          <Block title="Qué medimos en las páginas públicas y en las demos">
            <p>
              En la página principal, en las páginas de diseños, paquetes, wedding planners y preguntas frecuentes, y
              en las invitaciones de demostración, registramos:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-1.5">
              <li>Qué páginas visitas y hasta dónde bajas en ellas.</li>
              <li>Qué secciones llegas a ver.</li>
              <li>Cuándo tocas un botón de WhatsApp o un enlace a una demo, y en qué parte de la página estaba.</li>
              <li>
                De dónde llegaste (por ejemplo, el enlace de nuestro Instagram o el sitio que te mandó aquí), el tipo de
                dispositivo y navegador, y un país y ciudad aproximados.
              </li>
              <li>Cuánto tarda en cargar la página, para hacerla más rápida.</li>
            </ul>
            <p>
              Si nos escribes por WhatsApp desde un botón del sitio, el mensaje termina con una etiqueta corta, como{' '}
              <span className="font-bold text-[#211D19]">(ref: paquetes-basico-ig-bio)</span>, que nos dice desde qué
              página y canal llegaste. Puedes borrarla antes de enviar el mensaje.
            </p>
            <p>No grabamos tu visita.</p>
          </Block>

          <Block title="Qué medimos en las invitaciones">
            <p>
              En las invitaciones que reciben los invitados de una boda, en su página de &quot;Aparta la fecha&quot; y en
              su álbum de fotos, registramos:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-1.5">
              <li>Que se abrió la invitación, el save the date o el álbum, y con qué diseño.</li>
              <li>Si se confirmó la asistencia (sí o no) y cuántos pases se confirmaron.</li>
              <li>
                Si se tocó el mapa, agregar al calendario, la mesa de regalos, copiar una cuenta, la música, el contacto
                con los novios o el acceso al álbum.
              </li>
              <li>Qué secciones de la invitación se llegan a ver y que se subió una foto al álbum.</li>
            </ul>
            <p>
              Nunca enviamos a la herramienta de medición el nombre, el mensaje, el teléfono ni el correo de los
              invitados, ni el nombre o el identificador de la boda: el enlace se registra sin ellos.
            </p>
          </Block>

          <Block title="Cuentas de los paneles de administración">
            <p>
              Si tienes una cuenta para administrar tu invitación, registramos qué pasos del panel usas (iniciar sesión,
              guardar cambios, agregar invitados, copiar enlaces, usar el asistente con IA) ligados a un identificador
              interno de tu cuenta y a si es una cuenta de pareja o de wedding planner. No enviamos tu correo, tu nombre,
              el nombre de tu boda ni datos de tus invitados a la herramienta de medición.
            </p>
          </Block>

          <Block title="Cookies">
            <p>
              Usamos las cookies de Google Analytics (<span className="font-bold text-[#211D19]">_ga</span> y{' '}
              <span className="font-bold text-[#211D19]">_ga_&lt;ID&gt;</span>) para distinguir una visita de otra y
              reconocer cuando vuelves. Duran hasta 2 años, que es el valor por defecto de Google Analytics, y puedes
              borrarlas desde tu navegador en cualquier momento. Además guardamos en la pestaña que tienes abierta el
              origen de tu visita mientras dure.
            </p>
          </Block>

          <Block title="Con quién compartimos los datos">
            <p>
              Usamos Google Analytics para Firebase y Firebase Performance Monitoring, de Google, cuyos servidores están
              en Estados Unidos. Las señales de Google están desactivadas. Los datos de las páginas públicas y de las
              demos pueden usarse para mostrar anuncios de Invyta a quien ya visitó el sitio. Los de las invitaciones y
              los paneles de administración nunca se usan para publicidad. No vendemos los datos.
            </p>
          </Block>

          <Block title="Cómo desactivar la medición">
            <p>
              Abre{' '}
              <a href="/?notrack=1" className="font-bold text-[#AE5730] underline">
                {SITE.url.replace('https://', '')}/?notrack=1
              </a>{' '}
              en el dispositivo y navegador que uses: a partir de ahí no se envía ningún dato de medición desde ahí.
              Para volver a activarla, abre <span className="font-bold text-[#211D19]">/?notrack=0</span>.
            </p>
          </Block>

          <Block title="Tus derechos">
            <p>
              Puedes pedirnos acceso, rectificación, cancelación u oposición al tratamiento de tus datos escribiendo a{' '}
              <a href={`mailto:${SITE.email}`} className="font-bold text-[#AE5730] underline">
                {SITE.email}
              </a>
              . Como no sabemos quién eres a partir de la medición, cuéntanos desde qué dispositivo y en qué fecha
              visitaste el sitio para poder ayudarte.
            </p>
          </Block>

          <p className="text-sm text-[#5A534B]">Última actualización: 25 de noviembre de 2026.</p>
        </div>
      </Section>
    </PageShell>
  );
}
