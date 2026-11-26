// Cuándo se mide (spec 31). Firebase Analytics y Performance solo se cargan si:
//  - existe NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
//  - el dispositivo no tiene el interruptor de tráfico propio (`invyta:notrack`), y
//  - el build es de producción (NEXT_PUBLIC_VERCEL_ENV, la expone Vercel) o la pestaña
//    activó `?ga_debug=1` (DebugView de GA4; se excluye con el filtro "Tráfico de desarrolladores").
// `.env.local` ya trae el Measurement ID: sin esta condición el desarrollo local llenaría los reportes.

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

export const NOTRACK_KEY = 'invyta:notrack';
export const GA_DEBUG_KEY = 'invyta:ga_debug';

// ---------------------------------------------------------------------------
// Interruptor de tráfico propio (spec 11): persiste en el dispositivo
// ---------------------------------------------------------------------------

export function isNotrack(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(NOTRACK_KEY) === '1';
  } catch {
    return false;
  }
}

export function setNotrackFlag(on: boolean): void {
  try {
    if (on) window.localStorage.setItem(NOTRACK_KEY, '1');
    else window.localStorage.removeItem(NOTRACK_KEY);
  } catch {
    // Almacenamiento bloqueado: sin interruptor persistente, la medición sigue las reglas normales.
  }
}

// ---------------------------------------------------------------------------
// `?ga_debug=1|0`: solo para la pestaña
// ---------------------------------------------------------------------------

export function isGaDebug(): boolean {
  try {
    return typeof window !== 'undefined' && window.sessionStorage.getItem(GA_DEBUG_KEY) === '1';
  } catch {
    return false;
  }
}

export function applyGaDebugParam(): void {
  if (typeof window === 'undefined') return;
  const value = new URLSearchParams(window.location.search).get('ga_debug');
  try {
    if (value === '1') window.sessionStorage.setItem(GA_DEBUG_KEY, '1');
    else if (value === '0') window.sessionStorage.removeItem(GA_DEBUG_KEY);
  } catch {
    // Sin sessionStorage no hay modo de prueba.
  }
}

export function isGaEnabled(): boolean {
  if (typeof window === 'undefined' || !MEASUREMENT_ID || isNotrack()) return false;
  return IS_PRODUCTION || isGaDebug();
}

// Ejecuta en tiempo ocioso: los SDK de Firebase no entran al bundle inicial ni compiten con el LCP.
export function whenIdle(fn: () => void): void {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
  if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(fn, { timeout: 3000 });
  else setTimeout(fn, 1);
}
