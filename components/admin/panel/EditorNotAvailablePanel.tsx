'use client';

import { Sparkles } from 'lucide-react';
import { whatsappUrl } from '../../../lib/contact';
import { track } from '../../../lib/analytics/client';

// Misma pantalla de bloqueo que `components/admin/EditorNotAvailable.tsx` (legacy),
// pero sin su navbar propio incrustado (logo + AdminPageNav) — dentro del panel
// nuevo ese navbar ya lo da el shell (PanelSidebar/PanelTopBar), así que traerlo
// duplicaría la navegación. El mensaje, el CTA y el link a Invitados son idénticos.
export default function EditorNotAvailablePanel({ weddingId, locale }: { weddingId: string; locale: string }) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="max-w-[440px] w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 rounded-full bg-[#F4F4F5] flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-[#71717A]" />
        </div>
        <div className="text-lg font-extrabold tracking-[-0.01em] text-[#0A0A0A]">Esta invitación es del plan gratuito</div>
        <p className="text-sm leading-relaxed text-[#3F3F46]">
          El plan gratuito organiza invitados y mesas, pero no incluye el Editor de invitación ni una plantilla de diseño.
        </p>
        <a
          href={whatsappUrl(`Hola! Quiero activar mi boda "${weddingId}" con una invitación digital.`)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('free_wedding_upgrade_cta_click', {})}
          className="inline-flex items-center justify-center gap-2 h-[46px] px-5 rounded-lg bg-[#111111] text-white border border-transparent hover:bg-black text-sm font-bold"
        >
          <Sparkles className="h-4 w-4" />
          Solicita tu invitación digital
        </a>
        <a href={`/${locale}/admin/panel/${weddingId}/guests`} className="text-[13px] font-semibold text-[#71717A] hover:text-[#0A0A0A] hover:underline">
          Ir a Invitados
        </a>
      </div>
    </div>
  );
}
