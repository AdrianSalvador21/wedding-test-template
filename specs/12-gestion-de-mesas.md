# 12 — Gestión de mesas: Cuadrícula, Plano visual y objetos de salón

**Estado:** Approved
**Depende de:** SPEC 04, SPEC 11
**Fecha:** 2026-09-27

## Objetivo

Agregar al admin de cada boda un sistema de gestión de mesas que escale de pocas mesas a 100+: una vista de Cuadrícula con panel de asignación de invitados (arrastrar y soltar o botones) y una vista de Plano visual con zoom/pan donde las mesas y los objetos del salón (pista, barra, mesa principal) se colocan y editan libremente, ambas sobre los mismos datos por boda.

> **Diseño explorado (3 iteraciones, canvas validado con el usuario):** https://claude.ai/artifact/8uU2RPG1LqC2AQDGBim5md — Iteración 1: tablero Kanban por columnas (mesas = columnas), **descartada** porque no escala pasadas ~20-30 mesas (scroll horizontal infinito y todas las tarjetas de todas las mesas cargadas a la vez). Iteración 2: la alternativa elegida, Cuadrícula + panel de detalle (escritorio) y Plano con zoom/pan (escritorio). Iteración 3: ambas vistas en móvil (390px), incluida la hoja inferior del panel y el gesto de "mantener presionado" del Plano. Este spec implementa las iteraciones 2 y 3; la 1 queda documentada solo como referencia de por qué se descartó.

## Contexto

Estado real del código, revisado en esta sesión (no asumido):

**No existe gestión de mesas hoy.** El único rastro es `GuestInfo.table?: string` en `src/types/wedding.ts` (líneas ~325-338), un tipo paralelo usado solo en datos mock/demo (`src/data/mockInvitations.ts`) y completamente desconectado de Firestore. El modelo real, `FirebaseGuest` (mismo archivo), no tiene ningún campo de mesa.

**Admin actual** (relevante para este spec):

- `app/[locale]/admin/guests/[weddingId]/page.tsx` — dashboard de invitados: listado, alta/edición/borrado vía modal, filtros por estado RSVP, búsqueda, stats. Usa `services/guestService.ts` (clase `GuestService`, patrón CRUD claro: `getWeddingGuests`, `getGuest`, `createGuest`, `updateGuest`, `deleteGuest`, `getWeddingGuestStats`, más el helper privado `cleanUndefinedFields`). Este es el patrón que replican `tableService.ts` y `venueFixtureService.ts` de este spec.
- `components/admin/ui.tsx` — componentes reutilizables: `AdminTopBar`, `AdminPageNav` (hoy con 2 tabs: `active: 'editor' | 'guests'`), `AdminStatCard`, `AdminStatusPill`, `AdminButton`, `AdminCard`, tokens de color `A` (paleta "Dashboard Neutral") y `manrope`/`displayFont`.
- Stack: Next.js 14 (App Router, TS, Tailwind, next-intl `es`/`en`), Firebase/Firestore como única base de datos (sin ORM), Redux Toolkit existe pero el admin usa `useState` local, PostHog vía `lib/analytics/client.ts` (`track()`) desde el spec 11.
- `firestore.rules` hoy es permisivo (`allow read/write: if true`) para `weddings`, `guests` y `rsvp`/`rsvps` (inconsistencia preexistente, no se toca en este spec).
- `package.json` no tiene ninguna librería de drag-and-drop ni de canvas/nodos (ni `@dnd-kit/*`, `react-beautiful-dnd`, `react-dnd`, `konva`, `fabric` ni `reactflow`); ambas se agregan en este spec.

**Investigación de mercado** (RSVPify, Zola, WeddingWire, PerfectTablePlan, AllSeated, tableplan.io, Bodas.com.mx, Mi Webdding): el patrón universal es crear mesas con capacidad, asignar invitados desde una lista o un plano, y ver de un vistazo cuáles están llenas o vacías. Ningún competidor revisado resuelve bien el caso de 50-100 mesas con un tablero de columnas; los que manejan volumen grande separan "asignar" (lista/búsqueda) de "ver el layout físico" (plano), que es la misma separación que adopta este spec.

## Alcance

**Incluye:**

