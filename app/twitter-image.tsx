import { brandOg, OG_SIZE } from '../lib/og-brand';

export const alt = 'Invyta: invitaciones digitales para boda';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const runtime = 'edge';

export default function TwitterImage() {
  return brandOg();
}
