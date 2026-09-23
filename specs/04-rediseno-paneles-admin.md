# 04 — Rediseño de los paneles de administración (editor de invitación y gestión de invitados)

**Estado:** Approved
**Depende de:** 03-rediseno-landing
**Fecha:** 2026-09-23

## Objetivo

Aplicar a `app/[locale]/admin/wedding-editor/[weddingId]/page.tsx`, `app/[locale]/admin/guests/[weddingId]/page.tsx` y `app/[locale]/admin/confirmations/[weddingId]/page.tsx` un sistema visual de panel de administración — con los cambios estructurales de layout ya explorados en el canvas de Design "Rediseño Panel Admin e Invitados — Invyta" (`https://claude.ai/artifact/6cPLWg1kchh3jrV4kmf2Qf`: sidebar de navegación en escritorio, barra de guardado fija en móvil, tabla real de invitados en escritorio) — sin tocar la lógica de datos, validación ni las llamadas a Firebase ya existentes en las tres páginas.

**Actualización de paleta (post-implementación inicial):** la primera implementación de este spec usó los tokens "Romance Editorial" de la landing (`#FBF7F1` ivory, `#211D19` charcoal, `#C6663C` terracota, serif Fraunces en títulos), tal como describía el resto de esta sección originalmente. Al revisar el resultado, el usuario pidió una segunda propuesta ("Dashboard Neutral": blanco/negro/grises, sin serif) porque la calidez de "Romance Editorial" — correcta para la landing y las invitaciones — hacía que las páginas de trabajo (formularios densos, tablas) se sintieran como una invitación en vez de una herramienta. Se exploró la alternativa en el mismo canvas (artboards `MainNeutral.dc.html`/`GuestsNeutral.dc.html`) y, tras aprobarla, **se reemplazó por completo la paleta de `components/admin/ui.tsx`** por los tokens neutros (ver tabla actualizada en Alcance). El resto del spec — estructura, campos, lógica, criterios de aceptación — no cambia; solo cambian los valores de color/tipografía/radio. Se aprovechó además para corregir un bug real detectado en la implementación: la barra "invyta" del navbar vivía en un contenedor `max-w-7xl mx-auto` mientras el título de la página debajo era de ancho completo, desalineándose en pantallas anchas — ambos ahora comparten el mismo padding horizontal sin contenedor centrado.

## Contexto

Revisión del código real hecha antes de este spec (no asumida):

