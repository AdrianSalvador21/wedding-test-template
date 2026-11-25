'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Camera, CalendarClock, Download, Eye, EyeOff, Lock, QrCode, Trash2, Users } from 'lucide-react';
import { usePanelData } from '../../../../../../components/admin/panel/PanelDataContext';
import { AdminButton, AdminStatCard, AdminStatusPill, AdminTopBar, manrope } from '../../../../../../components/admin/ui';
import { useAuth } from '../../../../../../lib/auth-context';
import { formatAlbumDate, formatAlbumTime, type AlbumMode, type AlbumPhase } from '../../../../../../lib/album';
import AlbumQrCard, { downloadAlbumQr } from '../../../../../../components/admin/album/AlbumQrCard';
import DeletePhotoModal from '../../../../../../components/admin/album/DeletePhotoModal';
import AlbumZipModal, { type ZipPhoto } from '../../../../../../components/admin/album/AlbumZipModal';
import AlbumSalesPanel from '../../../../../../components/admin/album/AlbumSalesPanel';

// Spec 29 — sección "Fotos" del panel: venta del álbum si no está activado; si lo está, el modo,
// las fechas, el QR para las mesas y la galería con ocultar/mostrar y borrar (escritorio y celular).

interface PanelPhoto {
  id: string;
  thumbUrl: string;
  url: string;
  uploaderName: string | null;
  hidden: boolean;
  createdAt: string;
}

interface PanelAlbum {
  phase: AlbumPhase;
  mode: AlbumMode;
  opensAt: string | null;
  closesAt: string | null;
  revealAt: string | null;
  expiresAt: string | null;
  stats: { total: number; hidden: number; participants: number };
  photos: PanelPhoto[];
}

function photoWhen(iso: string) {
  const d = new Date(iso);
  const sameDay = formatAlbumDate(d, 'es') === formatAlbumDate(new Date(), 'es');
  return `${sameDay ? 'Hoy' : formatAlbumDate(d, 'es', { day: 'numeric', month: 'short' })}, ${formatAlbumTime(d, 'es')}`;
}

