# 07 — IA en el editor de la pareja: redactor, traducción, itinerario y lugares (Ola 1, Nivel 1)

**Estado:** Approved
**Depende de:** SPEC 06
**Fecha:** 2026-09-23

## Objetivo

Agregar al editor de la pareja las seis acciones de IA de Ola 1 – Nivel 1 (redactar y traducir la Historia de Amor, redactar el Dress Code, sugerir itinerario, y redactar/sugerir Lugares Recomendados) usando OpenAI (`gpt-4o-mini`), cada una limitada a 5 usos por boda y guardada en Firestore.

> **Diseño de la ampliación (14 artboards, validado con el usuario):** https://claude.ai/artifact/XJG6advegumbpwrp4qXCbx — casilla de inglés, panel "Inglés", vista previa de traducciones, redactor, cronograma, hoteles, lugares, solo adultos, alta de invitado y móvil. Incluye el cambio de tipografía: los inputs, textareas y selects del editor y de la gestión de invitados usan Manrope (hoy usan la fuente por defecto del navegador).
>
> **Ampliación 2026-09-24:** tras la primera prueba manual se agregó al alcance (a) correcciones de bugs y (b) inglés opcional con traducción con IA en todo el editor, hoteles con IA y renombrar "Configuración" a "Solo adultos". Ver la sección "Ampliación" al final. Donde el texto original contradiga la ampliación (traducción solo en Historia, sin hoteles, sin Frase Especial), manda la ampliación.

## Contexto

