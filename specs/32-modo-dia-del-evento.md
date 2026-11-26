# 32 — Modo "Día del evento": pase del invitado con su mesa en el mismo link

**Estado:** Approved
**Depende de:** SPEC 12 (mesas y Plano), SPEC 23 (asientos individuales), SPEC 27 (corte en `WeddingTemplate`, vista previa con sesión), SPEC 29 (álbum de fotos y `lib/album.ts`)
**Fecha:** 2026-11-26

## Objetivo

Agregar a cada boda con diseño un modo "Día del evento" que se habilita desde el Editor. Ya habilitado, el día de la boda el link personal del invitado abre primero un pase con su mesa, el plano del salón con su mesa resaltada y el acceso al álbum, y la invitación completa queda debajo.

## Contexto

Es la primera parte de la propuesta "Día del evento + check-in" (sesión del 2026-11-26). Se decidió partirla en dos specs:

- **Este spec (32):** la configuración y lo que ve el invitado.
- **Spec 33 (futuro):** check-in con QR para hostess y planner, que se apoya en este.

**Mercado (investigación del 2026-11-26).** El check-in con QR ya es común en México: LUSEKI (desde $699), PartyPass (desde $399), Invítame ($1,299), Invitado MX y VOWS. El "pase con la mesa" también existe en PartyPass. Lo que diferencia a Invyta es que el mismo link evoluciona (save the date → invitación → pase del día → álbum), con el plano real del salón que ya arma la pareja en Mesas.

Estado real del código, revisado en esta sesión:

- **`components/WeddingTemplate.tsx`** decide qué se renderiza, en este orden: carga, error, corte `tier === 'free'` (`InvitationNotActivated`), corte del save the date (`showsSaveTheDate`) y template completo. Si hay `?guest=`, carga `guestInfo` con `guestService.getGuestByGuestId` y muestra `InvitationOverlay`. Además renderiza `AlbumFab` (templates 01, 03 y 04) y `MusicPlayer`.
- **`app/[locale]/wedding/[id]/wedding-page.tsx`** lee `searchParams.vista` (`completa`, `aparta-la-fecha`) y lo pasa por `WeddingPageClient` hasta `WeddingTemplate`.
- **`hooks/useCanPreviewFull.ts`** (spec 27) resuelve si quien abre el link tiene sesión de admin o de dueño de la boda, con `POST /api/auth/link-weddings`.
- **Asientos.** Cada persona de una invitación tiene un `FirebaseTableSeat` (colección `tableSeats`, `seatIndex` 0 = titular) con su `tableId`. **No existe un número de silla fijo:** la posición alrededor de la mesa en el Plano solo es el orden de dibujo (`components/admin/tables/seatLayout.ts`). El nombre de cada persona se deriva con `getSeatDisplayName` (`services/seatService.ts`), con texto fijo en español. Los asientos se crean de forma perezosa desde el panel (`getOrCreateGuestSeats`). Una invitación que nunca se abrió en Mesas puede no tener asientos y conservar solo el `guest.tableId` del spec 12, que es obsoleto.
- **Plano.** Las mesas (`tables`) tienen `posX`/`posY`. Si no las tienen, están "sin colocar". Los objetos del salón (`venueFixtures`) tienen posición, tamaño y etiqueta. `components/admin/tables/PlanoCanvas.tsx` (944 líneas, reactflow) es un editor con arrastre y no sirve de solo lectura.
- **Servicios de lectura:** `tableService.getWeddingTables`, `venueFixtureService.getWeddingFixtures` y `seatService.getGuestSeats`. Se leen desde el cliente, igual que el resto del sitio público.
- **Álbum.** `lib/album.ts` calcula la hora de Ciudad de México (`weddingDay`, `mexicoCityTime`, `MX_UTC_OFFSET_HOURS = 6`, privadas) y `albumPhase()`. El botón de fotos aparece en las fases `open` y `closed`: `AlbumFab` en los templates 01, 03 y 04, y dentro de `StickyConfirmBarV2` en Moderno.
- **Editor** (`app/[locale]/admin/panel/[weddingId]/editor/page.tsx`): "Aparta la fecha" va como pestaña especial arriba (`saveTheDateTab`, con la etiqueta Activo/Apagado) y fuera del contador "N/9 secciones". La función de migración copia `saveTheDate` campo por campo. Se guarda con "Guardar cambios" (`saveWeddingDoc`, `mergeFields`).