- `wedding-editor/[weddingId]/page.tsx` (2078 líneas) tiene hoy una fila de tabs horizontales con scroll (`activeTab`, línea 283), duplicada para escritorio (`hidden md:flex`, línea 645) y móvil (`flex ... overflow-x-auto scrollbar-hide`, línea 673), con 9 secciones: `couple`, `event`, `venues`, `timeline`, `accommodation` ("Hoteles Recomendados"), `recommendedPlaces` ("Lugares Recomendados"), `gifts`, `social`, `settings` (líneas 513-521). El guardado es un único botón "Guardar Cambios" que escribe todo `WeddingData` — no se toca ese mecanismo.
- **Corrección hecha durante la implementación (no se detectó al escribir este spec):** el archivo ya tiene `isSectionComplete(section)` (líneas 418-503) e `isAllSectionsComplete()` (líneas 506-509) — completitud real calculada por sección, ya conectada hoy a los checks de los tabs actuales (desktop y móvil) y al badge "Completado" del header. Sus reglas son más estrictas que las que se habían propuesto en la sección Datos original de este spec (p. ej. `gifts` exige `giftRegistry.enabled` **y** al menos una tienda con `name`+`url` o una cuenta bancaria completa, no solo `enabled`; `social` exige hashtag **y** al menos una red social o `coupleEmail`, no solo hashtag; `settings` depende de `adultOnlyEvent`, no es siempre `true`). Se decidió con el usuario **reusar `isSectionComplete`/`isAllSectionsComplete` tal cual** en vez de reemplazarlas por reglas nuevas — ver sección Datos actualizada.
- `guests/[weddingId]/page.tsx` (1045 líneas) ya tiene: estadísticas (`total`, `confirmed`, `declined`, `pending`, `totalGuestCount`, `totalConfirmedPersons`), filtro por estado (`all`/`confirmed`/`declined`/`pending`, coincide 1:1 con los 4 chips del mockup), orden por columna (`sortBy`/`sortOrder`), y un **modal real** (`showForm`, `fixed inset-0 z-50`, línea 850) para crear/editar invitado con los campos `name`, `email`, `phone`, `guestCount`, `language`, `coupleMessage` — no es un panel inline, ya es un modal; solo se reestiliza. También existe un segundo modal para ver el mensaje de RSVP de un invitado (`showMessageModal`, línea 1003) que este spec también reestiliza por consistencia visual, aunque no se mencionó explícitamente en el Alcance original.
- **Corrección hecha durante la implementación:** a diferencia de lo que decía `ADMIN_SYSTEM.md` (desactualizado), la página **no tiene buscador** — no existe ningún `searchTerm` ni input de búsqueda en el código real, solo filtro por estado y orden. Tampoco es "un único layout de tarjetas": ya es una **tabla real** (`<table>`, línea 667) con scroll horizontal en pantallas angostas (`overflow-x-auto`, `min-w-[1200px]`), igual en todos los tamaños. Decisión tomada con el usuario: se **agrega** un buscador nuevo (input de texto, 100% en cliente, sin tocar Firebase/`guestService`) porque es una mejora de UX de bajo riesgo ya validada en el mockup, y se mantiene la decisión ya tomada de tabla en escritorio + tarjetas en móvil (evita el scroll horizontal de la tabla ancha en pantallas angostas, que es peor UX que tarjetas apiladas).
- `admin/confirmations/[weddingId]/page.tsx` (362 líneas) es una ruta separada con estadísticas parecidas a las de `guests`. El usuario decidió explícitamente **mantenerla separada** en este spec — solo se le aplica el mismo sistema visual, sin fusionarla con `guests`.
- Ninguna de las tres páginas usa `next-intl`/`useTranslations` — el panel de administración es únicamente en español, a diferencia de las páginas públicas de boda. Este spec no agrega internacionalización.
- El proyecto ya tiene el patrón de "`ui.tsx` propio por área con tokens hardcoded, sin tocar `tailwind.config.ts`" en `components/landing/ui.tsx` (spec 03), `components/sections-v2/ui.tsx` y `components/sections-v3/ui.tsx` (specs 01 y 02). Este spec sigue el mismo criterio para el área de administración.
- Las fuentes `Fraunces` y `Manrope` ya están cargadas globalmente vía `@import` en `app/globals.css` (línea 4) — no hace falta agregar ninguna carga de fuente nueva, ambas páginas de admin ya heredan ese `@import` global.
- Ambas páginas ya importan iconos de `lucide-react` (`Heart`, `Calendar`, `MapPin`, `Clock`, `Gift`, `User`, `Settings` en wedding-editor; `Plus`, `Edit2`, `Trash2`, `Save`, `X`, `Check`, `Link`, `MessageSquare`, `ChevronUp`, `ChevronDown`, `ArrowUpDown` en guests). El canvas de Design usó SVG inline dibujados a mano (limitación de la herramienta de diseño, no una decisión de producto) — en el código real se usan los iconos equivalentes de `lucide-react` ya disponibles como dependencia, agregando los que falten (`Search`, `Users`, `Copy`, `ChevronLeft`, etc.).
- `components/WeddingNotFound.tsx` se usa como estado de error en `guests/[weddingId]/page.tsx`, pero es un componente compartido con rutas públicas de boda — igual que en spec 02, queda **fuera de alcance** (no se modifica).

Decisiones ya cerradas con el usuario antes de escribir este spec (ver sesión previa):

