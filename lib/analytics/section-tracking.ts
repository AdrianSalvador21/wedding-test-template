// `section_viewed` (spec 11): una vez por sección con `id` y por carga de página, cuando al menos
// 40 % de la sección (o 40 % de la altura de la pantalla, para secciones más altas que ella)
// entra a la vista. Sirve para saber hasta dónde baja la gente en la landing y las páginas de marketing.
import { track } from './client';
import { pageKey } from './scope';

const VISIBLE_RATIO = 0.4;

export function observeSections(pathname: string): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};

  const page = pageKey(pathname);
  const seen = new Set<string>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target.id;
        if (!id || seen.has(id)) continue;
        const tallSectionSeen = entry.intersectionRect.height >= window.innerHeight * VISIBLE_RATIO;
        if (!entry.isIntersecting || (entry.intersectionRatio < VISIBLE_RATIO && !tallSectionSeen)) continue;
        seen.add(id);
        observer.unobserve(entry.target);
        track('section_viewed', { section: id, page });
      }
    },
    { threshold: [0, VISIBLE_RATIO] }
  );

  document.querySelectorAll('section[id]').forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}
