// Fachada de analítica (specs 11 y 31) sobre Google Analytics para Firebase (`ga.ts`).
// Todo es no-op si:
//  - falta NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, o el build no es de producción y la pestaña no
//    activó `?ga_debug=1` (ver `env.ts`),
//  - el dispositivo tiene el interruptor de tráfico propio (`invyta:notrack`),
//  - la ruta está fuera de alcance (el proveedor llama `setCaptureEnabled(false)`), o
//  - se ejecuta en el servidor.
// La firma de `track()` es la misma desde el spec 11: los componentes no dependen del proveedor.
import type { AnalyticsEventMap, AnalyticsEventName } from './events';
import { isNotrack, NOTRACK_KEY, setNotrackFlag } from './env';
import { gaDisable, gaEvent, gaPageView, gaSetAdPersonalization, gaSetUser, type GaParams } from './ga';
import { pageTitleFor, sanitizeUrl, type TrackingScope } from './scope';

export { isNotrack, NOTRACK_KEY };
export const SRC_KEY = 'invyta:src';

// Estado deseado: el proveedor lo fija por ruta.
let captureEnabled = true;
// Parámetros que acompañan a todos los eventos (`src`; `template_id` e `is_demo` en invitaciones).
let globalParams: GaParams = {};
let invitationParams: GaParams = {};
// `page_location` saneado de la página anterior, para el `page_referrer` de las navegaciones internas.
let lastLocation: string | null = null;

// ---------------------------------------------------------------------------
// Interruptor de tráfico propio
// ---------------------------------------------------------------------------

export function setNotrack(on: boolean): void {
  setNotrackFlag(on);
  // Al activarlo se corta de inmediato lo que ya estuviera corriendo.
  if (on) gaDisable();
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
// Captura
// ---------------------------------------------------------------------------

function canCapture(): boolean {
  return typeof window !== 'undefined' && captureEnabled && !isNotrack();
}

// Habilita o detiene la captura de eventos (fuera de alcance: no se manda nada).
export function setCaptureEnabled(on: boolean): void {
  captureEnabled = on;
}

export function track<K extends AnalyticsEventName>(name: K, props: AnalyticsEventMap[K]): void {
  if (!canCapture()) return;
  gaEvent(name, { ...globalParams, ...invitationParams, ...(props as GaParams) });
}

// `page_view` con la URL, el referente y el título saneados. Los mismos valores quedan como
// parámetros por defecto, así ningún evento posterior viaja con `document.location`.
export function capturePageview(pathname: string, scope: TrackingScope): void {
  if (!canCapture()) return;
  const location = sanitizeUrl(window.location.href);
  const referrer = lastLocation ?? sanitizeUrl(document.referrer);
  lastLocation = location;
  gaPageView({ location, referrer, title: pageTitleFor(pathname, scope) ?? document.title }, { ...globalParams, ...invitationParams });
}

// Propiedades que acompañan a todos los eventos de la sesión (por ejemplo `src`).
export function registerProps(props: Record<string, string>): void {
  globalParams = { ...globalParams, ...props };
}

// Plantilla de la invitación abierta. `null` al salir de las invitaciones y demos.
export function setInvitationContext(context: { template_id: string; is_demo: boolean } | null): void {
  invitationParams = context ? { ...context } : {};
}

// Solo marketing y demos alimentan audiencias de remarketing.
export function setAdPersonalization(on: boolean): void {
  if (!canCapture()) return;
  gaSetAdPersonalization(on);
}

// Identifica a una cuenta del admin solo por su uid de Firebase y su tipo (nunca correo ni ID de boda).
export function identifyUser(uid: string, accountType: 'couple' | 'planner'): void {
  if (!canCapture()) return;
  gaSetUser(uid, { account_type: accountType });
}

// Al cerrar sesión: los eventos siguientes ya no llevan `user_id`.
export function resetAnalytics(): void {
  gaSetUser(null, { account_type: null });
}