- El editor de escritorio cambia de fila de tabs horizontal a **sidebar de navegación fijo**, con las 9 secciones siempre visibles y una barra de progreso al pie.
- El editor móvil adopta el patrón del canvas: **chips de sección con scroll horizontal** + **barra fija de "Guardar cambios"** en la zona del pulgar, en vez de la fila de tabs móvil actual.
- `admin/confirmations/[weddingId]` se **reestiliza pero se mantiene como ruta separada** — no se fusiona con `guests`.
- La barra de progreso del sidebar (`X/9 secciones`) usa **completitud real calculada por sección**, con las reglas de la tabla en la sección Datos (confirmadas por el usuario).
- La lista de invitados cambia de un único layout de tarjetas (igual en todos los tamaños) a **tabla real en escritorio + tarjetas apiladas en móvil**.

## Alcance

**Incluye:**

- Nuevo `components/admin/ui.tsx`: tokens de paleta **"Dashboard Neutral"** (decisión final tras la actualización de paleta, ver Objetivo) — `canvas` (`#FAFAFA`), `surface` (`#FFFFFF`), `ink` (`#0A0A0A`), `inkSoft` (`#27272A`), `body` (`#3F3F46`), `muted` (`#71717A`), `faint` (`#9CA3AF`), `border` (`#D4D4D8`), `accent` (`#111111`, negro sólido — sin acentos cálidos), `success` (`#15803D`), `pending` (`#475569`), `danger` (`#B91C1C`) — como constantes propias del archivo (sin tocar `tailwind.config.ts`, mismo criterio que specs 01-03). Tipografía: Manrope en todo (sin serif); `displayFont` es solo peso 800 + tracking ajustado sobre Manrope, no una fuente distinta. Radios más chicos que "Romance Editorial" (`rounded-lg`/`rounded-xl` en vez de `rounded-full`/`rounded-2xl` para tarjetas y botones primarios) para reforzar el look de herramienta de trabajo. Incluye helpers compartidos: `AdminTopBar`, `AdminSidebarNavItem`, `AdminSectionChip`, `AdminStatCard`, `AdminStatusPill` (variantes `confirmed`/`pending`/`declined`/`active`), `AdminToggle` (switch estilizado), `AdminButton` (variantes `solid`/`ghost`/`dashed`), `AdminCard`.
- **`wedding-editor/[weddingId]/page.tsx` — escritorio:** la fila de tabs horizontal (`hidden md:flex`, línea 645) se reemplaza por un sidebar fijo de 260px con las 9 secciones (icono + label + check de completitud), usando `AdminSidebarNavItem`. Al pie del sidebar, una barra de progreso "`X/9 secciones`" calculada con las reglas de la sección Datos. El top bar se reestiliza con `AdminTopBar` (nombre de la pareja, slug, badge de estado Activa/Borrador, botón "Guardar cambios" en terracota). Las 9 secciones de contenido (`couple`, `event`, `venues`, `timeline`, `accommodation`, `recommendedPlaces`, `gifts`, `social`, `settings`) se reestilizan con los tokens nuevos, conservando exactamente los mismos campos, `useState`/`onChange` y estructura de datos que ya existen — **sin agregar ni quitar ningún campo del formulario**.
- **`wedding-editor/[weddingId]/page.tsx` — móvil:** la fila de tabs móvil (`overflow-x-auto scrollbar-hide`, línea 673) se reemplaza por chips de sección con scroll horizontal (mismo patrón que `MainMobile.dc.html`). Se agrega una barra fija al fondo de la pantalla con el botón "Guardar cambios" (`position: sticky`/`fixed`, con `env(safe-area-inset-bottom)` para no chocar con el home indicator de iOS), visible sin importar cuánto se haya hecho scroll ni qué sección esté activa. Los inputs y botones de las 9 secciones en vista móvil respetan un alto mínimo de 44px (objetivo táctil).
- **`guests/[weddingId]/page.tsx`:** tarjetas de estadísticas (`AdminStatCard`) y chips de filtro (`Todos`/`Confirmados`/`Pendientes`/`No asisten`, mapeando 1:1 a `filterStatus`) reestilizados con los tokens nuevos. Se agrega un **buscador nuevo** (`searchTerm`, `useState<string>('')`, 100% en cliente) que filtra `filteredAndSortedGuests` por `name`/`email` antes de renderizar — única excepción a "solo restyle" en este spec, decidida con el usuario por ser una mejora de UX de bajo riesgo que no toca Firebase/`guestService`. La lista de invitados se divide por breakpoint (mismo criterio `md` que ya usa `wedding-editor`): en escritorio (`md:` en adelante) se mantiene como **tabla real** (columnas Invitado/Contacto/Personas/Idioma/Estado/Acciones, ya existente en línea 667) reestilizada; en móvil se agrega un layout nuevo de **tarjetas apiladas** (una por invitado, con acciones al pie) en vez de que la tabla ancha (`min-w-[1200px]`) se desplace con scroll horizontal. Ambos layouts leen el mismo estado (`guests`, `filterStatus`, `searchTerm`, resultado de orden) — no se duplica lógica, solo el markup de presentación. El modal de "Nuevo/Editar Invitado" (línea 850) y el modal de "Ver mensaje" (línea 1003) se reestilizan con los tokens nuevos, conservando exactamente los mismos campos (`name`, `email`, `phone`, `guestCount`, `language`, `coupleMessage`), validación y llamada a `guestService` que ya existen.
- **`admin/confirmations/[weddingId]/page.tsx`:** se reestiliza con los mismos tokens de `components/admin/ui.tsx` (tarjetas de estadísticas, tabla/lista, badges de estado), sin cambiar su lógica de datos ni fusionarla con `guests`.
- Verificación manual de las tres páginas en viewport de escritorio y móvil tras cada bloque de cambios (ver Plan de implementación).

