# 05 — FAQ, personalización individual y consistencia de CTAs en la landing

**Estado:** Approved
**Depende de:** SPEC 03
**Fecha:** 2026-09-23

## Objetivo

Cerrar tres brechas de comunicación reales detectadas al comparar `Propuesta_cambios_Invyta.pdf` contra la landing ya implementada (spec 03): agregar una sección de FAQ, mostrar la personalización individual del Paquete Personalizado con ejemplos, y unificar el texto de los CTAs de conversión y la terminología de "RSVP".

## Contexto

Este spec nace de una revisión de negocio/comunicaciones de `Propuesta_cambios_Invyta.pdf` contra el estado real del código. La mayoría de las ideas del PDF ya están implementadas por el spec 03 (propuesta de valor, galería de 3 diseños, "cómo funciona", panel de administración como prueba, paquetes con precios reales). De las ideas restantes del PDF, se descartaron por chocar con decisiones ya tomadas: testimonios/prueba social (spec 03 decidió no inventar clientes reales sin datos), el precio ancla "Desde $2,000 MXN" en el Hero (el negocio vende dos paquetes fijos, no un rango abierto) y el panel de RSVP con cifras "en vivo" tipo "150 invitados · 112 confirmados" (mezclaría con el mismo problema de prueba social falsa).

Quedan tres brechas reales, que son el alcance de este spec:

1. **FAQ.** No existe ningún componente de FAQ en `components/landing/`. Las preguntas del PDF son objeciones reales de conversión (¿tengo que diseñar?, ¿mis invitados necesitan app?, ¿puedo cambiar info después?).
2. **Personalización individual.** El diferenciador "Personalización 1:1" del Paquete Personalizado (`components/landing/Packages.tsx`) hoy solo vive como una línea de texto dentro de la tarjeta de paquetes, sin ejemplos visuales.
3. **Consistencia de CTAs y terminología de "RSVP".** Se detectaron 4 botones de CTA con textos distintos (`Nav.tsx` y `PlannerCta.tsx`: "Comenzar ahora"; `Hero.tsx`: "Crea tu invitación"; `Packages.tsx`: "Elegir Básico" / "Elegir Personalizado") y 4 apariciones del término "RSVP" en el copy de la landing (`Hero.tsx`, `DesignGallery.tsx`, `Packages.tsx`, `TrustStrip.tsx`), mientras que el producto real (flujo de confirmación del invitado, `messages/es.json`) ya usa "Confirmación" en español, no "RSVP".

Revisión de código hecha antes de este spec (no asumida):

- `components/landing/Packages.tsx` ya usa "Elegir Básico" / "Elegir Personalizado" en sus botones — coincide con el criterio de "mismo verbo de acción, texto adaptado al contexto" decidido para este spec, por lo que **no requiere cambio**.
- `components/landing/Nav.tsx` tiene su propio botón "Comenzar ahora" (desktop y mobile), independiente del de `PlannerCta.tsx` — es el CTA genérico más visible de toda la página (fijo en el header al hacer scroll).
- No existe una sección "CTA final" genérica (tipo "¿Listos para crear su invitación?" del PDF) en el código actual — el orden real termina en `Packages → PlannerCta → Footer`. La sección de FAQ se ubica entonces justo después de `PlannerCta` y antes de `Footer`, que es la posición equivalente más cercana a "antes del CTA final" en la estructura real de la página.
- `messages/es.json` (flujo de confirmación del invitado) usa `"¡Confirmación Recibida!"`, no "RSVP" — confirma que "RSVP" es terminología exclusiva del copy de marketing de la landing, no del producto.
- `components/landing/ui.tsx` no tiene ningún componente de acordeón; se crea uno nuevo local a `FAQ.tsx`, sin nueva dependencia (usa `useState`, mismo patrón que el menú móvil de `Nav.tsx`).

## Alcance

**Incluye:**

