// Spec 28 — normaliza teléfonos a E.164 ("+523312345678") para guardarlos y armar links de
// WhatsApp. México es la lada por defecto; otras ladas se respetan si vienen con "+".
// Función pura: la usan la importación de invitados, el formulario manual y el modal de WhatsApp.

export interface NormalizedPhone {
  value: string | null;
  valid: boolean;
}

export function normalizePhone(raw: string | null | undefined): NormalizedPhone {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return { value: null, valid: true };

  const hasPlus = trimmed.startsWith('+');
  const cleaned = trimmed.replace(/[\s\-.()]/g, '');
  const digits = hasPlus ? cleaned.slice(1) : cleaned;
  if (!/^\d+$/.test(digits)) return { value: null, valid: false };

  if (!hasPlus) {
    if (digits.length === 10) return { value: `+52${digits}`, valid: true };
    if (digits.length === 12 && digits.startsWith('52')) return { value: `+${digits}`, valid: true };
    if (digits.length === 13 && digits.startsWith('521')) return { value: `+52${digits.slice(3)}`, valid: true };
    return { value: null, valid: false };
  }

  if (digits.startsWith('521') && digits.length === 13) return { value: `+52${digits.slice(3)}`, valid: true };
  if (digits.startsWith('52')) {
    return digits.length === 12 ? { value: `+${digits}`, valid: true } : { value: null, valid: false };
  }
  if (digits.length >= 8 && digits.length <= 15) return { value: `+${digits}`, valid: true };
  return { value: null, valid: false };
}