## Alcance

**Incluye:**

- **Campo nuevo `eventDay` en la boda** (`src/types/wedding.ts`), opcional. Si no existe, se considera deshabilitado.
- **Ventana automática.** Ya habilitado, el modo está activo desde las 00:00 del día de la boda hasta las 06:00 del día siguiente, en hora de Ciudad de México. El día sale de `event.date`. Fuera de esa ventana el link se ve como hoy.
- **Pase del invitado `components/eventDay/EventDayPass.tsx`.** Aparece al abrir un link con `?guest=` válido durante la ventana, antes de la invitación. Usa el estilo del diseño de la boda (paleta y tipografías de cada template, como `SaveTheDate.tsx`). Muestra:
  - un saludo con el nombre del invitado ("Hola, Carlos") y la fecha de hoy;
  - **su mesa** (si `showTable`): una fila por persona de la invitación con su nombre y el nombre de su mesa. Si una persona no tiene mesa: "Tu lugar te lo indicarán a tu llegada";
  - **el plano** (si `showFloorPlan`): el salón de solo lectura con las mesas de esa invitación resaltadas;
  - **el botón del álbum** (si `showAlbum` y `albumPhase()` es `open` o `closed`), con el mismo link y texto que el botón actual de fotos;
  - un botón "Ver invitación" que cierra el pase y deja la invitación completa.
- **Plano de solo lectura `components/eventDay/EventDayFloorPlan.tsx`.** Es un componente nuevo, ligero (SVG o HTML), sin reactflow. Dibuja las mesas colocadas con su forma y nombre, y los objetos del salón con su etiqueta. Se ajusta al ancho de la pantalla. Las mesas de la invitación se resaltan y las demás quedan atenuadas. Solo aparece si al menos una mesa de la invitación está colocada (`posX`/`posY`).
- **Salones con muchas mesas** (agregado al probar, diseño en la sección "Salones con muchas mesas" del canvas):
  - si, al meter todo el salón en el ancho disponible, una mesa mediría menos de 36 px, el plano abre en "Cerca de tu mesa";
  - ese encuadre se centra en las mesas de la invitación (todas, si hay personas en varias), con cada mesa de unos 46 px;
  - un control "Cerca de tu mesa / Todo el salón" cambia de vista, y su mesa siempre va resaltada;
  - con pocas mesas, o cuando el salón completo sí se lee (casi siempre en escritorio), no aparece el control.
- **Volver a abrir el pase.** Después de cerrarlo, la invitación muestra un botón "Mi mesa" que lo vuelve a abrir. Este botón solo existe durante la ventana y solo con `?guest=` válido. En los templates 01, 03 y 04 es un botón flotante junto a `AlbumFab`. En Moderno va dentro de `StickyConfirmBarV2`. La posición exacta la define el canvas.
- **Sin overlay de bienvenida durante la ventana.** Cuando aparece el pase, no se muestra `InvitationOverlay`. La música no arranca sola: queda su botón, como siempre.
- **Pestaña nueva "Día del evento" en el Editor,** después de "Aparta la fecha", fuera del contador "N/9 secciones", con la etiqueta "Habilitado"/"Apagado". Contiene:
  - el interruptor "Habilitar el modo Día del evento";
  - una línea con la ventana real: "Se activa el {fecha} de 00:00 a 06:00 del día siguiente (hora de Ciudad de México)";
  - tres interruptores: "Mostrar su mesa", "Mostrar el plano del salón" y "Mostrar el botón de fotos";
  - un aviso con el número de personas confirmadas sin mesa y un link a Mesas;
  - un selector de invitado y un botón "Ver pase" que abre la vista previa en una pestaña nueva.

  Se guarda con "Guardar cambios", como el resto del Editor.