- Nuevo `components/landing/FAQ.tsx` (sección `id="faq"`): acordeón con 8 preguntas, una respuesta visible a la vez, controlado con `useState<number | null>`. Contenido:
  1. ¿Tengo que diseñar mi invitación? → No. Tú eliges uno de los 3 diseños y nos das la información de tu boda; nosotros la preparamos.
  2. ¿Mis invitados necesitan descargar una aplicación? → No. La invitación funciona directo desde el navegador del celular.
  3. ¿Cómo reciben la invitación mis invitados? → Por WhatsApp, mensaje, correo o el medio que prefieras — es un enlace único.
  4. ¿Puedo saber quién confirmó? → Sí. Las confirmaciones aparecen en tu panel en tiempo real.
  5. ¿Puedo limitar cuántos invitados puede llevar cada persona? → Sí, en el Paquete Personalizado, que incluye invitaciones individuales con número de lugares por invitado.
  6. ¿Puedo cambiar la información después de publicar? → En el Paquete Básico, los cambios los hace el equipo de Invyta y pueden tener un costo adicional — contáctanos por WhatsApp. En el Paquete Personalizado, tú editas tu invitación y gestionas tus invitados cuando quieras, sin depender de nosotros.
  7. ¿Cuánto tarda la entrega? → 7 días hábiles.
  8. ¿Puedo tener mi invitación en otro idioma? → Sí, en el Paquete Personalizado puedes elegir español o inglés.
- Cada pregunta del acordeón es un `<button>` con `aria-expanded` correcto (accesible por teclado), consistente con el patrón ya usado en el botón del menú móvil de `Nav.tsx`.
- Nuevo `components/landing/IndividualPersonalization.tsx` (sección `id="personalizacion"`, ubicada entre `DesignGallery` y `Features`): título "Cada invitado recibe su propia invitación", copy explicando que es exclusivo del Paquete Personalizado, etiqueta visible "Ejemplo ilustrativo" (no son clientes reales de Invyta), y 3 ejemplos: "Juan & María → 2 lugares", "Carlos → 1 lugar", "The Smith Family → 4 lugares".
- Unificación de CTAs:
  - `components/landing/Nav.tsx`: botón "Comenzar ahora" (desktop y mobile) → "Crea tu invitación".
  - `components/landing/PlannerCta.tsx`: botón "Comenzar ahora" → "Habla con nosotros".
  - `components/landing/Hero.tsx` y `components/landing/Packages.tsx`: sin cambios (ya cumplen el criterio acordado).
- Reemplazo de "RSVP" por "confirmación"/"confirmaciones" en el copy visible de la landing:
  - `components/landing/Hero.tsx`: chip "RSVP automático" → "Confirmación automática".
  - `components/landing/DesignGallery.tsx`: "...propias secciones, RSVP y panel de administración." → "...propias secciones, confirmación de asistencia y panel de administración."
  - `components/landing/Packages.tsx`: título de grupo "RSVP y gestión" (Paquete Básico) → "Confirmación y gestión".
  - `components/landing/TrustStrip.tsx`: label "RSVP en tiempo real" → "Confirmaciones en tiempo real".
- `components/landing/Footer.tsx`: se agrega el enlace de navegación "FAQ" → `#faq` junto a los ya existentes (Cómo funciona, Diseños, Paquetes).
- `components/LandingPage.tsx`: se monta `IndividualPersonalization` entre `DesignGallery` y `Features`, y `FAQ` entre `PlannerCta` y `Footer`.
- Verificación manual de `/` en desktop y mobile: acordeón del FAQ abre/cierra cada pregunta, los 4 CTAs muestran el texto correcto, no queda ningún "RSVP" visible, y no hay errores de consola.

**No incluye:**

- No se agregan testimonios ni cifras de clientes (decisión ya tomada en el spec 03, reafirmada en este).
- No se cambia el precio del Hero a un formato "Desde $X MXN" ni se agrega ningún panel de RSVP con cifras "en vivo" tipo ejemplo — ambas ideas del PDF quedan descartadas por el riesgo de comunicar datos que parecen reales sin serlo.
- No se agrega marcado `FAQPage` a `components/StructuredData.tsx` (schema SEO para rich snippets de FAQ en buscadores) — es una mejora válida pero no fue parte de la conversación de este spec; queda para un spec futuro si se decide.
- No se cambia el término "RSVP" en código interno, nombres de archivo, tipos (`src/types/wedding.ts`), servicios (`services/rsvpService.ts`) ni en ninguna otra parte del producto fuera del copy visible de la landing — es un cambio de comunicación de marketing, no un rename técnico.
- No se define ni valida una cifra exacta de costo por cambio extra en el Paquete Básico — la respuesta del FAQ queda abierta ("contáctanos por WhatsApp") a propósito.
- No se modifican los precios, el desglose de paquetes, ni ninguna otra sección de la landing ya cubierta por el spec 03 (Hero visual, HowItWorks, TrustStrip salvo el label de RSVP, DesignGallery salvo la descripción, Features, AdminProof, Packages salvo lo indicado).
- No se toca `app/[locale]/page.tsx` ni ningún template de invitación (`Template01`/`Template02`/`Template03`).

