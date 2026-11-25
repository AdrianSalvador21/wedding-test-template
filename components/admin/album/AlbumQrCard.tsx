'use client';

import React, { useEffect, useState } from 'react';
import { track } from '../../../lib/analytics/client';
import { getAlbumTheme, type AlbumTheme } from '../../album/albumThemes';

// Spec 29 — QR imprimible para las mesas: PNG de 1200 × 1600 px con el estilo del template de la
// boda, "Álbum de la boda", los nombres, el QR del link general (/[idioma]/wedding/[id]/fotos, sin
// ?guest=) y "Escanea y comparte tus fotos de la boda". Se dibuja en el navegador con <canvas>.

const W = 1200;
const H = 1600;

export function albumPublicUrl(weddingId: string, language: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/${language === 'en' ? 'en' : 'es'}/wedding/${encodeURIComponent(weddingId)}/fotos`;
}

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

function setSpacing(ctx: Ctx, px: number) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`;
}

function text(ctx: Ctx, value: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center', spacing = 0) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  setSpacing(ctx, spacing);
  ctx.fillText(value, x, y);
  setSpacing(ctx, 0);
}

// Reduce el tamaño de fuente hasta que el texto quepa en `max` px.
function fitFont(ctx: Ctx, value: string, build: (size: number) => string, start: number, max: number): string {
  let size = start;
  ctx.font = build(size);
  while (ctx.measureText(value).width > max && size > 24) {
    size -= 4;
    ctx.font = build(size);
  }
  return build(size);
}

// Nombres en una línea con un conector de otra fuente ("Mariana & Daniel"), centrados.
function inlineNames(ctx: Ctx, parts: { value: string; font: string; color: string }[], cx: number, y: number) {
  const widths = parts.map((p) => {
    ctx.font = p.font;
    return ctx.measureText(p.value).width;
  });
  let x = cx - widths.reduce((a, b) => a + b, 0) / 2;
  parts.forEach((p, i) => {
    text(ctx, p.value, x, y, p.font, p.color, 'left');
    x += widths[i];
  });
}