- Extensión no rompiente de `FirebaseGuest` con `tableId?: string | null`.
- Nueva colección Firestore `tables` (`FirebaseTable`: nombre, capacidad, forma decorativa, posición opcional en el Plano).
- Nueva colección Firestore `venueFixtures` (objetos del salón sin invitados ni capacidad: pista, barra, mesa principal, entrada, personalizado).
- `services/tableService.ts` y `services/venueFixtureService.ts` (mismo patrón CRUD que `guestService.ts`), método `assignGuestToTable` en `guestService.ts`, y un helper compartido `cleanUndefinedFields` (hoy duplicable) extraído a `lib/firestore-utils.ts`.
- Nueva ruta `app/[locale]/admin/tables/[weddingId]/page.tsx` con un conmutador de vista **Cuadrícula / Plano** (por defecto Cuadrícula, sin persistir la preferencia).
- Tercer tab "Mesas" en `AdminPageNav` (`components/admin/ui.tsx`), junto a "Editor de invitación" e "Invitados".
- **Vista Cuadrícula:** stats (`AdminStatCard`), buscador y filtros por estado de ocupación, tarjeta fija "Sin mesa", grid responsivo de tarjetas de mesa compactas (código de color por ocupación: vacía / con espacio / completa / excedida) y un panel de detalle (drawer en escritorio, hoja inferior en móvil) con dos listas acotadas — "En esta mesa" y "Sin mesa" (buscable) — sin importar cuántas mesas existan en total.
- Asignación de invitados en el panel por **arrastrar y soltar** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`; sensores de puntero, táctil y teclado) **y** por botones "+"/"×" como respaldo accesible; en móvil solo los botones (ver Decisiones).
- Bloqueo de capacidad: el botón "+" y el `drop` se deshabilitan cuando una mesa está en su capacidad máxima; reducir la capacidad de una mesa ya llena por debajo de sus asignados la deja "excedida" (visual, no bloqueante ni destructivo).
- Alta, edición y borrado de mesas (`TableFormModal`, `DeleteTableConfirmModal`) con cascada: borrar una mesa limpia `tableId` de sus invitados (vuelven a "Sin mesa") tras confirmar.
- **Vista Plano:** lienzo con `reactflow` (pan, zoom con controles +/-/ajustar a pantalla, minimapa), mesas y objetos de salón como nodos arrastrables con posición persistida (`posX`/`posY`), y una bandeja "Sin colocar" para los que aún no tienen posición.
- Objetos de salón editables: crear, renombrar, redimensionar y borrar directamente en el Plano.
- Clic/tap en un nodo del Plano abre el mismo panel de asignación de la Cuadrícula (un solo componente, sin lógica duplicada).
- Comportamiento móvil (390px): Cuadrícula en 2 columnas con la hoja inferior; Plano con gesto de "mantener presionado" (~400ms) para levantar y mover un nodo sin chocar con el pan de un dedo, controles de zoom de al menos 44×44px y botón "ajustar a pantalla".
- `firestore.rules`: bloques para `tables` y `venueFixtures` (mismo patrón permisivo que `guests`).
- Eventos de analítica (`lib/analytics/events.ts`, patrón spec 11, sin datos personales): `table_created`, `table_deleted`, `guest_assigned_to_table`, `fixture_created`, `fixture_deleted`, `plano_view_opened`.

**No incluye (queda para otra iteración):**

- Reglas de "sentar juntos/separados" y auto-acomodo algorítmico de invitados.
- Asiento por persona individual: la unidad de asignación sigue siendo la invitación/grupo (`FirebaseGuest.guestCount`), no cada persona.
- Exportar o imprimir el plano o la lista de mesas.
- Rotación de mesas u objetos de salón (solo rectángulos/círculos alineados a los ejes).
- Reordenar manualmente las tarjetas de la Cuadrícula (se ordenan por nombre/fecha de creación, igual que `getWeddingGuests` hoy).
- Persistir el nivel de zoom/scroll del Plano por boda (vive solo del lado del cliente; el Plano siempre abre en "ajustar a pantalla").
- Reglas de Firestore restrictivas por rol para las colecciones nuevas (se mantiene el mismo patrón permisivo que ya usa `guests`).

## Modelo de datos

```ts
// src/types/wedding.ts — extensión de FirebaseGuest (no rompiente, Firestore es schemaless)
export interface FirebaseGuest {
  // ...campos existentes sin cambios
  tableId?: string | null; // NUEVO — id de FirebaseTable; ausente o null = "Sin mesa"
}

