'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useTranslations } from '../../lib/translations';
import { track } from '../../lib/analytics/client';
import { startTrace } from '../../lib/analytics/perf';
import { useInvitationOpened } from '../../lib/analytics/useInvitationOpened';
import { SITE } from '../../lib/site';
import { compressImage, UnsupportedImageError } from '../../lib/imageCompress';
import { ALBUM_PHOTO_LIMIT, formatAlbumDate, formatAlbumTime, type AlbumMode, type AlbumPhase } from '../../lib/album';
import { getAlbumTheme, type AlbumTheme } from './albumThemes';

// Spec 29 — página pública del álbum (/[locale]/wedding/[id]/fotos), pintada con el estilo del
// template de la boda. El invitado entra con su link personal (?guest=) o con el QR general
// (id anónimo del dispositivo + nombre opcional). Todo lo sensible lo decide el servidor.

interface PublicPhoto {
  id: string;
  thumbUrl: string;
  url: string;
  width: number;
  height: number;
  uploaderName: string | null;
  createdAt: string;
}

interface AlbumData {
  phase: AlbumPhase;
  mode: AlbumMode;
  names: { bride: string; groom: string };
  templateId: string | null;
  opensAt: string | null;
  closesAt: string | null;
  revealAt: string | null;
  expiresAt: string | null;
  revealed?: boolean;
  guestName: string | null;
  remaining: number;
  albumFull?: boolean; // la boda llegó al tope de ALBUM_WEDDING_LIMIT fotos
  standalone?: boolean; // Spec 30 — boda gratis: álbum sin invitación, sin foto de portada
  photos: PublicPhoto[];
  total: number;
}

type UploadStatus = 'waiting' | 'uploading' | 'done' | 'failed' | 'unsupported';
interface UploadItem {
  key: string;
  file: File;
  preview: string;
  status: UploadStatus;
  progress: number;
}