function wrap(ctx: Ctx, value: string, font: string, max: number): string[] {
  ctx.font = font;
  const words = value.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// El canvas no espera a las fuentes web: se cargan antes de dibujar (vienen de invitation-fonts.css).
const FONTS_BY_HEADER: Record<AlbumTheme['header'], string[]> = {
  classic: ["150px 'Allura'", "italic 500 80px 'Cormorant Garamond'", "600 34px 'Cormorant Garamond'", "400 22px 'Lora'"],
  modern: ["400 150px 'Bricolage Grotesque'", "600 22px 'Plus Jakarta Sans'", "500 26px 'Plus Jakarta Sans'"],
  botanical: ["italic 500 120px 'Cormorant Garamond'", "500 22px 'Jost'"],
  garden: [],
};

async function loadFonts(theme: AlbumTheme) {
  if (typeof document === 'undefined' || !document.fonts) return;
  await Promise.all(FONTS_BY_HEADER[theme.header].map((f) => document.fonts.load(f).catch(() => undefined)));
}

export async function renderAlbumQrPng(templateId: string | null | undefined, names: { bride: string; groom: string }, url: string, labels: { eyebrow: string; line: string; sub: string }): Promise<Blob> {
  const theme = getAlbumTheme(templateId);
  const q = theme.qr;
  await loadFonts(theme);
  const QRCode = (await import('qrcode')).default;
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, url, { width: 480, margin: 0, errorCorrectionLevel: 'M', color: { dark: q.ink, light: '#FFFFFF' } });

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d') as Ctx;
  ctx.fillStyle = q.bg;
  ctx.fillRect(0, 0, W, H);

  const drawQr = (x: number, y: number, box = 560) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, box, box);
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, box - 2, box - 2);
    const pad = (box - 480) / 2;
    ctx.drawImage(qrCanvas, x + pad, y + pad, 480, 480);
  };
  const { bride, groom } = names;

  if (theme.header === 'classic') {
    ctx.strokeStyle = q.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, W - 88, H - 88);
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(60, 60, W - 120, H - 120);
    ctx.globalAlpha = 1;
    text(ctx, labels.eyebrow.toUpperCase(), W / 2, 230, q.labelFont, q.ink, 'center', 9);
    const namesFont = fitFont(ctx, `${bride} & ${groom}`, (s) => `${s}px 'Allura', cursive`, q.namesSize, 980);
    const size = Number(/(\d+)px/.exec(namesFont)?.[1] || q.namesSize);
    inlineNames(ctx, [
      { value: `${bride} `, font: namesFont, color: q.ink },
      { value: '&', font: `italic 500 ${Math.round(size * 0.5)}px 'Cormorant Garamond', serif`, color: '#8B5E34' },
      { value: ` ${groom}`, font: namesFont, color: q.ink },
    ], W / 2, 420);
    // divisor con rombo
    ctx.strokeStyle = '#d9c6a8';
    ctx.beginPath();
    ctx.moveTo(380, 490);
    ctx.lineTo(585, 490);
    ctx.moveTo(615, 490);
    ctx.lineTo(820, 490);
    ctx.stroke();
    ctx.save();
    ctx.translate(600, 490);
    ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = q.accent;
    ctx.strokeRect(-8, -8, 16, 16);
    ctx.restore();
    drawQr(320, 560);
    wrap(ctx, labels.line.toUpperCase(), q.lineFont, 900).forEach((l, i) => text(ctx, l, W / 2, 1230 + i * 52, q.lineFont, q.ink, 'center', 6));
    text(ctx, labels.sub.toUpperCase(), W / 2, 1400, q.labelFont, '#6b5b4f', 'center', 5);
  } else if (theme.header === 'modern') {
    const x0 = 110;
    ctx.fillStyle = q.accent;
    ctx.fillRect(x0, 192, 48, 2);
    text(ctx, labels.eyebrow.toUpperCase(), x0 + 66, 202, q.labelFont, q.accent, 'left', 6);
    const nf = (s: number) => `400 ${s}px 'Bricolage Grotesque', sans-serif`;
    const f1 = fitFont(ctx, bride, nf, q.namesSize, 980);
    const f2 = fitFont(ctx, `& ${groom}`, nf, q.namesSize, 980);
    setSpacing(ctx, -5);
    text(ctx, bride, x0, 400, f1, q.ink, 'left', -5);
    inlineNamesLeft(ctx, x0, 540, [
      { value: '& ', font: f2, color: q.accent },
      { value: groom, font: f2, color: q.ink },
    ]);
    ctx.fillStyle = '#D9D3C9';
    ctx.fillRect(x0, 610, W - x0 * 2, 2);
    drawQr(x0, 680, 520);
    const tx = x0 + 520 + 50;
    const lines = wrap(ctx, labels.line, q.lineFont, W - x0 - tx);
    lines.forEach((l, i) => text(ctx, l, tx, 900 + i * 60, q.lineFont, q.ink, 'left', -1));
    text(ctx, labels.sub, tx, 900 + lines.length * 60 + 30, "500 26px 'Plus Jakarta Sans', sans-serif", '#57524B', 'left');
  } else if (theme.header === 'botanical') {
    // marco en arco
    ctx.strokeStyle = '#C8BBA4';
    ctx.lineWidth = 2;
    const left = 90;
    const right = W - 90;
    const r = (right - left) / 2;
    ctx.beginPath();
    ctx.moveTo(left, H - 90);
    ctx.lineTo(left, 90 + r);
    ctx.arc(W / 2, 90 + r, r, Math.PI, 0);
    ctx.lineTo(right, H - 90);
    ctx.closePath();
    ctx.stroke();
    text(ctx, labels.eyebrow.toUpperCase(), W / 2, 420, q.labelFont, q.accent, 'center', 8);
    const nf = (s: number) => `italic 500 ${s}px 'Cormorant Garamond', serif`;
    text(ctx, bride, W / 2, 540, fitFont(ctx, bride, nf, q.namesSize, 860), q.ink);
    text(ctx, '&', W / 2, 610, nf(64), q.accent);
    text(ctx, groom, W / 2, 720, fitFont(ctx, groom, nf, q.namesSize, 860), q.ink);
    drawQr(345, 780, 510);
    wrap(ctx, labels.line, q.lineFont, 860).forEach((l, i) => text(ctx, l, W / 2, 1380 + i * 58, q.lineFont, q.ink));
    text(ctx, labels.sub.toUpperCase(), W / 2, 1490, q.labelFont, '#6B6255', 'center', 5);
  } else {
    ctx.fillStyle = q.band || q.ink;
    ctx.fillRect(0, 0, W, 600);
    text(ctx, labels.eyebrow.toUpperCase(), W / 2, 170, "22px 'Helvetica Neue', Arial, sans-serif", '#C9A98C', 'center', 6);
    const nf = (s: number) => `400 ${s}px Georgia, serif`;
    text(ctx, bride.toUpperCase(), W / 2, 310, fitFont(ctx, bride.toUpperCase(), nf, q.namesSize, 1000), '#F4EFE3', 'center', 5);
    text(ctx, q.joiner, W / 2, 390, 'italic 46px Georgia, serif', '#C9A98C');
    text(ctx, groom.toUpperCase(), W / 2, 490, fitFont(ctx, groom.toUpperCase(), nf, q.namesSize, 1000), '#F4EFE3', 'center', 5);
    drawQr(320, 680);
    wrap(ctx, labels.line, q.lineFont, 1000).forEach((l, i) => text(ctx, l, W / 2, 1340 + i * 54, q.lineFont, q.ink));
    text(ctx, labels.sub.toUpperCase(), W / 2, 1440, q.labelFont, q.accent, 'center', 5);
  }

  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('png'))), 'image/png'));
}

