// Cliente de analítica con PostHog (spec 11). Todo el módulo es no-op si:
//  - falta NEXT_PUBLIC_POSTHOG_KEY (desarrollo local y ramas de vista previa),
//  - el dispositivo tiene el interruptor de tráfico propio (`invyta:notrack`), o
//  - se ejecuta en el servidor.
// `posthog-js` se importa de forma dinámica y en tiempo ocioso: no entra al bundle inicial.
import type { CaptureResult, PostHog, Properties } from 'posthog-js';
import type { AnalyticsEventMap, AnalyticsEventName } from './events';
import { sanitizeUrl } from './scope';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const API_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || '/ingest';
const UI_HOST = 'https://us.posthog.com';

export const NOTRACK_KEY = 'invyta:notrack';
export const SRC_KEY = 'invyta:src';

let instance: PostHog | null = null;
let initPromise: Promise<PostHog | null> | null = null;
// Estado deseado: el proveedor lo fija por ruta y se aplica en cuanto PostHog esté listo.
let captureEnabled = true;
let recordingWanted = false;

// ---------------------------------------------------------------------------
// Interruptor de tráfico propio
// ---------------------------------------------------------------------------

export function isNotrack(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(NOTRACK_KEY) === '1';
  } catch {
    return false;
  }
}

export function setNotrack(on: boolean): void {
  try {
    if (on) window.localStorage.setItem(NOTRACK_KEY, '1');
    else window.localStorage.removeItem(NOTRACK_KEY);
  } catch {
    // Almacenamiento bloqueado: sin interruptor persistente, la medición sigue las reglas normales.
  }
  // Al activarlo se corta de inmediato lo que ya estuviera corriendo (before_send descarta lo demás).
  if (on) instance?.stopSessionRecording();
}

// `?notrack=1` activa y `?notrack=0` desactiva la exclusión de este dispositivo.
export function applyNotrackParam(): void {
  if (typeof window === 'undefined') return;
  const value = new URLSearchParams(window.location.search).get('notrack');
  if (value === '1') setNotrack(true);
  else if (value === '0') setNotrack(false);
}

// ---------------------------------------------------------------------------
// Origen de la visita (`src`)
// ---------------------------------------------------------------------------

interface StoredSrc {
  v: string;
  explicit: boolean;
}

const REFERRER_SOURCES: Array<[RegExp, string]> = [
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$/, 'facebook'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)google\./, 'google'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)bodas\.com\.mx$/, 'bodas'],
  [/(^|\.)whatsapp\.com$/, 'whatsapp'],
];

function cleanSrc(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  return cleaned || null;
}

function srcFromReferrer(): string | null {
  try {
    if (!document.referrer) return null;
    const host = new URL(document.referrer).hostname;
    if (host === window.location.hostname) return null; // navegación interna: no es un origen
    for (const [pattern, name] of REFERRER_SOURCES) if (pattern.test(host)) return name;
    return host.replace(/^www\./, '').slice(0, 30);
  } catch {
    return null;
  }
}

