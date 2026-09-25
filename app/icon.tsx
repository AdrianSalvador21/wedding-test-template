import { brandIcon } from '../lib/og-brand';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default function Icon() {
  return brandIcon(32, true);
}
