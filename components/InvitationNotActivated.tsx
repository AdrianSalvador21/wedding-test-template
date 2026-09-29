'use client';

import { whatsappUrl } from '../lib/contact';
import { track } from '../lib/analytics/client';

interface InvitationNotActivatedProps {
  // Nombres de la pareja para personalizar el mensaje ("Sofía y Diego"), o vacío si la boda
  // gratuita todavía no tiene nombres capturados.
  coupleNames?: string;
  weddingId: string;
}

// Spec 16 — una boda gratuita (tier: 'free') no tiene plantilla ni enlace público que
// compartir con sus invitados. Antes de este componente, /[locale]/wedding/[id] caía
// silenciosamente en Template01 vacío para estas bodas (ver WeddingTemplate.tsx); esta
// pantalla evita eso y convierte la visita en una oportunidad de contacto.
export default function InvitationNotActivated({ coupleNames, weddingId }: InvitationNotActivatedProps) {
  const message = coupleNames
    ? `Hola! Vi la invitación de ${coupleNames} y quiero saber cómo activarla con diseño.`
    : `Hola! Vi una invitación de Invyta (${weddingId}) y quiero saber cómo activarla con diseño.`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Esta invitación todavía no está activada</h2>
        <p className="text-gray-600 mb-6">
          {coupleNames ? `${coupleNames} está` : 'Esta boda está'} organizando invitados y mesas, pero aún no tiene una invitación con diseño para compartir. Si eres tú, contáctanos para activarla.
        </p>
        <a
          href={whatsappUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('free_wedding_upgrade_cta_click', {})}
          className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Contáctanos para activarla
        </a>
      </div>
    </div>
  );
}