const DEVICE_KEY = 'invyta:album-device';
const NAME_KEY = 'invyta:album-name';

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Sin localStorage (modo privado): el valor vive solo en esta sesión.
  }
}
function newUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const fill = (text: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{${k}}`).join(String(v)), text);

// Sube una foto con XMLHttpRequest para poder mostrar el progreso.
function postPhoto(url: string, form: FormData, onProgress: (p: number) => void): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let body: Record<string, unknown> = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // respuesta sin JSON
      }
      resolve({ status: xhr.status, body });
    };
    xhr.onerror = () => reject(new Error('network'));
    xhr.send(form);
  });
}

const CameraIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.5 4h-5L7.5 6.5H4a1 1 0 0 0-1 1V19a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7.5a1 1 0 0 0-1-1h-3.5z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);
const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 16V4" />
    <path d="M7 9l5-5 5 5" />
    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </svg>
);
const LockIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
const Branch = ({ mirrored = false, style }: { mirrored?: boolean; style?: CSSProperties }) => (
  <svg width="90" height="112" viewBox="0 0 120 150" fill="none" stroke="#85906E" strokeWidth={1.3} strokeLinecap="round" aria-hidden="true" style={{ position: 'absolute', opacity: 0.85, transform: mirrored ? 'scaleX(-1)' : undefined, ...style }}>
    <path d="M20 148 C 40 110, 52 70, 50 10" />
    <path d="M47 40 C 30 34, 22 22, 24 10 C 38 14, 46 26, 47 40Z" />
    <path d="M49 70 C 66 62, 74 48, 72 36 C 58 40, 50 54, 49 70Z" />
    <path d="M44 96 C 26 92, 16 80, 16 68 C 30 70, 42 82, 44 96Z" />
  </svg>
);

// Encabezado del álbum con el lenguaje visual de cada template (spec 29, "Estilos por template").
function AlbumHeader({ theme, names, dateText, heroImage, eyebrow, photosLabel }: { theme: AlbumTheme; names: AlbumData['names']; dateText: string; heroImage: string; eyebrow: string; photosLabel?: string }) {
  const { bride, groom } = names;
  if (theme.header === 'classic') {
    return (
      <header className="ga-hd-classic" style={{ position: 'relative', height: 250, overflow: 'hidden', color: '#FFFFFF', background: '#2a2119' }}>
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 28%' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(24,17,10,0.6) 0%, rgba(24,17,10,0.82) 100%)' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', padding: '0 16px' }}>
          <p style={{ margin: 0, fontFamily: "'Lora', serif", fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase' }}>{eyebrow}</p>
          <h1 style={{ margin: 0, fontFamily: "'Allura', cursive", fontWeight: 400, fontSize: 52, lineHeight: 1.05, textShadow: '2px 2px 6px rgba(0,0,0,0.6)' }}>
            {bride} <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 30, color: '#e7e1d8' }}>&amp;</span> {groom}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 200 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.4)' }} />
            <div style={{ width: 6, height: 6, transform: 'rotate(45deg)', border: '1px solid #c9a86a' }} />
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.4)' }} />
          </div>
          {dateText && <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 500 }}>{dateText}</p>}
        </div>
      </header>
    );
  }
  if (theme.header === 'modern') {
    const initials = `${bride.charAt(0)}·${groom.charAt(0)}`;
    return (
      <header className="ga-pad ga-hd-modern" style={{ padding: '26px 24px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#7A5A3C' }}>
            <span style={{ width: 22, height: 1, background: '#7A5A3C' }} />
            {eyebrow}
          </p>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid #B79A7A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #7A5A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: '#7A5A3C' }}>{initials}</div>
          </div>
        </div>
        <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 400, fontSize: 56, lineHeight: 0.9, letterSpacing: '-0.045em', color: '#1E1C19' }}>
          {bride}
          <br />
          <span style={{ color: '#7A5A3C' }}>&amp;</span> {groom}
        </h1>
        {(dateText || photosLabel) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', borderTop: '1px solid #D9D3C9', borderBottom: '1px solid #D9D3C9', fontSize: 14, fontWeight: 500 }}>
            <span style={{ padding: '12px 12px 12px 0', borderRight: '1px solid #D9D3C9' }}>{dateText}</span>
            <span style={{ padding: '12px 0 12px 14px' }}>{photosLabel}</span>
          </div>
        )}
      </header>
    );
  }
  if (theme.header === 'botanical') {
    return (
      <header className="ga-hd-botanical" style={{ position: 'relative', padding: '24px 28px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', overflow: 'hidden' }}>
        <Branch style={{ left: -14, top: 30 }} />
        <Branch mirrored style={{ right: -14, top: 30 }} />
        <p style={{ margin: 0, fontSize: 11, fontWeight: 500, letterSpacing: '0.34em', textTransform: 'uppercase', color: '#B5643A' }}>{eyebrow}</p>
        {heroImage && (
          <div className="ga-arch" style={{ width: 92, height: 108, padding: 5, border: '1px solid #C8BBA4', borderRadius: '999px 999px 0 0', boxSizing: 'border-box' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', borderRadius: '999px 999px 0 0', display: 'block' }} />
          </div>
        )}
        <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 500, fontSize: 38, lineHeight: 1.02, color: '#34302A' }}>
          {bride} <span style={{ fontSize: 24, fontWeight: 400, color: '#B5643A' }}>&amp;</span> {groom}
        </h1>
        {dateText && <span style={{ fontSize: 14, color: '#6B6255' }}>{dateText}</span>}
      </header>
    );
  }
  return (
    <header className="ga-hd-garden" style={{ background: '#2E3323', color: '#F4EFE3', padding: '44px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
      <p style={{ margin: 0, fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#C9A98C' }}>{eyebrow}</p>
      <h1 style={{ margin: '4px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Georgia, serif', fontWeight: 400, lineHeight: 1.12 }}>
        <span style={{ fontSize: 34, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{bride}</span>
        <span style={{ fontSize: 19, fontStyle: 'italic', color: '#C9A98C' }}>y</span>
        <span style={{ fontSize: 34, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{groom}</span>
      </h1>
      {dateText && <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#E8E1D1' }}>{dateText}</p>}
    </header>
  );
}

// En celular el álbum es una columna de 480 px. En tablet se ensancha a 960 px con 3 columnas
// (el Clásico, de cuadros chicos, 4). Desde 1024 px son dos columnas, como en la página "Álbum en
// escritorio" del canvas: a la izquierda, fija, el encabezado del template y los controles de
// subida; a la derecha, la galería en 4 columnas (Clásico 5). La ventana de subida se centra.
const LAYOUT_CSS = `
.ga-col{max-width:480px;margin:0 auto}
.ga-grid{grid-template-columns:repeat(var(--ga-cols),minmax(0,1fr));grid-auto-flow:dense}
@media (min-width:768px){
  .ga-col{max-width:960px}
  .ga-pad{padding-left:40px!important;padding-right:40px!important}
  .ga-controls{max-width:560px;width:100%;box-sizing:border-box}
  .ga-center{margin-left:auto;margin-right:auto}
  .ga-grid{grid-template-columns:repeat(var(--ga-cols-md),minmax(0,1fr))}
}
@media (min-width:1024px){
  .ga-col{max-width:none;display:grid;grid-template-columns:minmax(360px,440px) minmax(0,1fr)}
  .ga-aside{position:sticky;top:0;height:100dvh;overflow-y:auto;border-right:var(--ga-line);box-sizing:border-box}
  .ga-aside .ga-controls{max-width:none;margin:0}
  .ga-main{padding:44px 56px 56px!important;gap:22px!important;min-width:0}
  .ga-grid{grid-template-columns:repeat(var(--ga-cols-lg),minmax(0,1fr))}
  .ga-grid-gap{gap:var(--ga-gap-lg)!important}
  .ga-chip{font-size:11px!important;padding:3px 9px!important;left:8px!important;bottom:8px!important}
  .ga-hd-classic{height:380px!important}
  .ga-hd-classic h1{font-size:64px!important}
  .ga-hd-modern{padding:44px 40px 8px!important;gap:26px!important}
  .ga-hd-modern h1{font-size:76px!important}
  .ga-hd-botanical{padding:48px 32px 12px!important;gap:14px!important}
  .ga-hd-botanical .ga-arch{width:124px!important;height:146px!important;padding:6px!important}
  .ga-hd-botanical h1{font-size:48px!important}
  .ga-hd-garden{padding:64px 32px 56px!important}
  .ga-hd-garden h1 > span:not(:nth-child(2)){font-size:40px!important}
  .ga-sheet-wrap{align-items:center;justify-content:center;background:rgba(31,26,23,0.45)}
  .ga-sheet-wrap > .ga-backdrop{position:absolute;inset:0;background:transparent!important}
  .ga-sheet{position:relative;max-width:520px!important;border-radius:var(--ga-modal-radius)!important;padding:28px 28px 24px!important;box-shadow:0 24px 60px rgba(0,0,0,0.25)}
  .ga-sheet-handle{display:none}
}
`;

function PhotoGrid({ theme, photos, showNames, guestLabel, onOpen }: { theme: AlbumTheme; photos: PublicPhoto[]; showNames: boolean; guestLabel: string; onOpen: (index: number) => void }) {
  const { cols, gap, radius, aspect, wideEvery } = theme.grid;
  const gridVars = { '--ga-cols': cols, '--ga-cols-md': Math.max(cols, 3) + (cols >= 3 ? 1 : 0), '--ga-cols-lg': Math.max(cols, 3) + 1 + (cols >= 3 ? 1 : 0) } as CSSProperties;
  return (
    <div className="ga-grid ga-grid-gap" style={{ display: 'grid', gap, ...gridVars, ['--ga-gap-lg' as string]: `${Math.max(gap, 10)}px` }}>
      {photos.map((p, i) => {
        const wide = wideEvery && i % wideEvery === 0;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`${p.uploaderName || guestLabel}`}
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: 0,
              border: 0,
              cursor: 'pointer',
              background: '#00000010',
              borderRadius: radius,
              aspectRatio: wide ? '16 / 10' : aspect,
              gridColumn: wide ? 'span 2' : undefined,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumbUrl} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            {showNames && (
              <span className="ga-chip" style={{ position: 'absolute', left: 6, bottom: 6, maxWidth: 'calc(100% - 12px)', fontSize: 10, fontWeight: 500, color: '#FFFFFF', background: 'rgba(20,18,15,0.55)', padding: '2px 7px', borderRadius: theme.chipRadius, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'inherit' }}>
                {p.uploaderName || guestLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Viewer({ photos, index, locale, guestLabel, labels, onClose, onMove }: { photos: PublicPhoto[]; index: number; locale: string; guestLabel: string; labels: { close: string; prev: string; next: string; count: string; today: string }; onClose: () => void; onMove: (i: number) => void }) {
  const photo = photos[index];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) onMove(index - 1);
      if (e.key === 'ArrowRight' && index < photos.length - 1) onMove(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, photos.length, onClose, onMove]);
  if (!photo) return null;
  const created = new Date(photo.createdAt);
  const sameDay = formatAlbumDate(created, locale) === formatAlbumDate(new Date(), locale);
  const when = `${sameDay ? labels.today : formatAlbumDate(created, locale, { day: 'numeric', month: 'short' })}, ${formatAlbumTime(created, locale)}`;
  const navBtn: CSSProperties = { position: 'absolute', top: '50%', marginTop: -22, width: 44, height: 44, borderRadius: 999, border: 0, background: 'rgba(20,17,16,0.55)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
  return (
    <div role="dialog" aria-modal="true" aria-label={photo.uploaderName || guestLabel} style={{ position: 'fixed', inset: 0, zIndex: 60, background: '#141110', color: '#FFFFFF', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 12px 8px 20px' }}>
        <span style={{ fontSize: 13, color: '#CFC7BE' }}>{labels.count}</span>
        <button type="button" onClick={onClose} aria-label={labels.close} style={{ width: 44, height: 44, borderRadius: 999, border: 0, background: 'transparent', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12" /><path d="M18 6L6 18" /></svg>
        </button>
      </div>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        {index > 0 && (
          <button type="button" aria-label={labels.prev} onClick={() => onMove(index - 1)} style={{ ...navBtn, left: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
        )}
        {index < photos.length - 1 && (
          <button type="button" aria-label={labels.next} onClick={() => onMove(index + 1)} style={{ ...navBtn, right: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        )}
      </div>
      <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{photo.uploaderName || guestLabel}</span>
        <span style={{ fontSize: 13, color: '#CFC7BE' }}>{when}</span>
      </div>
    </div>
  );
}

export default function GuestAlbum({ weddingId, locale, guestId }: { weddingId: string; locale: string; guestId: string | null }) {
  const { t } = useTranslations('album');
  const [data, setData] = useState<AlbumData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [heroImage, setHeroImage] = useState('');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [items, setItems] = useState<UploadItem[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tooManyNotice, setTooManyNotice] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const runningRef = useRef(false);
  // Copia síncrona de la cola: el ciclo de subida siempre toma la siguiente foto en espera,
  // así un "Reintentar" se suma aunque otras fotos sigan subiendo.
  const itemsRef = useRef<UploadItem[]>([]);
  const setQueue = (next: UploadItem[]) => {
    itemsRef.current = next;
    setItems(next);
  };

  const isGuestLink = !!guestId;

  useEffect(() => {
    if (isGuestLink) return;
    let id = readStorage(DEVICE_KEY);
    if (!id) {
      id = newUuid();
      writeStorage(DEVICE_KEY, id);
    }
    setDeviceId(id);
    setName(readStorage(NAME_KEY) || '');
  }, [isGuestLink]);

  const load = useCallback(async () => {
    if (!isGuestLink && !deviceId) return;
    setLoadError(false);
    try {
      const qs = new URLSearchParams();
      if (guestId) qs.set('guest', guestId);
      else if (deviceId) qs.set('device', deviceId);
      const res = await fetch(`/api/album/${encodeURIComponent(weddingId)}?${qs.toString()}`, { cache: 'no-store' });
      if (res.status === 404) {
        setData({ phase: 'disabled', mode: 'open', names: { bride: '', groom: '' }, templateId: null, opensAt: null, closesAt: null, revealAt: null, expiresAt: null, guestName: null, remaining: 0, photos: [], total: 0 });
        return;
      }
      if (!res.ok) throw new Error('load');
      setData(await res.json());
    } catch {
      setLoadError(true);
    }
  }, [weddingId, guestId, deviceId, isGuestLink]);

  useEffect(() => {
    void load();
  }, [load]);

  // La foto de portada sale de la invitación; un álbum sin invitación (spec 30) no lleva.
  const standalone = data?.standalone;
  useEffect(() => {
    if (standalone !== false) return;
    fetch(`/api/wedding-images/${encodeURIComponent(weddingId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setHeroImage(d?.heroImage || ''))
      .catch(() => setHeroImage(''));
  }, [weddingId, standalone]);

  const theme = getAlbumTheme(data?.templateId);
  const guestLabel = t('guestFallback');

  // Spec 31 — `invitation_opened` del álbum en cuanto carga (no si el álbum no existe o está apagado).
  // Un álbum sin invitación (spec 30) no tiene plantilla: viaja como 'none'.
  useInvitationOpened(
    data && data.phase !== 'disabled'
      ? { weddingId, templateId: data.templateId || 'none', pageType: 'album', hasGuest: isGuestLink }
      : null
  );

  const dateText = useMemo(() => (data?.opensAt ? formatAlbumDate(new Date(data.opensAt), locale) : ''), [data?.opensAt, locale]);
  const revealText = useMemo(() => (data?.revealAt ? formatAlbumDate(new Date(data.revealAt), locale, { day: 'numeric', month: 'long' }) : ''), [data?.revealAt, locale]);

  const runQueue = useCallback(async () => {
    if (runningRef.current || !data) return;
    runningRef.current = true;
    const update = (key: string, patch: Partial<UploadItem>) => setQueue(itemsRef.current.map((it) => (it.key === key ? { ...it, ...patch } : it)));
    for (let item = itemsRef.current.find((it) => it.status === 'waiting'); item; item = itemsRef.current.find((it) => it.status === 'waiting')) {
      const key = item.key;
      update(key, { status: 'uploading', progress: 0 });
      try {
        const compressed = await compressImage(item.file);
        const form = new FormData();
        form.append('photo', compressed.photo, 'photo.jpg');
        form.append('thumb', compressed.thumb, 'thumb.jpg');
        form.append('width', String(compressed.width));
        form.append('height', String(compressed.height));
        if (guestId) form.append('guestId', guestId);
        else if (deviceId) {
          form.append('deviceId', deviceId);
          if (name.trim()) form.append('name', name.trim());
        }
        const uploadTrace = startTrace('album_photo_upload');
        const res = await postPhoto(`/api/album/${encodeURIComponent(weddingId)}/photos`, form, (p) => update(key, { progress: p })).catch(
          (error: unknown) => {
            uploadTrace.stop('error', { template_id: data.templateId || 'none' });
            throw error;
          }
        );
        uploadTrace.stop(res.status === 200 ? 'ok' : 'error', { template_id: data.templateId || 'none' });
        if (res.status === 200) {
          update(key, { status: 'done', progress: 100 });
          const photo = res.body.photo as PublicPhoto | undefined;
          const remaining = typeof res.body.remaining === 'number' ? res.body.remaining : undefined;
          const albumFull = res.body.albumFull === true;
          setData((prev) => (prev ? { ...prev, remaining: remaining ?? Math.max(0, prev.remaining - 1), albumFull, photos: photo ? [photo, ...prev.photos] : prev.photos, total: prev.total + 1 } : prev));
          track('album_photo_uploaded', { mode: data.mode, source: guestId ? 'guest' : 'device' });
        } else {
          if (res.status === 429) {
            const albumFull = res.body.error === 'album_full';
            setData((prev) => (prev ? { ...prev, remaining: 0, albumFull: albumFull || prev.albumFull } : prev));
            // Sin espacio no tiene caso intentar las que siguen en espera.
            setQueue(itemsRef.current.map((it) => (it.key === key || it.status === 'waiting' ? { ...it, status: 'failed' } : it)));
            continue;
          }
          update(key, { status: 'failed' });
        }
      } catch (error) {
        update(key, { status: error instanceof UnsupportedImageError ? 'unsupported' : 'failed' });
      }
    }
    runningRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, deviceId, guestId, name, weddingId]);

  const onPick = (files: FileList | null) => {
    if (!files || files.length === 0 || !data) return;
    const all = Array.from(files);
    const allowed = all.slice(0, data.remaining);
    setTooManyNotice(all.length > data.remaining ? fill(t('tooMany'), { x: all.length, n: data.remaining }) : null);
    if (allowed.length === 0) return;
    if (!guestId) writeStorage(NAME_KEY, name.trim());
    const queue: UploadItem[] = allowed.map((file, i) => ({ key: `${Date.now()}-${i}`, file, preview: URL.createObjectURL(file), status: 'waiting', progress: 0 }));
    setQueue(queue);
    setSheetOpen(true);
    void runQueue();
  };

  const retry = (key: string) => {
    setQueue(itemsRef.current.map((it) => (it.key === key ? { ...it, status: 'waiting' as const, progress: 0 } : it)));
    void runQueue();
  };

  const closeSheet = () => {
    itemsRef.current.forEach((it) => URL.revokeObjectURL(it.preview));
    setQueue([]);
    setSheetOpen(false);
    setTooManyNotice(null);
  };

  const rootStyle: CSSProperties = { minHeight: '100dvh', background: theme.bg, color: theme.ink, fontFamily: theme.fontFamily };
  const column: CSSProperties = { maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: theme.bg };
  // Columna que se ensancha en tablet y escritorio (ver LAYOUT_CSS).
  const wideColumn = { minHeight: '100dvh', background: theme.bg, '--ga-line': theme.dashed.replace('dashed', 'solid') } as CSSProperties;
  const layoutStyle = <style>{LAYOUT_CSS}</style>;
  // El Moderno alinea todo a la izquierda; los demás templates centran el bloque de controles.
  const controlsClass = theme.header === 'modern' ? 'ga-controls ga-pad' : 'ga-controls ga-pad ga-center';

  if (loadError) {
    return (
      <div style={rootStyle}>
        <div style={{ ...column, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 15 }}>{t('errorLoad')}</p>
          <button type="button" onClick={() => void load()} style={{ ...theme.button, padding: '0 24px', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={rootStyle}>
        <div style={{ ...column, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, color: theme.muted }}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  const { phase, mode } = data;
  if (phase === 'disabled' || phase === 'expired') {
    return (
      <div style={rootStyle}>
        <div style={{ ...column, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 32px', textAlign: 'center' }}>
          <CameraIcon size={40} />
          <p style={{ margin: 0, fontSize: 24, ...theme.heading, textTransform: 'none', letterSpacing: 'normal' }}>{t('unavailableTitle')}</p>
          <p style={{ margin: 0, fontSize: 13, color: theme.muted, lineHeight: 1.45 }}>{t('unavailableHint')}</p>
        </div>
      </div>
    );
  }

  const header = (
    <AlbumHeader
      theme={theme}
      names={data.names}
      dateText={dateText}
      heroImage={heroImage}
      eyebrow={t('eyebrow')}
      photosLabel={phase !== 'before' ? fill(t('photosCount'), { n: data.total }) : undefined}
    />
  );

  if (phase === 'before') {
    return (
      <div style={rootStyle}>
        {layoutStyle}
        <div className="ga-col" style={wideColumn}>
          <aside className="ga-aside">{header}</aside>
          <div className="ga-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '56px 32px', textAlign: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={theme.fill} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17" /><path d="M8 3v4" /><path d="M16 3v4" />
            </svg>
            <p style={{ margin: 0, ...theme.heading, fontSize: 24, textTransform: 'none', letterSpacing: 'normal' }}>{t('beforeTitle')}</p>
            <p style={{ margin: 0, fontSize: 14, color: theme.body }}>{dateText || t('noDate')}</p>
            <p style={{ margin: 0, fontSize: 13, color: theme.muted, lineHeight: 1.45 }}>{t('beforeHint')}</p>
          </div>
        </div>
      </div>
    );
  }

  const isOpenPhase = phase === 'open';
  const revealed = data.revealed ?? (mode === 'open' || (data.revealAt ? Date.now() >= new Date(data.revealAt).getTime() : false));
  const used = ALBUM_PHOTO_LIMIT - data.remaining;
  const limitReached = data.remaining <= 0;
  const gridTitle = !isOpenPhase ? t('closedGridTitle') : revealed ? t('allPhotos') : t('yourPhotos');
  const doneCount = items.filter((it) => it.status === 'done').length;
  const activeIndex = items.findIndex((it) => it.status === 'uploading');
  const finished = items.length > 0 && items.every((it) => it.status === 'done' || it.status === 'failed' || it.status === 'unsupported');

  return (
    <div style={rootStyle}>
      {layoutStyle}
      <div className="ga-col" style={wideColumn}>
        <aside className="ga-aside">
        {header}

        <section className={controlsClass} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!isOpenPhase && (
            // Con la subida cerrada el álbum es un recuerdo de los novios: un mensaje suyo, sin avisos.
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 12, textAlign: 'start', padding: '0px 0px 6px' }}>
              <p style={{ margin: 0, ...theme.heading, fontSize: 21, lineHeight: 1.4, textTransform: 'none', letterSpacing: 'normal' }}>{t('closedMessage')}</p>
              <span style={{ fontSize: 13, color: theme.muted }}>
                {fill(t('closedSignature'), { names: `${data.names.bride} ${theme.qr.joiner} ${data.names.groom}` })}
              </span>
            </div>
          )}

          {isOpenPhase && mode === 'disposable' && !revealed && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 16, ...theme.card }}>
              <CameraIcon size={22} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={theme.cardTitle}>{t('disposableTitle')}</span>
                <span style={{ fontSize: 13, lineHeight: 1.45, color: theme.cardMuted }}>{fill(t('disposableBody'), { date: revealText })}</span>
              </div>
            </div>
          )}

          {isOpenPhase && isGuestLink && data.guestName && (
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45, color: theme.body }}>
              {fill(t('greeting'), { name: '\u0000' })
                .split('\u0000')
                .reduce<ReactNode[]>((acc, part, i, arr) => {
                  acc.push(part);
                  if (i < arr.length - 1) acc.push(<span key="n" style={{ fontWeight: 500, color: theme.ink }}>{data.guestName}</span>);
                  return acc;
                }, [])}
            </p>
          )}

          {isOpenPhase && !isGuestLink && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="album-name" style={{ fontSize: 13, fontWeight: 600 }}>{t('nameLabel')}</label>
              <input
                id="album-name"
                type="text"
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                style={{ height: 48, borderRadius: theme.button.borderRadius === 0 ? 0 : 12, border: theme.dashed.replace('dashed', 'solid'), background: '#FFFFFF', padding: '0 14px', fontFamily: 'inherit', fontSize: 16, color: theme.ink, boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: 12, color: theme.muted }}>{t('nameHint')}</span>
            </div>
          )}

          {isOpenPhase && (
            <>
              <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { onPick(e.target.files); e.target.value = ''; }} />
              <button
                type="button"
                disabled={limitReached}
                onClick={() => inputRef.current?.click()}
                style={{ ...theme.button, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', cursor: limitReached ? 'not-allowed' : 'pointer', opacity: limitReached ? 0.45 : 1 }}
              >
                <UploadIcon />
                {t('upload')}
              </button>
              {tooManyNotice && !sheetOpen && <p role="status" style={{ margin: 0, fontSize: 13, color: theme.body }}>{tooManyNotice}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 13, color: theme.body }}>
                  {limitReached ? (
                    <span style={{ fontWeight: 600, color: theme.ink }}>{data.albumFull ? t('albumFull') : t('limitReached')}</span>
                  ) : (
                    fill(isGuestLink ? t('remaining') : t('remainingDevice'), { n: data.remaining })
                  )}
                </span>
                <div style={{ width: '100%', overflow: 'hidden', ...theme.track }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (used / ALBUM_PHOTO_LIMIT) * 100)}%`, background: theme.fill, borderRadius: theme.track.borderRadius }} />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: theme.muted }}>{t('privacy')}</p>
            </>
          )}
        </section>

        </aside>

        <section className="ga-pad ga-main" style={{ padding: '2px 20px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ margin: 0, ...theme.heading }}>{gridTitle}</h2>
            {revealed && <span style={{ fontSize: 12, color: theme.muted }}>{fill(t('photosCount'), { n: data.photos.length })}</span>}
          </div>
          {data.photos.length > 0 ? (
            <PhotoGrid theme={theme} photos={data.photos} showNames={revealed} guestLabel={guestLabel} onOpen={setViewerIndex} />
          ) : (
            revealed && <p style={{ margin: 0, fontSize: 13, color: theme.muted }}>{t('emptyOpen')}</p>
          )}
          {!revealed && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', padding: '20px 16px', border: theme.dashed, borderRadius: theme.card.borderRadius }}>
              <LockIcon color={theme.muted} />
              <span style={{ fontSize: 13, lineHeight: 1.4, color: theme.body }}>{fill(t('disposableLocked'), { date: revealText })}</span>
            </div>
          )}
          {/* Spec 31 — el álbum se mide: el aviso de privacidad queda al alcance del invitado. */}
          <a
            href={`${SITE.url}/aviso-de-privacidad`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ alignSelf: 'center', marginTop: 12, fontSize: 12, color: theme.muted, textDecoration: 'none' }}
          >
            {locale === 'en' ? 'Privacy' : 'Privacidad'}
          </a>
        </section>
      </div>

      {sheetOpen && (
        <div className="ga-sheet-wrap" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', ['--ga-modal-radius' as string]: theme.button.borderRadius === 0 ? '0px' : '18px' }}>
          <div className="ga-backdrop" style={{ flex: 1, background: 'rgba(31,26,23,0.45)' }} onClick={finished ? closeSheet : undefined} aria-hidden="true" />
          <section className="ga-sheet" role="dialog" aria-modal="true" aria-label={t('upload')} style={{ background: '#FFFFFF', color: '#1F1A17', borderRadius: '22px 22px 0 0', padding: '12px 20px 28px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '80dvh', overflowY: 'auto', fontFamily: theme.fontFamily, width: '100%', maxWidth: 480, margin: '0 auto', boxSizing: 'border-box' }}>
            <div className="ga-sheet-handle" style={{ width: 40, height: 4, borderRadius: 99, background: '#D9D0C4', alignSelf: 'center' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {finished ? fill(t('doneTitle'), { n: doneCount }) : fill(t('uploadingTitle'), { i: Math.max(1, (activeIndex >= 0 ? activeIndex : doneCount) + 1), n: items.length })}
              </h2>
              {!finished && <span style={{ fontSize: 13, color: '#6B625A' }}>{t('uploadingHint')}</span>}
            </div>
            <div style={{ height: 6, borderRadius: 99, background: '#E7E0D6', overflow: 'hidden' }}>
              <div style={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%`, height: '100%', background: theme.fill }} />
            </div>
            {tooManyNotice && (
              <div role="status" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#FBF3EC', border: '1px solid #EBD3C2', borderRadius: 12, padding: '10px 12px', fontSize: 13, lineHeight: 1.4, color: '#5B3A26' }}>
                {tooManyNotice}
              </div>
            )}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((it) => {
                const label =
                  it.status === 'done' ? t('statusDone') : it.status === 'uploading' ? fill(t('statusUploading'), { p: it.progress }) : it.status === 'waiting' ? t('statusWaiting') : it.status === 'unsupported' ? t('statusUnsupported') : t('statusFailed');
                const color = it.status === 'done' ? '#15803D' : it.status === 'failed' || it.status === 'unsupported' ? '#B91C1C' : '#6B625A';
                return (
                  <li key={it.key} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.preview} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: '#E7E0D6' }} />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.file.name}</span>
                      <span style={{ fontSize: 12, color }}>{label}</span>
                    </div>
                    {it.status === 'failed' && !limitReached && (
                      <button type="button" onClick={() => retry(it.key)} style={{ height: 36, padding: '0 14px', borderRadius: 10, border: '1px solid #D9D0C4', background: '#FFFFFF', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#1F1A17', cursor: 'pointer' }}>
                        {t('retry')}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            {finished && (
              <button type="button" onClick={closeSheet} style={{ ...theme.button, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', cursor: 'pointer' }}>
                {t('close')}
              </button>
            )}
          </section>
        </div>
      )}

      {viewerIndex !== null && (
        <Viewer
          photos={data.photos}
          index={viewerIndex}
          locale={locale}
          guestLabel={guestLabel}
          labels={{ close: t('close'), prev: t('prev'), next: t('next'), today: t('today'), count: fill(t('viewerCount'), { i: viewerIndex + 1, n: data.photos.length }) }}
          onClose={() => setViewerIndex(null)}
          onMove={setViewerIndex}
        />
      )}
    </div>
  );
}
