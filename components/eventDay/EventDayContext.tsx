'use client';

import { createContext, useContext } from 'react';

// Spec 32 — lo que la invitación necesita saber del pase cuando está cerrado: si se puede volver a
// abrir (solo durante la ventana y con ?guest= válido) y la mesa del titular, para la barra fija
// de Moderno (StickyConfirmBarV2). null = no hay pase para esta visita.
export interface EventDayReopen {
  reopen: () => void;
  tableName: string | null;
}

export const EventDayContext = createContext<EventDayReopen | null>(null);

export function useEventDayReopen(): EventDayReopen | null {
  return useContext(EventDayContext);
}