**No incluye:**

- No se modifica `tailwind.config.ts` ni ninguna paleta global de Tailwind (mismo criterio que specs 01-03).
- No se toca la lógica de Firebase/Firestore de ninguna de las tres páginas: `rsvpService`, `guestService`, `setDoc`/`getDoc` de `wedding-editor`, ni el esquema de `WeddingData`/`FirebaseGuest`. Ningún campo se agrega, renombra ni elimina.
- No se fusiona `admin/confirmations/[weddingId]` con `guests/[weddingId]` (decisión explícita del usuario: quedan como rutas separadas).
- No se agrega autenticación ni control de acceso a las rutas de admin (siguen siendo URLs públicas sin login, igual que hoy — fuera de alcance de este spec).
- No se agrega internacionalización (`next-intl`) al panel de administración; sigue siendo solo en español, igual que hoy.
- No se modifica `components/WeddingNotFound.tsx` (compartido con rutas públicas de boda, fuera de alcance igual que en spec 02).
- No se cambia el mecanismo de guardado de `wedding-editor` (un único botón que escribe todo `WeddingData` a la vez) por guardado incremental por sección — el rediseño solo cambia dónde vive el botón (barra fija en móvil), no cuántas veces se llama a Firestore.
- No se reproduce en este documento cada valor exacto de color/espaciado/SVG del canvas; la referencia visual de precisión es el canvas de Design ya aprobado (`https://claude.ai/artifact/6cPLWg1kchh3jrV4kmf2Qf`), no una re-descripción textual. Los iconos se implementan con `lucide-react` (equivalentes más cercanos a los SVG del mockup), no como copias literales de los paths del canvas.

## Datos

No se introducen campos nuevos en `WeddingData`, `FirebaseGuest` ni ninguna estructura persistida.

**Actualización tras revisar el código real (reemplaza la tabla de reglas nuevas que tenía este spec originalmente):** `wedding-editor/[weddingId]/page.tsx` ya tiene `isSectionComplete(section: string): boolean` (líneas 418-503) e `isAllSectionsComplete(): boolean` (líneas 506-509) implementando completitud real por sección a partir de `weddingData` en estado, con acceso seguro (`?.`) en cada regla. Es más estricta y precisa que las reglas que se habían propuesto aquí antes de implementar (ver detalle en Contexto). Decisión tomada con el usuario durante la implementación: **se reusan tal cual**, sin escribir una función nueva ni cambiar sus reglas — el sidebar y la barra de progreso del editor (y el badge "Completado" del header) se conectan a estas dos funciones existentes.

