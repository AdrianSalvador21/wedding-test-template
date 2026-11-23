# 27 — Modo "Aparta la fecha" (save the date) en el mismo link de la invitación

**Estado:** Approved
**Depende de:** SPEC 08 (login y vínculo con la boda), SPEC 16 (tier `free` / `template`), SPEC 25 (`lib/calendar.ts` y "Agregar al calendario")
**Fecha:** 2026-11-23

## Objetivo

Agregar a cada boda un interruptor "Aparta la fecha". Mientras está activo, el link de la invitación (incluidos los links por invitado) muestra solo una pantalla de save the date con el diseño de la boda; al apagarlo, ese mismo link muestra la invitación completa.

## Contexto

Una wedding planner preguntó el 2026-11-23 cómo hacemos un save the date. Hoy Invyta no lo tiene. La investigación de mercado de esa sesión (México, Latinoamérica y EE. UU.) encontró:

- **En México casi no se vende suelto.** Se usa para subir de paquete (+$250 a +$700 MXN) o se regala. Si va aparte, cuesta $399–750 MXN.
- **La tendencia más fuerte es "un solo link que evoluciona"** de save the date a invitación (Wedvite, The Digital Envelope, SEIV, Mi Webdding). Los invitados no reciben dos links distintos.
- **Contenido estándar:** nombres, fecha, ciudad (sin dirección exacta), foto, cuenta regresiva, agregar al calendario y "Invitación formal próximamente". **No lleva** confirmación de asistencia, regalos, itinerario ni código de vestimenta.
- **Tiempos en México:** 6–8 meses antes si la boda es local y 9–12 meses si es destino. Esto adelanta la venta meses antes de la invitación.

Estado real del código, revisado en esta sesión:

- **`components/WeddingTemplate.tsx` decide qué se renderiza.** Primero va la carga y el error. Luego, si `tier === 'free'`, muestra `InvitationNotActivated`. Si no, muestra `Template01..04` según `template.id`. Si hay `?guest=`, agrega `InvitationOverlay` y `MusicPlayer`. El nuevo corte del save the date va en este mismo archivo, después del corte de `free`.
- **`app/[locale]/wedding/[id]/page.tsx`** solo pasa `guest` de `searchParams` a `WeddingPageClient`. Este spec agrega `vista`.
- **`lib/calendar.ts` (spec 25)** ya genera el `.ics` (`buildWeddingIcs`, `downloadIcs`, `getWeddingIcsFilename`) con duración fija de 6 h. Lo usa solo `AddToCalendarButtonV2` (Moderno). Sus textos viven en `messages/*.json` bajo `template02.calendar`.
- **Cada diseño tiene su paleta propia:** `T1_COLORS` (`components/sections/ui.tsx`), `V2_COLORS` (`components/sections-v2/ui.tsx`), `v3Colors` (`components/sections-v3/ui.tsx`) y `v4Colors` (`components/sections-v4/ui.tsx`).
- **No existe un campo de ciudad.** Solo hay `event.ceremonyVenue` y `event.receptionVenue`, con nombre y dirección.
- **El Editor** (`app/[locale]/admin/panel/[weddingId]/editor/page.tsx`):
  - Tiene 9 pestañas (`tabs`, línea ~431) y un contador "N/9 secciones" (`isSectionComplete`).
  - Normaliza los datos al cargar con una función de migración que copia los campos de primer nivel uno por uno (por ejemplo `showConfirmCta`, línea ~68).
  - Guarda con `saveWeddingDoc` (`lib/weddingSave.ts`, `mergeFields` por campo de primer nivel) al pulsar "Guardar cambios".
  - Lo usan la pareja, el planner y el operador. Las bodas `free` ven `EditorNotAvailablePanel`.
- **Los datos públicos se leen en el cliente.** `src/services/weddingApi.ts` hace `getDoc` y `processBilingualData`, que puede convertir un `{ es, en }` en texto plano según el idioma del invitado.
- **El sitio público no tiene `AuthProvider`.** Solo lo tienen los layouts de `admin` y `login`. `POST /api/auth/link-weddings` con el token de Firebase devuelve `isAdmin` y la lista de bodas vinculadas. Según el comentario de la ruta, no escribe nada.

## Alcance

**Incluye:**