- **Vista previa con sesión (`?preview=event-day`).** Con `?guest=` y sesión de admin o dueño, muestra el pase como si fuera el día de la boda, con cualquier fecha. Sin esa sesión, se ignora el parámetro.
- **Textos del pase en `messages/es.json` y `messages/en.json`** bajo una clave nueva `eventDay`. El pase respeta el idioma del invitado.
- **Canvas de diseño:** https://claude.ai/artifact/Nw2hnnHYqKFG3qiHiJ4962 (pase en los 4 diseños en móvil y escritorio, estado mínimo, botón "Mi mesa" y pestaña del Editor). **Ese canvas es la fuente de verdad visual y de copy.**

**No incluye (queda para otros specs):**

- **Check-in con QR** para hostess y planner, llegada en vivo y conteos (spec 33).
- **Número de silla fijo** ("Mesa 7, lugar 3"). Hoy no existe y requiere un cambio en Mesas.
- **Compañeros de mesa** (quién más se sienta en su mesa). Expone nombres de otros invitados.
- **Buscador "Encuentra tu mesa"** en el link general sin `?guest=`.
- **Itinerario en vivo** ("Ahora: cena · Siguiente: vals").
- **El modo en bodas gratis** (`tier === 'free'`), que no tienen invitación ni Editor.
- **Precio y venta:** paquetes, `PACKAGE_COMPARISON`, landing, FAQ y `BRAND-FOUNDATIONS`.
- **Actualización en tiempo real.** Si la mesa cambia, el invitado la ve al recargar.
- **Horas de inicio y fin elegidas por la pareja,** y un botón para activar el pase a todos antes de tiempo.
- **Cambios en las reglas de Firestore.**

## Modelo de datos

Nuevo campo opcional en `WeddingData` (`src/types/wedding.ts`), guardado en `weddings/{id}`:

```ts
// Spec 32 — modo "Día del evento". Ausente = deshabilitado (bodas existentes no cambian).
export interface EventDayConfig {
  enabled: boolean;       // la pareja lo habilita; se activa solo en la ventana del día de la boda
  showTable: boolean;     // mesa de cada persona de la invitación
  showFloorPlan: boolean; // plano del salón con sus mesas resaltadas
  showAlbum: boolean;     // botón del álbum (solo si el álbum está en fase open o closed)
}

eventDay?: EventDayConfig;
```

Valores al habilitar por primera vez: `showTable: true`, `showFloorPlan: true`, `showAlbum: true`.

Nuevo módulo `lib/eventDay.ts`:

```ts
export function eventDayStartsAt(wedding): Date | null; // 00:00 del día de la boda, hora CDMX
export function eventDayEndsAt(wedding): Date | null;   // 06:00 del día siguiente, hora CDMX
export function isEventDayActive(wedding, now = new Date()): boolean; // enabled && dentro de la ventana
```

`weddingDay` y `mexicoCityTime` se exportan desde `lib/album.ts` para no duplicar el cálculo de la hora de Ciudad de México.

**Mesa de cada persona (solo lectura, sin escribir nada):**

- Personas de la invitación: `getSeatedGuestCount(guest)`.
- Si la invitación tiene `tableSeats`, cada persona usa el `tableId` de su asiento (`seatIndex`).
- Si no tiene `tableSeats`, todas usan `guest.tableId` (modelo del spec 12) o quedan sin mesa.
- **Nombres:** el titular usa `guest.name`. El acompañante 1 usa `rsvpConfirmation.plusOne.name` si existe. Los demás usan la clave traducida `eventDay.companion` ("Acompañante {n}"). No se reutiliza `getSeatDisplayName` porque su texto está fijo en español.

**Nuevas claves de traducción (ES / EN), copy final según el canvas:**

| Clave | ES | EN |
| --- | --- | --- |
| `eventDay.greeting` | Hola, {name} | Hi, {name} |
| `eventDay.today` | Hoy es el gran día | Today is the big day |
| `eventDay.yourTable` | Tu mesa | Your table |
| `eventDay.noTable` | Tu lugar te lo indicarán a tu llegada | You'll be shown to your seat when you arrive |
| `eventDay.companion` | Acompañante {n} | Guest {n} |
| `eventDay.floorPlan` | Así está el salón | Venue layout |
| `eventDay.viewInvitation` | Ver invitación | View invitation |
| `eventDay.reopen` | Mi mesa | My table |

## Plan de implementación

Cada paso deja el proyecto compilando y las invitaciones actuales funcionando igual.