## Datos

No se introducen tipos ni estructuras de datos globales nuevas. El contenido de `FAQ.tsx` e `IndividualPersonalization.tsx` vive como constantes locales dentro de cada archivo, mismo patrón que `DesignGallery.tsx` (spec 03).

Forma de los datos locales, a modo de referencia:

```ts
// FAQ.tsx
const faqItems = [
  { question: '¿Tengo que diseñar mi invitación?', answer: 'No. Tú eliges uno de los 3 diseños...' },
  // ...8 items en total
];

// IndividualPersonalization.tsx
const examples = [
  { label: 'Juan & María', seats: '2 lugares' },
  { label: 'Carlos', seats: '1 lugar' },
  { label: 'The Smith Family', seats: '4 lugares' },
];
```

## Plan de implementación

1. Crear `components/landing/FAQ.tsx`: acordeón controlado con `useState<number | null>`, reutilizando `LSection`, `LReveal`, `fraunces` de `ui.tsx`; incluye las 8 preguntas/respuestas listadas en Alcance. No se monta todavía — no cambia nada visible.
2. Crear `components/landing/IndividualPersonalization.tsx`: título, copy, etiqueta "Ejemplo ilustrativo" y los 3 ejemplos listados en Alcance, reutilizando `LSection`, `LReveal`, `LStagger`, `LCard`. No se monta todavía.
3. Editar `components/landing/Nav.tsx`: cambiar el texto del botón (desktop y mobile) de "Comenzar ahora" a "Crea tu invitación".
4. Editar `components/landing/PlannerCta.tsx`: cambiar el texto del botón de "Comenzar ahora" a "Habla con nosotros".
5. Editar `components/landing/Hero.tsx`: cambiar el chip "RSVP automático" a "Confirmación automática".
6. Editar `components/landing/DesignGallery.tsx`: cambiar la descripción para reemplazar "RSVP" por "confirmación de asistencia".
7. Editar `components/landing/Packages.tsx`: cambiar el título de grupo "RSVP y gestión" (Paquete Básico) a "Confirmación y gestión".
8. Editar `components/landing/TrustStrip.tsx`: cambiar el label "RSVP en tiempo real" a "Confirmaciones en tiempo real".
9. Editar `components/landing/Footer.tsx`: agregar el enlace "FAQ" → `#faq` junto a los enlaces de navegación existentes.
10. Editar `components/LandingPage.tsx`: montar `IndividualPersonalization` entre `DesignGallery` y `Features`, y `FAQ` entre `PlannerCta` y `Footer`.
11. Verificación manual: `npm run dev`, visitar `/` en desktop y mobile; probar que cada pregunta del FAQ abre y cierra correctamente (una a la vez); confirmar que los 4 CTAs (Nav, Hero, Packages ×2, PlannerCta) muestran el texto correcto; confirmar visualmente que no queda ningún "RSVP" en el copy de la landing; confirmar ausencia de errores de consola.
12. `npm run build` (o `tsc --noEmit`) sin nuevos errores de tipos respecto al estado previo.

## Criterios de aceptación

- [ ] `components/landing/FAQ.tsx` existe, se monta en `/`, y muestra las 8 preguntas como acordeón — solo una respuesta visible a la vez.
- [ ] Cada pregunta del acordeón es accesible por teclado (`<button>` con `aria-expanded` correcto).
- [ ] La respuesta de "¿Puedo cambiar la información después de publicar?" distingue Paquete Básico (cambios vía Invyta, posible costo adicional) de Paquete Personalizado (edición libre desde el panel propio).
- [ ] `components/landing/IndividualPersonalization.tsx` existe, se monta entre `DesignGallery` y `Features`, y muestra los 3 ejemplos (Juan & María → 2 lugares, Carlos → 1 lugar, The Smith Family → 4 lugares) con una etiqueta visible de "ejemplo ilustrativo".
- [ ] El copy de `IndividualPersonalization.tsx` deja claro que la personalización individual es exclusiva del Paquete Personalizado.
- [ ] El botón del header (`Nav.tsx`, desktop y mobile) dice "Crea tu invitación".
- [ ] El botón de `PlannerCta.tsx` dice "Habla con nosotros".
- [ ] `Hero.tsx`, `Packages.tsx` (botones "Elegir Básico"/"Elegir Personalizado") no cambian.
- [ ] Ninguna sección de la landing muestra la palabra "RSVP" (verificado en Hero, DesignGallery, Packages y TrustStrip).
- [ ] `Footer.tsx` incluye un enlace "FAQ" que apunta a `#faq`.
- [ ] `npm run build` (o `tsc --noEmit`) no introduce nuevos errores de tipos respecto al estado previo.
- [ ] Visitar `/` en desktop y mobile no muestra errores de consola.