function readSrc(): StoredSrc | null {
  try {
    const raw = window.sessionStorage.getItem(SRC_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSrc;
    return typeof parsed.v === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

// Calcula el origen de la sesión y lo guarda en sessionStorage. `?src=` (o `utm_source`) manda y
// solo se respeta la primera vez que aparece de forma explícita; sin él, se usa el sitio de
// referencia externo o 'directo'.
export function resolveSrc(): string {
  if (typeof window === 'undefined') return 'directo';
  const stored = readSrc();
  const params = new URLSearchParams(window.location.search);
  const explicit = cleanSrc(params.get('src')) ?? cleanSrc(params.get('utm_source'));

  let next: StoredSrc | null = stored;
  if (explicit && !(stored && stored.explicit)) {
    next = { v: explicit, explicit: true };
  } else if (!stored) {
    next = { v: srcFromReferrer() ?? 'directo', explicit: false };
  }

  if (next && next !== stored) {
    try {
      window.sessionStorage.setItem(SRC_KEY, JSON.stringify(next));
    } catch {
      // Sin sessionStorage el origen solo vale para esta página.
    }
  }
  return next?.v ?? 'directo';
}

// Origen ya calculado (no vuelve a leer la URL). Para la etiqueta de WhatsApp.
export function getSrc(): string {
  if (typeof window === 'undefined') return 'directo';
  return readSrc()?.v ?? 'directo';
}

// ---------------------------------------------------------------------------
// PostHog
// ---------------------------------------------------------------------------

function sanitizeProps(props: Properties | undefined): Properties | undefined {
  if (!props) return props;
  const out: Properties = { ...props };
  for (const key of Object.keys(out)) {
    const value = out[key];
    if (typeof value === 'string') out[key] = sanitizeUrl(value);
  }
  return out;
}

// Descarta lo que no debe salir y quita el ID de boda de las URLs del admin.
function beforeSend(event: CaptureResult | null): CaptureResult | null {
  if (!event || !captureEnabled || isNotrack()) return null;
  return {
    ...event,
    properties: sanitizeProps(event.properties) ?? event.properties,
    $set: sanitizeProps(event.$set),
    $set_once: sanitizeProps(event.$set_once),
  };
}

function whenIdle(fn: () => void): void {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
  if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(fn, { timeout: 3000 });
  else setTimeout(fn, 1);
}

export function initAnalytics(): Promise<PostHog | null> {
  if (typeof window === 'undefined' || !KEY || isNotrack()) return Promise.resolve(null);
  if (initPromise) return initPromise;
  const key = KEY;

  initPromise = new Promise<PostHog | null>((resolve) => {
    whenIdle(async () => {
      try {
        const { default: posthog } = await import('posthog-js');
        posthog.init(key, {
          api_host: API_HOST,
          ui_host: UI_HOST,
          persistence: 'sessionStorage', // sin cookies; el identificador muere al cerrar la pestaña
          autocapture: false,
          capture_pageview: false, // el proveedor captura $pageview en cada cambio de ruta
          capture_pageleave: true, // trae la profundidad de scroll del $pageview anterior
          person_profiles: 'identified_only',
          disable_session_recording: true, // se activa solo en 'marketing' y 'demo'
          session_recording: { maskAllInputs: true },
          // Solo eventos explícitos: nada de banderas, encuestas, heatmaps ni excepciones.
          advanced_disable_flags: true,
          disable_surveys: true,
          disable_web_experiments: true,
          capture_heatmaps: false,
          capture_dead_clicks: false,
          capture_exceptions: false,
          rageclick: false,
          before_send: beforeSend,
        });
        instance = posthog;
        if (recordingWanted && captureEnabled && !isNotrack()) posthog.startSessionRecording();
        resolve(posthog);
      } catch {
        // Sin red o bloqueado: la analítica nunca debe romper el sitio.
        initPromise = null;
        resolve(null);
      }
    });
  });
  return initPromise;
}

function whenReady(fn: (ph: PostHog) => void): void {
  void initAnalytics().then((ph) => {
    if (ph) fn(ph);
  });
}

// Habilita o detiene la captura de eventos (fuera de alcance: no se manda nada).
export function setCaptureEnabled(on: boolean): void {
  captureEnabled = on;
  if (!on) {
    recordingWanted = false;
    instance?.stopSessionRecording();
  }
}

// La grabación solo se pide en 'marketing' y 'demo'.
export function setRecording(on: boolean): void {
  recordingWanted = on;
  if (!instance) return; // se aplica al terminar de iniciar
  if (on && captureEnabled && !isNotrack()) instance.startSessionRecording();
  else instance.stopSessionRecording();
}

export function track<K extends AnalyticsEventName>(name: K, props: AnalyticsEventMap[K]): void {
  if (!captureEnabled || isNotrack()) return;
  whenReady((ph) => ph.capture(name, props));
}

export function capturePageview(): void {
  if (!captureEnabled || isNotrack()) return;
  whenReady((ph) => ph.capture('$pageview'));
}

// Propiedades que acompañan a todos los eventos de la sesión (por ejemplo `src`).
export function registerProps(props: Record<string, string>): void {
  whenReady((ph) => ph.register(props));
}

// Identifica a una cuenta del admin solo por su uid de Firebase (nunca correo ni ID de boda).
export function identifyUser(uid: string): void {
  if (!captureEnabled || isNotrack()) return;
  whenReady((ph) => ph.identify(uid));
}

// Al cerrar sesión: nuevo identificador anónimo.
export function resetAnalytics(): void {
  if (!instance) return;
  instance.reset();
}
