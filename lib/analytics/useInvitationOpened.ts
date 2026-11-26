'use client';

import { useEffect, useRef } from 'react';
import { setInvitationContext, track } from './client';
import { isDemoId } from './demos';

export interface InvitationOpenedInfo {
  weddingId: string;
  templateId: string;
  pageType: 'invitation' | 'save_the_date' | 'album';
  hasGuest: boolean;
}

// `invitation_opened` (spec 31): una vez por carga y por tipo de página, cuando la invitación, el
// save the date o el álbum ya se pintaron. Fija la plantilla como contexto de los eventos
// siguientes (`template_id`, `is_demo`). El ID de boda nunca viaja: solo se usa para decidir
// si es una demo y para no repetir el evento.
// `null` mientras la página sigue cargando o no muestra la invitación (boda gratis sin activar).
export function useInvitationOpened(info: InvitationOpenedInfo | null): void {
  const sent = useRef<string | null>(null);
  const key = info ? `${info.weddingId}|${info.pageType}|${info.templateId}` : null;

  useEffect(() => {
    if (!info || !key) return;
    setInvitationContext({ template_id: info.templateId, is_demo: isDemoId(info.weddingId) });
    if (sent.current === key) return;
    sent.current = key;
    track('invitation_opened', { page_type: info.pageType, has_guest: info.hasGuest });
    // `info` cambia de identidad en cada render; `key` resume lo que importa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