// NUEVO
export interface FirebaseTable {
  id: string;
  weddingId: string;
  name: string;                 // "Mesa 1", "Mesa de Honor"
  capacity: number;
  shape?: 'round' | 'square' | 'rectangular' | 'imperial'; // decorativo (icono), no afecta la lógica de capacidad
  posX?: number;                 // posición en el Plano; ausente = "sin colocar" (aparece en la bandeja)
  posY?: number;
  createdAt: string;
  updatedAt: string;
}

// NUEVO — objetos del salón: sin invitados ni capacidad
export interface FirebaseVenueFixture {
  id: string;
  weddingId: string;
  type: 'dance_floor' | 'bar' | 'stage' | 'entrance' | 'custom';
  label: string;                // "Pista de baile", "Barra", o texto libre si type = 'custom'
  posX?: number;
  posY?: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}
```

Convenciones:

- **Personas a sentar por invitación**, igual que ya calcula `guestService.getWeddingGuestStats`: si `rsvpConfirmation?.attending === true`, usar `rsvpConfirmation.guestCount || 1` (confirmado real); si no, usar `guestCount` (estimado de la invitación).
- **Estado de ocupación de una mesa:** vacía (0 personas) · con espacio (0 < ocupado < capacidad) · completa (ocupado === capacidad) · excedida (ocupado > capacidad — solo alcanzable reduciendo la capacidad después de haber asignado gente, nunca agregando de más; ver Decisiones).
- **"Sin colocar" en el Plano** = `posX`/`posY` ausentes en `FirebaseTable`/`FirebaseVenueFixture`; se resuelve la primera vez que se arrastra desde la bandeja al lienzo.
- **Colecciones nuevas en Firestore:** `tables` y `venueFixtures`, nombradas en singular/plural consistente con `guests` (no repiten el bug preexistente `rsvp`/`rsvps` de las reglas actuales).

## Plan de implementación

1. **Tipos y datos base.** Extender `FirebaseGuest` con `tableId?: string | null` y agregar `FirebaseTable`/`FirebaseVenueFixture` en `src/types/wedding.ts`. Sin efecto visible. Prueba: `npm run build` compila.
2. **Reglas de Firestore.** Agregar bloques `tables` y `venueFixtures` a `firestore.rules` (mismo patrón `allow read/write: if true` que `guests`). Prueba: revisión manual de sintaxis (o `firebase deploy --only firestore:rules --dry-run` si está disponible).
3. **Servicio de mesas.** Crear `lib/firestore-utils.ts` con `cleanUndefinedFields` (extraído de `guestService.ts`, que pasa a importarlo) y `services/tableService.ts` con `getWeddingTables`, `getTable`, `createTable`, `updateTable`, `updateTablePosition`, `deleteTable` (cascada con `writeBatch`: limpia `tableId` de los invitados afectados antes de borrar el documento) y `getWeddingTableStats`. Sin efecto visible. Prueba manual: crear y borrar una mesa de prueba contra el proyecto de desarrollo de Firebase y confirmarlo en la consola de Firestore.
4. **Servicio de objetos de salón.** Crear `services/venueFixtureService.ts` con el mismo patrón (`getWeddingFixtures`, `createFixture`, `updateFixture`, `updateFixturePosition`, `deleteFixture`). Sin efecto visible.
5. **Asignación en el servicio de invitados.** Agregar `assignGuestToTable(guestId, tableId)` en `guestService.ts` (envuelve `updateGuest`); la validación de capacidad vive en el llamador (paso 11), no en el servicio. Sin efecto visible.
6. **Dependencias.** `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities reactflow`. Prueba: `npm run build` compila sin cambios de comportamiento.
7. **Navegación.** Ampliar `AdminPageNav` en `components/admin/ui.tsx` (`active: 'editor' | 'guests' | 'tables'`) con el tercer link "Mesas" → `/admin/tables/[weddingId]`; agregar el tono `full` a `AdminStatusPill`. Prueba manual: abrir Editor e Invitados de una boda existente y confirmar que el nuevo tab aparece sin romper los dos existentes (la ruta destino da 404 esperado hasta el paso 8).
8. **Esqueleto de la página y el conmutador de vista.** Crear `app/[locale]/admin/tables/[weddingId]/page.tsx`: carga `weddingData`, `guests` y `tables` en paralelo, estado `view: 'grid' | 'plano'` (por defecto `'grid'`, sin persistir), `AdminTopBar` + `AdminPageNav active="tables"` + el conmutador Cuadrícula/Plano. Prueba manual: la ruta abre, "Cuadrícula" aparece activa y el botón de Plano cambia el estado aunque su contenido esté vacío todavía.
9. **Vista Cuadrícula — tarjetas.** Crear `components/admin/tables/TableTile.tsx` (nombre, `ocupado/capacidad`, barra de ocupación, estado por color) y renderizar el grid con datos reales, más las stats (`AdminStatCard` x4: mesas creadas, invitados sin mesa, mesas en su límite, personas confirmadas) y la tarjeta fija "Sin mesa". Prueba manual: con mesas e invitados de prueba, los conteos y colores coinciden con los datos reales.
10. **Panel de detalle — lectura.** Crear `components/admin/tables/TableDetailPanel.tsx` (drawer en escritorio ≥768px, hoja inferior deslizable en móvil) con las dos listas ("En esta mesa" / "Sin mesa" con buscador) en modo solo lectura, abierto al hacer clic/tap en una tarjeta o en "Sin mesa". Prueba manual: abrir el panel de dos mesas distintas y de "Sin mesa" muestra las listas correctas en escritorio y en un viewport de 390px.
11. **Asignación — botones y bloqueo de capacidad.** Los botones "+"/"×" del panel llaman a `assignGuestToTable`; "+" se deshabilita (con tooltip) cuando la mesa está en su capacidad; reducir la capacidad de una mesa ya llena desde "Editar mesa" la deja "excedida" sin desasignar a nadie. Prueba manual: llenar una mesa hasta su capacidad y confirmar que "+" se deshabilita; luego reducir su capacidad y confirmar que queda excedida.
12. **Asignación — arrastrar y soltar (escritorio).** Envolver el panel con `DndContext` de `@dnd-kit` (sensores de puntero, táctil y teclado) para arrastrar una tarjeta de invitado entre "Sin mesa" y "En esta mesa"; soltar sobre una mesa llena no se acepta (mismo bloqueo del paso 11). Prueba manual: arrastrar con mouse y confirmar que Tab+Enter también reasigna (sensor de teclado).
13. **Nueva/editar/borrar mesa.** Crear `components/admin/tables/TableFormModal.tsx` (nombre, capacidad, forma) y `DeleteTableConfirmModal.tsx` (cuenta cuántos invitados quedarán "Sin mesa" y pide confirmación); conectar "+ Nueva mesa" y las acciones de cada tarjeta. Prueba manual: crear una mesa, asignarle invitados, borrarla y confirmar que esos invitados vuelven a "Sin mesa".
14. **Vista Plano — lienzo base.** Crear `components/admin/tables/PlanoCanvas.tsx` con `reactflow`: nodos personalizados `TableNode` y `FixtureNode` a partir de `tables`/`venueFixtures` con `posX`/`posY`; controles de zoom (+/-/ajustar a pantalla) y `MiniMap`; los sin posición aparecen en una bandeja lateral "Sin colocar". Prueba manual: con datos de prueba, el lienzo se ajusta a los nodos existentes y los de la bandeja no aparecen en el lienzo.
15. **Vista Plano — mover y persistir posición.** `onNodeDragStop` de `reactflow` llama a `updateTablePosition`/`updateFixturePosition` con las coordenadas finales; arrastrar un nodo desde la bandeja al lienzo le asigna posición inicial en el punto soltado. Prueba manual: mover una mesa, recargar la página y confirmar que quedó en el mismo lugar.
16. **Vista Plano — clic para asignar.** Un clic/tap en un `TableNode` abre el mismo `TableDetailPanel` de los pasos 10-12 (mismo componente, sin duplicar lógica). Prueba manual: asignar un invitado desde el Plano y confirmar que se refleja también en la Cuadrícula.
17. **Objetos de salón — CRUD visual.** Formulario para crear un objeto (tipo, etiqueta, ancho/alto), controladores de esquina para redimensionar un `FixtureNode` seleccionado, y acciones "Renombrar"/"Eliminar". Prueba manual: crear una "Pista", redimensionarla, renombrarla y borrarla; los cambios persisten al recargar.
18. **Móvil — gesto de mantener presionado.** En `PlanoCanvas`, distinguir en táctil: un toque simple selecciona/abre el panel; mantener presionado ~400ms "levanta" el nodo (escala y sombra) y habilita el arrastre; soltar sin haber mantenido presionado nunca mueve el nodo. Prueba manual con emulación táctil de Chrome DevTools: un toque corto abre el panel sin mover nada; mantener presionado y arrastrar reposiciona y persiste al soltar.
19. **Analítica.** Agregar a `lib/analytics/events.ts`: `table_created`, `table_deleted`, `guest_assigned_to_table`, `fixture_created`, `fixture_deleted`, `plano_view_opened` (todos `NoProps`, patrón spec 11); emitir cada uno en su acción correspondiente. Prueba manual: revisar en PostHog (o los logs de `track()`) que cada acción dispara su evento una sola vez.
20. **QA final y regresión.** `npm run build` sin errores nuevos; recorrer Editor → Invitados → Mesas de una boda existente confirmando que nada se rompió; probar Cuadrícula y Plano en 1440px, 768px y 390px.

## Criterios de aceptación

**Datos y servicios:**

- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos respecto al estado previo.
- [ ] Crear una mesa vía `tableService.createTable` la persiste en la colección `tables` con el `weddingId` correcto.
- [ ] Borrar una mesa con invitados asignados los deja con `tableId: null` (verificable en la consola de Firestore) antes de eliminar el documento de la mesa.
- [ ] Un invitado sin `tableId` aparece en "Sin mesa" en ambas vistas.

**Cuadrícula:**

- [ ] Las tarjetas de mesa muestran el color/estado correcto (vacía, con espacio, completa, excedida) según los invitados realmente asignados.
- [ ] El panel de detalle abre con las dos listas correctas al hacer clic en cualquier tarjeta o en "Sin mesa".
- [ ] Arrastrar un invitado de "Sin mesa" a "En esta mesa" (y viceversa) actualiza `tableId` en Firestore y refleja el cambio en las tarjetas sin recargar la página.
- [ ] El botón "+" (y el `drop`) se deshabilita cuando la mesa está en su capacidad máxima; el botón "×" sigue funcionando para quitar invitados de una mesa excedida.
- [ ] Reducir la capacidad de una mesa por debajo de sus invitados asignados la marca "excedida" sin quitar a nadie.
- [ ] Con 100 mesas de prueba, la Cuadrícula sigue respondiendo (scroll vertical, sin scroll horizontal) y el buscador encuentra una mesa o invitado por nombre.

**Plano:**

- [ ] Una mesa o un objeto sin `posX`/`posY` aparece en la bandeja "Sin colocar" y no en el lienzo.
- [ ] Arrastrar un nodo desde la bandeja al lienzo, o mover uno ya colocado, persiste su posición: recargar la página lo muestra en el mismo lugar.
- [ ] Los controles de zoom (+/-/ajustar a pantalla) y el minimapa funcionan sobre un plano con 40 o más nodos.
- [ ] Hacer clic en una mesa del Plano abre el mismo panel de asignación que en la Cuadrícula, y un cambio ahí se refleja también en la Cuadrícula.
- [ ] Crear, redimensionar, renombrar y borrar un objeto de salón (pista/barra/etc.) persiste cada cambio.

**Móvil (viewport 390px):**

- [ ] La Cuadrícula se ve en 2 columnas con scroll vertical; el panel de detalle abre como hoja inferior deslizable.
- [ ] En el Plano, un toque corto sobre un nodo abre el panel sin moverlo; solo mantener presionado y arrastrar reposiciona el nodo.
- [ ] Los controles de zoom del Plano miden al menos 44×44px.

**Analítica:**

- [ ] `table_created`, `table_deleted`, `guest_assigned_to_table`, `fixture_created`, `fixture_deleted` y `plano_view_opened` se emiten una vez por acción correspondiente.

## Decisiones tomadas y descartadas

- **Sí: un solo spec para Cuadrícula + Plano.** Decisión explícita del usuario tras diseñar ambas vistas juntas en el mismo canvas; el riesgo de tamaño queda documentado abajo, pero la Cuadrícula (pasos 1-13) es una feature completa y usable por sí sola si el trabajo se corta a la mitad.
- **Sí: unidad de asignación = invitación/grupo, no persona individual.** `FirebaseGuest.guestCount` ya agrupa al invitado principal y su(s) acompañante(s); modelar el asiento por persona exigiría rediseñar el RSVP, fuera de alcance.
- **Sí: Cuadrícula + panel de detalle en vez de un Kanban de columnas por mesa.** La primera iteración de diseño (columnas lado a lado, una por mesa) se descartó: con 50-100 mesas el scroll horizontal y cargar todas las tarjetas de todas las mesas a la vez no escalan. La Cuadrícula pagina visualmente con scroll vertical, y el panel de detalle acota el trabajo real de asignar a dos listas sin importar cuántas mesas existan.
- **Sí: `reactflow` para el Plano.** Da pan/zoom, arrastre de nodos y minimapa de fábrica. **No:** un canvas propio con Konva/Fabric, que hubiera significado reimplementar todo eso a mano.
- **Sí: arrastrar y soltar (`@dnd-kit`) además de los botones +/× en el panel, en escritorio.** Decisión explícita del usuario. `@dnd-kit` se eligió sobre `react-beautiful-dnd` (archivado desde 2022, conflictos con `StrictMode`) y sobre `react-dnd` (sin soporte táctil nativo, exige un backend aparte).
- **Sí: en móvil, el panel de asignación usa solo los botones +/×, no arrastre.** Arrastrar tarjetas pequeñas de invitado con el dedo entre dos listas dentro de una hoja inferior es impreciso; los botones son la interacción principal en pantallas táctiles chicas. `@dnd-kit` sigue activo en puntero/mouse y teclado.
- **Sí: bloquear el botón "+"/el `drop` al llegar a la capacidad, en vez de solo marcar "excedida".** Decisión explícita del usuario. Una mesa solo queda "excedida" si su capacidad se reduce después de haber asignado gente — es aviso de un cambio del organizador, no el resultado de agregar de más.
- **Sí: `venueFixtures` como colección separada de `tables`.** Los objetos de salón (pista, barra, mesa principal) no tienen capacidad ni invitados; mezclarlos en `tables` obligaría a que esos campos fueran opcionales en todos lados y a filtrar por tipo en cada consulta.
- **Sí: el gesto de "mantener presionado" para mover en móvil.** Un arrastre de un dedo sobre el lienzo debe poder ser panorámica sin mover nada por accidente; "mantener presionado para levantar" es el patrón estándar de editores tipo mapa y evita esa ambigüedad sin necesitar un nivel mínimo de zoom.
- **No: persistir el zoom/scroll del Plano en Firestore.** Es una preferencia de visualización, no un dato compartido importante; guardarla en cada pan/zoom generaría escrituras innecesarias. El Plano siempre abre en "ajustar a pantalla".
- **No: reglas de "sentar juntos/separados", auto-acomodo, exportar/imprimir, ni rotación de mesas/objetos.** Quedan para otra iteración si se necesitan; no estaban en el alcance validado en el diseño.
- **No: reglas de Firestore restrictivas por rol para `tables`/`venueFixtures`.** Se mantiene el mismo patrón permisivo (`allow read/write: if true`) que ya usa `guests`; endurecer las reglas es un cambio transversal a todo el proyecto, no de esta feature.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El spec es grande (20 pasos, dos librerías nuevas) y podría quedar a medias | El plan numera cada paso para que sea "commiteable" por separado; si se corta a mitad de camino, la Cuadrícula (pasos 1-13) ya es una feature completa y usable sin el Plano |
| `reactflow` agrega peso al bundle del admin | Es una ruta propia (`/admin/tables/...`) que no se carga desde la landing ni desde las invitaciones públicas; no afecta el rendimiento medido en el spec 10 |
| El gesto de "mantener presionado" se siente distinto entre iOS Safari y Android Chrome | Probar en ambos motores reales antes de cerrar el paso 18; la emulación táctil de DevTools no reemplaza la prueba en dispositivo |
| Con 100+ mesas, `getWeddingTables`/`getWeddingGuests` sin `orderBy` combinado traen toda la colección en cada carga | Aceptado por ahora (mismo patrón que `guestService` ya usa hoy); si el tiempo de carga se vuelve un problema, se pagina en una iteración futura |
| `@dnd-kit` (panel) y el arrastre nativo de `reactflow` (lienzo) conviven en la misma página sin interferirse | Cada uno vive en un árbol de componentes separado (panel vs. lienzo) y solo uno está montado a la vez según la vista activa |

## Lo que **no** está en este spec

- Reglas de "sentar juntos/separados" y auto-acomodo algorítmico de invitados.
- Asiento por persona individual (la unidad sigue siendo la invitación/grupo).
- Exportar o imprimir el plano o la lista de mesas.
- Rotación de mesas u objetos de salón.
- Reordenar manualmente las tarjetas de la Cuadrícula.
- Persistencia del zoom/scroll del Plano por boda.
- Reglas de Firestore restrictivas por rol.

Cada uno de estos, si se decide hacer, va en su propio spec.
