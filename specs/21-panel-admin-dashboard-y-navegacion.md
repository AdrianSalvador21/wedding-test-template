# 21 — Panel admin: sidebar unificado, Dashboard y Confirmaciones funcional

**Estado:** Approved
**Depende de:** SPEC 04, SPEC 08, SPEC 12, SPEC 17
**Fecha:** 2026-10-01

## Objetivo

Introducir un panel de administración nuevo en paralelo (`/admin/panel/[weddingId]/...`) con sidebar y topbar persistentes que no se recargan al navegar entre secciones, un Dashboard nuevo con datos reales (confirmaciones, mesas, restricciones alimenticias, cuenta regresiva) y una pantalla de Confirmaciones funcional (hoy rota/incompleta), migrando Editor/Invitados/Mesas a un layout compartido que centraliza el fetch de `weddingData`/invitados/mesas, dejando intacto el flujo de rutas actual (`wedding-editor`, `guests`, `confirmations`, `tables`) como respaldo sin tocar.

## Contexto

Revisión del código real hecha antes de este spec:

- Hoy no existe un shell de navegación persistente. `wedding-editor`, `guests` y `tables` navegan entre sí con `AdminPageNav` (`components/admin/ui.tsx`) — una barra horizontal de tabs, no un sidebar. `admin/confirmations/[weddingId]` ni siquiera usa esa barra (decisión explícita del spec 04, quedó aparte). Cada ruta es un `page.tsx` independiente con su propio `fetch`/`getDoc`: Next.js no recarga el navegador al navegar entre ellas, pero sí vuelve a pedir los datos a Firestore cada vez.
- `wedding-editor/[weddingId]/page.tsx` ya tiene su propio sidebar interno (`AdminSidebarNavItem`, spec 04) para navegar entre las 9 secciones del formulario (Pareja, Evento, Lugares, Cronograma, Hoteles Recomendados, Lugares Recomendados, Regalos, Social, Configuración), con `isSectionComplete`/`isAllSectionsComplete` ya calculando la barra de progreso. Ese sidebar interno no cambia.
- No existe "Dashboard" en el código. No existe "Rondas de confirmación" (reenvío de invitaciones por WhatsApp/Email con tracking de entrega/apertura) ni el concepto de "alergia": `services/guestService.ts` solo modela `rsvpStatus: 'pending' | 'confirmed' | 'declined'` por invitado, y `guest.rsvpConfirmation?.dietaryRestriction` (`'vegetarian' | 'glutenFree' | 'other'`), visible solo si `weddingData.hasDiet` está activo.
- `admin/confirmations/[weddingId]/page.tsx` existe pero usa una fuente de datos distinta y más pobre: `rsvpService.getWeddingRSVPs` (colección `FirebaseRSVP`, solo respuestas recibidas por el formulario público), con estadísticas limitadas a `total`/`attending`/`notAttending`. No refleja invitados pendientes reales ni el conteo de personas que sí calcula `guestService` (usado hoy en `guests/[weddingId]/page.tsx`: `stats.total`, `stats.confirmed`, `stats.pending`, `stats.totalGuestCount`, `stats.totalConfirmedPersons`, renderizados como 5 `AdminStatCard`).
- `services/tableService.ts` ya calcula `seatedGuests`/`unseatedGuests` y ocupación por mesa (`capacity` vs. invitados sentados) — reutilizable tal cual para la tarjeta de mesas del Dashboard.
- Una propuesta visual (imagen de referencia de otro producto, "Confirmando") mostraba además un ítem "Control de acceso" y una tarjeta "Rondas de confirmación" con canales (WhatsApp/Email), tracking de entrega/apertura y límites por plan — ninguno de los dos tiene datos ni lógica detrás en este código. Decisión explícita del usuario: **ambos quedan fuera de este spec por completo** (ni siquiera como placeholder).
- Validado en un canvas de diseño (claude.ai Artifact, `https://claude.ai/artifact/TtdzhAQgARUpYJ26ADGAhM`) con 4 artboards: Dashboard, Confirmaciones, Editor (mostrando el sidebar global + el sidebar interno de 9 secciones conviviendo) y la versión móvil con el sidebar como drawer. Los tres artboards de escritorio son un prototipo navegable real (el sidebar de cada uno enlaza a los otros).