1. **Tipo, ventana y textos.**
   - Agregar `EventDayConfig` y `eventDay?` en `src/types/wedding.ts`.
   - Exportar `weddingDay` y `mexicoCityTime` en `lib/album.ts` sin cambiar su comportamiento.
   - Crear `lib/eventDay.ts` con `eventDayStartsAt`, `eventDayEndsAt` e `isEventDayActive`.
   - Agregar las claves `eventDay.*` en `messages/es.json` y `messages/en.json`.
   - Prueba: `npm run build` sin errores. Con `event.date` de una boda del 2027-03-20, `eventDayStartsAt` es `2027-03-20T06:00:00Z` y `eventDayEndsAt` es `2027-03-21T12:00:00Z`.
2. **Datos del pase: `hooks/useEventDayPass.ts`.**
   - Recibe la boda y el `guestInfo` ya cargado.
   - Lee en paralelo `seatService.getGuestSeats`, `tableService.getWeddingTables` y, solo si `showFloorPlan`, `venueFixtureService.getWeddingFixtures`.
   - Devuelve las personas con su mesa (o sin mesa), las mesas resaltadas, las mesas y los objetos del plano, y un estado de carga y error.
   - Si la lectura falla, el pase muestra el saludo y el botón "Ver invitación" sin la sección que falló.
   - Prueba: en una invitación de 3 personas con dos mesas distintas, el hook devuelve 3 filas con la mesa de cada una.
3. **Plano de solo lectura: `components/eventDay/EventDayFloorPlan.tsx`.**
   - Dibuja las mesas colocadas (`round`, `square`, `rectangular`, `imperial`) con su nombre, y los objetos del salón con su etiqueta, escalados para caber en el ancho del contenedor.
   - Resalta las mesas recibidas y atenúa las demás. Sin arrastre, zoom ni selección.
   - Las mesas sin `posX`/`posY` no se dibujan.
   - Prueba: montarlo a mano con las mesas de una boda real a 390 px y a 1440 px, y compararlo con el Plano del panel.
4. **Pase: `components/eventDay/EventDayPass.tsx`.**
   - Recibe la boda, el invitado, el idioma y `onClose`.
   - Elige el estilo con un mapa `template.id → { colores, tipografías }`, igual que `SaveTheDate.tsx`.
   - Muestra el saludo, las secciones activas (mesa, plano, álbum) y "Ver invitación".
   - El plano solo aparece si al menos una mesa de la invitación está colocada.
   - El botón del álbum usa `albumHref()` y aparece solo en las fases `open` o `closed`.
   - Respeta `prefers-reduced-motion`.
   - Prueba: montarlo a mano con cada uno de los 4 `template.id` y revisarlo contra el canvas.
5. **Corte en el sitio público.**
   - `wedding-page.tsx` lee `searchParams.preview === 'event-day'` y lo pasa por `WeddingPageClient` hasta `WeddingTemplate` como `previewEventDay`.
   - En `WeddingTemplate.tsx`, después del corte del save the date, se calcula `showEventDayPass`. Es verdadero si hay `guestInfo` válido, la invitación no está declinada (`rsvpStatus !== 'declined'`) y se cumple una de dos: `isEventDayActive(boda)`, o `previewEventDay` con `useCanPreviewFull` en verdadero.
   - Si es verdadero, se renderiza el template completo con `EventDayPass` encima, y no se muestra `InvitationOverlay`.
   - Al cerrar el pase queda la invitación. El estado de abierto o cerrado vive solo en memoria, así que al recargar el link el pase vuelve a abrirse.
   - Prueba: con `eventDay.enabled: true` puesto a mano y una fecha de boda de hoy, `/es/wedding/{id}?guest={guestId}` abre el pase. Con una fecha de mañana, se ve la invitación con su overlay como hoy.
6. **Botón "Mi mesa".**
   - Crear `components/eventDay/EventDayReopenButton.tsx` para los templates 01, 03 y 04, flotante junto a `AlbumFab`, sin taparlo.
   - En Moderno, agregar la acción dentro de `StickyConfirmBarV2`.
   - Solo existe si `showEventDayPass` es verdadero y el pase está cerrado.
   - Prueba: cerrar el pase, tocar "Mi mesa" y ver que el pase se vuelve a abrir. Fuera de la ventana, el botón no existe.
