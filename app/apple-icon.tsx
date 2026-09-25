import { brandIcon } from '../lib/og-brand';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default function AppleIcon() {
  return brandIcon(180);
}
