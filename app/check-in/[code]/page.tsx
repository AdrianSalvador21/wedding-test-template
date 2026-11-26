import type { Metadata } from 'next';
import HostessApp from '../../../components/checkIn/HostessApp';

// Spec 33 — modo hostess. Pública (sin cuenta), solo en español y fuera de buscadores. El código
// del link no se manda como referente a otros sitios y la analítica lo reemplaza por `:code`.
export const metadata: Metadata = {
  title: 'Check-in | Invyta',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function CheckInPage({ params }: { params: { code: string } }) {
  return <HostessApp code={params.code} />;
}
