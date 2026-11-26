'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CameraOff, Search, X } from 'lucide-react';
import { BTN_SECONDARY } from './ui';

// Spec 33 — lector de QR con cámara (`qr-scanner`, cargado solo al abrirlo). Escaneo continuo: la
// cámara sigue activa después de cada lectura. En tablet va en el panel derecho (cámara frontal
// por defecto: la tablet en su base y el invitado acerca su celular); en celular, a pantalla
// completa con la trasera. El equipo recuerda la elección.

type Facing = 'user' | 'environment';
const CAMERA_KEY = 'invyta-checkin-camera';
const REPEAT_MS = 2500;

function savedFacing(fallback: Facing): Facing {
  try {
    const v = window.localStorage.getItem(CAMERA_KEY);
    return v === 'user' || v === 'environment' ? v : fallback;
  } catch {
    return fallback;
  }
}

export default function QrScannerSheet({
  embedded,
  onDecode,
  onClose,
  onSearch,
  result,
  recent,
}: {
  embedded: boolean; // true = panel derecho de la tablet
  onDecode: (text: string) => void;
  onClose: () => void;
  onSearch: () => void;
  result?: ReactNode; // tarjeta del último escaneo
  recent?: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facing, setFacing] = useState<Facing>(() => (typeof window === 'undefined' ? 'environment' : savedFacing(embedded ? 'user' : 'environment')));
  const [camError, setCamError] = useState(false);
  const last = useRef<{ text: string; at: number } | null>(null);
  const decodeRef = useRef(onDecode);
  decodeRef.current = onDecode;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let scanner: { start: () => Promise<void>; stop: () => void; destroy: () => void } | null = null;
    let cancelled = false;
    setCamError(false);
    (async () => {
      try {
        const QrScanner = (await import('qr-scanner')).default;
        if (cancelled) return;
        const s = new QrScanner(
          video,
          (res) => {
            const text = res.data;
            const now = Date.now();
            if (last.current && last.current.text === text && now - last.current.at < REPEAT_MS) return;
            last.current = { text, at: now };
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(60);
            decodeRef.current(text);
          },
          { preferredCamera: facing, maxScansPerSecond: 6, returnDetailedScanResult: true }
        );
        scanner = s;
        await s.start();
      } catch {
        if (!cancelled) setCamError(true);
      }
    })();
    return () => {
      cancelled = true;
      scanner?.stop();
      scanner?.destroy();
    };
  }, [facing]);

  const choose = (f: Facing) => {
    setFacing(f);
    try {
      window.localStorage.setItem(CAMERA_KEY, f);
    } catch {
      // sin localStorage: la elección dura solo esta sesión
    }
  };

  const camera = (
    <div className={`relative overflow-hidden bg-[#18181B] ${embedded ? 'h-[300px] w-full max-w-[380px] rounded-2xl' : 'flex-1'}`}>
      <video ref={videoRef} muted playsInline className={`h-full w-full object-cover ${camError ? 'hidden' : ''}`} style={facing === 'user' ? { transform: 'scaleX(-1)' } : undefined} />
      {camError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <CameraOff className="h-10 w-10 text-[#A1A1AA]" strokeWidth={1.6} />
          <span className="text-[17px] font-semibold text-white">No pudimos usar la cámara</span>
          <span className="text-sm leading-relaxed text-[#D4D4D8]">Permite la cámara en los ajustes del navegador o busca al invitado por nombre.</span>
        </div>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-[200px] w-[200px] md:h-[200px] md:w-[200px]">
              {['left-0 top-0 border-l-4 border-t-4 rounded-tl-[14px]', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-[14px]', 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-[14px]', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-[14px]'].map((c) => (
                <span key={c} className={`absolute h-10 w-10 border-white ${c}`} />
              ))}
            </div>
          </div>
          <span className="absolute left-3.5 top-3 inline-flex h-[26px] items-center gap-1.5 rounded-full bg-[rgba(255,255,255,0.14)] px-2.5 text-xs font-semibold text-white">
            <span className="h-[7px] w-[7px] rounded-full bg-[#22C55E]" />
            Escaneo continuo
          </span>
          <span className="absolute bottom-3.5 left-0 right-0 text-center text-[13px] text-[#E4E4E7]">Acerca el QR del pase a la cámara</span>
        </>
      )}
    </div>
  );

  const cameraToggle = (
    <div role="group" aria-label="Cámara" className="grid w-full max-w-[380px] grid-cols-2 gap-1 rounded-full border border-[rgba(0,0,0,0.1)] bg-white p-1">
      {(['user', 'environment'] as const).map((f) => (
        <button key={f} type="button" aria-pressed={facing === f} onClick={() => choose(f)} className={`h-[38px] rounded-full text-[13px] font-semibold ${facing === f ? 'bg-[#111111] text-white' : 'text-[#3F3F46]'}`}>
          {f === 'user' ? 'Cámara frontal' : 'Cámara trasera'}
        </button>
      ))}
    </div>
  );

  if (embedded) {
    return (
      <div className="flex min-h-0 flex-1 gap-6 overflow-y-auto px-7 py-6">
        <div className="flex w-[380px] flex-shrink-0 flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-[#0A0A0A]">Escanear QR de entrada</span>
            <button type="button" aria-label="Cerrar escáner" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F4F5]">
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
          {camera}
          {cameraToggle}
          <p className="m-0 text-[13px] leading-relaxed text-[#71717A]">
            Tablet en su base: usa la cámara frontal y pide al invitado que acerque su celular. Invitaciones de 1 persona se marcan solas; las de varias abren su ficha.
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          {result || (
            <div className="rounded-[14px] border border-dashed border-[rgba(0,0,0,0.15)] bg-white px-5 py-8 text-center text-sm text-[#71717A]">
              Aquí aparece cada invitado que escanees.
            </div>
          )}
          {recent}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#18181B]">
      <header className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-base font-semibold">Escanear QR de entrada</span>
        <button type="button" aria-label="Cerrar" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(255,255,255,0.12)]">
          <X className="h-[18px] w-[18px] text-white" />
        </button>
      </header>
      {camera}
      <div className="flex flex-col gap-2.5 rounded-t-[20px] bg-white p-4">
        {result}
        <div className="flex items-center gap-2.5">
          <div className="flex-1">{cameraToggle}</div>
        </div>
        <span className="text-sm text-[#3F3F46]">¿No trae su QR o no abrió su link?</span>
        <button type="button" onClick={onSearch} className={`${BTN_SECONDARY} h-[50px] w-full`}>
          <Search className="h-[18px] w-[18px]" />
          Buscar por nombre
        </button>
      </div>
    </div>
  );
}
