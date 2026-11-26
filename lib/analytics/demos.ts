// Fuente única de las demos públicas oficiales.
// Son invitaciones con datos ficticios (src/data/mockData.ts). Se usa para:
//  - la analítica (specs 11 y 31): en las demos el ID se conserva en las URLs medidas; en cualquier
//    otra invitación (nombres y teléfonos reales) el ID se reemplaza por `:weddingId` y nunca se
//    carga Google Ads;
//  - el modo demo del formulario de confirmación (RSVP.tsx, RSVPV2.tsx, RSVPV3.tsx, RSVPV4.tsx): solo
//    estas demos muestran el formulario sin `?guest=`, y no guarda nada.
export const DEMO_IDS = ['template-01-demo', 'template-02-demo', 'valentina-mateo-2026', 'template-04-demo'] as const;

export type DemoId = (typeof DEMO_IDS)[number];

export function isDemoId(id: string | undefined | null): id is DemoId {
  return !!id && (DEMO_IDS as readonly string[]).includes(id);
}
