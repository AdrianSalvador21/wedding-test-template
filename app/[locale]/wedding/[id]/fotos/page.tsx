import type { Metadata } from 'next';
import GuestAlbum from '../../../../../components/album/GuestAlbum';

// Spec 29 — álbum de fotos de los invitados: /[locale]/wedding/[id]/fotos.
// Con ?guest= las fotos se atribuyen a esa invitación; sin él (QR general) se usa un id anónimo
// del dispositivo. La página no se indexa.
export const metadata: Metadata = {
  title: 'Álbum de la boda',
  robots: { index: false, follow: false },
};

export default function AlbumPage({
  params,
  searchParams,
}: {
  params: { locale: string; id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const guest = typeof searchParams.guest === 'string' && searchParams.guest.trim() ? searchParams.guest.trim() : null;
  return <GuestAlbum weddingId={params.id} locale={params.locale === 'en' ? 'en' : 'es'} guestId={guest} />;
}