- **Campo nuevo `saveTheDate` en la boda** (`src/types/wedding.ts`), opcional. Si no existe, se considera apagado.
- **Pantalla pública `components/SaveTheDate.tsx`:** un solo componente con 4 estilos según `template.id`. Muestra:
  - foto (`heroImage`);
  - "Aparta la fecha" (o "Carlos, aparta la fecha" si hay invitado);
  - nombres de la pareja;
  - fecha larga;
  - lugar (`saveTheDate.place`);
  - cuenta regresiva;
  - mensaje opcional;
  - botón "Agregar a mi calendario";
  - el texto "Invitación formal próximamente".

  El diseño de referencia (4 estilos en móvil y escritorio, variante con invitado, pestaña del Editor y franja de vista previa) es el canvas https://claude.ai/artifact/LiEhf11s8WD9GUVYbMsM2M. **Ese canvas es la fuente de verdad visual y de copy de la pantalla y de la pestaña.**
- **Animación de apertura propia de cada estilo,** de unos 2.5 s, que corre una vez al cargar:
  - **Clásico:** un velo con el monograma en sello se desvanece; la foto pasa de `scale(1.14)` a `scale(1)` y el texto aparece escalonado.
  - **Moderno:** los anillos entran girando, los nombres suben con una máscara y la foto se descubre de arriba hacia abajo.
  - **Botánica:** el arco revela la foto de abajo hacia arriba y las ramas se dibujan solas.
  - **Jardín:** los filetes del numeral se abren desde el centro, aparece el arco y sube el panel crema.

  Al terminar, la foto queda con un acercamiento muy lento (unos 22 s, de ida y vuelta). Con `prefers-reduced-motion: reduce` no hay animación y todo se ve completo desde el inicio.
- **Corte en `WeddingTemplate.tsx`.** Si `saveTheDate.enabled` es `true` y no hay vista previa autorizada, se renderiza `SaveTheDate` en lugar del template. Tampoco se muestran `InvitationOverlay`, `MusicPlayer` ni el overlay de demo.
- **Links por invitado (`?guest=`).** La pantalla muestra el nombre del invitado y respeta su idioma, igual que hoy (incluida la redirección de idioma existente).
- **Vista previa con sesión (`?vista=completa`).** Muestra la invitación completa solo si quien abre el link tiene sesión de Firebase y es admin o dueño de esa boda. Si no, se ignora el parámetro y se ve el save the date.
- **Pestaña nueva "Aparta la fecha" en el Editor,** como primera pestaña. Contiene:
  - el interruptor;
  - el campo "Ciudad o lugar";
  - el mensaje opcional (ES y, si `hasEnglish`, EN);
  - una explicación de qué ven los invitados;
  - los botones "Ver save the date" y "Ver invitación completa".

  Se guarda con "Guardar cambios", como el resto del Editor.
- **Textos de la pantalla en `messages/es.json` y `messages/en.json`** bajo una clave nueva `saveTheDate`.
- **Calendario para los 4 diseños.** `lib/calendar.ts` deja de depender de las claves `template02.calendar` y pasa a usar `saveTheDate.calendar`. Moderno sigue funcionando igual.
- **Selector de calendario.** "Agregar a mi calendario" abre un selector con el estilo del diseño: una hoja desde abajo por debajo de 768 px, y un menú bajo el botón en escritorio. Tiene dos opciones:
  - **"Calendario del celular"** (iPhone, Android u Outlook): descarga el `.ics` actual.
  - **"Google Calendar"**: abre `https://calendar.google.com/calendar/render?action=TEMPLATE&…` en una pestaña nueva, con título, fechas, lugar y el link de la invitación prellenados.

  Se cierra con "Cancelar", tocando fuera o con Esc. El diseño de cada estilo está en la fila "Agregar a mi calendario" del canvas.

**No incluye (queda para otros specs):**

- **Precio y venta.** El precio, la fila en `PACKAGE_COMPARISON`, las FAQ y cualquier cambio en la landing, `/paquetes` o `docs/BRAND-FOUNDATIONS.md` quedan fuera. El modelo de cobro todavía no está decidido.
- Botón "Agregar al calendario" en la invitación completa de Clásico, Botánica y Jardín.
- Imagen o video vertical para estados de WhatsApp generado del diseño.
- Seguimiento de quién abrió el save the date y recordatorios.
- Recolección de datos del invitado (teléfono, ciudad de origen) desde el save the date.
- Sobre que se abre (animación de sobre) o música en el save the date. La animación de apertura de este spec no es un sobre.
- Programar el apagado automático en una fecha.
- Vista previa en las tarjetas del link (Open Graph) específica del save the date.
- Cambios en las reglas de Firestore.