## Decisiones tomadas y descartadas

- **FAQ se ubica entre `PlannerCta` y `Footer`, no antes de un "CTA final" separado**: el código actual no tiene una sección de CTA final genérica distinta de `PlannerCta` (a diferencia del PDF, que sí la propone como sección 13); se usa la posición real equivalente más cercana a la intención original.
- **Las 8 preguntas del PDF se mantienen, pero se ajustan a la realidad del producto**: decisión explícita del usuario ("revisa si aplican... y si no, ajústalas a lo que nosotros tenemos"). La única que requirió ajuste real fue la de cambios post-publicación.
- **Costo de cambios extra en el Paquete Básico sin cifra exacta**: decisión explícita del usuario — no hay una tarifa fija definida hoy, así que se deja abierto ("contáctanos por WhatsApp") en vez de inventar un monto.
- **Ejemplos de personalización idénticos a los del PDF, con etiqueta de "ejemplo ilustrativo"**: decisión explícita del usuario — mismo criterio que se usó para descartar testimonios falsos en el spec 03: no dar a entender que son clientes reales.
- **`Packages.tsx` no cambia sus botones**: ya decía "Elegir Básico"/"Elegir Personalizado", que ya cumple el criterio acordado de "mismo verbo de acción, texto adaptado al contexto" — no había nada que corregir.
- **`Nav.tsx` sí se incluye en la unificación de CTAs aunque no estaba en la pregunta original**: se detectó durante la revisión de código que tiene su propio botón "Comenzar ahora", independiente del de `PlannerCta.tsx`; el usuario confirmó incluirlo y usar el mismo texto que el Hero por ser el CTA genérico más visible de la página.
- **`PlannerCta.tsx` usa un texto distinto ("Habla con nosotros") en vez de repetir "Crea tu invitación"**: decisión explícita del usuario — mismo verbo/tono de acción, pero adaptado a que ese CTA es para wedding planners, no para la pareja.
- **Reemplazo de "RSVP" por "confirmación"/"confirmaciones" en las 4 apariciones**: decisión explícita del usuario, motivada por la inconsistencia real detectada entre el copy de marketing (usa "RSVP") y el producto ya en producción (usa "Confirmación", ver `messages/es.json`).
- **No se toca terminología técnica interna ("RSVP" en nombres de archivo, tipos, servicios)**: es un cambio de comunicación de cara al usuario final, no un rename de código; renombrar `rsvpService.ts` o campos de `WeddingData` está fuera de alcance y no aporta valor de negocio.
- **Sin testimonios, sin precio "Desde $X" en el Hero, sin panel de RSVP con cifras "en vivo"**: se reafirman decisiones ya tomadas en el spec 03 por el mismo motivo — evitar comunicar datos que parecen reales sin serlo.
- **Sin `FAQPage` schema en `StructuredData.tsx`**: mejora de SEO válida pero no discutida en este spec; se deja para una iteración futura si se decide explícitamente.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El acordeón de FAQ es un componente nuevo sin precedente en `components/landing/ui.tsx` | Se implementa con el mismo patrón ya usado en el menú móvil de `Nav.tsx` (`useState` + render condicional), sin agregar dependencias nuevas. |
| Cambiar "RSVP" en 4 archivos distintos puede dejar alguna instancia sin actualizar | El plan de implementación lista cada archivo explícitamente (pasos 5–8) y el criterio de aceptación de verificación manual pide confirmar visualmente que no quede ningún "RSVP" en pantalla. |

## Lo que NO está en este spec

- Testimonios o prueba social con cifras.
- Precio "Desde $X MXN" en el Hero, o cualquier rango de precio abierto.
- Panel de RSVP con cifras de ejemplo "en vivo" (tipo "150 invitados · 112 confirmados").
- Schema `FAQPage` en `components/StructuredData.tsx`.
- Renombrar "RSVP" en código interno, tipos, servicios o nombres de archivo.
- Cifra exacta de costo por cambios extra en el Paquete Básico.
- Cambios a precios, paquetes o cualquier otra sección de la landing ya cubierta por el spec 03.

Cada uno de estos, si se decide hacer, va en su propio spec.
