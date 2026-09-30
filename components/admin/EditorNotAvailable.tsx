'use client';

import { Sparkles } from 'lucide-react';
import { AdminPageNav, manrope, displayFont } from './ui';
import { whatsappUrl } from '../../lib/contact';
import { track } from '../../lib/analytics/client';

// Corrección (fuera del alcance de un spec en curso, tratada aparte): navegar a mano a
// /admin/wedding-editor/[weddingId] de una boda del tier gratuito (spec 16) dejaba entrar
// al Editor completo, aunque esa boda no tiene plantilla ni el link "Editor" es visible en
// AdminPageNav. Esta pantalla reemplaza al Editor en ese caso y explica por qué, en vez de
// redirigir en silencio.
export default function EditorNotAvailable({ weddingId, locale }: { weddingId: string; locale: string }) {
  return (
    <div className="admin-form min-h-screen bg-[#FAFAFA]" style={manrope}>
      <div className="bg-white border-b border-[rgba(0,0,0,0.06)] px-4 sm:px-10 py-3.5 flex items-center justify-between gap-4">
        <a href="/" className="text-xl sm:text-2xl text-[#0A0A0A] hover:opacity-70 transition-opacity" style={displayFont}>
          invyta
        </a>
        <AdminPageNav weddingId={weddingId} locale={locale} active="editor" tier="free" />
      </div>

      <div className="flex items-center justify-center px-4 py-20">
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
          <a href={`/${locale}/admin/guests/${weddingId}`} className="text-[13px] font-semibold text-[#71717A] hover:text-[#0A0A0A] hover:underline">
            Ir a Invitados
          </a>
        </div>
      </div>
    </div>
  );
}
