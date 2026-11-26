// Adaptador de Google Analytics para Firebase (spec 31). Todo es no-op si `isGaEnabled()` es falso
// (sin Measurement ID, fuera de producción sin `?ga_debug=1`, o con `invyta:notrack`) o si el
// navegador no soporta Analytics (`isSupported()`). Nunca lanza errores.
//
// - `firebase/app` y `firebase/analytics` se importan de forma dinámica en tiempo ocioso.
// - `gtag` y `dataLayer` propios (`invytaGtag`, `invytaDataLayer`): `GoogleAdsTag` define su propio
//   `gtag` global y no deben pisarse.
// - `send_page_view: false`: el proveedor manda `page_view` saneado en cada cambio de ruta.
import type { Analytics } from 'firebase/analytics';
import { firebaseConfig } from '../firebase-config';
import { isGaDebug, isGaEnabled, whenIdle } from './env';

type AnalyticsModule = typeof import('firebase/analytics');
type Ready = { mod: AnalyticsModule; analytics: Analytics };

export type GaParamValue = string | number | boolean | null | undefined;
export type GaParams = Record<string, GaParamValue>;

const MAX_VALUE_LENGTH = 100; // límite de GA4 para el valor de un parámetro

let initPromise: Promise<Ready | null> | null = null;

// GA4 no maneja booleanos y recorta textos de más de 100 caracteres.
function normalize(params: GaParams): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'boolean') out[key] = value ? 'true' : 'false';
    else if (typeof value === 'string') out[key] = value.slice(0, MAX_VALUE_LENGTH);
    else out[key] = value;
  }
  return out;
}

export function initGa(): Promise<Ready | null> {
  if (initPromise) return initPromise;
  if (!isGaEnabled()) return Promise.resolve(null);

  initPromise = new Promise<Ready | null>((resolve) => {
    whenIdle(async () => {
      try {
        const [{ getApps, initializeApp }, mod] = await Promise.all([import('firebase/app'), import('firebase/analytics')]);
        if (!(await mod.isSupported())) {
          resolve(null);
          return;
        }
        mod.settings({ gtagName: 'invytaGtag', dataLayerName: 'invytaDataLayer' });
        const app = getApps()[0] ?? initializeApp(firebaseConfig);
        const analytics = mod.initializeAnalytics(app, {
          config: {
            send_page_view: false,
            allow_google_signals: false,
            ...(isGaDebug() ? { debug_mode: true } : {}),
          },
        });
        resolve({ mod, analytics });
      } catch {
        // Sin red, bloqueado o navegador sin soporte: la analítica nunca debe romper el sitio.
        resolve(null);
      }
    });
  });
  return initPromise;
}

// Las llamadas se encadenan sobre la misma promesa, así que conservan su orden.
function whenReady(fn: (ready: Ready) => void): void {
  void initGa().then((ready) => {
    if (!ready) return;
    try {
      fn(ready);
    } catch {
      // Nunca interferir con la página.
    }
  });
}

export function gaEvent(name: string, params: GaParams): void {
  whenReady(({ mod, analytics }) => mod.logEvent(analytics, name, normalize(params)));
}

// Parámetros que GA4 aplica a todos los eventos posteriores, incluidos los automáticos
// (`user_engagement`, `session_start`): así ninguno sale con `document.location`.
export function gaSetDefaults(params: GaParams): void {
  whenReady(({ mod }) => mod.setDefaultEventParameters(normalize(params)));
}

export function gaPageView(page: { location: string; referrer: string; title: string }, extra: GaParams = {}): void {
  const params = { page_location: page.location, page_referrer: page.referrer, page_title: page.title };
  gaSetDefaults(params);
  gaEvent('page_view', { ...extra, ...params });
}

// Solo marketing y demos alimentan audiencias de remarketing (`npa=1` en el resto).
export function gaSetAdPersonalization(on: boolean): void {
  whenReady(({ mod }) => mod.setDefaultEventParameters({ allow_ad_personalization_signals: on }));
}

// Cuentas del admin: solo uid y tipo de cuenta. `null` al cerrar sesión.
export function gaSetUser(uid: string | null, props: { account_type: 'couple' | 'planner' | null }): void {
  if (uid === null && !initPromise) return; // nada que limpiar si GA4 nunca se inició
  whenReady(({ mod, analytics }) => {
    mod.setUserId(analytics, uid);
    mod.setUserProperties(analytics, { account_type: props.account_type });
  });
}

// Corta el envío en caliente (interruptor de tráfico propio activado en esta pestaña).
export function gaDisable(): void {
  if (!initPromise) return;
  whenReady(({ mod, analytics }) => mod.setAnalyticsCollectionEnabled(analytics, false));
}
