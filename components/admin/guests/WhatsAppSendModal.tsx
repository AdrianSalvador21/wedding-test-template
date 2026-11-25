'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { FirebaseGuest, WeddingData } from '../../../src/types/wedding';
import { guestService } from '../../../services/guestService';
import { track } from '../../../lib/analytics/client';
import { normalizePhone } from '../../../lib/phone';
import { buildDefaultWhatsAppMessage, buildGuestAlbumUrl, buildGuestInvitationUrl, buildWhatsAppUrl, type WhatsAppMessageKind } from '../../../lib/whatsapp';
import { resolveHasEnglish } from '../../../lib/wedding-language';
import { AdminButton, manrope, displayFont } from '../ui';

// Spec 28 — modal "Enviar por WhatsApp". Abre el WhatsApp de la pareja con el mensaje escrito;
// lo que la pareja edite se guarda solo para este invitado al pulsar "Abrir WhatsApp".
// Spec 30 — con `album`, manda el link personal del álbum de fotos (bodas sin invitación).

const MAX_SUGGESTED_LENGTH = 1000;

interface WhatsAppSendModalProps {
  guest: FirebaseGuest;
  weddingId: string;
  weddingData: WeddingData;
  onClose: () => void;
  onSaved: (guestId: string, whatsappMessages: FirebaseGuest['whatsappMessages']) => void;
  album?: boolean;
}

const KIND_LABELS: Record<'invitation' | 'saveTheDate', string> = {
  invitation: 'Invitación',
  saveTheDate: 'Save the date',
};

