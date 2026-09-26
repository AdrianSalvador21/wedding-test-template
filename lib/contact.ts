// Mismo número de WhatsApp que usa la landing (components/landing/*).
export const WHATSAPP_NUMBER = '529602460590';

// Saludo por defecto: lo usan los botones sin mensaje al agregarles la etiqueta de origen (spec 11).
export const DEFAULT_WHATSAPP_MESSAGE = 'Hola! Me interesa conocer más sobre las invitaciones digitales de Invyta.';

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