Decisiones ya cerradas con el usuario antes de escribir este spec:

- Un solo spec (no se divide en "navegación" + "dashboard").
- Arquitectura: layout compartido de Next.js, pero como **ruta nueva en paralelo** (`/admin/panel/[weddingId]/...`), sin tocar ni borrar ninguna de las 4 rutas legacy — si el panel nuevo falla, el staff puede seguir usando las URLs de siempre.
- El sidebar nuevo reemplaza a `AdminPageNav`, pero **solo dentro del árbol de rutas nuevo**; `AdminPageNav` sigue existiendo tal cual para las rutas legacy.
- El sidebar global y el sidebar interno del editor conviven anidados (no se aplanan las 9 secciones en el sidebar global).
- Confirmaciones pasa a ser una pantalla de estadísticas con datos reales de `guestService` (no `rsvpService`), y las 5 tarjetas de estadística que hoy están en Invitados se mueven ahí (se quitan de la vista de Invitados del panel nuevo).

## Alcance

**Incluye:**

- Nuevo `app/[locale]/admin/panel/[weddingId]/layout.tsx`: envuelve con `AuthGuard` (reutilizado, no se modifica), hace un único fetch en paralelo de `weddingData` (mismo mecanismo que usa hoy `wedding-editor`), invitados (`guestService.getWeddingGuests`) y mesas (`tableService`), y expone esos tres recursos más una función de refetch a través de un Context (`PanelDataContext`) para que las páginas hijas no vuelvan a pedirlos. Monta el shell visual (sidebar + topbar) alrededor de `{children}`; sin `weddingId` válido o con error de carga, reutiliza `WeddingNotFound` (componente ya existente, sin modificarlo) en vez de duplicar un estado de error.
- `components/admin/panel/ui.tsx` (archivo nuevo, no se toca `components/admin/ui.tsx` existente): `PanelSidebar` (5 ítems — Dashboard, Editor de invitación, Invitados, Confirmaciones, Mesas — con icono + label, resalta la sección activa, selector de evento arriba, cuenta de usuario abajo reutilizando el `AccountControls` ya existente) y `PanelTopBar` (encabezado simple, sin buscador ni campana de notificaciones — ver Decisiones). En móvil (`<768px`) el sidebar se oculta por defecto y se abre como drawer con un botón de menú en el topbar.
- Selector de evento en el sidebar: dropdown con las bodas vinculadas a la cuenta (reutiliza `useAuth()`/`linkedWeddings`, igual que resuelve hoy "Mis invitaciones"); se oculta por completo si la cuenta solo tiene una boda.
- `app/[locale]/admin/panel/[weddingId]/dashboard/page.tsx` (nuevo): header con nombre de la pareja, pill de estado (Activa/Borrador, mismo dato que ya existe en `weddingData.status`/`isActive`), fecha y lugar del evento, countdown de días hasta `event.date`; y 3 tarjetas con datos reales:
  - **Confirmaciones**: % y conteo confirmados/pendientes/declinados desde `guestService` (mismos campos que ya calcula `guests/[weddingId]/page.tsx`), enlaza a Confirmaciones.
  - **Asignación de mesas**: sentados/total y lugares libres desde `tableService` (mismos campos que ya calcula `tables/[weddingId]/page.tsx`).
  - **Restricciones alimenticias**: conteo de invitados confirmados con `rsvpConfirmation.dietaryRestriction` distinto de vacío, desglosado por tipo (`vegetarian`/`glutenFree`/`other`); si `weddingData.hasDiet` es `false`, la tarjeta muestra un estado vacío explícito ("Esta boda no pregunta restricciones alimenticias") en vez de un cero sin contexto.
