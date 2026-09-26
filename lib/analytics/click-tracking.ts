// Listener de clics delegado (spec 11). Un solo punto para medir los botones de WhatsApp,
// los enlaces a demos y la salida de las demos al sitio, sin editar cada botón.
//
// Solo actúa en rutas 'marketing' y 'demo'. Nunca lanza errores: la analítica no puede
// romper un clic.
import { DEFAULT_WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from '../contact';
import { SITE } from '../site';
import { getSrc, track } from './client';
import { demoIdFromPath, pageKey, resolveScope } from './scope';

const WHATSAPP_PREFIX = `https://wa.me/${WHATSAPP_NUMBER}`;
// El sitio con y sin www: el pie de las demos históricamente apuntaba al apex.
const SITE_ORIGINS = [SITE.url, SITE.url.replace('://www.', '://')];

// Contenedores que nombran la ubicación de un botón, del más cercano al más lejano.
const LOCATION_SELECTOR = '[data-track-package], [data-track-location], section[id], header, nav, footer';

interface Placement {
  location: string;
  pkg?: 'basico' | 'personalizado';
}

// Ubicación de un enlace: paquete (`data-track-package`), nombre explícito (`data-track-location`),
// id de la sección, o el tipo de contenedor (`header`/`nav` -> 'nav', `footer`). Sin nada, 'page'.
export function placementOf(el: Element): Placement {
  const container = el.closest(LOCATION_SELECTOR);
  if (!container) return { location: 'page' };

  const pkg = container.getAttribute('data-track-package');
  if (pkg === 'basico' || pkg === 'personalizado') return { location: pkg, pkg };

  const named = container.getAttribute('data-track-location');
  if (named) return { location: named };

  const tag = container.tagName.toLowerCase();
  if (tag === 'section') return { location: container.id || 'page' };
  if (tag === 'header' || tag === 'nav') return { location: 'nav' };
  return { location: tag }; // footer
}

// Agrega la etiqueta de origen al final del mensaje de WhatsApp. Idempotente: si el enlace ya
// la trae (segundo clic), no se duplica. Sin mensaje, usa el saludo por defecto.
export function withRefTag(href: string, ref: string): string {
  const url = new URL(href);
  const message = url.searchParams.get('text') || DEFAULT_WHATSAPP_MESSAGE;
  if (message.includes('(ref:')) return href;
  return `${url.origin}${url.pathname}?text=${encodeURIComponent(`${message}\n\n(ref: ${ref})`)}`;
}

function handleClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest('a[href]');
  if (!(anchor instanceof HTMLAnchorElement)) return;

  const scope = resolveScope(window.location.pathname);
  if (scope !== 'marketing' && scope !== 'demo') return;

  const page = pageKey(window.location.pathname);
  const href = anchor.href;

  // WhatsApp de Invyta (el resto de wa.me, como el de la pareja en una demo, no se toca)
  if (href === WHATSAPP_PREFIX || href.startsWith(`${WHATSAPP_PREFIX}?`) || href.startsWith(`${WHATSAPP_PREFIX}/`)) {
    const { location, pkg } = placementOf(anchor);
    track('cta_click', pkg ? { location, page, package: pkg } : { location, page });
    anchor.href = withRefTag(href, `${page}-${location}-${getSrc()}`);
    return;
  }

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return;
  }

  // Enlace a una demo pública (mismo sitio)
  if (url.origin === window.location.origin) {
    const demoId = demoIdFromPath(url.pathname);
    if (demoId) {
      track('demo_click', { demo_id: demoId, location: placementOf(anchor).location });
      return;
    }
  }

  // Salida de una demo al sitio de Invyta (el pie de la invitación)
  if (scope === 'demo' && SITE_ORIGINS.includes(url.origin)) {
    track('site_link_click', { from: 'demo', page });
  }
}

export function installClickTracking(): () => void {
  const listener = (event: MouseEvent) => {
    try {
      handleClick(event);
    } catch {
      // Nunca interferir con el clic del usuario.
    }
  };
  document.addEventListener('click', listener, true);
  document.addEventListener('auxclick', listener, true);
  return () => {
    document.removeEventListener('click', listener, true);
    document.removeEventListener('auxclick', listener, true);
  };
}
