// Fuente única de las demos públicas oficiales.
// Son invitaciones con datos ficticios (src/data/mockData.ts). Se usa para:
//  - la analítica (spec 11): cualquier otra invitación muestra nombres y teléfonos reales de
//    invitados y NUNCA se mide;
//  - el modo demo del formulario de confirmación (RSVP.tsx, RSVPV2.tsx, RSVPV3.tsx): solo estas
//    demos muestran el formulario sin `?guest=`, y no guarda nada.
export const DEMO_IDS = ['template-01-demo', 'template-02-demo', 'valentina-mateo-2026'] as const;

export type DemoId = (typeof DEMO_IDS)[number];

export function isDemoId(id: string | undefined | null): id is DemoId {
  return !!id && (DEMO_IDS as readonly string[]).includes(id);
}