- `app/[locale]/admin/panel/[weddingId]/confirmations/page.tsx` (nuevo, reemplaza funcionalmente a `admin/confirmations/[weddingId]` solo dentro del panel nuevo): las 5 `AdminStatCard` que hoy están en Invitados (Total invitaciones, Confirmadas, Pendientes, Personas invitadas, Personas confirmadas), un resumen con barra segmentada (confirmados/pendientes/declinados, % de cada uno) y una lista de invitados filtrable por estado (reutiliza los mismos datos/handlers que ya existen en `guests/[weddingId]/page.tsx` para filtro y orden, sin el formulario de alta/edición). Fuente de datos: `guestService`, no `rsvpService`. Sin ninguna sección de "Rondas".
- `app/[locale]/admin/panel/[weddingId]/editor/page.tsx` (nuevo): migra el contenido y la lógica de `wedding-editor/[weddingId]/page.tsx` tal cual (mismos `useState`, `onChange`, validación, `isSectionComplete`/`isAllSectionsComplete`, botón único "Guardar cambios" que escribe todo `WeddingData`), leyendo `weddingData` desde `PanelDataContext` en vez de su propio `getDoc`. Conserva su sidebar interno de 9 secciones (`AdminSidebarNavItem`, sin cambios) anidado dentro del área de contenido, debajo del sidebar global.
- `app/[locale]/admin/panel/[weddingId]/guests/page.tsx` (nuevo): migra la tabla/tarjetas de invitados, filtros, búsqueda, orden y el modal de crear/editar de `guests/[weddingId]/page.tsx` tal cual, leyendo invitados desde `PanelDataContext`, **sin** las 5 `AdminStatCard` (movidas a Confirmaciones).
- `app/[locale]/admin/panel/[weddingId]/tables/page.tsx` (nuevo): migra la vista de mesas (cuadrícula/plano) de `tables/[weddingId]/page.tsx` tal cual, leyendo mesas/invitados desde `PanelDataContext`.
- `app/[locale]/admin/page.tsx` ("Mis invitaciones"): los enlaces de cada boda (`WeddingCard`) apuntan a `/admin/panel/[weddingId]/dashboard` como entrada por defecto, en vez de a `wedding-editor`.
- Verificación manual de las 5 pantallas del panel nuevo en escritorio y móvil, y de que las 4 rutas legacy siguen funcionando sin cambios.

**No incluye:**

- "Control de acceso" — no se agrega ningún ítem al sidebar ni página relacionada; decisión explícita del usuario, no existe la feature detrás (ni check-in, ni QR). Si se define en el futuro, es un spec aparte.
- "Rondas de confirmación" — ni la funcionalidad real (envío por WhatsApp/Email, tracking de entrega/apertura, límites por plan) ni un placeholder visual. Decisión explícita del usuario: queda diferido por completo.
- No se modifica ni se elimina ninguna de las 4 rutas legacy: `app/[locale]/admin/wedding-editor/[weddingId]/page.tsx`, `app/[locale]/admin/guests/[weddingId]/page.tsx`, `app/[locale]/admin/confirmations/[weddingId]/page.tsx`, `app/[locale]/admin/tables/[weddingId]/page.tsx`. Tampoco se modifica `components/admin/ui.tsx` ni `AdminPageNav` (siguen usándose tal cual en esas 4 rutas).
- No se agrega buscador funcional ni centro de notificaciones en el topbar — ver Decisiones.
- No se agrega ningún campo nuevo a `WeddingData`, `FirebaseGuest` ni ninguna estructura persistida (ver Modelo de datos).
- No se cambia el mecanismo de guardado del editor (un único botón que escribe todo `WeddingData` a la vez).
- No se fusiona `rsvpService`/`FirebaseRSVP` con `guestService`; la ruta legacy de Confirmaciones sigue leyendo `rsvpService` exactamente igual que hoy, sin tocarse.
- No se agrega internacionalización (`next-intl`) al panel; sigue siendo solo en español, igual que hoy.
- No se borran archivos existentes ni se renombra ninguna ruta actual.

## Modelo de datos

No se introducen campos nuevos en `WeddingData`, `FirebaseGuest` ni ninguna estructura persistida en Firestore. Todo el contenido nuevo (Dashboard, Confirmaciones) se deriva en el cliente de datos que `guestService` y `tableService` ya exponen hoy.

