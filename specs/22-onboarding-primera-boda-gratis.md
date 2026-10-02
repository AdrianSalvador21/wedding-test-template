# 22 — Onboarding de bienvenida y creación de la primera boda gratuita

**Estado:** Approved
**Depende de:** SPEC 08, SPEC 16
**Fecha:** 2026-10-02

## Objetivo

Reemplazar la pantalla actual de `NoWeddingsScreen` ("No tienes ninguna invitación") por un onboarding cálido de 3 pasos más una pantalla de éxito, que reciba a toda cuenta nueva sin bodas, le explique en segundos qué puede hacer gratis, y la guíe a crear su primera boda — reutilizando exactamente los mismos 3 campos y el mismo endpoint que ya usa `FreeWeddingModal` (`/api/weddings/free`), sin tocar el modelo de datos ni el backend.

## Contexto

Revisión del código real hecha antes de este spec:

- Hoy, una cuenta recién verificada sin ninguna boda vinculada (`auth.status === 'noWeddings'`, solo ocurre para cuentas no-admin — los operadores siempre tienen `status === 'ready'`) ve `NoWeddingsScreen` (`components/admin/auth-ui.tsx`): un mensaje "No tienes ninguna invitación" que asume que la persona ya compró una invitación en otro lado y no la ve en su cuenta. El único CTA de creación ("Crear mi lista de invitados gratis") es secundario frente al mensaje de WhatsApp para "ligar" una compra existente.
- `FreeWeddingModal` (`components/admin/FreeWeddingTools.tsx`) ya implementa la creación de la boda gratuita: pide `bride`, `groom`, `date` (sin tipo de evento, sin plantilla, sin paquete), valida con `isValidIsoDate`, y hace POST a `/api/weddings/free`, que escribe Firestore directamente vía `firebase-admin` con un tope de `FREE_WEDDING_LIMIT = 3` bodas por cuenta. Este modal también se usa desde "Mis invitaciones" para "Crear otra boda gratis" cuando la cuenta ya tiene al menos una boda — ese caso de uso no cambia.
- El plan gratis no tiene plantilla, editor de invitación, enlace público para invitados, RSVP automático ni entrada QR: el organizador agrega a mano a cada invitado y anota su confirmación desde el panel (`lib/wedding-defaults.ts`, `FreeWeddingTools.tsx` línea 94-96). Las mesas sí están disponibles (`tableService`). Ningún tipo de evento aparte de boda existe en el producto.
- `docs/BRAND-FOUNDATIONS.md` (aprobado) fija la voz de marca ("cálida, elegante, clara... concreto antes que emotivo", sin emojis), la tagline ("Tu boda, en una invitación que se siente tuya.") y los paquetes vigentes: Básico ($2,000 MXN, Invyta gestiona los cambios) y Personalizado ($2,400 MXN, incluye panel de edición y gestión para la pareja). Toda venta de paquete ocurre fuera de la app, por WhatsApp.
- `app/layout.tsx` ya carga Fraunces (`--font-fraunces`, con estilo itálico) como "fuente de marca... para landing, páginas de marketing y paneles de admin", pero `components/admin/ui.tsx` define `displayFont` únicamente con Manrope en negritas (comentario explícito: "se mantiene el nombre `displayFont`... para que el código no sugiera una fuente que ya no se usa"). Hoy ningún texto del panel de admin usa Fraunces.
- Referencia visual que motivó este spec: capturas de un onboarding de un competidor ("Confirmando") con bienvenida personalizada ("Hola, Adrian"), una pantalla "Lo que encontrarás" con 3 features, y un asistente de 4 pasos (tipo de evento, lugar/fecha, paquete por invitados, plan de inversión). No aplica 1:1 a este producto: no existe selector de tipo de evento (Invyta es solo bodas), no hay paso de pricing dentro de la app, y las features reales del plan gratis no incluyen RSVP ni QR.
- Validado en un canvas de diseño (claude.ai Artifact, `https://claude.ai/artifact/VGCPp9A6X2EJvA6AjKRMxJ`, versión 3) con el flujo completo navegable: Bienvenida → Lo que podrás hacer → Formulario → Éxito, usando los tokens visuales reales del panel (`#FAFAFA`, blanco, `#AE5730`/`#8F4524`, `rgba(0,0,0,0.08)`, Manrope).

Decisiones ya cerradas con el usuario antes de escribir este spec:

- Se introduce Fraunces itálica (`var(--font-fraunces)`, ya cargada globalmente) como acento tipográfico solo en los títulos de este flujo de onboarding, aunque el resto del panel de admin siga usando únicamente Manrope/`displayFont`. Es un cambio deliberado y acotado a esta pantalla, no una migración del sistema tipográfico del panel.
- El onboarding reemplaza únicamente `NoWeddingsScreen` (cuentas self-serve con 0 bodas). El estado vacío del operador ("Todavía no hay invitaciones", dentro de `app/[locale]/admin/page.tsx`) no se toca.
- No se personaliza el saludo con el nombre de la persona (la cuenta solo tiene `email`, no `displayName`); el texto de bienvenida es genérico.
- La tarjeta "Invitación con diseño" del paso 2 menciona "tu panel para editar los datos y el diseño" sin distinguir entre el paquete Básico y el Personalizado, aunque `docs/BRAND-FOUNDATIONS.md` marca el panel de edición como exclusivo del Personalizado. Riesgo aceptado explícitamente por el usuario: la conversación por WhatsApp aclara el paquete antes de cobrar.
- Se conserva el enlace "¿Ya contrataste una invitación con diseño? Escríbenos por WhatsApp" (ruta de recuperación ya validada en el spec 08) en los pasos de Bienvenida y Lo que podrás hacer; se oculta en el paso de formulario y en la pantalla de éxito.

## Alcance

**Incluye:**

- Reescribir `NoWeddingsScreen` (`components/admin/auth-ui.tsx`) como un flujo de 3 pasos más pantalla de éxito dentro de la misma tarjeta de `AuthScreen`, con una barra de progreso de 3 segmentos (estilo píldora) que se va llenando:
  1. **Bienvenida** — ícono (reutiliza `IconBadge`), título con la palabra de énfasis en Fraunces itálica color `#AE5730` ("Bienvenida a *Invyta*."), la tagline de marca como subtítulo, CTA único "Comenzar".
  2. **Lo que podrás hacer** — eyebrow "Con tu cuenta gratis", título con acento Fraunces, y 3 tarjetas de feature en el mismo orden y trato visual que el canvas validado:
     - "Lista de invitados" — agregar invitados y anotar confirmación manualmente, sin límite de invitados.
     - "Acomodo de mesas" — armar mesas y mover invitados entre ellas.
     - "Invitación con diseño" (tarjeta con borde punteado, visualmente distinta de las dos anteriores) — un sitio propio con enlace único y panel para editar datos y diseño, con un enlace inline "Escríbenos por WhatsApp" (reutiliza `whatsappUrl()` de `lib/contact.ts`) — ver Decisiones sobre el riesgo de no distinguir paquete.
     CTA "Crear mi boda gratis".
  3. **Formulario** — mismos 3 campos, mismo copy de ayuda ("Puedes cambiarla después desde Ajustes.", "No hay ningún enlace público... Puedes crear hasta 3 bodas gratuitas por cuenta.") y misma validación que `FreeWeddingModal` hoy; botón "Atrás" (vuelve al paso 2) y CTA "Crear mi boda".
  4. **Éxito** — ícono de confirmación, nombres de la pareja y fecha capturados, y 2 CTA de siguiente paso: uno primario a la vista de invitados de la boda recién creada, uno secundario ("Ir a mis invitaciones") a `/admin`.
- Extraer la lógica de formulario de `FreeWeddingModal` (estado de campos, validación, submit contra `/api/weddings/free`, manejo de los errores `free_limit_reached` y `400`) a una pieza compartida (hook o componente) que use tanto el modal existente (sigue sirviendo "Crear otra boda gratis" desde "Mis invitaciones", sin cambios de comportamiento) como el paso 3 de este onboarding — sin duplicar la lógica de red/validación.
- El enlace "¿Ya contrataste una invitación con diseño? Escríbenos por WhatsApp" se muestra debajo de la tarjeta en los pasos 1 y 2, y desaparece en los pasos 3 y 4.
- Verificación manual del flujo completo en escritorio y móvil con una cuenta de prueba sin bodas, incluyendo el caso de error `free_limit_reached` si se repite tras llegar a 3 bodas.

**No incluye:**