## Plan de implementación

**Bloque A — Sistema compartido**

1. Crear `components/admin/ui.tsx` con los tokens de paleta (`ivory`, `charcoal`, `charcoalSoft`, `terracota`, `terracotaDark`, `sage`, `muted`, `amber`, `stone`) y los helpers (`AdminTopBar`, `AdminSidebarNavItem`, `AdminStatCard`, `AdminStatusPill`, `AdminToggle`, `AdminButton`, `AdminCard`). No se monta en ninguna página todavía — no cambia nada visible.

**Bloque B — Editor de invitación (escritorio)**

2. En `wedding-editor/[weddingId]/page.tsx`, reemplazar la fila de tabs de escritorio (línea 645) por un sidebar fijo de 260px con `AdminSidebarNavItem` × 9 (icono ya importado de `lucide-react` + label + check si `isSectionComplete(tab.id)` es `true`, función ya existente, sin modificarla) y la barra de progreso al pie (`tabs.filter(t => isSectionComplete(t.id)).length / tabs.length`).
3. Reestilizar el top bar (nombre de la pareja, slug, badge Activa/Borrador, botón "Guardar cambios") con `AdminTopBar`.
4. Reestilizar el contenido de las 9 secciones (`couple`, `event`, `venues`, `timeline`, `accommodation`, `recommendedPlaces`, `gifts`, `social`, `settings`) con `AdminCard`/tokens nuevos, conservando cada `input`/`textarea`/`onChange`/estructura de datos exactamente igual.
5. Verificación manual Bloque B (escritorio): `npm run dev`, `/es/admin/wedding-editor/template-01-demo` (o cualquier boda existente), confirmar las 9 secciones, el check de completitud correcto contra datos reales, y que "Guardar cambios" sigue escribiendo a Firestore sin errores.

**Bloque C — Editor de invitación (móvil)**

6. Reemplazar la fila de tabs móvil (línea 673) por chips de sección con scroll horizontal, reusando `getSectionCompletion` para el estado activo/completado.
7. Agregar la barra fija de "Guardar cambios" al fondo de la pantalla en viewport móvil (`env(safe-area-inset-bottom)`), visible independientemente del scroll de la sección activa.
8. Verificación manual Bloque C (viewport móvil, DevTools o dispositivo real): confirmar que los 9 chips son navegables con scroll horizontal, que los inputs tienen alto táctil ≥44px, y que la barra de guardado permanece visible al hacer scroll dentro de cualquier sección.

**Bloque D — Gestión de invitados**

9. En `guests/[weddingId]/page.tsx`, reestilizar tarjetas de estadísticas, buscador y chips de filtro con `AdminStatCard`/tokens nuevos, sin tocar `filterStatus`/búsqueda/orden.
10. Dividir el render de la lista de invitados en dos bloques condicionados por breakpoint (mismo criterio `md` que ya usa `wedding-editor`): tabla real en escritorio, tarjetas apiladas en móvil — ambos leyendo el mismo arreglo de invitados ya filtrado/ordenado.
11. Reestilizar el modal de "Nuevo/Editar Invitado" (línea 850) con `AdminCard`/tokens nuevos, conservando los mismos campos, validación y llamada a `guestService`.
12. Verificación manual Bloque D: `npm run dev`, `/es/admin/guests/[weddingId]` con una boda que tenga invitados reales, confirmar tabla en escritorio, tarjetas en móvil, filtros, búsqueda, modal de creación/edición y exportación CSV funcionando sin cambios de comportamiento.

**Bloque E — Confirmaciones**