```ts
// Contexto nuevo, solo en memoria del cliente — no persiste nada
// components/admin/panel/PanelDataContext.tsx (o ubicación equivalente)
interface PanelData {
  weddingData: WeddingData | null;
  guests: FirebaseGuest[];
  tables: Table[]; // tipo ya existente en tableService
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

Convenciones:

- Las estadísticas de Confirmaciones y la tarjeta de Confirmaciones del Dashboard se calculan con la misma lógica que ya usa `guests/[weddingId]/page.tsx` (`stats.total`, `stats.confirmed`, `stats.pending`, `stats.declined`, `stats.totalGuestCount`, `stats.totalConfirmedPersons`) — no se reimplementa el cálculo, se extrae a una función compartida o se reutiliza tal cual sobre `guests` del contexto.
- La tarjeta de Mesas se calcula con la misma lógica que ya usa `tables/[weddingId]/page.tsx` (`seatedGuests`, `unseatedGuests`, ocupación por mesa vs. `capacity`).
- La tarjeta de Restricciones alimenticias es cálculo nuevo pero sobre datos existentes: `guests.filter(g => resuelveEstado(g) === 'confirmed' && g.rsvpConfirmation?.dietaryRestriction)`, agrupado por valor de `dietaryRestriction`. No existe un campo "alergia" separado — la tarjeta se llama "Restricciones alimenticias", no "Restricciones y alergias".

## Plan de implementación

**Bloque A — Infraestructura compartida**

1. Crear `app/[locale]/admin/panel/[weddingId]/layout.tsx` con `AuthGuard`, el fetch único en paralelo (`weddingData`/`guests`/`tables`) y `PanelDataContext`. Aún sin página hija real debajo (o una página vacía de prueba). Verificación: la ruta compila y el fetch único se confirma en las DevTools (Network), sin tocar ninguna ruta legacy.
2. Crear `components/admin/panel/ui.tsx` con `PanelSidebar` y `PanelTopBar` (tokens de `components/admin/ui.tsx` reutilizados por import, no duplicados). Montar ambos en el `layout.tsx` del paso 1. Verificación: el shell visual aparece alrededor de la página de prueba, con los 5 ítems del sidebar y el selector de evento condicional.

**Bloque B — Dashboard**

3. Crear `app/[locale]/admin/panel/[weddingId]/dashboard/page.tsx`: header con countdown y datos del evento, más las 3 tarjetas (Confirmaciones, Mesas, Restricciones) calculadas desde `PanelDataContext`. Verificación manual con una boda real que tenga invitados y mesas cargados: los números coinciden con lo que hoy muestran `guests`/`tables` legacy para la misma boda.

**Bloque C — Confirmaciones**

4. Crear `app/[locale]/admin/panel/[weddingId]/confirmations/page.tsx`: las 5 `AdminStatCard`, el resumen segmentado y la lista filtrable de invitados, sobre `guestService`/`PanelDataContext`. Verificación manual: los conteos coinciden con los de la tarjeta de Confirmaciones del Dashboard y con `guests/[weddingId]` legacy.
5. En `app/[locale]/admin/panel/[weddingId]/guests/page.tsx` (ruta nueva, no la legacy): quitar las 5 `AdminStatCard` de la vista (quedan solo en Confirmaciones).

**Bloque D — Editor, Invitados y Mesas migrados**

6. Crear `app/[locale]/admin/panel/[weddingId]/editor/page.tsx` migrando la lógica de `wedding-editor/[weddingId]/page.tsx`, con su sidebar interno de 9 secciones intacto, leyendo `weddingData` del contexto. Verificación manual: editar un campo y confirmar que "Guardar cambios" lo persiste en Firestore igual que en la ruta legacy.
7. Crear `app/[locale]/admin/panel/[weddingId]/guests/page.tsx` (contenido de la tabla, del paso 5) migrando filtros, búsqueda, orden y el modal de crear/editar de `guests/[weddingId]/page.tsx`, leyendo invitados del contexto. Verificación manual: crear/editar un invitado de prueba y confirmar que `guestService` lo persiste igual que en la ruta legacy.
8. Crear `app/[locale]/admin/panel/[weddingId]/tables/page.tsx` migrando la vista de mesas (cuadrícula/plano) de `tables/[weddingId]/page.tsx`, leyendo mesas/invitados del contexto.

**Bloque E — Entrada y cierre**

9. Actualizar `app/[locale]/admin/page.tsx`: los enlaces de `WeddingCard` apuntan a `/admin/panel/[weddingId]/dashboard`.
10. Verificación manual cruzada: navegar entre las 5 secciones del panel nuevo confirma que el sidebar/topbar no se desmontan (solo cambia el contenido) y que no hay nuevas llamadas a Firestore por `weddingData`/`guests`/`tables` al cambiar de sección; probar el drawer móvil; confirmar que las 4 rutas legacy siguen funcionando igual que antes de este spec tecleando sus URLs directamente.
11. `npm run build` (o `tsc --noEmit`) sin nuevos errores de tipos respecto al estado previo.

## Criterios de aceptación

- [ ] `/admin/panel/[weddingId]/dashboard`, `/editor`, `/guests`, `/confirmations` y `/tables` existen y comparten el mismo `layout.tsx`, con sidebar y topbar que no se desmontan al navegar entre ellas.
- [ ] El layout centraliza el fetch de `weddingData`/invitados/mesas una sola vez — navegar entre las 5 secciones no dispara nuevas llamadas a Firestore para esos tres recursos (verificable en Network de DevTools).
- [ ] El sidebar muestra 5 ítems (Dashboard, Editor de invitación, Invitados, Confirmaciones, Mesas), resalta la sección activa, y en viewport <768px se abre/cierra como drawer con un botón de menú en el topbar.
- [ ] El selector de evento aparece en el topbar/sidebar solo cuando la cuenta tiene más de una boda vinculada.
- [ ] El Dashboard muestra countdown real (días hasta `event.date`) y 3 tarjetas con datos reales (Confirmaciones, Mesas, Restricciones alimenticias) que coinciden con los números de `guests`/`tables`; no existe ninguna tarjeta ni sección de "Rondas" ni ítem "Control de acceso" en ninguna parte del panel nuevo.
- [ ] Confirmaciones (ruta nueva) muestra las 5 estadísticas movidas desde Invitados, calculadas con `guestService` (no `rsvpService`), más un resumen segmentado y una lista de invitados filtrable por estado.
- [ ] Dentro del panel nuevo, Invitados ya no muestra las 5 tarjetas de estadística; conserva tabla, filtros, búsqueda, orden y el modal de crear/editar sin cambios de comportamiento respecto a la lógica legacy.
- [ ] El Editor dentro del panel nuevo conserva su sidebar interno de 9 secciones, la barra de progreso y el guardado a Firestore sin cambios de comportamiento.
- [ ] Ninguna de las 4 rutas legacy (`wedding-editor`, `guests`, `confirmations`, `tables` fuera de `/admin/panel/`) fue modificada ni eliminada — siguen accesibles y funcionando igual que antes de este spec.
- [ ] "Mis invitaciones" enlaza a `/admin/panel/[weddingId]/dashboard` como entrada por defecto para cada boda.
- [ ] `npm run build` (o `tsc --noEmit`) no introduce nuevos errores de tipos respecto al estado previo.
- [ ] Visitar las 5 pantallas del panel nuevo en escritorio y móvil no muestra errores de consola.

## Decisiones tomadas y descartadas

- **Un solo spec, no dividido en "navegación" + "dashboard"**: decisión explícita del usuario — se acepta un plan de implementación más largo en bloques en vez de dos documentos.
- **Ruta nueva en paralelo (`/admin/panel/[weddingId]/...`) en vez de reusar las URLs actuales con un flag**: decisión explícita del usuario — si el panel nuevo falla, el staff puede seguir usando las 4 rutas de siempre sin ningún cambio de comportamiento ahí. Costo aceptado: duplicación temporal de los componentes de página (Editor/Invitados/Mesas existen dos veces) hasta que se decida retirar las rutas legacy en un spec futuro.
- **Layout compartido de Next.js con fetch centralizado, no solo un sidebar visual compartido**: decisión explícita del usuario — es la única forma real de eliminar las recargas de datos al navegar, no solo la sensación visual de recarga.
- **"Control de acceso" fuera de alcance por completo (ni placeholder)**: decisión explícita del usuario — no existe la feature detrás (check-in de invitados, QR, etc.); se define en un spec futuro si se decide construirla.
- **"Rondas de confirmación" fuera de alcance por completo**: la referencia visual implicaba envío de invitaciones por WhatsApp/Email con tracking de entrega/apertura y límites por plan — ninguno de esos datos ni esa lógica existe hoy. Construirlo habría expandido este spec a una feature de mensajería completa; se deja para un spec dedicado.
- **Confirmaciones usa `guestService`, no `rsvpService`**: decisión explícita del usuario — `guestService` ya tiene conteos más completos (incluye pendientes reales, no solo respuestas recibidas) y es la misma fuente que ya usa Invitados, evitando que Dashboard/Confirmaciones/Invitados muestren números distintos para el mismo concepto.
- **Las 5 tarjetas de estadística se mueven de Invitados a Confirmaciones (no se duplican) — pero solo dentro del panel nuevo**: decisión explícita del usuario. La ruta legacy `guests/[weddingId]` no se toca, así que conserva sus tarjetas tal cual; la duplicación entre "panel nuevo sin tarjetas" y "legacy con tarjetas" es aceptada como parte del costo de mantener el legacy intacto.
- **Editor con sidebar anidado (global + interno de 9 secciones), no aplanado**: decisión explícita del usuario — menor cambio al editor ya construido (spec 04); el sidebar global resuelve navegación ENTRE módulos, el interno resuelve navegación DENTRO del editor.
- **Sidebar móvil como drawer, no barra inferior fija**: decisión explícita del usuario, siguiendo el patrón ya usado para el menú compacto de `AdminPageNav` (spec 08).
- **Selector de evento condicional (solo con >1 boda vinculada)**: evita mostrar un control sin utilidad a la mayoría de las cuentas (una boda = un correo), reutilizando `linkedWeddings` de `auth-context` (spec 17) en vez de construir una fuente de datos nueva.
- **Sin buscador funcional ni campana de notificaciones en el topbar**: la imagen de referencia los mostraba, pero no hay ni un backend de notificaciones ni un índice de búsqueda cruzada (invitados/mesas/configuración) detrás. Se prefiere omitirlos a mostrar controles que no hacen nada — quedan para specs futuros si se construye esa funcionalidad real.
- **Restricciones alimenticias, no "Restricciones y alergias"**: el modelo de datos solo tiene `dietaryRestriction` (vegetariano/sin gluten/otro); no existe un campo de alergia independiente, así que el nombre de la tarjeta no promete un dato que no existe.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| La ruta legacy de Confirmaciones (`rsvpService`) y la nueva (`guestService`) pueden mostrar números distintos para la misma boda, confundiendo al staff si usan ambas. | Se documenta explícitamente en este spec; no se fusionan ni se enlazan entre sí — el panel nuevo no referencia la ruta legacy de Confirmaciones en ningún lado. |
| Con `weddingId` inválido o error de carga, las 5 páginas del panel nuevo dependen todas del mismo `layout.tsx` — un fallo ahí tira las 5 a la vez. | Se reutiliza `WeddingNotFound` (ya probado en producción vía `guests/[weddingId]`) como estado de error del layout, en vez de construir uno nuevo. |
| Duplicar Editor/Invitados/Mesas (ruta nueva + legacy) puede desincronizarse si una futura corrección de bug se aplica solo en una de las dos copias. | Riesgo aceptado explícitamente por el usuario como costo de mantener el legacy intacto; se documenta aquí para que quien retire las rutas legacy en un spec futuro sepa que debe verificar que ambas copias llegaron a converger primero. |