## Modelo de datos

Nuevo campo opcional en `WeddingData` (`src/types/wedding.ts`), guardado en el documento `weddings/{id}`:

```ts
// Spec 27 — modo "Aparta la fecha". Ausente = apagado (bodas existentes no cambian).
saveTheDate?: {
  enabled: boolean;
  place?: string;                          // texto libre: "Guadalajara, Jalisco". Vacío = no se muestra línea de lugar.
  message?: { es: string; en: string };    // mensaje opcional bajo la fecha. Vacío = no se muestra.
};
```

Convenciones:

- **`place` es texto plano, no bilingüe.** Las ciudades no se traducen.
- **Tipos al leer `message`.** En el sitio público puede llegar como texto plano por `processBilingualData`. La pantalla lo lee con un helper que acepta `string | { es, en }`, como `v2Localized`.
- **Fecha.** La pantalla usa `event.date`, la misma fuente que la cuenta regresiva y el `.ics`.
- **Vista previa.** No se guarda nada nuevo. La autorización se calcula en cada visita con `POST /api/auth/link-weddings`.

Nuevas claves de traducción (ES / EN):

| Clave | ES | EN |
| --- | --- | --- |
| `saveTheDate.title` | Aparta la fecha | Save the date |
| `saveTheDate.titleGuest` | {name}, aparta la fecha | {name}, save the date |
| `saveTheDate.formalToFollow` | Invitación formal próximamente | Formal invitation to follow |
| `saveTheDate.addToCalendar` | Agregar a mi calendario | Add to my calendar |
| `saveTheDate.calendarPhone` / `calendarPhoneHint` | Calendario del celular / iPhone, Android u Outlook | Phone calendar / iPhone, Android or Outlook |
| `saveTheDate.calendarGoogle` / `calendarGoogleHint` | Google Calendar / Se abre en tu cuenta de Google | Google Calendar / Opens in your Google account |
| `saveTheDate.cancel` | Cancelar | Cancel |
| `saveTheDate.countdown.days` / `hours` / `minutes` | días / horas / min | days / hours / min |
| `saveTheDate.calendar.title` | Boda de {bride} & {groom} | {bride} & {groom}'s wedding |
| `saveTheDate.calendar.filename` | boda-{bride}-{groom} | wedding-{bride}-{groom} |

Los textos de `calendar` deben copiarse tal cual de `template02.calendar` para no cambiar lo que ya ven los invitados de Moderno.

## Plan de implementación

Cada paso deja el proyecto compilando y las invitaciones actuales funcionando igual.

1. **Tipo y textos.**
   - Agregar `saveTheDate?` a `WeddingData` en `src/types/wedding.ts`.
   - Agregar las claves `saveTheDate.*` a `messages/es.json` y `messages/en.json`.
   - En `lib/calendar.ts`, cambiar `template02.calendar.*` por `saveTheDate.calendar.*` con los mismos textos.
   - Agregar `buildGoogleCalendarUrl(wedding, locale, invitationUrl)` en `lib/calendar.ts`. Usa el mismo inicio, fin, título y lugar que `buildWeddingIcs` (`dates=` en formato UTC `YYYYMMDDTHHMMSSZ/…`) y pone el link de la invitación en `details`.
   - Prueba: `npm run build` sin errores. En una boda Moderno, "Agregar al calendario" descarga el mismo `.ics` que antes.
2. **Pantalla `components/SaveTheDate.tsx`.**
   - Recibe `wedding`, `guestName?` y `locale`.
   - Elige su estilo con un mapa `template.id → { colores, tipografías }` que lee `T1_COLORS`, `V2_COLORS`, `v3Colors` y `v4Colors`, con las mismas familias tipográficas del hero de cada diseño.
   - Usa una cuenta regresiva propia simple (días, horas y minutos desde `event.date`) y un botón de calendario que abre el selector "Calendario del celular" (`buildWeddingIcs`/`downloadIcs`) o "Google Calendar" (`buildGoogleCalendarUrl`, pestaña nueva).
   - Oculta la línea de lugar si `place` está vacío, el mensaje si está vacío y la cuenta regresiva y el botón de calendario si `event.date` no existe o ya pasó.
   - Ocupa al menos el alto de la pantalla y no tiene secciones, navegación, RSVP ni barra fija de confirmación.
   - Al pie va el mismo footer "invyta" de `WeddingTemplate`.
   - Prueba: montarlo a mano en una ruta local con cada uno de los 4 `template.id` y revisarlo contra el canvas a 390 px y a 1440 px.
