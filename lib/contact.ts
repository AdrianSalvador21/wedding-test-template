// Mismo número de WhatsApp que usa la landing (components/landing/*).
export const WHATSAPP_NUMBER = '529602460590';

// Saludo por defecto: lo usan los botones sin mensaje al agregarles la etiqueta de origen (spec 11).
export const DEFAULT_WHATSAPP_MESSAGE = 'Hola! Me interesa conocer más sobre las invitaciones digitales de Invyta.';

// Mensaje del botón principal "Cotiza por WhatsApp" (hero, Nav, cierre y barra móvil), spec 26.
export const QUOTE_WHATSAPP_MESSAGE = 'Hola! Quiero cotizar mi invitación de boda con Invyta.';

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
