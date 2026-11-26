'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from '../../lib/translations';
import { SITE } from '../../lib/site';

// Spec 33 — QR de entrada del invitado: su link personal (con la cámara normal solo abre su
// invitación). Con "Día del evento" va dentro del pase (EntryQrBlock); sin él, en una hoja que abre
// el botón "Mi QR de entrada" (EntryQrSheet). Un estilo por diseño, como el canvas del spec 33.

type TemplateKey = 'template-01' | 'template-02' | 'template-03' | 'template-04';

// Mismo dominio donde se abrió la invitación (producción, preview o local); si no hay ventana, el canónico.
export function guestInvitationUrl(weddingId: string, language: string, guestUrlId: string): string {
  const lang = language === 'en' ? 'en' : 'es';
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE.url;
  return `${origin}/${lang}/wedding/${encodeURIComponent(weddingId)}?guest=${encodeURIComponent(guestUrlId)}`;
}

function useQrDataUrl(text: string, dark: string, light: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    import('qrcode')
      .then((QR) => QR.default.toDataURL(text, { margin: 1, width: 520, errorCorrectionLevel: 'M', color: { dark, light } }))
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [text, dark, light]);
  return url;
}

const STYLE: Record<TemplateKey, {
  ink: string; bg: string; frame: CSSProperties; label: CSSProperties; name: CSSProperties; hint: CSSProperties; card?: CSSProperties;
  sheetBg: string; sheetRadius: string; title: CSSProperties; body: string; muted: string; close: CSSProperties; scrim: string;
}> = {
  'template-01': {
    ink: '#2a2119', bg: '#faf8f5',
    frame: { padding: 14, background: '#faf8f5', border: '1px solid #c9a86a', outline: '1px solid rgba(201,168,106,0.45)', outlineOffset: 5 },
    label: { fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a86a', fontFamily: "'Jost', sans-serif" },
    name: { fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#ffffff' },
    hint: { fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 16, color: 'rgba(255,255,255,0.78)' },
    sheetBg: '#faf8f5', sheetRadius: '0', title: { fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500 }, body: "'Jost', sans-serif", muted: '#6b5b4f',
    close: { background: 'transparent', color: '#5a4a3a', border: '1.5px solid #d9c6a8', fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }, scrim: 'rgba(20,14,8,0.6)',
  },
  'template-02': {
    ink: '#1E1C19', bg: '#FBFAF7',
    frame: { padding: 0 },
    card: { display: 'flex', flexDirection: 'column', gap: 14, padding: 18, background: '#FBFAF7', border: '1px solid #D9D3C9', borderRadius: 5 },
    label: { fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#57524B', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    name: { fontSize: 12, fontWeight: 600, color: '#7A5A3C', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    hint: { fontSize: 14, lineHeight: 1.5, color: '#57524B', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    sheetBg: '#FBFAF7', sheetRadius: '0', title: { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 30, fontWeight: 400, letterSpacing: '-0.03em' }, body: "'Plus Jakarta Sans', sans-serif", muted: '#57524B',
    close: { background: 'transparent', color: '#1E1C19', border: '1px solid #1E1C19', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600 }, scrim: 'rgba(30,28,25,0.55)',
  },
  'template-03': {
    ink: '#34302A', bg: '#FAF6EF',
    frame: { padding: 14, background: '#FAF6EF', borderRadius: 18 },
    card: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '22px 18px', background: '#F1EADD', borderRadius: 28 },
    label: { fontSize: 11, fontWeight: 500, letterSpacing: '0.34em', textTransform: 'uppercase', color: '#A4572F', fontFamily: "'Jost', sans-serif" },
    name: { fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 500, fontSize: 21, color: '#34302A' },
    hint: { fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 17, color: '#6B6255' },
    sheetBg: '#FAF6EF', sheetRadius: '28px', title: { fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 28, fontWeight: 500 }, body: "'Jost', sans-serif", muted: '#6B6255',
    close: { background: 'transparent', color: '#6B6255', border: '1px solid #E7DECD', borderRadius: 999, fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 500 }, scrim: 'rgba(52,48,42,0.5)',
  },
  'template-04': {
    ink: '#2E3323', bg: '#F4EFE3',
    frame: { padding: 14, border: '1px solid #B7AD90' },
    label: { fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#5E6152', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
    name: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 18, color: '#2E3323' },
    hint: { fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontSize: 15, color: '#3A3830' },
    sheetBg: '#F4EFE3', sheetRadius: '0', title: { fontFamily: "Georgia, serif", fontSize: 22, letterSpacing: '0.06em', textTransform: 'uppercase' }, body: "Georgia, serif", muted: '#5E6152',
    close: { background: '#2E3323', color: '#F4EFE3', border: 0, fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }, scrim: 'rgba(46,51,35,0.6)',
  },
};

const keyOf = (id?: string): TemplateKey => (['template-01', 'template-02', 'template-03', 'template-04'].includes(id || '') ? (id as TemplateKey) : 'template-01');

function peopleText(t: (k: string) => string, count: number) {
  return count === 1 ? t('onePerson') : t('people').split('{count}').join(String(count));
}

// Bloque dentro del pase (casos 3 y 5 del spec 33).
export function EntryQrBlock({ templateId, url, guestName, count, big = false }: { templateId?: string; url: string; guestName: string; count: number; big?: boolean }) {
  const { t } = useTranslations('eventDay');
  const key = keyOf(templateId);
  const s = STYLE[key];
  const qr = useQrDataUrl(url, s.ink, key === 'template-02' ? '#FBFAF7' : s.bg);
  const size = big ? 240 : key === 'template-02' ? 210 : 196;
  const aria = t('entryQrAria').split('{name}').join(guestName);
  const img = qr ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={qr} alt={aria} width={size} height={size} style={{ display: 'block', width: size, height: size }} />
  ) : (
    <div style={{ width: size, height: size }} aria-hidden="true" />
  );

  if (key === 'template-02') {
    return (
      <section aria-label={t('entryQrTitle')} style={s.card}>
        <div className="flex items-center justify-between">
          <span style={s.label}>{t('entryQrTitle')}</span>
          <span style={s.name}>{peopleText(t, count)}</span>
        </div>
        <div className="flex justify-center">{img}</div>
        <p className="m-0" style={s.hint}>{t('entryQrHint')}</p>
      </section>
    );
  }
  const inner = (
    <>
      {key === 'template-04' ? (
        <div className="flex items-center gap-3">
          <span className="block h-px w-9" style={{ background: '#B7AD90' }} />
          <span style={s.label}>{t('entryQrTitle')}</span>
          <span className="block h-px w-9" style={{ background: '#B7AD90' }} />
        </div>
      ) : (
        <p className="m-0" style={s.label}>{t('entryQrTitle')}</p>
      )}
      <div style={s.frame}>{img}</div>
      <p className="m-0 mt-1" style={s.name}>
        {guestName} · {peopleText(t, count)}
      </p>
      <p className="m-0" style={s.hint}>{t('entryQrShort')}</p>
    </>
  );
  return (
    <section aria-label={t('entryQrTitle')} className="flex w-full flex-col items-center gap-3 text-center" style={s.card}>
      {inner}
    </section>
  );
}

// Hoja "Tu QR de entrada" (caso 4: check-in activo sin "Día del evento").
export function EntryQrSheet({ templateId, url, guestName, count, onClose }: { templateId?: string; url: string; guestName: string; count: number; onClose: () => void }) {
  const { t } = useTranslations('eventDay');
  const key = keyOf(templateId);
  const s = STYLE[key];
  const qr = useQrDataUrl(url, s.ink, s.sheetBg);
  const radius = s.sheetRadius === '0' ? '0' : `${s.sheetRadius} ${s.sheetRadius} 0 0`;
  const aria = t('entryQrAria').split('{name}').join(guestName);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center" style={{ background: s.scrim }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('entryQrTitle')}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col items-center gap-3 px-[22px] pb-6 pt-[22px] text-center md:w-[420px]"
        style={{ background: s.sheetBg, borderRadius: radius, color: s.ink, fontFamily: s.body, boxShadow: '0 -12px 30px rgba(0,0,0,0.2)' }}
      >
        <p className="m-0" style={s.title}>{t('entryQrTitle')}</p>
        <p className="m-0 text-sm" style={{ color: s.muted }}>
          {guestName} · {peopleText(t, count)}
        </p>
        <div style={{ padding: 12, border: `1px solid ${key === 'template-01' ? '#d9c6a8' : key === 'template-03' ? '#E7DECD' : key === 'template-04' ? '#B7AD90' : '#D9D3C9'}`, borderRadius: key === 'template-03' ? 18 : 0 }}>
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt={aria} width={220} height={220} style={{ display: 'block' }} />
          ) : (
            <div style={{ width: 220, height: 220 }} aria-hidden="true" />
          )}
        </div>
        <p className="m-0 text-sm leading-relaxed" style={{ color: s.muted }}>{t('entryQrHint')}</p>
        <button type="button" onClick={onClose} className="h-12 w-full cursor-pointer" style={s.close}>
          {t('close')}
        </button>
      </div>
    </div>,
    document.body
  );
}