3. **Animación de apertura.**
   - Implementarla dentro de `SaveTheDate.tsx` con `framer-motion` (ya es dependencia y `components/sections/ui.tsx` ya usa `useReducedMotion`), con una variante de entrada por estilo y los tiempos de la nota "Animación de apertura" del canvas.
   - Solo se animan `opacity`, `transform` y `clip-path`, para no provocar saltos de layout.
   - Si `useReducedMotion()` devuelve `true`, se renderiza todo en su estado final sin animar.
   - El velo del Clásico no bloquea clics (`pointer-events: none`) y se quita del DOM al terminar.
   - Prueba: recargar cada estilo y ver la apertura completa. Con "reducir movimiento" activado en el sistema, la pantalla aparece completa al instante.
4. **Corte en el sitio público.**
   - `app/[locale]/wedding/[id]/page.tsx` lee `searchParams.vista` y lo pasa por `WeddingPageClient` hasta `WeddingTemplate` como `previewFull: boolean` (`vista === 'completa'`).
   - En `WeddingTemplate.tsx`, después del corte de `tier === 'free'`: si `currentWedding.saveTheDate?.enabled` y no hay vista previa autorizada, renderizar `<SaveTheDate>` con `guestInfo?.name` cuando exista el invitado. En ese caso no se renderizan `InvitationOverlay`, el overlay de demo ni `MusicPlayer`.
   - La carga del invitado y la redirección de idioma existentes se mantienen.
   - Prueba: con `saveTheDate.enabled: true` puesto a mano en Firestore, `/es/wedding/{id}` y `/es/wedding/{id}?guest={guestId}` muestran el save the date. Con `false` o sin el campo, muestran la invitación como hoy.
5. **Vista previa autorizada.**
   - Crear `hooks/useCanPreviewFull.ts`. Solo cuando `previewFull` es `true`, el hook:
     1. espera `onAuthStateChanged` del `auth` de `lib/firebase`;
     2. si hay usuario, llama `POST /api/auth/link-weddings` con su token;
     3. devuelve `true` si `isAdmin` o si la boda está en `weddings`.
   - Mientras resuelve, `WeddingTemplate` muestra el spinner de carga existente.
   - Con vista previa autorizada se renderiza el template completo con una franja fija arriba: "Vista previa · Tus invitados ven 'Aparta la fecha' mientras esté activo". Esa franja no se muestra si `saveTheDate.enabled` es `false`.
   - Prueba: con sesión de dueño, `?vista=completa` muestra la invitación con la franja. En incógnito, el mismo link muestra el save the date.
6. **Pestaña "Aparta la fecha" en el Editor.**
   - Agregar `{ id: 'saveTheDate', label: 'Aparta la fecha', icon: CalendarHeart }` como primer elemento de `tabs`. Excluirla del contador "N/9 secciones" para que siga contando las 9 pestañas de contenido.
   - Copiar `saveTheDate` en la función de migración del Editor, igual que `showConfirmCta`.
   - Contenido de la pestaña:
     - Interruptor "Mostrar 'Aparta la fecha' en lugar de la invitación".
     - Campo "Ciudad o lugar" con la ayuda "Ej. Guadalajara, Jalisco. No pongas la dirección exacta del salón."
     - Campo "Mensaje (opcional)" en ES, y en EN si `hasEnglish`.
     - Una caja informativa con lo que ven los invitados en cada estado.
     - Botones "Ver save the date" (`/{locale}/wedding/{id}`) y "Ver invitación completa" (`/{locale}/wedding/{id}?vista=completa`), ambos en pestaña nueva.
   - Mover el interruptor marca "Cambios sin guardar" y no publica nada hasta "Guardar cambios".
   - Prueba: activar y guardar desde el Editor con una cuenta de pareja. El link público muestra el save the date. Al apagar y guardar, muestra la invitación.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos.