function inlineNamesLeft(ctx: Ctx, x: number, y: number, parts: { value: string; font: string; color: string }[]) {
  let cursor = x;
  parts.forEach((p) => {
    text(ctx, p.value, cursor, y, p.font, p.color, 'left', -5);
    ctx.font = p.font;
    setSpacing(ctx, -5);
    cursor += ctx.measureText(p.value).width;
    setSpacing(ctx, 0);
  });
}

export async function downloadAlbumQr(weddingId: string, templateId: string | null | undefined, names: { bride: string; groom: string }, language: string) {
  const blob = await renderAlbumQrPng(templateId, names, albumPublicUrl(weddingId, language), {
    eyebrow: 'Álbum de la boda',
    line: 'Escanea y comparte tus fotos de la boda',
    sub: 'Sin app ni registro',
  });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = `qr-album-${weddingId}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 2000);
  track('album_qr_downloaded', {});
}

// Tarjeta "QR para las mesas" del panel: vista previa y descarga.
export default function AlbumQrCard({ weddingId, templateId, names, language }: { weddingId: string; templateId: string | null | undefined; names: { bride: string; groom: string }; language: string }) {
  const [preview, setPreview] = useState<string>('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('qrcode')
      .then((m) => m.default.toDataURL(albumPublicUrl(weddingId, language), { width: 192, margin: 0, color: { dark: '#0A0A0A', light: '#FFFFFF' } }))
      .then((d) => {
        if (!cancelled) setPreview(d);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [weddingId, language]);

  const download = async () => {
    setBusy(true);
    try {
      await downloadAlbumQr(weddingId, templateId, names, language);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 flex flex-col gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">QR para las mesas</span>
      <div className="flex gap-3.5 items-center">
        <div className="w-24 h-24 flex-shrink-0 rounded-[10px] border border-[rgba(0,0,0,0.08)] bg-white p-2.5 box-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview && <img src={preview} alt="Código QR del álbum" className="w-full h-full" />}
        </div>
        <span className="text-[13px] font-medium text-[#3F3F46] leading-normal">Imprímelo y ponlo en cada mesa. Abre el álbum sin necesidad de la invitación.</span>
      </div>
      <button type="button" onClick={download} disabled={busy} className="self-start text-[13px] font-semibold text-[#AE5730] hover:text-[#8F4524] disabled:opacity-50">
        {busy ? 'Preparando…' : 'Ver y descargar'}
      </button>
    </section>
  );
}