export function WhatsAppSendModal({ guest, weddingId, weddingData, onClose, onSaved, album = false }: WhatsAppSendModalProps) {
  const [kind, setKind] = useState<WhatsAppMessageKind>(album ? 'album' : weddingData.saveTheDate?.enabled ? 'saveTheDate' : 'invitation');
  const invitationUrl = useMemo(
    () => (album ? buildGuestAlbumUrl(weddingId, guest) : buildGuestInvitationUrl(window.location.origin, weddingId, guest)),
    [album, weddingId, guest]
  );
  const defaultText = useMemo(
    () => buildDefaultWhatsAppMessage(kind, guest, weddingData, invitationUrl),
    [kind, guest, weddingData, invitationUrl]
  );
  const [text, setText] = useState(() => guest.whatsappMessages?.[kind] ?? defaultText);
  const [useGuestPhone, setUseGuestPhone] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const phone = normalizePhone(guest.phone);
  const hasValidPhone = phone.valid && !!phone.value;
  const isEnglish = resolveHasEnglish(weddingData) && guest.language === 'en';

  // Cambiar el tipo carga el texto de ese tipo: el guardado del invitado o el por defecto.
  // Lo escrito y no enviado en el otro tipo se pierde (decisión del spec).
  useEffect(() => {
    setText(guest.whatsappMessages?.[kind] ?? defaultText);
  }, [kind, guest.whatsappMessages, defaultText]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isEdited = text !== defaultText;

  const handleOpen = async () => {
    setError(null);
    window.open(buildWhatsAppUrl(useGuestPhone && hasValidPhone ? phone.value : null, text), '_blank', 'noopener,noreferrer');
    track('guest_whatsapp_opened', { kind, edited: isEdited });

    const stored = guest.whatsappMessages?.[kind];
    const next = isEdited ? text : null;
    if ((stored ?? null) !== next) {
      try {
        await guestService.saveWhatsAppMessage(guest.id, kind, next);
        const messages = { ...(guest.whatsappMessages || {}) };
        if (next === null) delete messages[kind];
        else messages[kind] = next;
        onSaved(guest.id, messages);
      } catch {
        setError('WhatsApp se abrió, pero no pudimos guardar el mensaje editado.');
        return;
      }
    }
    onClose();
  };

  const recipientOption = (selected: boolean, onSelect: () => void, label: React.ReactNode) => (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex items-center gap-2.5 min-h-[44px] px-3 rounded-lg text-left text-[13.5px] font-semibold transition-colors ${
        selected ? 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] text-[#0A0A0A]' : 'text-[#52525B] hover:bg-white/60'
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full flex-none box-border ${selected ? 'border-[5px] border-[#166534]' : 'border-2 border-[#A1A1AA]'}`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={manrope}>
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)]" onClick={onClose} />
        <div role="dialog" aria-modal="true" aria-labelledby="whatsapp-modal-title" className="relative w-full max-w-[600px] bg-white rounded-2xl shadow-xl">
          <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-xl bg-[#F0FDF4] text-[#15803D] inline-flex items-center justify-center flex-none">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <h3 id="whatsapp-modal-title" className="text-[19px] text-[#0A0A0A]" style={displayFont}>
                  {album ? 'Enviar link del álbum' : 'Enviar por WhatsApp'}
                </h3>
                <div className="text-[13px] text-[#71717A] mt-0.5">
                  {album ? `${guest.name} · Con este link, sus fotos llevan su nombre` : `${guest.name} · ${isEnglish ? 'Mensaje en inglés' : 'Mensaje en español'}`}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="text-[#71717A] hover:text-[#0A0A0A] p-2 rounded-lg hover:bg-[#FAFAFA] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 pb-5 flex flex-col gap-3.5">
            {!album && (
            <div role="radiogroup" aria-label="Tipo de mensaje" className="grid grid-cols-2 gap-1 p-1 bg-[#F4F4F5] rounded-xl">
              {(Object.keys(KIND_LABELS) as (keyof typeof KIND_LABELS)[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={kind === k}
                  onClick={() => setKind(k)}
                  className={`min-h-[44px] rounded-lg text-sm transition-colors ${
                    kind === k ? 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] font-semibold text-[#0A0A0A]' : 'font-semibold text-[#71717A] hover:text-[#0A0A0A]'
                  }`}
                >
                  {KIND_LABELS[k]}
                </button>
              ))}
            </div>
            )}

            <div>
              <label htmlFor="whatsapp-message" className="block text-[13px] font-semibold text-[#27272A] mb-1.5">
                Mensaje
              </label>
              <textarea
                id="whatsapp-message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="w-full px-3.5 py-3 border border-[rgba(0,0,0,0.14)] rounded-xl text-sm leading-relaxed text-[#0A0A0A] resize-y focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
              />
              <div className={`text-right text-[11.5px] mt-1 ${text.length > MAX_SUGGESTED_LENGTH ? 'text-[#B45309] font-semibold' : 'text-[#A1A1AA]'}`}>
                {text.length > MAX_SUGGESTED_LENGTH
                  ? `${text.length} caracteres · un mensaje tan largo puede no abrir bien en WhatsApp`
                  : `${text.length} / ${MAX_SUGGESTED_LENGTH}`}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap -mt-1">
              {isEdited ? (
                <span className="text-[12.5px] font-semibold text-[#9A3412] bg-[#FFEDD5] px-2.5 py-1 rounded-full">Editado para este invitado</span>
              ) : (
                <span className="text-[12.5px] text-[#71717A]">Puedes editarlo; se guarda solo para este invitado.</span>
              )}
              <button
                type="button"
                onClick={() => setText(defaultText)}
                disabled={!isEdited}
                className="min-h-[36px] text-[13px] font-semibold text-[#AE5730] hover:text-[#8F4524] disabled:text-[#A1A1AA] disabled:cursor-not-allowed"
              >
                Restaurar mensaje por defecto
              </button>
            </div>

            {hasValidPhone ? (
              <div role="radiogroup" aria-label="Destinatario" className="flex flex-col gap-0.5 p-1.5 rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#FAFAFA]">
                {recipientOption(useGuestPhone, () => setUseGuestPhone(true), <>Enviar a <span className="font-semibold">{phone.value}</span></>)}
                {recipientOption(!useGuestPhone, () => setUseGuestPhone(false), 'Elegir el contacto en WhatsApp')}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 rounded-xl border border-[rgba(0,0,0,0.06)] bg-[#FAFAFA] px-3.5 py-3 text-[13.5px] font-semibold text-[#27272A]">
                <Phone className="h-4 w-4 text-[#3F3F46]" />
                Sin teléfono: elegirás el contacto en WhatsApp
              </div>
            )}

            {error && <div className="text-[13px] font-semibold text-[#B91C1C]">{error}</div>}
          </div>

          <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-[rgba(0,0,0,0.08)]">
            <AdminButton variant="ghost" onClick={onClose}>
              Cancelar
            </AdminButton>
            <button
              type="button"
              onClick={handleOpen}
              className="inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-lg px-5 py-2.5 min-h-[44px] bg-[#166534] text-white hover:bg-[#14532D] transition-colors"
              style={manrope}
            >
              <MessageCircle className="h-4 w-4" />
              Abrir WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