7. **Pestaña "Día del evento" en el Editor.**
   - Agregar `eventDayTab` después de `saveTheDateTab`, con la etiqueta Habilitado/Apagado, y excluirla del contador "N/9 secciones".
   - Copiar `eventDay` en la función de migración del Editor, igual que `saveTheDate`.
   - El contenido sigue la lista del Alcance.
   - El aviso de personas sin mesa cuenta los asientos de las invitaciones confirmadas que no tienen `tableId`. Usa los mismos servicios que Mesas, pero sin crear asientos.
   - "Mostrar el botón de fotos" queda deshabilitado, con la ayuda "Activa el álbum en Fotos", si `photoAlbum.enabled` no es verdadero.
   - Si falta `event.date`, la pestaña dice "Agrega la fecha en Evento para que el modo se active".
   - Si `saveTheDate.enabled` es verdadero, la pestaña avisa que el save the date tiene prioridad y los invitados no verán el pase mientras esté activo, pero "Ver pase" sí lo muestra.
   - "Ver pase" abre `/{locale}/wedding/{id}?guest={guestId}&preview=event-day` en una pestaña nueva.
   - Prueba: habilitar y guardar con una cuenta de pareja, y abrir "Ver pase" con un invitado elegido.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos.
- [ ] Una boda sin el campo `eventDay` se ve exactamente igual que antes de este spec, en los 4 diseños y cualquier día.
- [ ] Con `eventDay.enabled: true` y la boda hoy, `/es/wedding/{id}?guest={guestId}` abre el pase antes de la invitación.
- [ ] Con `eventDay.enabled: true`, el pase no aparece antes de las 00:00 del día de la boda ni después de las 06:00 del día siguiente (hora de Ciudad de México).
- [ ] Con `eventDay.enabled: false` y la boda hoy, el link se ve como antes de este spec.
- [ ] Durante la ventana, `/es/wedding/{id}` sin `?guest=` muestra la invitación normal, sin pase y sin el botón "Mi mesa".
- [ ] El pase muestra el nombre del invitado y una fila por persona de la invitación con el nombre de su mesa.
- [ ] Una persona sin mesa ve "Tu lugar te lo indicarán a tu llegada" y las demás personas de la invitación ven su mesa.
- [ ] Una invitación sin `tableSeats` y con `guest.tableId` muestra esa mesa para todas sus personas, y abrir el pase no crea documentos en `tableSeats`.
- [ ] Con `showTable: false` no aparece la sección de mesa.
- [ ] Con `showFloorPlan: true` y la mesa colocada, el plano aparece con esa mesa resaltada y los objetos del salón (pista, barra, entrada) con su etiqueta.
- [ ] Si ninguna mesa de la invitación está colocada, el plano no aparece.
- [ ] Con un salón de unas 25 mesas, en el celular el plano abre en "Cerca de tu mesa" con la mesa del invitado legible, y el control cambia a "Todo el salón" y de regreso.
- [ ] Con un salón de 4 mesas por fila o menos, no aparece el control y se ve todo el salón.
- [ ] Con `showFloorPlan: false` no aparece el plano.
- [ ] Con `showAlbum: true` y el álbum activado, el pase muestra el botón de fotos, que abre `/wedding/{id}/fotos?guest={guestId}`.
- [ ] Con el álbum desactivado, el pase no muestra el botón de fotos aunque `showAlbum` sea `true`.
- [ ] Mientras el pase está abierto no aparece `InvitationOverlay` y la música no suena sola.
- [ ] "Ver invitación" cierra el pase y deja visible la invitación completa.
- [ ] Después de cerrar el pase aparece "Mi mesa" (flotante en Clásico, Botánica y Jardín; en la barra fija en Moderno), y al tocarlo el pase se vuelve a abrir.
- [ ] Fuera de la ventana no existe el botón "Mi mesa".
- [ ] Un invitado con idioma `en` ve el pase en inglés.
- [ ] Una invitación declinada (`rsvpStatus: 'declined'`) no ve el pase.
- [ ] El pase usa colores y tipografías distintos para `template-01`, `template-02`, `template-03` y `template-04`.
- [ ] Con `saveTheDate.enabled: true`, el link muestra el save the date aunque sea el día de la boda.
- [ ] `?guest={guestId}&preview=event-day` con sesión de admin o dueño muestra el pase con cualquier fecha.
- [ ] `?guest={guestId}&preview=event-day` en incógnito, fuera de la ventana, muestra la invitación normal.
- [ ] `?guest={guestId}&preview=event-day` con sesión de dueño o admin muestra el pase aunque "Aparta la fecha" esté encendido.
- [ ] El Editor muestra la pestaña "Día del evento" después de "Aparta la fecha", y el contador sigue diciendo "N/9 secciones".
- [ ] La pestaña muestra la fecha y el horario reales de la ventana de esa boda.
- [ ] La pestaña muestra cuántas personas confirmadas no tienen mesa.
- [ ] Mover los interruptores sin guardar no cambia el link público. Después de "Guardar cambios", sí.
- [ ] Guardar otra pestaña del Editor no borra ni cambia `eventDay`.
- [ ] Las demos (`template-01-demo`, `template-02-demo`, `valentina-mateo-2026`, `template-04-demo`) se ven igual que antes.

