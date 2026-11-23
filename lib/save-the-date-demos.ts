// Spec 27 — demos públicas del modo "Aparta la fecha", una por diseño. Cada una copia la demo
// oficial de su diseño (src/data/mockData.ts) con fecha futura y el save the date activo, y usa
// las fotos de esa demo (public/assets/wedding-images/<demo>/). El id lleva el nombre de la pareja
// para que el link se vea como el de una boda real: /wedding/sofia-diego-2027/aparta-la-fecha.
export const SAVE_THE_DATE_DEMOS = [
  { id: 'sofia-diego-2027', baseId: 'template-01-demo' },
  { id: 'camila-andres-2027', baseId: 'template-02-demo' },
  { id: 'valentina-mateo-2027', baseId: 'valentina-mateo-2026' },
  { id: 'renata-joaquin-2027', baseId: 'template-04-demo' },
] as const;

export function isSaveTheDateDemo(weddingId: string | undefined | null): boolean {
  return !!weddingId && SAVE_THE_DATE_DEMOS.some((d) => d.id === weddingId);
}

// Id del que se toman las fotos: la demo base para las demos de save the date, la boda misma en
// cualquier otro caso.
export function imageSourceId(weddingId: string): string {
  return SAVE_THE_DATE_DEMOS.find((d) => d.id === weddingId)?.baseId ?? weddingId;
}

// Nombre de invitado de muestra que llega por `?invitado=` (solo en estas demos, para enseñar la
// bienvenida con nombre sin crear invitados). Se limita a texto corto y sin caracteres de marcado.
export function sanitizeDemoGuestName(value: string | undefined | null): string | null {
  const name = (value || '').replace(/[<>{}"`]/g, '').trim().slice(0, 40);
  return name || null;
}
