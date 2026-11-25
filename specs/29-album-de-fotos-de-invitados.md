# 29 — Álbum de fotos de los invitados

**Estado:** Approved
**Depende de:** SPEC 08 (login y vínculo con la boda), SPEC 16 (tier `free` / `template`), SPEC 21 (panel y `PanelDataContext`), SPEC 25 (template 02 "Moderno"), SPEC 27 (modo "Aparta la fecha")
**Fecha:** 2026-11-24
**Diseño:** canvas `https://claude.ai/artifact/GwsF96ct7CPeMMby5mjMFf` (página "Flujo base" para el flujo y el panel, página "Por template" para la vista del invitado en cada template)

## Objetivo

Que los invitados de una boda con el álbum activado suban fotos desde su link personal o desde un QR en las mesas, y que la pareja las vea, oculte, borre y descargue desde su panel.

## Contexto

### Mercado

Investigación hecha el 2026-11-24. Se revisaron 13Bodas, Convite, Mi Webdding, FotoLive, Zankyou, WedShoots (Bodas.com.mx), Joy, Zola, The Knot, Paperless Post, Greenvelope, Minted, POV, Lense, Kululu, GuestPix y Wedibox.

- **El patrón dominante es un QR o link que abre una página web, sin app y sin cuenta.**
  - WedShoots es gratis, pero obliga a descargar la app, y eso le resta participación.
- **En México ya lo venden competidores directos.**
  - Convite lo cobra como extra a MXN 399.
  - 13Bodas lo cobra a MXN 1,800 (800 con cupón), con QR en mesas, moderación, modo proyector y ZIP.
- **En EE. UU. las plataformas grandes lo resuelven mal.**
  - The Knot cerró "The Guest" en 2022.
  - Minted no lo tiene.
  - Zola lo cobra aparte (US$12.99–25).
  - Las apps especializadas cobran un solo pago de US$35–119.
- **Patrones que se adoptan aquí:**
  - entrar sin esfuerzo (QR en mesas, sin login);
  - nombre opcional;
  - "cámara desechable", con tope de fotos y revelado diferido;
  - publicación automática con opción de ocultar;
  - descarga en ZIP;
  - fecha límite para subir separada de la fecha de borrado.
- **La ventaja de Invyta es el link personal.** Atribuye cada foto a una invitación sin pedir login.

### Estado real del código (revisado en esta sesión)