- [ ] Una boda sin el campo `saveTheDate` se ve exactamente igual que antes de este spec en los 4 diseños.
- [ ] Con `saveTheDate.enabled: true`, `/es/wedding/{id}` muestra la pantalla de save the date y no aparece ningún formulario ni botón de confirmación de asistencia.
- [ ] La pantalla muestra foto, "Aparta la fecha", nombres, fecha, lugar, cuenta regresiva, mensaje, "Agregar a mi calendario" e "Invitación formal próximamente".
- [ ] Al cargar, cada estilo muestra su animación de apertura (Clásico: velo con monograma; Moderno: anillos y nombres con máscara; Botánica: arco y ramas; Jardín: filetes, arco y panel), y en menos de 3 s todo el contenido queda visible.
- [ ] Con "reducir movimiento" activado en el sistema, la pantalla aparece completa sin ninguna animación.
- [ ] Durante la apertura el botón "Agregar a mi calendario" funciona en cuanto es visible; el velo del Clásico no bloquea clics.
- [ ] Con `place` vacío no aparece ninguna línea de lugar.
- [ ] Con `message` vacío no aparece ningún mensaje.
- [ ] La pantalla usa colores y tipografías distintos para `template-01`, `template-02`, `template-03` y `template-04`, tomados de la paleta de cada diseño.
- [ ] "Agregar a mi calendario" abre un selector con "Calendario del celular" y "Google Calendar" en los 4 diseños. En móvil es una hoja desde abajo y en escritorio un menú, y se cierra con "Cancelar", tocando fuera o con Esc.
- [ ] "Calendario del celular" descarga un `.ics` que se abre en el calendario del celular con el título "Boda de {novia} & {novio}".
- [ ] "Google Calendar" abre en una pestaña nueva el formulario de evento de Google con el mismo título, la misma fecha y hora, el lugar y el link de la invitación en la descripción.
- [ ] Con `?guest={guestId}` válido, la pantalla dice "{Nombre}, aparta la fecha" y no aparece el overlay de bienvenida.
- [ ] Un invitado con idioma `en` ve los textos en inglés ("Save the date", "Formal invitation to follow").
- [ ] Mientras el save the date está activo no suena música ni aparece el botón de música.
- [ ] Con `saveTheDate.enabled: false`, el mismo link (con y sin `?guest=`) muestra la invitación completa y el overlay de bienvenida como hoy.
- [ ] `?vista=completa` en una ventana de incógnito muestra el save the date, no la invitación.
- [ ] `?vista=completa` con sesión de admin o de un correo dueño de la boda muestra la invitación completa con la franja "Vista previa".
- [ ] `?vista=completa` con sesión de un correo que no es dueño de esa boda muestra el save the date.
- [ ] El Editor muestra "Aparta la fecha" como primera pestaña, y el contador sigue diciendo "N/9 secciones".
- [ ] Mover el interruptor sin guardar no cambia lo que ve el link público.
- [ ] Después de "Guardar cambios", el link público refleja el estado nuevo al recargar.
- [ ] Guardar otra pestaña del Editor no borra ni apaga `saveTheDate`.
- [ ] Las demos (`template-01-demo`, `template-02-demo`, `valentina-mateo-2026`, `template-04-demo`) se ven igual que antes.

## Decisiones tomadas y descartadas