Este spec implementa el diseño ya validado con el usuario para "Ola 1 - Nivel 1" (canvas de diseño publicado como Artifact, 8 artboards desktop/mobile: https://claude.ai/artifact/JBE4ZPZiPNkiwNssQQncij) y la fila correspondiente de la tabla Nivel 1 en `specs/06-ia-personalizado-vision-general.md`. No hay ninguna integración de IA en el código hoy (`grep` de "openai"/"anthropic" no arroja resultados) — es la primera vez que el proyecto llama a un servicio de IA externo.

Revisión de código hecha antes de este spec (no asumida):

- El editor de la pareja vive completo en un solo archivo, `app/[locale]/admin/wedding-editor/[weddingId]/page.tsx` (~2000 líneas), con cada sección del formulario como una función local dentro del mismo archivo (`CoupleSection`, `EventSection`, `RecommendedPlacesSection`, etc.) — no son componentes separados. Este spec sigue ese mismo patrón: la UI de IA se agrega como nuevas piezas locales dentro de ese archivo, no como componentes nuevos en `components/`.
- El guardado es manual y explícito: `handleSave` (línea 366) hace `setDoc(docRef, updatedData)` con todo el documento cuando la pareja da clic en el botón "Guardar" (líneas 581 y 700). No hay autosave. Todo lo que genere la IA debe llenar el mismo estado local que ya llena el tecleo manual (`onChange`), sin saltarse ese flujo.
- El proyecto ya tiene el patrón de Next.js Route Handlers (`app/api/wedding-music/[weddingId]/route.ts`, `app/api/wedding-images/[weddingId]/route.ts`): `NextRequest`/`NextResponse`, validación del `weddingId` contra una regex (línea 13 de `wedding-music/route.ts`), `try/catch` con `NextResponse.json(..., {status})`. Las rutas nuevas de este spec siguen ese mismo patrón.
- "Historia de Amor" es `couple.story: {es, en}` y "Frase Especial" es `couple.quote: {es, en}` (`src/types/wedding.ts`). El diseño solo puso un botón interactivo de IA sobre `story`; `quote` se mostró ya traducida como ejemplo ilustrativo del resultado final, no como campo con acción propia en esta iteración.
- "Descripción de Dress Code" es `event.dressCode.description: {es, en}`. El campo en inglés existe en el modelo pero el diseño no le puso acción de IA (ni redactor ni traductor) — se deja para una iteración futura.
- El Cronograma es un array `timeline: TimelineEvent[]` con shape `{id, time, title:{es,en}, description:{es,en}, icon}` (ver `addTimelineEvent`, línea 1099-1109 de `page.tsx`). `iconOptions` (línea 1133) limita los íconos válidos a `['MapPin','Heart','Music','Utensils','Users','Wine','Clock','Star','Gift']`. La hora de la ceremonia vive en `event.ceremony.time` y el lugar en `event.receptionVenue.address`/`event.receptionVenue.name` (`src/types/wedding.ts`, líneas 81-108).
- "Lugares Recomendados" en el editor edita `weddingData.accommodation.recommendedPlaces` (tipo `AccommodationOption[]`), **no** el tipo `RecommendedPlace`/`RecommendedPlacesConfig` que también existe en `src/types/wedding.ts` (líneas 238-261) pero no está conectado a ningún tab del editor — confirmado en `page.tsx` líneas 667-671 y 1389-1397. `addPlace` crea `{id, name, description:{es,en}, mapsUrl}`. Este spec usa `accommodation.recommendedPlaces`.
- No existe ningún campo de "ciudad" en el modelo de datos — solo `event.receptionVenue.address` como texto libre. Se usa tal cual como contexto de ubicación para la IA (decisión del usuario, ver Decisiones).
- No hay autenticación en ninguna ruta de `app/[locale]/admin/*` (riesgo ya señalado en el spec 06). Este spec no la agrega; ver Riesgos.
- Variables de entorno existentes siguen el prefijo `NEXT_PUBLIC_*` (`.env.local`) para las de Firebase, que sí se exponen al cliente. La nueva `OPENAI_API_KEY` es del lado servidor (usada solo dentro de rutas `app/api/**/route.ts`), por lo que **no** lleva el prefijo `NEXT_PUBLIC_`.

## Alcance

**Incluye:**

- **Redactor de Historia de Amor** — modal "Redactor de textos con IA" (igual al diseño): 3 preguntas (cómo se conocieron, anécdota, tono) → un solo llamado genera `couple.story.es` y `couple.story.en` juntos. Botones "Generar borrador con IA" y "Regenerar" cuentan para el mismo límite de uso.
- **Traducir Historia a inglés** — botón junto al campo "Historia en Inglés" que traduce el `story.es` ya escrito a mano y llena solo `story.en`. Acción independiente del redactor, con su propio límite de uso.
- **Redactor de Dress Code** — botón "Redactar con IA" en `dressCode.description.es`. Solo español, sin traducción en esta iteración.
- **Itinerario sugerido** — botón "Sugerir itinerario con IA" en Cronograma. Usa `event.ceremony.time` y `event.receptionVenue.address`/`name` como contexto para generar de 3 a 5 eventos ya bilingües (`title`, `description` en `{es,en}`, `icon` de la lista permitida). Cada evento aceptado (individual o "Agregar todas") se agrega a `timeline` con el mismo shape que `addTimelineEvent`, como si la pareja lo hubiera creado a mano.
- **Redactor de un lugar recomendado** — botón "Redactar con IA" por lugar ya agregado, llena `description.es` de ese lugar (`accommodation.recommendedPlaces[i]`). Solo español.
- **Sugerencia de lugares por ciudad** — botón "Sugerir lugares con IA" a nivel de sección. Usa `event.receptionVenue.address` tal cual como contexto, devuelve nombres reales de negocios (hospedaje/restaurante/actividad) con una razón corta. Cada sugerencia aceptada se agrega a `accommodation.recommendedPlaces` con el mismo shape que `addPlace` (`description: {es: <generado>, en: ''}`); la pareja siempre revisa antes de agregar, nada se guarda solo.
- **Límite duro de 5 usos por acción, por boda**, guardado en Firestore (`aiUsage` en el documento de la boda). El contador solo sube si la llamada a OpenAI tiene éxito; un error no consume intento. Al llegar a 5, el botón de esa acción se deshabilita con el texto "Ya usaste tus 5 generaciones para esto".
- **Estado de carga**: mientras se espera la respuesta, el campo de destino muestra una animación sutil de gradiente en tonos violeta (mismos que el botón de IA, `#6D28D9`/`#F5F3FF`) moviéndose, para comunicar que se está generando.
- **Estado de error**: si la llamada a OpenAI falla, se muestra un mensaje corto ("No pudimos generar el texto, intenta de nuevo") y el botón queda disponible para reintentar de inmediato.
- Todo el contenido generado solo llena el estado local del formulario (mismo `onChange` que el tecleo manual) — se guarda hasta que la pareja da clic en el botón "Guardar" ya existente.

**No incluye (queda para otra iteración):**

- Traducción a inglés en Dress Code o en Lugares Recomendados — decisión explícita del usuario, solo Historia de Amor tiene traducción por ahora.
- Un campo `event.city` nuevo en el modelo de datos — se usa `receptionVenue.address` tal cual.
- Cualquier fuente de datos verificada de lugares reales (Google Places API u otra similar) — los nombres de negocios sugeridos vienen del conocimiento general del modelo. El riesgo de que invente o se equivoque de lugar se acepta y se mitiga con revisión obligatoria antes de agregar (ver Riesgos).
- Autenticación en los paneles de `app/[locale]/admin/*` — riesgo conocido, ya señalado en el spec 06, fuera de alcance de este spec.
- Resto de Ola 1 (Nivel 2 y 3 del spec 06): asistente de seguimiento de RSVP, resumen ejecutivo de invitados, distribución de mesas, onboarding conversacional, paleta de color por foto.
- Cualquier función de Ola 2 (chatbot de invitados, RSVP conversacional, traducción en vivo por invitado, recap post-boda).
- Resolver la duplicación de tipos `RecommendedPlace`/`RecommendedPlacesConfig` vs `AccommodationOption` en `src/types/wedding.ts` — se detectó durante este spec pero no se toca; el editor real ya usa `AccommodationOption`.
- Botón "Redactar con IA" para "Frase Especial" (`couple.quote`) — el diseño solo la mostró como ejemplo ilustrativo del resultado final, no como campo interactivo.

## Datos

Un solo campo nuevo en el documento de la boda (Firestore), opcional — si no existe se asume 0 en todos los contadores:

```ts
// Nuevo, dentro del documento de la boda
interface AiUsage {
  storyGenerate?: number;       // "Generar borrador con IA" / "Regenerar" del modal de Historia
  storyTranslate?: number;      // "Traducir a inglés" del campo Historia en Español
  dresscodeGenerate?: number;   // "Redactar con IA" de Dress Code
  timelineSuggest?: number;     // "Sugerir itinerario con IA"
  placesSuggest?: number;       // "Sugerir lugares con IA"
  placeGenerate?: Record<string, number>; // "Redactar con IA" de un lugar, por id de lugar
}
```

Cada ruta de `app/api/ai/*` lee el contador correspondiente antes de llamar a OpenAI; si es `>= 5` devuelve `{ error: 'limit_reached' }` con status 429. Si la llamada a OpenAI tiene éxito, incrementa el contador con `updateDoc` + `increment(1)` sobre la ruta con puntos (ej. `aiUsage.storyGenerate`, o `aiUsage.placeGenerate.${placeId}`).

Contrato de las 6 rutas nuevas (todas `POST`, todas devuelven `{ error }` con status 429/500 en caso de límite alcanzado o falla):

```ts
// POST /api/ai/story           { weddingId, howMet, anecdote, tone }        → { es, en }
// POST /api/ai/story-translate { weddingId, text }                          → { en }
// POST /api/ai/dresscode       { weddingId, style }                        → { es }
// POST /api/ai/timeline-suggest{ weddingId, ceremonyTime, venueAddress }    → { events: [{ time, title:{es,en}, description:{es,en}, icon }] }
// POST /api/ai/place-description{ weddingId, placeId, placeName }          → { es }
// POST /api/ai/places-suggest  { weddingId, venueAddress }                 → { places: [{ name, category, reason }] }
```

No se introduce ningún paquete nuevo de npm: las llamadas a OpenAI se hacen con `fetch` directo a la Chat Completions API (`response_format: { type: 'json_object' }`), no con el SDK oficial `openai` — el proyecto no lo tiene instalado y una llamada HTTP simple es suficiente para este alcance.

## Plan de implementación

1. Agregar `OPENAI_API_KEY` a `.env.local` (la pareja ya tiene la key). Sin cambios de código todavía.
2. Crear `lib/openai.ts`: función `generateJson(systemPrompt, userPrompt)` que llama a `https://api.openai.com/v1/chat/completions` con `model: 'gpt-4o-mini'` y `response_format: { type: 'json_object' }`, parsea y devuelve el JSON de respuesta, o lanza error. Sin usarse todavía.
3. Crear `lib/aiUsage.ts`: `checkAndIncrementUsage(weddingId, counterPath, run)` — lee `aiUsage.<counterPath>` del documento de la boda con el cliente de Firestore ya existente (`lib/firebase.ts`); si es `>= 5` devuelve `{ ok: false, reason: 'limit_reached' }`; si no, ejecuta `run()` (la llamada a OpenAI) y, solo si tiene éxito, hace `updateDoc` con `increment(1)` sobre esa ruta antes de devolver el resultado. Sin usarse todavía.
4. Crear `app/api/ai/story/route.ts` (usa `storyGenerate`). Probar con una petición manual (curl/Postman).
5. Crear `app/api/ai/story-translate/route.ts` (usa `storyTranslate`). Probar con una petición manual.
6. Crear `app/api/ai/dresscode/route.ts` (usa `dresscodeGenerate`). Probar con una petición manual.
7. Crear `app/api/ai/timeline-suggest/route.ts` (usa `timelineSuggest`), limitando `icon` a los valores de `iconOptions`. Probar con una petición manual.
8. Crear `app/api/ai/place-description/route.ts` (usa `placeGenerate.<placeId>`). Probar con una petición manual.
9. Crear `app/api/ai/places-suggest/route.ts` (usa `placesSuggest`). Probar con una petición manual.
10. En `components/admin/ui.tsx`: agregar `AiButton` (violeta `#6D28D9`/`#F5F3FF`, mismo patrón que `AdminButton`), `AiBadge` (pill "Generado/Traducido con IA") y una clase de animación de carga (gradiente violeta en movimiento) reutilizables desde el editor.
11. En `CoupleSection` (dentro de `page.tsx`): agregar el botón "Redactar con IA" que abre un modal local nuevo (`AiStoryModal`, preguntas → `/api/ai/story` → resultado ES/EN → "Usar este texto" llena `story.es`/`story.en` vía `onChange`), y el botón "Traducir a inglés" junto a "Historia en Inglés" que llama a `/api/ai/story-translate` y llena `story.en`. Verificación manual: generar, regenerar, traducir, y llegar al límite de 5 en al menos una de las dos acciones.
12. En `EventSection`: agregar el botón "Redactar con IA" en Descripción de Dress Code, llamando a `/api/ai/dresscode`.
13. En la función local del Cronograma: agregar el botón "Sugerir itinerario con IA" y el panel de sugerencias (aceptar/descartar individual y "Agregar todas"/"Descartar todas"), llamando a `/api/ai/timeline-suggest`; al aceptar, agrega el o los eventos a `timeline` vía `onChange('timeline', [...timelineData, ...eventosAceptados])`.
14. En `RecommendedPlacesSection`: agregar "Redactar con IA" por lugar (`/api/ai/place-description`) y "Sugerir lugares con IA" a nivel de sección (`/api/ai/places-suggest`), con el mismo patrón de aceptar/descartar del paso 13.
15. Verificación manual completa en `npm run dev`: las 6 acciones en desktop y mobile, estado de carga, estado de error (probar con una API key inválida), y llegar al límite de 5 usos para confirmar que el botón correspondiente se deshabilita con el mensaje correcto.
16. `npm run build` (o `tsc --noEmit`) sin nuevos errores de tipos respecto al estado previo.

## Criterios de aceptación

- [ ] El modal "Redactor de textos con IA" genera `story.es` y `story.en` a partir de las 3 preguntas, y "Usar este texto" los escribe en el formulario (no en Firestore directo).
- [ ] "Regenerar" dentro del modal permite un nuevo intento y cuenta contra el mismo límite que "Generar borrador con IA".
- [ ] El botón "Traducir a inglés" junto a "Historia en Inglés" traduce el `story.es` actual y llena `story.en`, sin abrir el modal.
- [ ] El botón "Redactar con IA" de Dress Code llena `dressCode.description.es`; `dressCode.description.en` no se toca.
- [ ] "Sugerir itinerario con IA" genera entre 3 y 5 eventos con `title`/`description` en español e inglés y un `icon` válido de `iconOptions`; "Agregar todas" los agrega al Cronograma con el mismo shape que un evento creado manualmente.
- [ ] Cada evento sugerido se puede agregar o descartar individualmente sin afectar a los demás.
- [ ] El botón "Redactar con IA" de un lugar llena solo `description.es` de ese lugar específico.
- [ ] "Sugerir lugares con IA" devuelve nombres reales de negocios con categoría y razón; ninguna sugerencia se agrega a `accommodation.recommendedPlaces` sin que la pareja dé clic en "Agregar" o "Agregar todas".
- [ ] Cada una de las 6 acciones tiene su propio contador en `aiUsage` (o `aiUsage.placeGenerate.<placeId>` para lugares), y se bloquea al llegar a 5 usos exitosos, mostrando "Ya usaste tus 5 generaciones para esto".
- [ ] Un error de la llamada a OpenAI no incrementa el contador correspondiente.
- [ ] Mientras se espera la respuesta de una acción de IA, el campo de destino muestra la animación de carga en tonos violeta.
- [ ] Si la llamada a OpenAI falla, se muestra un mensaje de error corto y el botón queda disponible para reintentar de inmediato.
- [ ] Ninguna de las 6 acciones escribe directamente en Firestore — todas pasan por el mismo `onChange` que el tecleo manual, y solo se persisten al dar clic en "Guardar".
- [ ] `OPENAI_API_KEY` no aparece en ningún archivo dentro de `app/[locale]/**` ni en ningún componente cliente — solo se lee dentro de `app/api/ai/**/route.ts`.
- [ ] `npm run build` (o `tsc --noEmit`) no introduce nuevos errores de tipos respecto al estado previo.
- [ ] Las 6 acciones funcionan visualmente igual en desktop y mobile, sin errores de consola.

## Decisiones tomadas y descartadas

- **Un solo spec para toda Ola 1 - Nivel 1, no dos**: decisión explícita del usuario al elegir entre spec único vs. dividir por patrón técnico o por sección — se prioriza entregarlo como una sola unidad de trabajo.
- **OpenAI (`gpt-4o-mini`) como proveedor**: decisión explícita del usuario, que ya cuenta con una API key propia. `gpt-4o-mini` en vez de `gpt-4o` por costo — para textos cortos como estos la diferencia de calidad no justifica el costo varias veces mayor.
- **Sin el SDK oficial `openai`, con `fetch` directo**: el proyecto no tiene esa dependencia y una llamada HTTP simple a Chat Completions con `response_format: json_object` cubre el alcance sin agregar una librería nueva.
- **El contenido generado solo llena el formulario, nunca escribe directo a Firestore**: decisión explícita del usuario — consistente con el resto del editor, que ya se guarda con un botón "Guardar" explícito, sin autosave.
- **Límite duro de 5 usos por acción, por boda, guardado en Firestore (`aiUsage`)**: decisión explícita del usuario — se fija el número desde ya en vez de medir primero (como sugería el spec 06), y se persiste en Firestore (no en el cliente) para que el límite sea real y no se pueda saltar recargando la página.
- **El contador solo sube si la llamada a OpenAI tiene éxito**: decisión explícita del usuario — un error de red o de la API no debe penalizar a la pareja con uno de sus 5 intentos.
- **Animación de carga en tonos violeta sobre el campo que se está generando**: pedido explícito del usuario, para comunicar que "está pensando" mientras se espera la respuesta — mismos tonos que ya usa el botón de IA en el diseño (`#6D28D9`/`#F5F3FF`), sin introducir una paleta nueva.
- **Traducción limitada a Historia de Amor, sin extenderla a Dress Code, Frase Especial, Cronograma o Lugares**: decisión explícita del usuario — se implementa exactamente lo que el diseño mostró como interactivo, dejando el resto para una siguiente iteración si se decide.
- **Sin campo `event.city` nuevo; se usa `receptionVenue.address` tal cual**: decisión explícita del usuario — evita un cambio de modelo de datos adicional no contemplado en el diseño original.
- **Nombres reales de negocios en "Sugerir lugares con IA", con revisión obligatoria antes de agregar**: decisión explícita del usuario, aceptando el riesgo de alucinación ya señalado en el spec 06 a cambio de una sugerencia más útil; la revisión obligatoria (nada se agrega sin clic de la pareja) es la mitigación.
- **Error de OpenAI no consume intento y permite reintentar de inmediato**: decisión explícita del usuario, sobre la alternativa de que cualquier error también contara contra el límite de 5.
- **La UI de IA se agrega como funciones locales dentro de `page.tsx`, no como componentes nuevos en `components/`**: sigue el patrón real ya existente en el archivo (`CoupleSection`, `EventSection`, `RecommendedPlacesSection` son todas funciones locales del mismo archivo), evitando introducir una convención distinta a la ya establecida.
- **No se resuelve la duplicación `RecommendedPlace`/`RecommendedPlacesConfig` vs `AccommodationOption`**: se detectó durante la revisión de código de este spec pero es un problema de código preexistente sin relación directa con las funciones de IA; corregirlo es un cambio de refactor aparte.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Los paneles de `app/[locale]/admin/*` no tienen autenticación — cualquiera con el link podría gastar los 5 usos de IA de una boda ajena | El límite duro de 5 por acción por boda (guardado en Firestore, no en el cliente) acota el daño máximo posible a un costo pequeño y conocido por boda; agregar autenticación real queda fuera de este spec, como ya señalaba el spec 06 |
| "Sugerir lugares con IA" puede nombrar un negocio cerrado, con otro nombre, o que no existe en esa ciudad | Nada se agrega a `accommodation.recommendedPlaces` sin que la pareja dé clic en "Agregar"/"Agregar todas"; se usa la dirección real de la boda como contexto para reducir sugerencias fuera de lugar |
| Un `weddingId` con formato inesperado en las nuevas rutas de `app/api/ai/*` | Se reutiliza la misma validación por regex ya usada en `wedding-music/route.ts` (línea 13) en las 6 rutas nuevas |
| La respuesta de OpenAI no es JSON válido o no cumple el shape esperado (ej. `icon` fuera de `iconOptions`) | `lib/openai.ts` valida el JSON antes de devolverlo; un shape inválido se trata como error de la llamada (no consume intento) y dispara el estado de error con opción de reintentar |

## Ampliación (2026-09-24)

### Bugs encontrados en la prueba manual (causa raíz verificada)

1. "Usar este texto" solo llenaba `story.en`: `updateWeddingData` clonaba `weddingData` del closure del render; dos `onChange` seguidos se pisaban. Se corrige con actualización funcional (`setWeddingData(prev => ...)`).
2. El itinerario sugerido usaba `event.ceremony.time` (campo que el editor no edita; queda en 16:00) en vez de `event.time` (el que edita la pareja y usa la invitación pública). Además no recibía el contexto de la ceremonia. Se corrige y el primer evento se fuerza por código a la hora recibida.
3. "Sugerir lugares" recomendaba hoteles: el prompt pedía hospedaje. Ahora pide restaurantes, cafés, atracciones y experiencias, excluye hospedaje y elementos ya agregados, y devuelve lista vacía si la dirección no permite ubicar la zona.
4. El fondo del modal quedaba cortado arriba (causa a confirmar con captura): se renderiza con `createPortal` en `document.body` y se bloquea el scroll del fondo.

### Alcance agregado

- **Inglés opcional.** Casilla "¿Tendrás invitaciones en inglés?" (apagada por defecto) debajo de los teléfonos en Pareja, guardada como `hasEnglish` (raíz del documento). Si no está definida, se infiere `true` cuando ya hay contenido EN en la boda. Al desmarcarla no se borra nada: solo se ocultan los inputs y botones EN. Con inglés apagado, el alta de invitado no muestra "Idioma de la Invitación" y guarda `language: 'es'`; los invitados existentes con `en` se conservan.
- **Traducir con IA por campo** en: Historia (ya existe), Frase Especial, Dress Code (estilo y descripción), nombres de ceremonia y recepción, Cronograma (título y descripción), Hoteles (descripción), Lugares (descripción), Regalos (mensaje, descripción de tiendas, descripción de cuenta bancaria) y Solo adultos (mensaje). Un solo contador compartido `translate` (30 usos por boda).
- **Redactores con inglés:** cuando hay inglés, Dress Code, redactor de lugar y las sugerencias de hoteles y lugares devuelven también el texto EN.
- **Panel "Inglés N/M"** en la barra superior (solo con inglés activo): lista los campos EN pendientes agrupados por pestaña, con salto al campo, y botón "Traducir lo que falta" con vista previa ES | EN editable antes de aplicar. Solo llena el formulario; se guarda con "Guardar".
- **Sugerir hoteles con IA** (3 a 5) en la pestaña Hoteles, visible solo si hay dirección de ceremonia o recepción; si no, texto de ayuda en lugar del botón. Mismo panel aceptar/descartar que Lugares. Contador `hotelsSuggest` (5).
- **Link de Google Maps de búsqueda** autogenerado (`https://www.google.com/maps/search/?api=1&query=<nombre+dirección>`) como `mapsUrl` al agregar un hotel o lugar sugerido.
- **Renombrar** la pestaña "Configuración" a "Solo adultos" (etiqueta y título).
- `isSectionComplete` deja de exigir texto EN en hoteles, lugares y solo adultos cuando el inglés está apagado.

### Datos agregados

```ts
interface AiUsage {
  // ...contadores existentes
  translate?: number;      // compartido por todos los botones "Traducir con IA" (límite 30)
  hotelsSuggest?: number;  // "Sugerir hoteles con IA" (límite 5)
}
// Nuevo, raíz del documento de la boda
hasEnglish?: boolean;
```

Rutas nuevas o cambiadas:

```ts
// POST /api/ai/translate      { weddingId, items: [{ key, text }] }        → { items: [{ key, en }] }  (reemplaza a story-translate)
// POST /api/ai/hotels-suggest { weddingId, ceremony:{name,address}, reception:{name,address}, withEnglish } → { places: [{ name, reason, reasonEn? }] }
// POST /api/ai/places-suggest { ..., existingNames, withEnglish }          → { places: [...] }  (sin hospedaje)
// POST /api/ai/story | dresscode | place-description  { ..., withEnglish } → también devuelven EN cuando withEnglish
// POST /api/ai/timeline-suggest { ..., ceremonyTime: event.time, ceremony, reception, withEnglish }
```

El límite de `translate` es 30 y el resto sigue en 5; `checkAndIncrementUsage` recibe el límite como parámetro.

### Plan de implementación (continuación de los pasos 1-16)

17. Corrección 1: `updateWeddingData` funcional.
18. Corrección 4: `AiStoryModal` con portal y bloqueo de scroll; reproducir antes con captura.
19. Corrección 2: `TimelineSection` recibe `event.time` y datos de ambos lugares; `timeline-suggest` fuerza la hora del primer evento.
20. Corrección 3: `places-suggest` sin hospedaje, con exclusiones y lista vacía + aviso.
21. `lib/wedding-language.ts` (`resolveHasEnglish`), tipo `hasEnglish`, casilla en `CoupleSection` (prop `onRootChange`), `hasEnglish` a todas las secciones, relajar `isSectionComplete`, ocultar "Idioma de la Invitación" en la página de invitados.
22. `lib/aiUsage.ts` con límite parametrizable; ruta `translate`; borrar `story-translate`.
23. `AiTranslateButton` local y su uso en todos los campos EN; redactores devuelven EN cuando `hasEnglish`.
24. Panel "Inglés" con vista previa.
25. Ruta `hotels-suggest` y panel en `AccommodationSection`; link de búsqueda de Maps también en Lugares.
26. Renombrar "Configuración" a "Solo adultos".
26b. Tipografía: inputs, textareas y selects del editor y de la página de invitados con `font-family: inherit` (Manrope) mediante una clase `admin-form` en `app/globals.css`, también dentro del modal en portal.
27. `npx tsc --noEmit` y `npm run build`; verificación manual de todo lo agregado.

### Criterios de aceptación adicionales

- [ ] "Usar este texto" llena `story.es` y `story.en` (ambos).
- [ ] El fondo del modal cubre toda la pantalla en desktop y mobile.
- [ ] El primer evento del itinerario sugerido tiene la hora de "Hora del evento" (`event.time`).
- [ ] "Sugerir lugares" no devuelve hospedaje; con dirección vaga muestra aviso y no agrega nada.
- [ ] Con la casilla de inglés apagada no se ve ningún input ni botón EN, ni "Idioma de la Invitación" al crear invitado; al encenderla reaparecen con sus datos intactos.
- [ ] Una boda existente con contenido EN arranca con la casilla marcada.
- [ ] Cada campo EN listado tiene "Traducir con IA" y llena solo ese campo.
- [ ] El contador `translate` es compartido y se bloquea a los 30 usos.
- [ ] El panel "Inglés" cuenta y lista los pendientes, y "Traducir lo que falta" muestra vista previa antes de aplicar.
- [ ] "Sugerir hoteles con IA" no aparece sin dirección de ceremonia ni recepción y agrega hoteles con `mapsUrl` de búsqueda.
- [ ] La pestaña se llama "Solo adultos" y su mensaje tiene "Traducir con IA".
- [ ] Con inglés apagado, las secciones se marcan completas sin texto EN.
- [ ] Nada se escribe en Firestore hasta "Guardar cambios".
- [ ] Los inputs, textareas y selects del editor y de la gestión de invitados se ven en Manrope, igual que en el diseño.
- [ ] La implementación coincide visualmente con el diseño de la ampliación (liga arriba).

### Cierre de cabos (revisión 2026-09-24)

- **Guardar ya no pisa `aiUsage`.** `lib/weddingSave.ts` (`saveWeddingDoc`) guarda con `mergeFields` de todos los campos de primer nivel menos `aiUsage`. Lo usan el guardado del editor y las escrituras de migración al cargar del editor y de invitados. Antes, un "Guardar cambios" reescribía el contador con el valor cargado al abrir y reiniciaba el límite.
- **"Redactar con IA" en lugares con tope total.** El contador por lugar sigue en 5, pero el id lo manda el cliente; se agrega `aiUsage.placeGenerateTotal` con tope de 25 (`lib/aiLimits.ts`) y el id se limita a 60 caracteres.
- **Usos restantes visibles.** Cada respuesta de las rutas incluye `usage: { key, used, limit }` (también en el 429). El editor inicializa los usos desde el documento cargado y muestra "· te quedan N" cuando quedan pocos; los botones aparecen agotados desde el inicio, sin necesidad de chocar con el 429.
- **Cambios sin guardar.** El editor compara el documento contra lo último cargado o guardado; muestra "Cambios sin guardar" junto a Guardar y pide confirmación del navegador al salir. Los usos de IA consumen intentos y un borrador perdido cuesta uno.
- **Cronograma sin duplicados y ordenado.** `timeline-suggest` recibe los eventos existentes, no repite ceremonia ni títulos ya presentes y descarta duplicados en el servidor. Los eventos agregados se insertan ordenados por hora.
- **Entrada suave** del panel "Inglés" (deslizamiento y fundido) y de los modales; sin animación con "reducir movimiento".

Criterios adicionales:

- [ ] Usar una traducción, guardar y recargar no reinicia el contador (`aiUsage` conserva el valor del servidor).
- [ ] Variar `placeId` en `place-description` no permite más de 25 redacciones por boda.
- [ ] Los botones muestran "te quedan N" al acercarse al límite y aparecen agotados al recargar si ya se agotó.
- [ ] Editar y navegar a otra pantalla sin guardar dispara la confirmación del navegador; tras guardar desaparece el indicador.
- [ ] Sugerir itinerario con eventos existentes no duplica la ceremonia y deja el cronograma ordenado por hora.

### Decisiones de la ampliación

- **Contador `translate` compartido (30):** decisión del usuario; con 12 campos EN un contador por campo se agotaría y traducir cuesta fracciones de centavo.
- **Mitigación anti-invento con link de búsqueda de Maps y lista vacía si la dirección es vaga:** decisión del usuario; Google Places API queda como spec futuro.
- **`hasEnglish` inferido para bodas existentes y sin borrado al desmarcar:** decisión del usuario.
- **Se deja `hasEnglish` aparte y no se reutiliza `languages`:** todas las bodas traen `languages: ['es','en']`, así que no distingue nada, y nadie lo lee.
- **Las piezas de IA nuevas viven en `ai-parts.tsx`, junto a `page.tsx`, no dentro de él:** contexto, campo EN, sugerencias, panel de inglés y modal. `page.tsx` ya superaba las 2.600 líneas y esto agrega ~600; sigue sin usar `components/`, porque son piezas exclusivas de esta pantalla. Reemplaza la decisión original de "funciones locales dentro de `page.tsx`".
- **Traducción con vista previa en lote, no escritura directa:** las traducciones de nombres y lugares se equivocan fácil; la pareja revisa antes de aplicar.

### Fuera de esta ampliación (specs futuros)

- Spec 08: login con Firebase (correo y contraseña), propiedad de la boda y reglas de Firestore.
- Spec 09: brief de voz de la pareja reutilizado en todos los prompts.
- Spec 10: inglés en la invitación pública (selector de idioma, textos fijos, fechas, metadata) en las 3 plantillas.
- Aviso "El español cambió: retraducir" (v1.1) y auditoría de campos de un solo idioma (`timeline.location`, colores y recomendaciones de dress code, `coupleMessage`).

## Lo que **no** está en este spec

- ~~Traducción a inglés en Dress Code o en Lugares Recomendados.~~ (Incluida en la ampliación.)
- Campo `event.city` nuevo en el modelo de datos.
- Integración con una fuente de datos verificada de lugares reales (Google Places API u otra).
- Autenticación en los paneles de admin.
- Nivel 2 y 3 de Ola 1 (seguimiento de RSVP, resumen ejecutivo de invitados, distribución de mesas, onboarding conversacional, paleta de color por foto).
- Cualquier función de Ola 2 (chatbot de invitados, RSVP conversacional, traducción en vivo por invitado, recap post-boda).
- Resolver la duplicación de tipos `RecommendedPlace`/`RecommendedPlacesConfig` vs `AccommodationOption`.
- ~~Botón de IA para "Frase Especial".~~ (Solo "Traducir con IA" del campo EN, incluido en la ampliación.)

Cada uno de estos, si se decide hacer, va en su propio spec.
