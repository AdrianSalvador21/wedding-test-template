// Firebase Performance Monitoring (spec 31). Mismas condiciones que GA4 (`isGaEnabled()`).
// - Trazas automáticas (carga de página y red) solo en 'marketing' y 'demo': el SDK guarda la URL
//   de la página y de las peticiones sin permitir sanearla, y en invitaciones y admin llevan el ID de boda.
// - Trazas propias en todos lados, con nombre fijo y sin IDs.
// Nunca lanza errores.
import type { FirebasePerformance } from 'firebase/performance';
import { firebaseConfig } from '../firebase-config';
import { isGaEnabled, whenIdle } from './env';
import type { TrackingScope } from './scope';

type PerformanceModule = typeof import('firebase/performance');
type Ready = { mod: PerformanceModule; perf: FirebasePerformance };

export type TraceName = 'rsvp_submit' | 'editor_save' | 'album_photo_upload';

let initPromise: Promise<Ready | null> | null = null;
let instrumentationWanted = false;

function initPerf(): Promise<Ready | null> {
  if (initPromise) return initPromise;
  if (!isGaEnabled()) return Promise.resolve(null);

  initPromise = new Promise<Ready | null>((resolve) => {
    whenIdle(async () => {
      try {
        const [{ getApps, initializeApp }, mod] = await Promise.all([import('firebase/app'), import('firebase/performance')]);
        const app = getApps()[0] ?? initializeApp(firebaseConfig);
        const perf = mod.initializePerformance(app, {
          instrumentationEnabled: instrumentationWanted,
          dataCollectionEnabled: true,
        });
        // El alcance pudo cambiar mientras se cargaba el SDK.
        perf.instrumentationEnabled = instrumentationWanted;
        resolve({ mod, perf });
      } catch {
        resolve(null);
      }
    });
  });
  return initPromise;
}

// Se llama en cada cambio de ruta: enciende o apaga las trazas automáticas según el alcance.
export function setPerfScope(scope: TrackingScope): void {
  instrumentationWanted = scope === 'marketing' || scope === 'demo';
  if (!scope) {
    // Fuera de alcance no se inicia el SDK; si ya corría, se apagan las trazas automáticas.
    void initPromise?.then((ready) => {
      if (ready) ready.perf.instrumentationEnabled = false;
    });
    return;
  }
  void initPerf().then((ready) => {
    if (ready) ready.perf.instrumentationEnabled = instrumentationWanted;
  });
}

// Mide una acción propia. La duración se toma aunque el SDK aún no haya cargado; se registra al
// terminar con `trace.record`. Sin SDK activo, `stop` no hace nada.
export function startTrace(name: TraceName): {
  stop(result: 'ok' | 'error', attrs?: { template_id?: string }): void;
} {
  const startTime = Date.now();
  let stopped = false;
  return {
    stop(result, attrs) {
      if (stopped) return;
      stopped = true;
      const duration = Math.max(0, Date.now() - startTime);
      void initPerf().then((ready) => {
        if (!ready) return;
        try {
          const attributes: Record<string, string> = { result };
          if (attrs?.template_id) attributes.template_id = attrs.template_id.slice(0, 100);
          ready.mod.trace(ready.perf, name).record(startTime, duration, { attributes });
        } catch {
          // Nunca interferir con la acción medida.
        }
      });
    },
  };
}