- **Sí: mismo link, con un interruptor en la boda.** Es la tendencia más fuerte del mercado y el principal argumento de venta ("mandas un solo link y se transforma"). **No:** una URL o boda aparte para el save the date, porque obliga a mandar dos links y duplica datos.
- **Sí: la pareja y el operador lo controlan desde el Editor.** Decisión del usuario. El Editor ya lo usan la pareja, el planner y el operador. **No:** un interruptor solo para el operador en "Ajustes de la invitación".
- **Sí: pestaña propia "Aparta la fecha", primera del Editor.** Decisión del usuario. Junta el interruptor, el lugar y el mensaje en un solo lugar. **No:** una tarjeta dentro de "Evento".
- **Sí: se guarda con "Guardar cambios".** Decisión del usuario. Es igual que el resto del Editor y evita publicar o apagar por un clic accidental. **No:** guardado instantáneo con modal.
- **Sí: un componente con 4 estilos según `template.id`.** Decisión del usuario. **No:** 4 pantallas a la medida, que serían unas 4 veces el trabajo.
- **Sí: campo nuevo de texto libre para el lugar.** Decisión del usuario. La etiqueta recomienda la ciudad y no el salón. **No:** usar el nombre del lugar de recepción, que revela un salón que a veces no está confirmado.
- **Sí: el nombre del invitado va dentro de la pantalla, sin overlay.** Decisión del usuario. El overlay de bienvenida se reserva para la invitación completa.
- **Sí: vista previa solo con sesión de admin o dueño.** Decisión del usuario. Reutiliza `POST /api/auth/link-weddings`, que ya resuelve admin y dueños sin escribir nada. **No:** un parámetro abierto, porque reenviar el link mostraría la invitación antes de tiempo. **No:** sin vista previa, porque obligaría a apagar el save the date para revisar.
- **Sí: el precio y la comunicación comercial quedan fuera.** Decisión del usuario. El modelo de cobro todavía no está decidido. La función se puede construir sin él.
- **Sí: `place` no es bilingüe y `message` sí.** Los nombres de ciudades no se traducen. El mensaje sigue la convención `{ es, en }` del resto del Editor.
- **Sí: dos opciones de calendario, celular (`.ics`) y Google Calendar (link).** Decisión del usuario. En Android con Google el `.ics` no siempre abre el calendario, y muchos invitados usan Google en el celular. **No:** una opción aparte para Outlook o Yahoo, porque Outlook ya lee el `.ics`.
- **Sí: el calendario pasa a claves `saveTheDate.calendar`.** Así los 4 diseños comparten textos sin depender de las claves de Moderno, y los textos no cambian.
- **No: confirmación de asistencia, regalos ni itinerario en el save the date.** La etiqueta y todos los competidores lo desaconsejan.
- **Sí: animación de apertura propia de cada estilo, corta (unos 2.5 s) y solo una vez.** Decisión del usuario, que pidió un movimiento elegante, sencillo y profesional. Cada estilo usa su propio gesto (sello, anillos, arco o panel) para que no se parezcan entre sí. **No:** sobre que se abre, porque suma un clic antes de ver la fecha y ya lo ofrecen muchos competidores. **No:** repetir la apertura en bucle, porque distrae. Lo único continuo es el acercamiento muy lento de la foto.
- **No: música en el save the date.** Es una pantalla corta. La música se queda en la invitación completa.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| La pareja deja activo el save the date por olvido y los invitados nunca ven la invitación. | La pestaña explica qué ven los invitados en cada estado. El operador puede apagarlo desde el mismo Editor. |
| Ocultar la invitación no es seguridad real. Los datos completos se siguen descargando en el cliente y las reglas de Firestore están abiertas. | Se acepta. Es una decisión de presentación, no de privacidad. Endurecer reglas ya está registrado como pendiente aparte. |
| La función de migración del Editor no copia `saveTheDate`, y un guardado lo borra o lo apaga. | El paso 5 la copia de forma explícita y hay un criterio de aceptación para esto. `saveWeddingDoc` usa `mergeFields`, así que otras páginas que no traen el campo no lo tocan. |
| `processBilingualData` entrega `message` como texto plano en el sitio público. | La pantalla lo lee con un helper que acepta `string` o `{ es, en }`. |
| Cambiar las claves del calendario rompe el `.ics` de Moderno. | Los textos se copian sin cambios. Hay un criterio de aceptación sobre el `.ics` y una prueba en el paso 1. |
| El link compartido por WhatsApp muestra la vista previa genérica "Invitación de Boda" para bodas reales. | Se acepta. Es el comportamiento actual de `generateMetadata` para bodas de Firestore. Una vista previa propia queda fuera de alcance. |

## Lo que **no** está en este spec

- Precio, landing, `/paquetes`, FAQ y `BRAND-FOUNDATIONS` del save the date.
- "Agregar al calendario" en la invitación completa de Clásico, Botánica y Jardín.
- Imagen o video para estados de WhatsApp.
- Seguimiento de aperturas, recordatorios y recolección de datos del invitado.
- Sobre animado y música.
- Apagado automático programado.
- Vista previa Open Graph del save the date.
- Reglas de Firestore.

Cada uno de estos, si se decide hacer, va en su propio spec.