## Decisiones tomadas y descartadas

- **Sí: dos specs, este para el pase y el 33 para el check-in.** Decisión del usuario. Juntos tocaban el sitio, el panel, datos de llegada y un escáner con cámara.
- **Sí: configuración en una pestaña del Editor.** Decisión del usuario, igual que "Aparta la fecha". Se guarda con "Guardar cambios". **No:** una sección nueva en el sidebar ni una tarjeta en el Dashboard.
- **Sí: se habilita a mano y se activa solo por fecha.** Decisión del usuario. Así no depende de que alguien lo encienda la noche de la boda. **No:** solo manual, porque se olvida. **No:** horas elegidas por la pareja, porque son más campos.
- **Sí: ventana de 00:00 del día de la boda a 06:00 del día siguiente, hora de Ciudad de México.** Decisión del usuario. Cubre bodas que terminan de madrugada y usa la misma base horaria que el álbum.
- **Sí: interruptores independientes para la mesa, el plano y el botón de fotos.** Decisión del usuario. El botón de fotos va en el pase porque ese día ya existe en la invitación.
- **Sí: primero el pase y la invitación debajo, y el pase se puede volver a abrir con "Mi mesa" solo durante la ventana.** Decisión del usuario. **No:** reemplazar la invitación por completo, porque ese día también se busca la ubicación. **No:** solo un botón flotante, porque tiene poco impacto.
- **Sí: mensaje amable para la persona sin mesa.** Decisión del usuario. La pestaña avisa a la pareja cuántas faltan.
- **Sí: solo bodas con diseño, y el precio queda fuera.** Decisión del usuario, igual que en el spec 27.
- **Sí: vista previa con sesión (`?preview=event-day`).** Decisión del usuario. Reutiliza `useCanPreviewFull`. **No:** un botón "Activar ahora" para todos, porque se puede quedar prendido por error.
- **Sí: el link general muestra la invitación normal.** Decisión del usuario. Sin `?guest=` no sabemos quién es. **No:** buscador por nombre, porque expone la mesa de cualquiera.
- **Sí: canvas de diseño después del spec y antes de aprobarlo.** Decisión del usuario.
- **Sí: las vistas previas usan `?preview=` en inglés** (`full`, `save-the-date`, `event-day`). Decisión del usuario al probar, para que no se mezcle con `?guest=`. `?guest=` no cambia porque ya va en los links enviados a invitados reales. `?vista=completa`, `?vista=aparta-la-fecha` y `?vista=dia` se siguen aceptando como alias.
- **No: número de silla.** Hoy no existe. La posición en el Plano es solo el orden de dibujo y cambia al mover gente.
- **No: compañeros de mesa ni itinerario en vivo.** El usuario no los eligió.
- **Sí: con muchas mesas, dos vistas fijas ("Cerca de tu mesa" por defecto y "Todo el salón").** Decisión del usuario al probar. La regla es por tamaño en pantalla (menos de 36 px por mesa) y no por número de mesas, porque depende de qué tan ancho se acomodó el salón. **No:** pellizcar o arrastrar, porque se confunde con el scroll y es difícil para invitados mayores. **No:** un número fijo de mesas (por ejemplo, más de 12), porque falla con salones muy anchos o muy compactos.
- **Sí: plano nuevo y ligero, sin reutilizar `PlanoCanvas`.** `PlanoCanvas` es un editor de 944 líneas con reactflow, arrastre y bandeja, y meterlo en el sitio público lo vuelve más pesado.
- **Sí: abrir el pase no escribe nada.** No se usa `getOrCreateGuestSeats`, y si no hay asientos se usa `guest.tableId`. El sitio público no debe crear documentos.
- **Sí: el save the date tiene prioridad sobre el pase para los invitados.** Si los dos están activos, se respeta el corte que ya existe y la pestaña lo avisa. **Excepción (pedida por el usuario al probar):** la vista previa con sesión (`?preview=event-day`) sí muestra el pase aunque el save the date esté encendido, igual que `?preview=full`, para que quien gestiona la boda lo revise sin apagarlo.
- **Propuesta de esta sesión, pendiente de confirmar al revisar:**
  - una invitación declinada no ve el pase;
  - el pase vuelve a abrirse al recargar el link, porque su estado vive en memoria.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `event.date` guarda la hora en UTC y el día se toma de la parte de la fecha. Una fecha mal capturada corre la ventana un día. | Se usa el mismo cálculo que el álbum, que ya está en producción. La pestaña muestra la fecha y el horario reales para que la pareja los revise. |