13. Reestilizar `admin/confirmations/[weddingId]/page.tsx` con los mismos tokens/helpers de `components/admin/ui.tsx`, sin cambiar su lógica de datos ni su ruta.
14. Verificación manual Bloque E: `/es/admin/confirmations/[weddingId]` sigue mostrando las mismas estadísticas y lista, con el nuevo sistema visual.

**Cierre**

15. `npm run build` (o `tsc --noEmit`) sin nuevos errores de tipos respecto al estado previo.
16. Revisión cruzada: confirmar que ningún archivo fuera de `app/[locale]/admin/**` y `components/admin/ui.tsx` aparece en el diff (en particular, `tailwind.config.ts`, `components/WeddingNotFound.tsx` y las páginas públicas de boda no cambian).

## Criterios de aceptación

- [ ] `components/admin/ui.tsx` existe con los tokens y helpers "Dashboard Neutral" (blanco/negro/grises, sin serif); ninguna de las tres páginas de admin usa colores hardcoded de la paleta "Romance Editorial" (`#C6663C`, `#AE5730`, `#FBF7F1`, etc.) — solo los tokens neutros nuevos.
- [ ] El logo "invyta" del navbar y el título de la página debajo (`AdminTopBar`) comparten el mismo padding horizontal, sin contenedor `max-w-7xl` centrado en uno y ancho completo en el otro — verificable en viewport ancho (≥1440px), donde antes se desalineaban.
- [ ] El editor de invitación en escritorio (`≥768px`) muestra un sidebar fijo con las 9 secciones y una barra de progreso "`X/9 secciones`" que coincide exactamente con `isSectionComplete`/`isAllSectionsComplete` (ya existentes, sin modificar) aplicadas a los datos reales de la boda visitada.
- [ ] El editor de invitación en móvil (`<768px`) muestra chips de sección con scroll horizontal y una barra fija de "Guardar cambios" visible en cualquier punto del scroll de cualquier sección.
- [ ] Las 9 secciones del editor (Pareja, Evento, Lugares, Cronograma, Hoteles Recomendados, Lugares Recomendados, Regalos, Social, Configuración) conservan exactamente los mismos campos y lógica de `onChange` que antes del rediseño — verificable editando un campo y confirmando que "Guardar cambios" lo persiste en Firestore.
- [ ] `guests/[weddingId]/page.tsx` muestra tabla real de invitados en escritorio y tarjetas apiladas en móvil, ambas reflejando el mismo estado de filtro/búsqueda/orden, incluyendo el nuevo buscador por nombre/email (`searchTerm`, cliente, sin llamadas nuevas a Firebase).
- [ ] El modal de "Nuevo/Editar Invitado" conserva los mismos campos (`name`, `email`, `phone`, `guestCount`, `language`, `coupleMessage`) y sigue llamando a `guestService` sin cambios de comportamiento — verificable creando un invitado de prueba.
- [ ] `admin/confirmations/[weddingId]` sigue existiendo como ruta separada, con el nuevo sistema visual aplicado y sin cambios en sus datos ni su URL.
- [ ] `tailwind.config.ts` y `components/WeddingNotFound.tsx` no aparecen en el diff.
- [ ] `npm run build` (o `tsc --noEmit`) no introduce nuevos errores de tipos respecto al estado previo.
- [ ] Visitar las tres páginas de admin en viewport de escritorio y móvil no muestra errores de consola.

## Decisiones tomadas y descartadas