- No se modifica el estado vacío del operador/admin ("Todavía no hay invitaciones" en `app/[locale]/admin/page.tsx`) ni `NewWeddingModal`. Decisión explícita del usuario.
- No se agrega ningún selector de "tipo de evento" (boda/quinceañera/cumpleaños/etc.) — el producto sigue siendo exclusivamente bodas.
- No se agrega ningún paso de pricing ni selección de paquete dentro de la app — la venta de Básico/Personalizado sigue siendo 100% manual por WhatsApp, fuera de este flujo.
- No se agrega ningún campo nuevo al modelo de datos ni a `/api/weddings/free`: se reutilizan exactamente `bride`, `groom`, `date`.
- No se construye RSVP automático, enlace público para invitados, ni entrada QR para el plan gratis — esas features no existen hoy y esta tarjeta de onboarding no las promete (la tarjeta "Invitación con diseño" las ofrece solo como upsell hacia un paquete pagado, vía WhatsApp).
- No se cambia el límite de 3 bodas gratuitas por cuenta (`FREE_WEDDING_LIMIT`) ni su mensaje de error.
- No se distingue entre paquete Básico y Personalizado en la tarjeta de upsell del paso 2 (ver Decisiones y Riesgos: riesgo aceptado explícitamente).
- No se agrega personalización por nombre en el saludo (no existe `displayName` en la cuenta).

## Modelo de datos

Ninguno nuevo. Se reutiliza exactamente el contrato ya existente:

```ts
// POST /api/weddings/free — sin cambios
{ bride: string; groom: string; date: string } // ISO yyyy-mm-dd
```

El único estado nuevo es local y efímero (no persistido): el paso actual del onboarding (`0 | 1 | 2 | 3`) en el componente que reemplaza a `NoWeddingsScreen`.

## Plan de implementación

**Bloque A — Extraer el formulario reutilizable**

1. Extraer de `FreeWeddingModal` (`components/admin/FreeWeddingTools.tsx`) el estado de campos, la validación y el submit contra `/api/weddings/free` (incluyendo el manejo de `free_limit_reached` y errores de campo) a una pieza compartida — por ejemplo un hook `useFreeWeddingForm()` o un componente `FreeWeddingFields` sin el `<Modal>` envolvente. `FreeWeddingModal` pasa a usar esa pieza compartida por dentro, sin cambiar su comportamiento visible. Verificación: "Crear otra boda gratis" desde "Mis invitaciones" sigue funcionando exactamente igual que antes de este spec.

**Bloque B — Construir el onboarding**

2. Reescribir `NoWeddingsScreen` en `components/admin/auth-ui.tsx` con los 4 pasos (Bienvenida, Lo que podrás hacer, Formulario, Éxito), la barra de progreso de 3 segmentos, y el acento tipográfico en Fraunces itálica solo en los títulos de este componente (sin tocar `displayFont`/`manrope` de `components/admin/ui.tsx`). El paso 3 usa la pieza compartida del Bloque A.
3. Integrar el enlace "Escríbenos por WhatsApp" (recuperación de compra existente) en los pasos 1 y 2, y el enlace de upsell dentro de la tarjeta "Invitación con diseño" del paso 2, ambos con `whatsappUrl()` de `lib/contact.ts`.
4. Pantalla de éxito (paso 4): al completarse la creación, mostrar nombres/fecha de la boda recién creada y los 2 CTA de siguiente paso (reutilizando el mismo `id` que devuelve `/api/weddings/free` para enlazar a la vista de invitados de esa boda).

**Bloque C — Verificación**

5. Verificación manual end-to-end en escritorio y móvil con una cuenta de prueba sin bodas: completar los 4 pasos, confirmar que la boda se crea en Firestore igual que hoy (mismos campos), que tras crearla `auth.status` deja de ser `'noWeddings'` y la cuenta pasa a ver "Mis invitaciones" con la tarjeta nueva, y que el enlace de WhatsApp de recuperación sigue abriendo el mensaje esperado.
6. Verificar el caso límite: con una cuenta de prueba que ya tiene 3 bodas gratuitas, el paso 3 muestra el mismo mensaje de `free_limit_reached` que hoy muestra `FreeWeddingModal`.
7. `npm run build` (o `tsc --noEmit`) sin nuevos errores de tipos respecto al estado previo.

## Criterios de aceptación