| Invitaciones con varias personas y asientos sin crear (nunca se abrieron en Mesas). | Se cae a `guest.tableId`. Si tampoco existe, se muestra "Tu lugar te lo indicarán a tu llegada". |
| El plano es ilegible en celular con muchas mesas. | Si una mesa mediría menos de 36 px, abre en "Cerca de tu mesa" con el control "Todo el salón". El canvas tiene el caso de 25 mesas. |
| La mesa cambia a última hora y el invitado ve la anterior. | Se acepta. Ve la nueva al recargar. Tiempo real queda fuera. |
| La función de migración del Editor no copia `eventDay` y un guardado lo borra. | El paso 7 la copia de forma explícita y hay un criterio de aceptación para esto. |
| Cualquier persona con un link personal ve la mesa de esa invitación. | Se acepta: es el mismo nivel de exposición que la invitación personal de hoy. Las reglas de Firestore siguen abiertas y su endurecimiento ya está registrado aparte. |

## Lo que **no** está en este spec

- Check-in con QR, app de hostess y llegada en vivo (spec 33).
- Número de silla fijo.
- Compañeros de mesa, buscador por nombre e itinerario en vivo.
- Bodas gratis.
- Precio, paquetes, landing y FAQ.
- Actualización en tiempo real.
- Horas personalizadas y activación manual para todos.
- Reglas de Firestore.

Cada uno de estos, si se decide hacer, va en su propio spec.

## Siguientes pasos (roadmap)

Orden acordado con el usuario el 2026-11-26:

1. **Diseño del spec 32.** Canvas del pase en los 4 diseños, del botón "Mi mesa" y de la pestaña del Editor. Después, marcar este spec como Approved y correr `/spec-impl 32-modo-dia-del-evento`.
2. **Spec 33 — Check-in con QR el día del evento.** Se apoya en este spec. El check-in con QR ya es común en México (LUSEKI, PartyPass, Invítame, Invitado MX, VOWS). Para diferenciarse, la investigación del 2026-11-26 sugiere:
   - varias hostess trabajando a la vez en el mismo evento;
   - funcionar sin internet y sincronizar después;
   - cambiar una mesa en vivo y verlo en todos los teléfonos;
   - llegada en vivo para el planner;
   - una lista impresa por mesa como respaldo.
3. **Spec 34 — Modo planner.** Es la planeación al final. Parte de la investigación de software para planners del 2026-11-26 (VOWS, Aisle Planner, HoneyBook, Lovely Seating, The Bridal Link, Timeline Genius y otros). Candidatos:
   - un dashboard con todas las bodas del planner;
   - marca blanca;
   - las herramientas del día del evento del spec 33;
   - un itinerario minuto a minuto compartible con proveedores.

   Fuera quedan CRM, contratos y facturación. El cobro sería con paquetes de créditos por boda. Probablemente se parta en varios specs.
