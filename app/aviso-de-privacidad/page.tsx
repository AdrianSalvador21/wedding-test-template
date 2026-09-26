import type { Metadata } from 'next';
import PageShell from '../../components/marketing/PageShell';
import { PageHero, Section } from '../../components/marketing/blocks';
import { fraunces } from '../../lib/brand';
import { pageMetadata } from '../../lib/page-metadata';
import { SITE } from '../../lib/site';

// Aviso de la medición del sitio (spec 11). No es una página de captación: lleva `noindex`
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
              <li>
                Grabaciones de tu visita (cómo se mueve el cursor o el dedo por la página) para entender dónde se
                atoran las personas. Lo que escribes en cualquier campo de formulario se enmascara y no se registra.
              </li>
            </ul>
            <p>
              Si nos escribes por WhatsApp desde un botón del sitio, el mensaje termina con una etiqueta corta, como{' '}
              <span className="font-bold text-[#211D19]">(ref: paquetes-basico-ig-bio)</span>, que nos dice desde qué
              página y canal llegaste. Puedes borrarla antes de enviar el mensaje.
            </p>
          </Block>

          <Block title="Qué no medimos">
            <ul className="list-disc pl-6 flex flex-col gap-1.5">
              <li>
                Las invitaciones que reciben los invitados de una boda real: no se mide nada de lo que haces ahí, y no
                se graba.
              </li>
              <li>Los paneles de administración no se graban.</li>
              <li>No usamos tu nombre, correo ni teléfono para la medición del sitio.</li>
            </ul>
          </Block>

          <Block title="Cuentas de los paneles de administración">
            <p>
              Si tienes una cuenta para administrar tu invitación, registramos qué pasos del panel usas (iniciar sesión,
              guardar cambios, agregar invitados, copiar enlaces, usar el asistente con IA) ligados a un identificador
              interno de tu cuenta. No enviamos tu correo, tu nombre, el nombre de tu boda ni datos de tus invitados a
              la herramienta de medición.
            </p>
          </Block>

          <Block title="Cookies y almacenamiento en tu navegador">
            <p>
              No usamos cookies para la medición. Un identificador anónimo se guarda solo en la pestaña que tienes
              abierta (almacenamiento de sesión) y se borra cuando la cierras; por eso no reconocemos a la misma persona
              entre una visita y otra. También guardamos en la pestaña el origen de tu visita mientras dure.
            </p>
          </Block>

          <Block title="Con quién compartimos los datos">
            <p>
              Usamos PostHog para la medición. Los datos se envían por nuestro propio dominio a sus servidores en
              Estados Unidos y no se venden ni se usan para publicidad.
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
              . Como no identificamos a las personas que visitan el sitio, cuéntanos desde qué dispositivo y en qué
              fecha lo visitaste para poder ayudarte.
            </p>
          </Block>

          <p className="text-sm text-[#5A534B]">Última actualización: 26 de septiembre de 2026.</p>
        </div>
      </Section>
    </PageShell>
  );
}