- [ ] Una cuenta no-admin recién verificada sin bodas ve el nuevo flujo de onboarding (Bienvenida → Lo que podrás hacer → Formulario → Éxito) en vez del mensaje "No tienes ninguna invitación".
- [ ] El paso "Lo que podrás hacer" muestra exactamente 3 tarjetas (Lista de invitados, Acomodo de mesas, Invitación con diseño), con la tercera visualmente distinta (borde punteado) y un enlace "Escríbenos por WhatsApp".
- [ ] El paso de formulario pide exactamente `bride`, `groom`, `date` con la misma validación, textos de ayuda y límite de 3 bodas que `FreeWeddingModal` hoy — sin campos nuevos.
- [ ] Al enviar el formulario, la boda se crea contra `/api/weddings/free` sin cambios de contrato; la pantalla de éxito muestra los nombres y la fecha capturados.
- [ ] Repetir el flujo con una cuenta en el límite de 3 bodas gratuitas muestra el mismo error `free_limit_reached` que ya existe.
- [ ] El enlace "¿Ya contrataste una invitación con diseño? Escríbenos por WhatsApp" sigue visible en los pasos 1 y 2, y funciona igual que en `NoWeddingsScreen` hoy.
- [ ] "Crear otra boda gratis" desde "Mis invitaciones" (`FreeWeddingModal`) sigue funcionando sin cambios de comportamiento tras extraer el formulario compartido.
- [ ] El estado vacío del operador ("Todavía no hay invitaciones") no fue modificado.
- [ ] Los títulos del onboarding usan Fraunces itálica como acento; el resto del panel de admin no cambia su tipografía.
- [ ] `npm run build` (o `tsc --noEmit`) no introduce nuevos errores de tipos respecto al estado previo.
- [ ] El flujo completo no muestra errores de consola en escritorio ni en móvil.

## Decisiones tomadas y descartadas

- **Reemplaza solo `NoWeddingsScreen`, no el estado vacío del operador**: decisión explícita del usuario — los operadores crean bodas de pago manualmente vía `NewWeddingModal`, con datos distintos (correos, plantilla); mezclar ambos flujos habría complicado el alcance sin necesidad.
- **Sin selector de tipo de evento**: la referencia visual (competidor multi-evento) no aplica — el producto es y seguirá siendo solo bodas; agregar el selector habría sido construir una opción que no lleva a ningún lado.
- **Sin paso de pricing/paquetes dentro de la app**: toda la venta de Básico/Personalizado ocurre hoy por WhatsApp fuera de la app; meter un paso de precios en el onboarding habría requerido construir checkout/cobro, fuera del alcance de este spec.
- **Fraunces itálica como acento solo en este flujo**: decisión explícita del usuario tras confirmar que la fuente ya está cargada globalmente (`app/layout.tsx`) y es la tipografía de marca aprobada; se usa aquí porque es el momento más cargado de marca que ve una cuenta nueva, sin migrar el resto del panel (que sigue siendo utilitario con Manrope).
- **Sin personalizar el saludo con nombre**: la cuenta solo guarda `email` en `auth-context`, no `displayName`; inventar un nombre a partir del email (parte local del correo) se descartó por poco confiable.
- **Tarjeta de upsell sin distinguir paquete Básico/Personalizado**: decisión explícita del usuario, aceptando el riesgo de que alguien que compre el Básico espere el panel de edición que solo trae el Personalizado — se confía en que la conversación por WhatsApp aclara el paquete antes de cobrar, igual que ya resuelve la tabla de objeciones de `docs/BRAND-FOUNDATIONS.md`.
- **Se mantiene el enlace de recuperación por WhatsApp**: es la ruta ya validada en el spec 08 para cuentas que compraron una invitación con diseño y no la ven vinculada; quitarlo habría roto ese caso de soporte.
- **Formulario extraído a una pieza compartida en vez de duplicar el código de `FreeWeddingModal`**: evita que una futura corrección de validación o de manejo de errores tenga que aplicarse dos veces.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| La tarjeta "Invitación con diseño" promete panel de edición sin aclarar que es exclusivo del paquete Personalizado; alguien podría comprar el Básico esperando panel. | Riesgo aceptado explícitamente por el usuario; se documenta aquí para que quien atienda WhatsApp sepa aclarar el paquete antes de cobrar. |
| Extraer el formulario de `FreeWeddingModal` a una pieza compartida puede introducir una regresión sutil en "Crear otra boda gratis" si el refactor cambia el orden de validación o el manejo de errores. | El Bloque A se verifica de forma aislada (paso 1) antes de construir el onboarding encima, comparando el comportamiento contra el modal actual. |
| Mostrar el enlace de recuperación por WhatsApp en 2 de los 4 pasos (en vez de solo al inicio) puede sentirse repetitivo. | Se oculta explícitamente en los pasos de formulario y éxito, donde ya no aporta (la persona ya está creando o ya creó su boda). |
