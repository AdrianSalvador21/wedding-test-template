import { brandIcon } from '../../../lib/og-brand';

// Íconos 192 y 512 para site.webmanifest. Solo esos dos tamaños existen.
export const runtime = 'edge';

export async function GET(_request: Request, { params }: { params: { size: string } }) {
  if (params.size !== '192' && params.size !== '512') {
    return new Response('Not Found', { status: 404 });
  }
  return brandIcon(Number(params.size));
}