- **Sidebar fijo en el editor de escritorio (no mantener la fila de tabs horizontal)**: decisión explícita del usuario — con 9 secciones, un sidebar siempre visible con progreso es más usable que una fila de pills con scroll horizontal en desktop.
- **Chips + barra fija de guardado en el editor móvil**: decisión explícita del usuario, siguiendo el artboard `MainMobile.dc.html` del canvas — la acción de guardar debe estar siempre alcanzable con el pulgar, sin importar la sección activa ni el scroll.
- **`admin/confirmations` se reestiliza pero se mantiene separada de `guests`**: decisión explícita del usuario tras evaluar la alternativa de fusionarlas — se prioriza no tocar una ruta funcional existente en este spec, aunque haya redundancia de estadísticas entre ambas.
- **Completitud por sección calculada en el cliente con reglas simples (no un campo nuevo en Firestore)**: decisión explícita del usuario tras revisar la tabla de reglas propuesta — evita agregar un campo de progreso que haya que mantener sincronizado; se deriva siempre de los datos reales ya guardados.
- **Tabla real en escritorio + tarjetas en móvil para la lista de invitados (no mantener un único layout de tarjetas)**: decisión explícita del usuario — una tabla es más rápida de escanear en escritorio para listas largas de invitados; las tarjetas siguen siendo mejores para tocar en móvil.
- **Iconos con `lucide-react` en vez de los SVG inline del canvas**: los SVG a mano fueron una limitación de la herramienta de diseño (no puede montar componentes propios), no una decisión de producto — el código real ya depende de `lucide-react` en ambas páginas, así que se usan sus iconos equivalentes.
- **Nuevo `components/admin/ui.tsx` en vez de extender `components/landing/ui.tsx`**: el área de administración necesita componentes propios (sidebar, tabla, badges de estado de RSVP, toggle) que no tienen sentido en la landing pública — mismo criterio de separación por área que ya usan `sections/ui.tsx` y `sections-v2/ui.tsx` entre sí. Además, tras la actualización de paleta, admin y landing ya **no comparten tokens de color** — separar los archivos evitó que ese cambio afectara la landing.
- **Paleta "Dashboard Neutral" en vez de "Romance Editorial" para el área de administración**: decisión explícita del usuario tras ver la primera implementación — un panel de trabajo con formularios densos y tablas se lee mejor con una paleta neutra tipo herramienta de software (blanco/negro/grises, sans-serif) que con la calidez cálida/serif que sí es correcta para la landing y las invitaciones públicas (que no cambian). Se mantuvo un mínimo de color funcional (verde/gris-azulado/rojo) solo para estados de RSVP (confirmado/pendiente/declinado), no como acento de marca.
- **Alineación del navbar "invyta" con el título de página**: bug real detectado en la implementación (no un cambio de diseño) — el navbar vivía centrado en `max-w-7xl mx-auto` mientras `AdminTopBar` y el resto del contenido eran de ancho completo, desalineando el logo del título en pantallas anchas. Se corrigió unificando el padding horizontal y quitando el contenedor centrado del navbar.
- **Sin autenticación ni internacionalización en este spec**: ambas son decisiones de mayor alcance (seguridad y arquitectura de rutas) que no forman parte de un rediseño visual — quedarían como specs futuros si se deciden.

## Riesgos

- **Alcance en un archivo grande (`wedding-editor/page.tsx`, 2078 líneas)**: si el tiempo se dispara, el plan permite entregar el Bloque B (escritorio) completo y verificado antes de empezar el Bloque C (móvil), y ambos antes del Bloque D (guests) — cada bloque deja el sistema funcional por separado.
- **Desconexión entre el nuevo sidebar/progreso y `isSectionComplete` real**: como se reusa la función existente tal cual (ver Contexto/Datos), el riesgo ya no es de lógica sino de conexión — que el sidebar nuevo llame mal a `isSectionComplete(tab.id)` o que la barra de progreso cuente distinto que `isAllSectionsComplete()`. Se mitiga verificando que el badge "Completado" del header y el nuevo contador del sidebar siempre coincidan en la misma boda.
- **Deriva entre el mockup `.dc.html` y el código real**: el canvas usa SVG y valores de espaciado que pueden requerir ajuste fino al pasarlos a Tailwind/React. No se considera un defecto si el resultado es visualmente equivalente aunque no sea pixel-perfect contra el canvas.
- **Regresión accidental en el modal de invitados**: al reestilizar `guests/[weddingId]/page.tsx` línea 850 en adelante, el mayor riesgo es tocar por error el `onSubmit`/validación en vez de solo el markup — se mitiga verificando la creación de un invitado de prueba de punta a punta antes de cerrar el Bloque D.