export default function PhotosPage() {
  const params = useParams();
  const weddingId = params.weddingId as string;
  const auth = useAuth();
  const { weddingData, setWeddingData } = usePanelData();
  const [album, setAlbum] = useState<PanelAlbum | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'hidden'>('all');
  const [deleteTarget, setDeleteTarget] = useState<PanelPhoto | null>(null);
  const [zipPhotos, setZipPhotos] = useState<ZipPhoto[] | null>(null);
  const [modeError, setModeError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [qrBusy, setQrBusy] = useState(false);

  const tier = weddingData?.tier === 'free' ? 'free' : 'template';
  const enabled = tier !== 'free' && weddingData?.photoAlbum?.enabled === true;
  const names = { bride: weddingData?.couple?.bride?.name || '', groom: weddingData?.couple?.groom?.name || '' };
  const language = weddingData?.defaultLanguage === 'en' ? 'en' : 'es';

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await auth.authedFetch(`/api/panel/album/${weddingId}`);
      if (!res.ok) throw new Error('load');
      setAlbum(await res.json());
    } catch {
      setLoadError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weddingId]);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  const fetchPhoto = useCallback(
    (id: string, signal: AbortSignal) => auth.authedFetch(`/api/panel/album/${weddingId}/photos/${id}`, { signal }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weddingId]
  );

  const visiblePhotos = useMemo(() => (album ? album.photos.filter((p) => (filter === 'hidden' ? p.hidden : true)) : []), [album, filter]);

  const setHidden = async (photo: PanelPhoto, hidden: boolean) => {
    setBusyId(photo.id);
    try {
      const res = await auth.authedFetch(`/api/panel/album/${weddingId}/photos/${photo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden }),
      });
      if (!res.ok) throw new Error('hide');
      setAlbum((prev) =>
        prev
          ? {
              ...prev,
              photos: prev.photos.map((p) => (p.id === photo.id ? { ...p, hidden } : p)),
              stats: { ...prev.stats, hidden: prev.stats.hidden + (hidden ? 1 : -1) },
            }
          : prev
      );
    } catch {
      // Si falla, la foto conserva su estado; el botón queda listo para reintentar.
    } finally {
      setBusyId(null);
    }
  };

  const deletePhoto = async (photo: PanelPhoto) => {
    const res = await auth.authedFetch(`/api/panel/album/${weddingId}/photos/${photo.id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('delete');
    setAlbum((prev) => {
      if (!prev) return prev;
      const photos = prev.photos.filter((p) => p.id !== photo.id);
      return { ...prev, photos, stats: { ...prev.stats, total: photos.length, hidden: photos.filter((p) => p.hidden).length } };
    });
    setDeleteTarget(null);
  };

  const changeMode = async (mode: AlbumMode) => {
    if (!album || album.mode === mode) return;
    setModeError(null);
    const res = await auth.authedFetch(`/api/panel/album/${weddingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    if (res.ok) {
      setAlbum({ ...album, mode });
      setWeddingData((prev) => (prev && prev.photoAlbum ? { ...prev, photoAlbum: { ...prev.photoAlbum, mode } } : prev));
    } else if (res.status === 409) {
      setModeError('El modo ya no se puede cambiar.');
      void load();
    } else {
      setModeError('No pudimos cambiar el modo. Inténtalo de nuevo.');
    }
  };

  const openZip = () => {
    if (!album) return;
    const visible = album.photos.filter((p) => !p.hidden);
    if (visible.length === 0) return;
    setZipPhotos(visible.map((p) => ({ id: p.id, uploaderName: p.uploaderName, createdAt: p.createdAt })));
  };

  const downloadQr = async () => {
    setQrBusy(true);
    try {
      await downloadAlbumQr(weddingId, weddingData?.template?.id, names, language);
    } finally {
      setQrBusy(false);
    }
  };

  if (!weddingData) return null;

  if (tier === 'free') {
    return (
      <div className="admin-form min-h-screen min-h-[100dvh] bg-[#FAFAFA]" style={manrope}>
        <AdminTopBar title="Fotos" />
        <div className="px-4 sm:px-10 py-8 text-sm text-[#3F3F46]">El álbum de fotos está disponible para bodas con diseño.</div>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="admin-form min-h-screen min-h-[100dvh] bg-[#FAFAFA]" style={manrope}>
        <AdminTopBar title="Fotos" meta={<AdminStatusPill tone="template">Extra</AdminStatusPill>} />
        <AlbumSalesPanel weddingId={weddingId} eventDate={weddingData.event?.date} />
      </div>
    );
  }

  const locked = album ? album.phase !== 'before' : false;
  const closesShort = album?.closesAt ? formatAlbumDate(new Date(album.closesAt), 'es', { day: 'numeric', month: 'short' }).replace('.', '') : '—';
  const opensLong = album?.opensAt ? formatAlbumDate(new Date(album.opensAt), 'es', { day: 'numeric', month: 'long' }) : '';
  const closesLong = album?.closesAt ? formatAlbumDate(new Date(album.closesAt), 'es') : '';
  const expiresLong = album?.expiresAt ? formatAlbumDate(new Date(album.expiresAt), 'es') : '';
  const revealLong = album?.revealAt ? formatAlbumDate(new Date(album.revealAt), 'es', { day: 'numeric', month: 'long' }) : '';
  const visibleCount = album ? album.photos.filter((p) => !p.hidden).length : 0;

  const modes: { id: AlbumMode; title: string; desc: string }[] = [
    { id: 'open', title: 'Álbum abierto', desc: 'Cada foto aparece en el álbum en cuanto se sube.' },
    { id: 'disposable', title: 'Cámara desechable', desc: `Cada invitado ve solo sus fotos. El álbum se revela el ${revealLong || 'día siguiente de la boda'} a las 10:00.` },
  ];

  return (
    <div className="admin-form min-h-screen min-h-[100dvh] bg-[#FAFAFA]" style={manrope}>
      <AdminTopBar
        title="Fotos"
        meta={
          <>
            <AdminStatusPill tone="active">Álbum activo</AdminStatusPill>
            {album && <span className="text-[12.5px] font-semibold text-[#71717A]">{album.mode === 'open' ? 'Modo: álbum abierto' : 'Modo: cámara desechable'}</span>}
          </>
        }
        actions={
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <AdminButton variant="ghost" onClick={downloadQr} disabled={qrBusy} className="flex-1 sm:flex-none">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Descargar QR</span>
              <span className="sm:hidden">QR</span>
            </AdminButton>
            <AdminButton onClick={openZip} disabled={!album || visibleCount === 0} className="flex-[2] sm:flex-none">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Descargar todo (ZIP)</span>
              <span className="sm:hidden">Descargar todo</span>
            </AdminButton>
          </div>
        }
      />

      <div className="px-4 sm:px-10 py-6 sm:py-8 flex flex-col gap-5">
        {loadError && (
          <div role="alert" className="flex items-center justify-between gap-3 bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 text-sm text-[#3F3F46]">
            No pudimos cargar las fotos.
            <AdminButton variant="ghost" onClick={() => void load()}>
              Reintentar
            </AdminButton>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminStatCard icon={Camera} label="Fotos subidas" value={album ? album.stats.total : '—'} />
          <AdminStatCard
            icon={Users}
            label={<><span className="hidden sm:inline">Invitaciones que participaron</span><span className="sm:hidden">Participaron</span></>}
            value={album ? album.stats.participants : '—'}
            tone="success"
          />
          <AdminStatCard icon={EyeOff} label="Ocultas" value={album ? album.stats.hidden : '—'} tone="pending" />
          <AdminStatCard icon={CalendarClock} label="Cierre de subida" value={closesShort} />
        </div>

        <div className="hidden lg:grid grid-cols-3 gap-5">
          <section className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">Modo del álbum</span>
            <div role="radiogroup" aria-label="Modo del álbum" className="flex flex-col gap-2">
              {modes.map((m) => {
                const on = album?.mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={!album || locked}
                    onClick={() => void changeMode(m.id)}
                    className={`flex gap-3 items-start text-left px-3.5 py-3 rounded-[10px] transition-colors disabled:cursor-not-allowed ${
                      on ? 'border-[1.5px] border-[#AE5730] bg-[rgba(198,102,60,0.04)]' : 'border border-[rgba(0,0,0,0.12)] bg-white hover:bg-[#FAFAFA]'
                    } ${locked && !on ? 'opacity-60' : ''}`}
                  >
                    <span className={`w-[18px] h-[18px] rounded-full box-border flex-shrink-0 mt-px ${on ? 'border-[5px] border-[#AE5730]' : 'border-[1.5px] border-[#A1A1AA]'}`} />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-[#0A0A0A]">{m.title}</span>
                      <span className="text-[13px] font-medium text-[#71717A] leading-snug">{m.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {locked && (
              <span className="flex gap-1.5 items-center text-[12.5px] font-semibold text-[#71717A]">
                <Lock className="h-3.5 w-3.5" />
                El modo ya no se puede cambiar
              </span>
            )}
            {modeError && <span role="alert" className="text-[12.5px] font-semibold text-[#B91C1C]">{modeError}</span>}
          </section>

          <section className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 flex flex-col gap-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">Fechas</span>
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-semibold text-[#3F3F46]">Subida de fotos</span>
              <span className="text-sm font-medium text-[#0A0A0A] leading-snug">{opensLong && closesLong ? `Del ${opensLong} al ${closesLong}` : 'Define la fecha de la boda en el Editor.'}</span>
            </div>
            <div className="flex flex-col gap-1 border-t border-[rgba(0,0,0,0.06)] pt-3">
              <span className="text-[13px] font-semibold text-[#3F3F46]">Se guardan hasta</span>
              <span className="text-sm font-medium text-[#0A0A0A] leading-snug">{expiresLong ? `${expiresLong}. Descárgalas antes.` : '—'}</span>
            </div>
            <span className="text-[12.5px] font-semibold text-[#71717A]">Hasta 30 fotos por invitación o por teléfono.</span>
          </section>

          <AlbumQrCard weddingId={weddingId} templateId={weddingData.template?.id} names={names} language={language} />
        </div>

        <section className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">Fotos de los invitados</span>
            <div className="flex items-center gap-1 bg-[#F4F4F5] rounded-lg p-1" role="tablist" aria-label="Filtrar fotos">
              {(['all', 'hidden'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-3 py-1.5 text-[12.5px] font-semibold ${filter === f ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#71717A]'}`}
                >
                  {f === 'all' ? `Todas · ${album?.stats.total ?? 0}` : `Ocultas · ${album?.stats.hidden ?? 0}`}
                </button>
              ))}
            </div>
          </div>

          {album && album.photos.length === 0 && (
            <div className="bg-[#FAFAFA] border-[1.5px] border-dashed border-[rgba(0,0,0,0.18)] rounded-xl px-5 py-12 text-center text-sm font-medium text-[#3F3F46]">
              Aún no hay fotos. Comparte el QR o el link de la invitación el día de la boda.
            </div>
          )}
          {album && album.photos.length > 0 && visiblePhotos.length === 0 && <p className="m-0 text-sm text-[#71717A]">No hay fotos ocultas.</p>}

          {visiblePhotos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5 sm:[grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
              {visiblePhotos.map((p) => {
                const name = p.uploaderName || 'Invitado';
                const toggleLabel = p.hidden ? 'Mostrar foto' : 'Ocultar foto';
                return (
                  <div key={p.id} className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
                    <div className="relative aspect-square rounded-[10px] overflow-hidden bg-[#F4F4F5]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.thumbUrl} alt={`Foto de ${name}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: p.hidden ? 0.35 : 1 }} />
                      {p.hidden && <span className="absolute left-2 top-2 text-xs font-semibold text-[#3F3F46] bg-[#F4F4F5] px-2.5 py-0.5 rounded-full">Oculta</span>}
                    </div>
                    <div className="flex justify-between items-center gap-1.5">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-semibold text-[#0A0A0A] truncate">{name}</span>
                        <span className="text-xs font-medium text-[#71717A]">{photoWhen(p.createdAt)}</span>
                      </div>
                      <div className="hidden sm:flex gap-0.5 flex-shrink-0">
                        <button type="button" aria-label={toggleLabel} title={toggleLabel} disabled={busyId === p.id} onClick={() => void setHidden(p, !p.hidden)} className="w-[34px] h-[34px] rounded-lg text-[#3F3F46] hover:bg-[#F4F4F5] flex items-center justify-center disabled:opacity-50">
                          {p.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button type="button" aria-label="Borrar foto" title="Borrar" onClick={() => setDeleteTarget(p)} className="w-[34px] h-[34px] rounded-lg text-[#B91C1C] hover:bg-[rgba(185,28,28,0.06)] flex items-center justify-center">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex sm:hidden gap-1.5">
                      <button type="button" aria-label={toggleLabel} disabled={busyId === p.id} onClick={() => void setHidden(p, !p.hidden)} className="flex-1 h-11 rounded-lg border border-[rgba(0,0,0,0.14)] bg-white text-[#3F3F46] flex items-center justify-center disabled:opacity-50">
                        {p.hidden ? <Eye className="h-[17px] w-[17px]" /> : <EyeOff className="h-[17px] w-[17px]" />}
                      </button>
                      <button type="button" aria-label="Borrar foto" onClick={() => setDeleteTarget(p)} className="flex-1 h-11 rounded-lg border border-[rgba(185,28,28,0.25)] bg-white text-[#B91C1C] flex items-center justify-center">
                        <Trash2 className="h-[17px] w-[17px]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {deleteTarget && (
        <DeletePhotoModal
          thumbUrl={deleteTarget.thumbUrl}
          caption={`${deleteTarget.uploaderName || 'Invitado'} · ${photoWhen(deleteTarget.createdAt)}`}
          onConfirm={() => deletePhoto(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {zipPhotos && <AlbumZipModal weddingId={weddingId} photos={zipPhotos} fetchPhoto={fetchPhoto} onClose={() => setZipPhotos(null)} />}
    </div>
  );
}
