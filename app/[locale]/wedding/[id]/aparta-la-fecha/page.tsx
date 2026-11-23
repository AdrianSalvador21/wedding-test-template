import { generateWeddingMetadata, renderWeddingPage, type WeddingPageProps } from '../wedding-page';

// Spec 27 — /wedding/[id]/aparta-la-fecha: el mismo link de la boda, pero siempre muestra el save
// the date (aunque el interruptor esté apagado). Lo usan el botón "Ver save the date" del Editor y
// las demos (con ?invitado= para el nombre de muestra).
export const generateMetadata = generateWeddingMetadata;

export default function SaveTheDatePage({ params, searchParams }: WeddingPageProps) {
  return renderWeddingPage(params, searchParams, true);
}