- **No hay almacenamiento de archivos en la nube.**
  - `lib/firebase.ts` inicializa solo Firestore y Auth.
  - Las fotos de cada boda viven en `public/assets/wedding-images/{id}` y se leen con `app/api/wedding-images/[weddingId]/route.ts`.
  - Ya existe la variable `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, pero no se usa.
- **firebase-admin** se inicializa en `lib/firebase-admin.ts` (`getAdminAuth`, `getAdminDb`) desde `FIREBASE_SERVICE_ACCOUNT_JSON`. Lo usan las rutas API con `runtime = 'nodejs'`.
- **Operador de Invyta.**
  - Es un correo verificado incluido en `ADMIN_EMAILS` (`requireAdmin`, en `lib/serverAuth.ts`).
  - Su interfaz es `app/[locale]/admin/page.tsx`, con `SettingsModal` en `components/admin/OperatorTools.tsx`.
  - `PATCH /api/admin/weddings/[weddingId]` hoy solo acepta `templateId`, `newWeddingId` y `plannerEmail`.
- **No hay un helper que valide en el servidor que un correo es dueño de una boda.** Los dueños viven en `weddingOwners/{id}.emails`.
- **Panel de la pareja.**
  - El menú está en `NAV_ITEMS` (`components/admin/panel/ui.tsx`). El sidebar mide 260 px, y la opción activa usa `bg-[rgba(198,102,60,0.08)] text-[#AE5730]`.
  - `PanelSection` vale `'dashboard' | 'editor' | 'guests' | 'confirmations' | 'tables'`.
  - Cada página arranca con `AdminTopBar` (`components/admin/ui.tsx`): barra blanca, título de 24 px, `meta` y `actions`. El contenido va con `px-4 sm:px-10 py-8`.
  - Las piezas son `AdminStatCard`, `AdminStatusPill`, `AdminButton` (`solid` terracota `#AE5730`, `ghost` blanco) y tarjetas `bg-white border-[rgba(0,0,0,0.08)] rounded-2xl p-5`. El peso tipográfico máximo es 600.
  - En celular, `PanelTopBar` mide 56 px y el sidebar se abre como cajón.
  - El CTA de activación por WhatsApp usa `whatsappUrl` de `lib/contact`.
- **Invitación pública.**
  - Se arma en `app/[locale]/wedding/[id]/wedding-page.tsx`, que usa `components/WeddingTemplate.tsx`.
  - `?guest=` se resuelve con `guestService.getGuestByGuestId`.
  - `tier === 'free'` muestra `InvitationNotActivated`.
  - El save the date se decide en `WeddingTemplate` (línea ~178).
  - Cada template (01–04) tiene su propio set de secciones (`components/sections*`). No hay secciones compartidas.
  - El botón de música global (`MusicPlayer`) va abajo a la derecha en los templates 01, 03 y 04. El 02 dibuja el suyo arriba a la derecha (spec 25).
  - El template 02 tiene `StickyConfirmBarV2`: una barra fija abajo con los nombres, la fecha y "Confirmar". Aparece al salir del hero y se oculta al llegar al RSVP.
- **`firestore.rules`** tiene todas las colecciones abiertas (`if true`).

## Alcance

Todo este spec aplica **solo a bodas con `tier !== 'free'`**.

- **Sin el álbum activado:** la invitación no hace ninguna referencia a las fotos. El panel ofrece el álbum.
- **Con el álbum activado por el operador:** aparece todo lo del invitado.

**Incluye:**

1. **Infraestructura.**
   - Firebase Storage en el plan Blaze, con el bucket en `us-central1`.
   - `storage.rules` cerrado para los clientes. Todo se escribe desde el servidor.
2. **Activación por el operador.**
   - El álbum es un extra de **$399 MXN**. El pago se acuerda por WhatsApp.
   - El operador lo enciende o apaga desde `SettingsModal`.
3. **Dos modos, elegidos por la pareja:**
   - **Álbum abierto:** cada foto se ve en el álbum en cuanto se sube.
   - **Cámara desechable:** cada invitado solo ve sus propias fotos hasta el revelado, que es el día siguiente de la boda a las 10:00. La pareja ve todas desde el principio.
   - En los dos modos el límite es de **30 fotos por invitación** (link personal) o **por dispositivo** (QR general).
4. **Página pública del álbum** en `/{locale}/wedding/{id}/fotos`, **con el diseño del template de la boda**.
   - Con `?guest={guestId}`, las fotos se atribuyen a esa invitación con su nombre.
   - Sin `?guest=` (QR general), se usa un id anónimo del dispositivo y un nombre opcional.
5. **Ventana de subida:** desde las 00:00 del día de la boda hasta las 23:59 del día +21 (3 semanas), en hora de la Ciudad de México.
6. **Acceso desde la invitación:**
   - **Templates 01, 03 y 04:** un botón flotante "Comparte tus fotos" abajo a la izquierda, con el estilo de botón de cada template.
   - **Template 02:** sin botón flotante. El día de la boda, `StickyConfirmBarV2` cambia su botón "Confirmar" por "Comparte tus fotos".
7. **Compresión en el teléfono antes de subir.**
   - La foto queda a 2048 px en su lado mayor, en JPEG con calidad 0.82.
   - Se genera también una miniatura de 480 px.
   - Solo fotos, no videos.
8. **Sección "Fotos" en el panel de la pareja**, en escritorio y en celular, con:
   - la tarjeta de venta, si el álbum no está activado;
   - el encabezado con el estado y el modo;
   - 4 contadores;
   - el modo del álbum, las fechas de la ventana y el QR;
   - la galería, con el filtro "Todas / Ocultas", y ocultar o mostrar y borrar en cada foto;
   - la descarga en ZIP y el QR imprimible por template;
   - el aviso de hasta cuándo se guardan las fotos.
9. **Retención de 2 años desde la fecha de la boda.** Se guarda la fecha y se muestra el aviso. Las fotos no se borran solas en este spec.
10. **Textos del invitado en español e inglés**, según el idioma de la URL.
11. **Página de venta en el panel** para las bodas sin el álbum activado.
12. **Banner en la landing y página pública `/album-de-fotos`** con el detalle, el precio y las preguntas frecuentes.

**No incluye (queda para otros specs):**

- Slideshow en vivo o modo proyector. Va en el SPEC 30.
- Exportar las fotos a Google Drive (o Google Fotos). La pareja las descarga en ZIP.
- Videos.
- Guardar la foto original sin comprimir.
- Que el invitado descargue fotos.
- Moderación previa (aprobar antes de publicar).
- Borrado automático al vencer y avisos por correo o WhatsApp antes del borrado.
- Cobro en línea del extra. Se sigue cobrando por WhatsApp.
- Mostrar el extra en `/paquetes`, en la FAQ general o en el menú principal.
- Actualizar `app/aviso-de-privacidad`.
- Likes, comentarios o filtros de imagen en las fotos.
- Cambiar la ventana de subida o el límite de fotos desde el panel.
- Una sección del álbum dentro de los sets de secciones de cada template.
- La versión de escritorio de la página del invitado más allá de centrar la columna móvil.
- Bodas gratis.
- Cerrar las reglas de Firestore de las colecciones que ya existen.

## Modelo de datos

### `WeddingData` (`src/types/wedding.ts`), campo nuevo opcional

```ts
// Spec 29 — álbum de fotos de los invitados. Ausente = no activado.
export interface PhotoAlbumConfig {
  enabled: boolean;              // lo escribe solo el operador
  mode: 'open' | 'disposable';   // lo elige la pareja; 'open' por defecto
  activatedAt: string;           // ISO, la primera vez que el operador lo enciende
}

photoAlbum?: PhotoAlbumConfig;
```

Las fechas no se guardan. Se calculan con `event.date` en `lib/album.ts`, en la zona `America/Mexico_City`:

| Función | Valor |
| --- | --- |
| `uploadOpensAt(wedding)` | 00:00 del día de la boda |
| `uploadClosesAt(wedding)` | 23:59:59 del día de la boda + 21 |
| `revealAt(wedding)` | 10:00 del día siguiente a la boda |
| `expiresAt(wedding)` | final del día de la boda + 2 años |
| `albumPhase(wedding, now)` | `'disabled' \| 'before' \| 'open' \| 'closed' \| 'expired'` |

- Sin `event.date`, la fase es `'before'` y la página dice "La fecha de la boda aún no está definida".
- Apagar el álbum (`enabled: false`) da `'disabled'` y no borra fotos.
- El modo se puede cambiar solo en la fase `'before'`.

### Colección nueva `albumPhotos`

```ts
// Spec 29 — una foto subida por un invitado. Solo la lee y escribe el servidor.
export interface AlbumPhoto {
  id: string;                         // id del documento
  weddingId: string;
  source: 'guest' | 'device';         // link personal o QR general
  guestId?: string;                   // si source === 'guest'
  deviceId?: string;                  // si source === 'device' (uuid del navegador)
  uploaderName?: string;              // guest.name, o el nombre opcional del QR (máx. 60)
  storagePath: string;                // albums/{weddingId}/{id}.jpg
  thumbPath: string;                  // albums/{weddingId}/{id}_thumb.jpg
  url: string;                        // URL de descarga con token
  thumbUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  hidden: boolean;                    // la pareja la ocultó
  createdAt: string;                  // ISO, del servidor
}
```

- **URLs.** El servidor sube los archivos con `metadata.firebaseStorageDownloadTokens = <uuid>` y arma `https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path codificado}?alt=media&token={uuid}`. Así las URLs funcionan aunque `storage.rules` niegue todo a los clientes.
- **Firestore.** `firestore.rules` agrega `match /albumPhotos/{id} { allow read, write: if false; }`. Así nadie puede listar las URLs desde el cliente, que en modo cámara desechable revelarían el álbum antes de tiempo.
- **Índice.** `firestore.indexes.json` agrega un índice compuesto en `weddingId` + `createdAt desc`.
- **Conteo del límite.** Se hace con `count()` filtrando `weddingId` y `guestId`, o `weddingId` y `deviceId`. Las fotos ocultas cuentan. Las borradas no.

### Navegador del invitado

- `localStorage['invyta:album-device']` guarda el uuid del dispositivo y se crea la primera vez.
- `localStorage['invyta:album-name']` guarda el nombre opcional del QR.
- Las lecturas y escrituras van dentro de try/catch. Si falla, se genera un uuid en memoria para la sesión.

### Estilos por template (`components/album/albumThemes.ts`)

Un objeto `ALBUM_THEMES: Record<'template-01' | 'template-02' | 'template-03' | 'template-04', AlbumTheme>` con los tokens que usan la página `/fotos`, el botón de la invitación y el QR imprimible. Los valores salen de cada template en producción. No se inventan colores ni adornos.

| Template | Fuente de verdad | Fondo · texto · acento | Tipografía | Botón principal | Encabezado del álbum |
| --- | --- | --- | --- | --- | --- |
| 01 Clásico | `components/sections/Hero.tsx`, `ui.tsx` | `#faf8f5` · `#5a4a3a` · `#8B5E34`, oro `#c9a86a` | Allura (nombres), Cormorant 600 (títulos), Lora (texto) | recto, `#8B5E34`, Lora 11.5 px, mayúsculas `.18em` | foto oscura con los nombres en Allura y divisor de rombo |
| 02 Moderno | `components/sections-v2/ui.tsx`, canvas del spec 25 | `#F2EFEA` · `#1E1C19` · bronce `#7A5A3C` | Bricolage Grotesque 400 (nombres), Plus Jakarta Sans (texto) | píldora `#1E1C19`, 56 px | sobretítulo con raya, nombres apilados con "&" bronce, insignia "M·D" y fila con filetes |
| 03 Botánica | `components/sections-v3/HeroV3.tsx`, `ui.tsx` | `#FAF6EF` · `#34302A` · terracota `#B5643A`, salvia `#85906E` | Cormorant itálica 500 (nombres), Jost (texto) | píldora `#B5643A` | foto en arco, ramas de línea y "&" terracota |
| 04 Jardín | `components/sections-v4/HeroV4.tsx`, `ui.tsx` | `#F4EFE3` · `#2E3323` · acento `#B0714A`, oro `#C9A98C` | Georgia (todo), Helvetica en etiquetas | recto, `#2E3323`, 11 px, mayúsculas `.2em` | banda olivo con los nombres en mayúsculas y la "y" dorada en itálica |

- Los numerales de sección de la invitación (por ejemplo "XII" en el 04 o "05" en el 02) **no** se usan en el álbum.
- En la cámara desechable, la tarjeta de aviso usa la superficie oscura del template cuando existe (tinta en el 02, olivo en el 04).
- Si el template de la boda no está en `ALBUM_THEMES`, se usa el del 02.

### Rutas API nuevas (`runtime = 'nodejs'`)

| Ruta | Quién | Qué hace |
| --- | --- | --- |
| `GET /api/album/[weddingId]?guest=&device=` | público | Devuelve `{ phase, mode, revealAt, names, templateId, remaining, photos }`. En modo abierto, `photos` son todas las fotos con `hidden: false`. En modo desechable, antes de `revealAt`, solo las del mismo `guestId` o `deviceId`. Cada foto trae `{ id, thumbUrl, url, width, height, uploaderName, createdAt }`. |
| `POST /api/album/[weddingId]/photos` | público | `multipart/form-data` con `photo` (JPEG ≤ 1.5 MB), `thumb` (JPEG ≤ 200 KB), `guestId` o `deviceId`, y `name` opcional. Valida y escribe en Storage y en `albumPhotos`. |
| `GET /api/panel/album/[weddingId]` | dueño u operador | Devuelve todas las fotos, incluidas las ocultas, y `stats: { total, hidden, participants }`. `participants` es el número de `guestId` y `deviceId` distintos. |
| `PATCH /api/panel/album/[weddingId]/photos/[photoId]` | dueño u operador | `{ hidden: boolean }`. |
| `DELETE /api/panel/album/[weddingId]/photos/[photoId]` | dueño u operador | Borra los dos archivos de Storage y el documento. |
| `PATCH /api/panel/album/[weddingId]` | dueño u operador | `{ mode }`. Solo en la fase `'before'`; si no, responde 409. |
| `PATCH /api/admin/weddings/[weddingId]` (existente) | operador | Acepta `photoAlbum: { enabled: boolean }`. La primera vez que se enciende escribe `mode: 'open'` y `activatedAt`. |

Validaciones de `POST .../photos`, en este orden:

| Caso | Respuesta |
| --- | --- |
| La boda no existe, es `free` o la fase es `'disabled'` | 404 `album_unavailable` |
| La fase no es `'open'` | 403 `album_closed` |
| `guestId` no corresponde a un invitado de esa boda | 400 `invalid_guest` |
| No llega ni `guestId` ni un `deviceId` con formato uuid | 400 `missing_uploader` |
| El archivo no es `image/jpeg` o pasa del tamaño | 400 `invalid_file` |
| Ya hay 30 fotos para ese `guestId` o `deviceId` | 429 `limit_reached` |

**`requireWeddingAccess(req, weddingId)`** se agrega en `lib/serverAuth.ts`. Pasa si el correo verificado es de un operador o está en `weddingOwners/{weddingId}.emails`.

### Eventos de analytics (`lib/analytics/events.ts`)

- `album_photo_uploaded: { mode: 'open' | 'disposable'; source: 'guest' | 'device' }`
- `album_zip_downloaded: { photos: number }`
- `album_qr_downloaded: NoProps`
- `album_activation_cta_click: NoProps`

### Archivos nuevos

| Archivo | Contenido |
| --- | --- |
| `storage.rules` | `allow read, write: if false` para todo |
| `lib/album.ts` | fechas, `albumPhase`, `ALBUM_PHOTO_LIMIT = 30` (funciones puras) |
| `lib/imageCompress.ts` | `compressImage(file)` → `{ photo: Blob, thumb: Blob, width, height }` con `createImageBitmap` y canvas |
| `lib/firebase-admin.ts` (cambio) | se agrega `getAdminBucket()` |
| `app/api/album/[weddingId]/route.ts` | GET público |
| `app/api/album/[weddingId]/photos/route.ts` | POST público |
| `app/api/panel/album/[weddingId]/route.ts` | GET y PATCH del panel |
| `app/api/panel/album/[weddingId]/photos/[photoId]/route.ts` | PATCH y DELETE del panel |
| `app/[locale]/wedding/[id]/fotos/page.tsx` | página pública del álbum |
| `components/album/albumThemes.ts` | tokens por template |
| `components/album/GuestAlbum.tsx` | interfaz del invitado, pintada con el tema del template |
| `components/album/AlbumFab.tsx` | botón flotante de los templates 01, 03 y 04 |
| `components/sections-v2/StickyConfirmBarV2.tsx` (cambio) | botón "Comparte tus fotos" en la fase `'open'` |
| `app/[locale]/admin/panel/[weddingId]/photos/page.tsx` | sección "Fotos" del panel |
| `components/admin/album/AlbumQrCard.tsx` | QR imprimible por template (PNG) |
| `components/admin/album/DeletePhotoModal.tsx` | modal para confirmar el borrado |
| `components/admin/album/AlbumZipModal.tsx` | progreso de la descarga en ZIP |
| `components/admin/album/AlbumSalesPanel.tsx` | página de venta del panel (álbum sin activar) |
| `lib/albumServer.ts` | utilidades del servidor (lectura de bodas y fotos, guardado en Storage) |
| `app/api/panel/album/[weddingId]/photos/[photoId]/route.ts` (GET) | entrega el JPEG de una foto para el ZIP, sin depender de configurar CORS en el bucket |
| `components/landing/AlbumBanner.tsx` | banner del álbum en la landing |
| `app/album-de-fotos/page.tsx` | página pública del álbum, con precio y preguntas frecuentes |
| `lib/marketing-content.ts`, `lib/site.ts`, `components/landing/Footer.tsx`, `components/LandingPage.tsx` (cambio) | `ALBUM_FAQ`, la ruta en `NON_LOCALIZED_PATHS` y `MARKETING_PAGES`, el enlace del footer y el banner |
| `messages/es.json`, `messages/en.json` (cambio) | textos `album.*` |

Dependencias nuevas: `qrcode`, para el QR, y `client-zip`, para el ZIP en el navegador. Las dos se cargan con `import()` solo donde se usan.

## Experiencia

### Página del invitado (`/fotos`)

- **Se ve con el estilo del template de la boda** (`ALBUM_THEMES[templateId]`), como en la página "Por template" del canvas. La columna es móvil, de máximo 480 px, centrada en escritorio.
- **Encabezado:** lleva "Álbum de la boda", los nombres de los novios con el adorno de su template y la fecha.
- **Estados según la fase:**

| Fase | Qué se ve |
| --- | --- |
| `before` | "El álbum se abre el día de la boda", la fecha y "Ese día podrás subir hasta 30 fotos desde aquí." No hay botón para subir. |
| `open`, modo abierto | El saludo, el botón "Subir fotos", el contador "Te quedan {n} de 30 fotos", la nota de privacidad y la cuadrícula "Fotos de todos", de la más reciente a la más antigua, con el nombre de quien subió cada una. |
| `open`, modo desechable | Una tarjeta "Cámara desechable · El álbum se revela el {fecha} a las 10:00. Mientras, solo tú ves tus fotos.", el botón, el contador, "Tus fotos" y el aviso "Las fotos de los demás invitados aparecerán aquí el {fecha} a las 10:00." |
| `open`, con 30 fotos ya subidas | El botón deshabilitado y "Ya subiste tus 30 fotos. ¡Gracias!". |
| `closed` o después de `revealAt` | "Ya no se reciben fotos", "Gracias por compartir. Aquí están las {n} fotos de la boda." y la cuadrícula completa. En modo desechable se ve completa solo después de `revealAt`. |
| `expired`, `disabled` o `free` | "Este álbum no está disponible." y "Si crees que es un error, pregúntales a los novios." |

- **Con link personal:** el saludo es "Hola, {guest.name}. Comparte las fotos que tomaste hoy." No se pide nombre.
- **Con el QR general (sin `?guest=`):**
  - Se muestra el campo "Tu nombre (opcional)", lleno con el que se haya guardado, y la ayuda "Aparecerá junto a tus fotos. Si lo dejas vacío, dirá 'Invitado'."
  - El contador dice "Te quedan {n} de 30 fotos en este teléfono".
- **Bajo el botón** va la nota "Al subir fotos, los novios podrán verlas y descargarlas."
- **Al pulsar "Subir fotos":**
  - Se abre `<input type="file" accept="image/*" multiple>`.
  - Si se eligen más de las que quedan, se avisa "Elegiste {x} fotos. Solo se subirán {n}, porque te quedaban {n} de 30." y se suben las primeras {n}.
  - Se abre una hoja inferior con "Subiendo {i} de {n}", "No cierres esta página hasta que termine." y una fila por foto: "Subida", "Subiendo… {p} %", "En espera" o "No se pudo subir" con "Reintentar".
  - Cada foto se comprime y se sube **de una en una**. Si una falla, las demás siguen.
  - Al terminar: "¡Gracias! Se subieron {n} fotos".
- **Al tocar una foto** se abre el visor a pantalla completa, con fondo oscuro, "{i} de {total}", anterior y siguiente, el nombre de quien la subió y la hora. No hay botón de descarga.

### Acceso desde la invitación

- **Solo aparece si se cumplen todas estas condiciones:**
  - `tier !== 'free'`;
  - `photoAlbum.enabled`;
  - la fase es `'open'` o `'closed'`;
  - no se está mostrando el save the date.

  Sin estas condiciones, la invitación queda exactamente como hoy.
- **El texto depende de la fase:** es "Comparte tus fotos" en la fase `'open'` y "Ver álbum" en `'closed'`. Lleva un ícono de cámara en línea, no emoji.
- **Lleva a `/{locale}/wedding/{id}/fotos`.** Si la invitación tiene `?guest=`, lo conserva.
- **Templates 01, 03 y 04 (`AlbumFab`):**
  - Se renderiza en `WeddingTemplate`, fuera del switch de templates.
  - Es fijo, abajo a la izquierda (`left: 16px; bottom: 16px`), a la misma altura que el botón de música.
  - Toma el estilo del botón principal del template (`ALBUM_THEMES`). En el 04 es crema con texto olivo, porque va sobre la foto.
  - No cambia nada más del hero.
- **Template 02:**
  - No usa `AlbumFab`.
  - En la fase `'open'`, `StickyConfirmBarV2` cambia el subtítulo por "Hoy es el día" y el botón "Confirmar" por "Comparte tus fotos". En la fase `'closed'`, por "Ver álbum".
  - La barra mantiene su regla de aparecer al salir del hero y ocultarse en el RSVP.

### Sección "Fotos" del panel

- **Nuevo `PanelSection` `'photos'`, con la etiqueta "Fotos" y el ícono `Camera`.** Va después de "Mesas" y no aparece en las bodas `free`.
- **Se usan las piezas que ya existen:** `AdminTopBar`, `AdminStatCard`, `AdminStatusPill`, `AdminButton` y las tarjetas `rounded-2xl`. El peso máximo es 600.
- **Si el álbum no está activado: página de venta** (diseño en la página "Venta del álbum" del canvas). `AdminTopBar` lleva "Fotos" y la etiqueta "Extra". Debajo, en este orden:
  1. **Encabezado oscuro** (`#141210`, radio 20 px):
     - etiqueta "Álbum de fotos de tus invitados";
     - título "Las fotos de tu boda que tu fotógrafo no va a tomar.";
     - texto "Tus invitados toman fotos toda la noche desde su mesa. Con el álbum llegan a ti en un solo lugar, con buena calidad y sin perseguir a nadie por WhatsApp.";
     - botón principal "Activar mi álbum · $399" (WhatsApp) y botón secundario "Ver cómo funciona", que baja a la sección de pasos;
     - tres palomitas: "Pago único", "Sin app para tus invitados" y "Listo el mismo día";
     - en escritorio, a la derecha, dos celulares fijos en el estilo del template 02 (invitación con "Comparte tus fotos" y álbum) y el aviso "Carlos subió 6 fotos".
  2. **Aviso con la fecha de la boda:** "Su boda es el {fecha}: faltan {n} días." y "Actívalo con tiempo para imprimir el QR junto con los centros de mesa y avisar a tus invitados.", con el enlace "Activar ahora →". Sin `event.date`, o si la boda ya pasó, no se muestra.
  3. **Sin álbum / con el álbum:** dos tarjetas. "Sin álbum": "Las fotos quedan repartidas en decenas de chats de WhatsApp", "Llegan comprimidas, borrosas o nunca llegan" y "Tienes que pedirlas una por una después de la boda". "Con el álbum de Invyta": "Todas en un solo lugar, con el nombre de quien la tomó", "Con calidad para verlas en grande o imprimirlas en tamaño postal" y "Las descargas todas juntas en un ZIP cuando quieras".
  4. **Cómo funciona, en 3 pasos:** "Lo activamos", "Tus invitados suben fotos" y "Tú te quedas con todo".
  5. **Precio y preguntas frecuentes**, lado a lado en escritorio:
     - tarjeta "$399 MXN · Pago único por boda", con 5 conceptos incluidos, el botón "Activar por WhatsApp" y "Nos escribes, pagas y lo activamos ese mismo día.";
     - 5 preguntas frecuentes en acordeón.
  6. **Cierre terracota:** "Que ningún momento se quede en el celular de alguien más." y "Activar mi álbum".
  - En celular el contenido va apilado, sin los celulares del encabezado, con una barra fija abajo: "$399 MXN · Pago único" y "Activar por WhatsApp".
  - Las preguntas frecuentes abren y cierran con una transición suave (altura, opacidad y desplazamiento, 480 ms con easing largo).
  - Todos los botones de compra abren `whatsappUrl("Hola! Quiero activar el álbum de fotos de mi boda \"{weddingId}\".")` y mandan `album_activation_cta_click`.
  - Vive en `components/admin/album/AlbumSalesPanel.tsx`.
- **Si el álbum está activado:**
  - **`AdminTopBar`:**
    - título "Fotos";
    - `meta` con `AdminStatusPill tone="active"` "Álbum activo" y "Modo: álbum abierto" o "Modo: cámara desechable";
    - `actions` con `AdminButton variant="ghost"` "Descargar QR" y `AdminButton` "Descargar todo (ZIP)". En celular quedan "QR" y "Descargar todo".
  - **4 contadores (`AdminStatCard`):** "Fotos subidas", "Invitaciones que participaron" ("Participaron" en celular), "Ocultas" y "Cierre de subida" ({día} {mes abreviado}). En escritorio van en 4 columnas; en celular, en 2 × 2.
  - **3 tarjetas, solo en escritorio:**
    - **Modo del álbum:** dos opciones (`role="radio"`), "Álbum abierto" ("Cada foto aparece en el álbum en cuanto se sube.") y "Cámara desechable" ("Cada invitado ve solo sus fotos. El álbum se revela el {fecha} a las 10:00."). Desde el día de la boda se bloquean con "El modo ya no se puede cambiar".
    - **Fechas:** "Subida de fotos · Del {apertura} al {cierre}", "Se guardan hasta · {expiresAt}. Descárgalas antes." y "Hasta 30 fotos por invitación o por teléfono."
    - **QR para las mesas:** una vista previa, "Imprímelo y ponlo en cada mesa. Abre el álbum sin necesidad de la invitación." y el enlace "Ver y descargar".
  - **Galería:**
    - Lleva un filtro segmentado "Todas · {total} / Ocultas · {ocultas}".
    - Cada foto muestra la miniatura cuadrada y debajo el nombre de quien subió ("Invitado" si no hay), la hora y dos acciones: ocultar o mostrar, y borrar.
    - En escritorio, las acciones son íconos de 34 px junto al nombre, en una cuadrícula de `minmax(160px, 1fr)`.
    - En celular, la cuadrícula es de 2 columnas, y debajo del nombre y la hora van dos botones de 44 px, ocultar o mostrar y borrar, a lo ancho de la foto.
    - Una foto oculta se ve al 35 % de opacidad, con la etiqueta "Oculta".
  - **Borrar** abre `DeletePhotoModal`, no `confirm()`. Lleva:
    - la miniatura;
    - "¿Borrar esta foto?";
    - "Se eliminará del álbum y de la descarga. No se puede deshacer.";
    - "{nombre} · {hora}";
    - la sugerencia "Si solo no quieres que la vean los invitados, mejor ocúltala.";
    - los botones "Cancelar" y "Borrar foto" (rojo `#B91C1C`).
  - **ZIP:**
    - "Descargar todo (ZIP)" baja las fotos **visibles** en archivos de máximo 200 fotos cada uno: `fotos-{weddingId}-1.zip`, `-2.zip`, y así.
    - Mientras se arma, un modal muestra "Preparando tu descarga", "{n} fotos visibles, en {k} archivo(s) ZIP. Las ocultas no se incluyen.", la barra de progreso por archivo, "Mantén esta pestaña abierta. Con más de 200 fotos se descargan varios archivos, uno tras otro." y "Cancelar".
    - Se manda `album_zip_downloaded`.
  - **QR imprimible:**
    - Es un PNG de 1200 × 1600 px con el estilo del template.
    - Lleva "Álbum de la boda", los nombres con el adorno del template, el QR del link general `/{defaultLanguage}/wedding/{id}/fotos`, "Escanea y comparte tus fotos de la boda" y "Sin app ni registro".
    - Se manda `album_qr_downloaded`.
  - **Sin fotos:** la galería muestra "Aún no hay fotos. Comparte el QR o el link de la invitación el día de la boda."

### Landing y página pública del álbum

- **Banner en la landing** (`components/landing/AlbumBanner.tsx`), entre `GuestJourney` y `PersonalizadoSection`:
  - tarjeta arena (`#F6EFE4`) dentro de una sección marfil, sin precio;
  - etiqueta "Nuevo · Álbum de los invitados", título en Fraunces "Las fotos que toman tus invitados, juntas en un solo álbum." y el texto "El día de la boda, tu invitación se convierte en el lugar para compartirlas. Sin app y sin registro: suben desde su invitación o con un QR en las mesas.";
  - un solo botón con borde, "Conoce el álbum de fotos", que lleva a `/album-de-fotos`;
  - en escritorio, a la derecha, dos celulares (invitación de Jardín con "Comparte tus fotos" y el álbum) y el aviso "Carlos subió 6 fotos". En celular va un solo celular.
- **Página `/album-de-fotos`** (`app/album-de-fotos/page.tsx`), con `PageShell` y migas "Inicio › Álbum de fotos":
  1. encabezado: "Las fotos que tu fotógrafo no va a tomar, en un solo álbum.", botones "Pregúntanos por WhatsApp" y "Ver cómo funciona", palomitas "Sin app", "Sin registro" y "Con el diseño de tu invitación", y celulares (invitación y álbum) con el aviso "Carlos subió 6 fotos";
  2. "El problema": sin álbum frente a con el álbum;
  3. "Cómo funciona" en 4 pasos;
  4. "Dos maneras de vivirlo": álbum abierto y cámara desechable;
  5. "Con el diseño de tu invitación": los 4 templates;
  6. "Tú tienes el control" y el precio: "$399 MXN · pago único", "Se agrega a cualquier invitación con diseño de Invyta (paquete Básico o Personalizado).", lo que incluye y "Agregarlo a mi invitación";
  7. 8 preguntas frecuentes (`ALBUM_FAQ` en `lib/marketing-content.ts`) con `FaqList soft` (apertura y cierre suaves) y su JSON-LD `faqSchema`;
  8. cierre oscuro con "Pregúntanos por WhatsApp".
  - Los botones abren `whatsappUrl("Hola! Quiero información del álbum de fotos para mi boda.")`.
  - Se agrega a `NON_LOCALIZED_PATHS` y a `MARKETING_PAGES` (sitemap), y al footer de la landing como "Álbum de fotos". **No** se agrega al menú principal, que ya tiene 6 enlaces.
  - Las imágenes son las de los diseños que ya usa la landing (`getDesign(...)`).

### Operador

En `SettingsModal` se agrega, en un bloque "Extras", el interruptor "Álbum de fotos de invitados ($399)".

- Debajo va una línea de estado: "Activado el {activatedAt}" o "Apagado".
- La ayuda dice: "Actívalo cuando la pareja haya pagado. Al apagarlo no se borra ninguna foto. No disponible en bodas gratis."
- El interruptor está deshabilitado en las bodas `free`.

## Plan de implementación

Cada paso deja el proyecto compilando y lo que ya existe funcionando igual.

1. **Preparar Firebase Storage. Este paso lo hace el usuario a mano.**
   - Pasar el proyecto al plan Blaze.
   - Configurar una alerta de presupuesto de US$5 al mes.
   - Crear el bucket por defecto en `us-central1` y confirmar que `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` apunta a él.
   - Agregar `storage.rules` y la entrada `"storage": { "rules": "storage.rules" }` en `firebase.json`, y desplegar las reglas.
   - Prueba: en la consola de Firebase, Storage muestra el bucket y las reglas niegan todo.
2. **Tipos y utilidades puras.**
   - Agregar `PhotoAlbumConfig`, `photoAlbum?` y `AlbumPhoto`.
   - Crear `lib/album.ts`, `components/album/albumThemes.ts` y los 4 eventos de analytics.
   - Agregar `getAdminBucket()` y `requireWeddingAccess`.
   - Prueba: `npm run build` sin errores. `albumPhase` con una boda del 2027-03-14 da `'before'` el 13 a las 23:59, `'open'` el 14 a las 00:00 y el 4 de abril a las 23:59, `'closed'` el 5 de abril y `'expired'` el 2029-03-15. `revealAt` da el 2027-03-15 a las 10:00, hora de la Ciudad de México.
3. **Activación por el operador.**
   - Extender `PATCH /api/admin/weddings/[weddingId]` y `SettingsModal`.
   - Prueba: al encenderlo en una boda `template` queda `photoAlbum = { enabled: true, mode: 'open', activatedAt }`. Al apagarlo y volver a encenderlo se conservan `mode` y `activatedAt`. En una boda `free` responde 400.
4. **Subida y lectura públicas (sin interfaz).**
   - Crear las dos rutas `api/album/...` con sus validaciones, la regla de `albumPhotos` y el índice.
   - Prueba con `curl`:
     - un JPEG con `guestId` válido en la fase `'open'` crea el documento y los 2 archivos, y su `url` abre la foto;
     - la foto 21 responde 429;
     - fuera de la ventana responde 403;
     - leer `albumPhotos` con el SDK de cliente falla por permisos.
5. **Compresión y página del invitado, con el tema de cada template.**
   - Crear `lib/imageCompress.ts`, `GuestAlbum` (estados, hoja de subida, visor), `fotos/page.tsx` y los textos `album.*` en español e inglés.
   - Prueba:
     - Una foto de celular de 4 MB se sube pesando menos de 1.5 MB, con 2048 px en su lado mayor.
     - Por link personal aparece con el nombre del invitado.
     - Por el link general, con el nombre escrito o "Invitado".
     - En modo desechable un segundo navegador no ve las fotos del primero antes de `revealAt`.
     - Una boda de cada template (01 a 04) muestra `/fotos` con los colores, tipografías y adornos de la página "Por template" del canvas.
6. **Acceso desde la invitación.**
   - Crear `AlbumFab`, renderizarlo en `WeddingTemplate` para los templates 01, 03 y 04, y cambiar `StickyConfirmBarV2` para el 02.
   - Prueba:
     - En la fase `'open'`, los templates 01, 03 y 04 muestran el botón abajo a la izquierda, sin tapar el de música, y el 02 muestra "Comparte tus fotos" en su barra.
     - Se conserva `?guest=`.
     - No se ve nada en el save the date, en la fase `'before'` ni con el álbum apagado.
7. **Sección "Fotos" del panel: sin activar, encabezado, contadores, modo, fechas y galería.**
   - Agregar `'photos'` a `PanelSection` y a `NAV_ITEMS`.
   - Crear la página con la tarjeta de venta, el `AdminTopBar`, los contadores, las 3 tarjetas, la galería con filtro y acciones en escritorio y en celular, `DeletePhotoModal` y las rutas `api/panel/album/...`.
   - Prueba:
     - Ocultar una foto la quita de la página del invitado, y aparece en el filtro "Ocultas".
     - Borrarla, desde escritorio o desde celular, pide confirmar y elimina los 2 archivos de Storage.
     - El modo no se puede cambiar en la fase `'open'`.
     - "Invitaciones que participaron" cuenta los `guestId` y `deviceId` distintos.
8. **QR por template y ZIP.**
   - Crear `AlbumQrCard` con `qrcode` y los 4 estilos, y la descarga en ZIP con `client-zip` en partes de 200 fotos, con su modal de progreso.
   - Prueba:
     - El QR, escaneado con un celular, abre `/wedding/{id}/fotos` sin `?guest=`.
     - El PNG usa el estilo del template de la boda.
     - Con 450 fotos visibles se descargan 3 ZIP, con 200, 200 y 50 fotos.

9. **Página de venta en el panel.**
   - Crear `AlbumSalesPanel` con las 6 secciones y la barra fija en celular, y usarlo en `photos/page.tsx` cuando el álbum no está activado.
   - Prueba: con una boda de diseño sin álbum, la sección "Fotos" muestra la página de venta con los días que faltan para la boda, y cada botón abre WhatsApp con el `weddingId`.
10. **Landing y página `/album-de-fotos`.**
    - Crear `ALBUM_FAQ`, `AlbumBanner` (en `LandingPage` después de `GuestJourney`) y `app/album-de-fotos/page.tsx`; registrar la ruta en `NON_LOCALIZED_PATHS`, `MARKETING_PAGES` y el footer.
    - Prueba: el banner no muestra precio y lleva a `/album-de-fotos`; la página responde 200 sin prefijo de idioma, aparece en `/sitemap.xml` e incluye el JSON-LD de `FAQPage`.

## Criterios de aceptación

**General**

- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos.
- [ ] En una boda `free` no aparecen la sección "Fotos" del panel ni el acceso desde la invitación, y `/fotos` dice "Este álbum no está disponible".
- [ ] Una boda con diseño que no tiene el álbum activado no muestra ninguna referencia a las fotos en su invitación.
- [ ] `storage.rules` niega toda lectura y escritura desde el cliente, y `albumPhotos` no se puede leer con el SDK de cliente.
- [ ] Ninguna pantalla nueva usa un peso tipográfico mayor a 600.

**Activación**

- [ ] El operador enciende el álbum desde `SettingsModal` y queda `photoAlbum.enabled: true`, con `mode: 'open'`.
- [ ] Sin el álbum activado, la sección "Fotos" muestra la tarjeta con $399 MXN y un botón que abre WhatsApp con el `weddingId` en el mensaje.
- [ ] Apagar el álbum oculta el acceso desde la invitación y `/fotos`, y no borra ninguna foto.

**Invitado**

- [ ] En la fase `'open'`, los templates 01, 03 y 04 muestran "Comparte tus fotos" abajo a la izquierda, y el 02 lo muestra en su barra fija en lugar de "Confirmar". En los cuatro lleva a `/fotos` conservando `?guest=`.
- [ ] El hero de cada template se ve igual que en producción, salvo por el botón nuevo.
- [ ] `/fotos` usa los colores, las tipografías y los adornos del template de la boda, y no muestra numerales de sección.
- [ ] Antes del día de la boda, `/fotos` dice "El álbum se abre el día de la boda" y no deja subir.
- [ ] El día +22 de la boda, `/fotos` dice "Ya no se reciben fotos" y el servidor rechaza las subidas con 403.
- [ ] Con link personal, `/fotos` saluda con el nombre del invitado, y sus fotos aparecen con ese nombre.
- [ ] Con el link general, las fotos aparecen con el nombre escrito o, si está vacío, con "Invitado". El contador dice "en este teléfono".
- [ ] Ninguna foto guardada pasa de 2048 px en su lado mayor, y cada una tiene su miniatura de 480 px.
- [ ] Al llegar a 30 fotos, el botón se deshabilita con "Ya subiste tus 30 fotos. ¡Gracias!", y la API responde 429.
- [ ] Con el QR general, un mismo navegador tampoco pasa de 30 fotos.
- [ ] Si se eligen 8 fotos y quedan 5, solo se suben 5, y aparece "Elegiste 8 fotos. Solo se subirán 5, porque te quedaban 5 de 30."
- [ ] Si falla la subida de una foto, las demás siguen y la que falló muestra "Reintentar".
- [ ] En modo abierto, una foto subida aparece al recargar en otro navegador.
- [ ] En modo desechable, otro navegador no ve las fotos antes del día siguiente a las 10:00, y después sí.
- [ ] Una foto oculta no aparece en `/fotos` ni en la respuesta de `GET /api/album`.
- [ ] Con la URL en inglés (`/en/...`), los textos de `/fotos` salen en inglés.
- [ ] `/fotos` y el visor no tienen botón de descarga.

**Venta**

- [ ] Sin el álbum activado, la sección "Fotos" muestra la página de venta con encabezado oscuro, aviso de días, sin/con, 3 pasos, precio, preguntas frecuentes y cierre.
- [ ] En celular, la página de venta tiene la barra fija con "$399 MXN" y "Activar por WhatsApp".
- [ ] El banner de la landing aparece después de `GuestJourney`, no menciona el precio y lleva a `/album-de-fotos`.
- [ ] `/album-de-fotos` muestra el precio, las 8 preguntas frecuentes y su JSON-LD, y aparece en `/sitemap.xml` y en el footer.

**Panel**

- [ ] "Fotos" aparece en el menú después de "Mesas", con el mismo estilo que las demás secciones.
- [ ] Con el álbum activo, el encabezado muestra "Álbum activo" y el modo, y hay 4 contadores con valores correctos.
- [ ] El filtro "Ocultas" muestra solo las fotos ocultas, y "Todas" muestra todas.
- [ ] Cada foto muestra el nombre de quien la subió, la hora, ocultar o mostrar y borrar, en escritorio y en celular.
- [ ] En celular, los botones de ocultar y borrar miden al menos 44 px de alto.
- [ ] "Borrar" pide confirmar en `DeletePhotoModal` y elimina la foto y sus 2 archivos de Storage.
- [ ] El modo se puede cambiar antes del día de la boda, y desde ese día aparece bloqueado.
- [ ] El panel muestra la ventana de subida y "Se guardan hasta {boda + 2 años}. Descárgalas antes."
- [ ] "Descargar QR" baja un PNG con el estilo del template y un QR que abre `/fotos` sin `?guest=`.
- [ ] "Descargar todo (ZIP)" baja solo las fotos visibles, en archivos de máximo 200 fotos cada uno, y muestra el progreso.

## Decisiones tomadas y descartadas

- **Sí: no se crea un panel de invitados.** El link de la invitación ya funciona como su "panel", en línea con la idea de "el mismo link evoluciona" del spec 27.
- **Sí: dos accesos, el link personal y el QR general.** Decisión del usuario.
  - El link personal atribuye cada foto sin login.
  - El QR cubre a quien no tiene su link a mano en la fiesta.
  - **No:** que el QR pida buscar la invitación de cada quien. Agrega esfuerzo y expone la lista de invitados.
- **Sí: Firebase Storage en el plan Blaze.** Decisión del usuario. Es el mismo ecosistema (firebase-admin y la consola).
  - **No:** Cloudflare R2, Backblaze B2 ni Cloudinary.
  - **No:** AWS S3, que es el que más cobra por descarga.
  - El bucket va en `us-central1` porque la capa sin costo solo aplica en regiones de EE. UU.
- **Sí: todo pasa por el servidor.** `storage.rules` y `albumPhotos` están cerrados para los clientes. Así el límite de 30, la ventana de subida y el revelado diferido no se pueden saltar desde el navegador, aunque el resto de Firestore siga abierto.
- **Sí: URLs con token de descarga.** Funcionan con las reglas cerradas, y el servidor decide a quién se las da.
- **Sí: es un extra de $399 MXN que activa el operador después del pago por WhatsApp.** Decisión del usuario. **No:** incluirlo en los paquetes ni cobrarlo en línea.
- **Sí: sin el álbum activado, la invitación no menciona las fotos, y el panel sí ofrece el álbum.** Decisión del usuario.
- **Sí: los dos modos, abierto y cámara desechable, con 30 fotos por invitación en ambos.** Decisión del usuario (subió de 20 a 30 durante la implementación).
  - **No:** que el límite sea configurable.
  - **No:** que el límite se multiplique por el número de pases.
- **Sí: en el QR general el límite es de 30 por dispositivo.** Decisión del usuario.
  - **No:** un QR por mesa con límite por mesa. Se consideró y se descartó para no depender del módulo de Mesas. Se puede saltar borrando los datos del navegador, y se acepta.
- **Sí: el revelado es el día siguiente de la boda a las 10:00.** Decisión del usuario. **No:** un botón "Revelar" ni un álbum que solo vea la pareja.
- **Sí: publicación automática, con ocultar y borrar.** Decisión del usuario. **No:** aprobar cada foto antes de publicarla.
- **Sí: la ventana de subida va del día de la boda al día +21 (3 semanas).** Decisión del usuario (antes era una semana). Es fija, en hora de la Ciudad de México.
- **Sí: el modo se bloquea desde que abre la ventana.** Cambiarlo a media boda revelaría o escondería fotos a quien ya subió.
- **Sí: solo fotos, comprimidas a 2048 px con una miniatura de 480 px.** Decisión del usuario.
  - Una foto queda en ~400 KB, y con eso el costo se mantiene en la capa sin costo.
  - **No:** guardar el original ni subir videos.
- **Sí: se guardan 2 años desde la boda, y en este spec solo se muestra la fecha.** Decisión del usuario (antes eran 12 meses). El borrado automático va en otro spec.
- **Sí: el ZIP se arma en el navegador con `client-zip`, en partes de 200 fotos.** Así no depende del límite de tiempo de las funciones del servidor, y no se carga 1 GB en memoria.
- **Sí: el álbum tiene página propia.** Decisión del usuario. **No:** una sección dentro de cada uno de los 4 sets de secciones.
- **Sí: la página `/fotos` y el QR imprimible toman el diseño del template de la boda.** Decisión del usuario, después de revisar el diseño.
  - **No:** el diseño neutro compartido de la primera versión del spec.
  - Los tokens salen del código de producción de cada template, sin adornos inventados.
  - **No:** los numerales de sección (por ejemplo "XII"), que solo tienen sentido dentro de la invitación.
- **Sí: en el template 02 el acceso va en `StickyConfirmBarV2`, no en un botón flotante.** El día de la boda ya no tiene sentido "Confirmar", y un botón flotante chocaría con la barra. En los otros tres va abajo a la izquierda porque la música ocupa la derecha.
- **Sí: el ZIP, el QR imprimible y el slideshow entraron como extras del álbum.** Decisión del usuario.
  - El slideshow se pasa al SPEC 30 al dividir el alcance, también por decisión del usuario.
  - **No:** que el invitado descargue fotos.
- **Sí: en el panel se agregan 4 contadores y el filtro "Todas / Ocultas".** Salieron del diseño y se aceptaron. Usan `AdminStatCard` y el control segmentado que ya existe en Mesas.
- **Sí: en celular, cada foto del panel tiene el nombre, la hora, ocultar y borrar debajo, igual que en escritorio.** Decisión del usuario. **No:** una hoja de acciones al tocar la foto.
- **No: exportar a Google Drive en este spec.** Decisión del usuario.
  - Se puede hacer con el permiso `drive.file`, que no es sensible y solo necesita la verificación de marca de Google, sin auditoría de seguridad.
  - Aun así suma un proyecto de Google Cloud, la verificación, el inicio de sesión con Google y la subida con reintentos. El ZIP ya resuelve que la pareja se quede con sus fotos.
  - **No:** usar el Drive de la pareja como almacenamiento del álbum. Si la pareja revoca el permiso o se le llena el Drive, el álbum se rompe en plena boda.
- **Sí: la página de venta del panel se rediseñó con prácticas de marketing** (encabezado con demostración, urgencia con la fecha real de la boda, sin/con, pasos, precio anclado por invitado y preguntas frecuentes). Decisión del usuario. **No:** testimonios ni cifras de uso, porque no hay reseñas reales; **no:** comparar el precio con la competencia, porque Convite también cobra $399.
- **Sí: la landing solo lleva un banner sin precio, y el detalle va en `/album-de-fotos`.** Decisión del usuario: la landing ya es extensa. **No:** agregarlo al menú principal.
- **Sí: las fotos se suben de una en una.** Una foto comprimida queda muy por debajo del límite de 4.5 MB por petición de Vercel, y si una falla no se pierden las demás.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Blaze pide tarjeta y factura si se pasa la capa sin costo. | Se usa compresión, el límite de 30, el bucket en `us-central1` y una alerta de presupuesto de US$5. |
| Las fotos HEIC de iPhone no se pueden leer en un navegador que no sea Safari. | Safari las convierte a JPEG al elegirlas con `accept="image/*"`. Si `createImageBitmap` falla, la foto se marca "Formato no compatible" y las demás siguen. |
| Alguien sube contenido inapropiado desde el QR general. | La pareja puede ocultar o borrar la foto. Además hay un límite por dispositivo y solo se sube durante la ventana. |
| Se abusa del QR general borrando los datos del navegador. | Se acepta. Es abuso casual y el peor caso está acotado por la ventana de 22 días. |
| Las fotos se acumulan después de 2 años porque no se borran solas. | La fecha queda calculada y visible. El borrado va en un spec propio antes de que la primera boda cumpla 2 años. |
| Una URL con token que se comparte queda abierta para siempre. | Se acepta. Son URLs largas y no se pueden adivinar. Ocultar una foto la quita de la API, pero no invalida su URL. Borrarla sí. |
| Calcular las fechas con la zona horaria del servidor (UTC) corre la ventana 6 horas. | `lib/album.ts` usa siempre `America/Mexico_City` y se prueba en el paso 2. |
| Las reglas abiertas de `weddings` dejan que un cliente escriba `photoAlbum.enabled`. | El servidor valida `enabled` al subir, pero un cliente podría activarse el álbum sin pagar. Se acepta por ahora, igual que los demás campos. Cerrarlo va junto con el endurecimiento de las reglas. |
| Un cambio futuro en el diseño de un template deja el álbum desalineado. | Los tokens viven en un solo archivo (`albumThemes.ts`) que cita su fuente. Cualquier spec que rediseñe un template debe revisarlo. |
| El botón flotante tapa contenido del hero en pantallas bajas. | Va dentro del margen inferior que ya dejan los heroes (64 px en el 04) y a la altura del botón de música. Se prueba en 390 × 844 y 360 × 640. |

## Lo que **no** está en este spec

- Slideshow en vivo o modo proyector (SPEC 30).
- Exportar a Google Drive o a Google Fotos.
- Videos, fotos originales sin comprimir y descarga por parte de los invitados.
- Moderación previa, likes, comentarios y filtros de imagen.
- Borrado automático al vencer y avisos antes del borrado.
- Cobro en línea, y el extra en `/paquetes`, la FAQ general y el menú principal.
- Actualizar el aviso de privacidad.
- Ventana o límite de fotos configurables.
- Una sección del álbum dentro de cada template.
- Bodas gratis y cerrar las reglas de Firestore que ya existen.

Cada uno de estos, si se decide hacer, va en su propio spec.
