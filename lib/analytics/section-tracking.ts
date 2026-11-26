// `section_viewed` (specs 11 y 31): una vez por sección con `id` y por carga de página, cuando al menos
// 40 % de la sección (o 40 % de la altura de la pantalla, para secciones más altas que ella)
// entra a la vista. Sirve para saber hasta dónde baja la gente en la landing, las páginas de
// marketing, las demos y las invitaciones.
//
// Las invitaciones montan sus secciones después de cargar los datos de la boda en el cliente:
// un MutationObserver agrega al observador las secciones que aparecen más tarde.
import { track } from './client';
import { pageKey } from './scope';

const VISIBLE_RATIO = 0.4;

export function observeSections(pathname: string): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};

  const page = pageKey(pathname);
  const seen = new Set<string>();
  const observed = new WeakSet<Element>();

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

  const observeAll = () => {
    document.querySelectorAll('section[id]').forEach((el) => {
      if (observed.has(el) || seen.has(el.id)) return;
      observed.add(el);
      observer.observe(el);
    });
  };
  observeAll();

  let scheduled = false;
  const mutations =
    typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(() => {
          if (scheduled) return;
          scheduled = true;
          requestAnimationFrame(() => {
            scheduled = false;
            observeAll();
          });
        });
  mutations?.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    mutations?.disconnect();
  };
}
