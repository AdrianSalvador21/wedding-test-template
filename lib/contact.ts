// Mismo número de WhatsApp que usa la landing (components/landing/*).
export const WHATSAPP_NUMBER = '529602460590';

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
