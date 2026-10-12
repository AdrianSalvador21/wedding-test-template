# 24 — Actualización de precios: Paquete Básico a $1,100 MXN y Personalizado a $1,400 MXN

**Estado:** Approved
**Depende de:** —
**Fecha:** 2026-10-12

## Objetivo

Bajar el precio de lista del Paquete Básico de $2,000 a $1,100 MXN y del Paquete Personalizado de $2,400 a $1,400 MXN, actualizando la única fuente de verdad del código y los dos documentos vivos que repiten esas cifras a mano.

## Contexto

Estado real del código, revisado en esta sesión (no asumido):

- **El precio ya tiene una única fuente de verdad en código.** `PACKAGES` (`lib/marketing-content.ts`) define `price: 2000 | 2400` para `'basico'`/`'personalizado'`. Todo lo demás en el sitio lo lee de ahí: `components/landing/PriceStrip.tsx`, `components/landing/Packages.tsx` (incluida la frase "Solo $X MXN más que el Básico", calculada como `personalizado.price - basico.price`), `app/paquetes/page.tsx`, `app/disenos/[slug]/page.tsx`, `lib/seo-schema.ts` (`packagesSchema`, que alimenta el JSON-LD de `Offer`) y las dos respuestas de `FAQ_ITEMS` que mencionan precio (`'¿Cuánto cuesta una invitación digital de boda con Invyta?'` y el callout de `/paquetes`). Ningún otro archivo de código tiene el número de precio escrito a mano, **excepto uno**.
- **Única excepción en código:** `app/page.tsx` (línea 7) tiene la meta description de la portada con el literal `'...Desde $2,000 MXN.'` escrito a mano, sin leer de `PACKAGES`. Es el único lugar del código que quedaría desincronizado si no se toca a mano.
- **El precio de un paquete no se persiste por boda.** No existe ningún campo de precio en Firestore (`src/types/wedding.ts` solo tiene `price`/`priceRange` para datos de hospedaje/lugares recomendados, sin relación con los paquetes de Invyta). Este cambio es puramente de contenido/copy, no de datos.
- **Dos documentos vivos (no specs) repiten los precios a mano**, usados como fuente para PDFs y respuestas de WhatsApp/redes: `docs/BRAND-FOUNDATIONS.md` (tabla de la sección 4 y la regla de estilo de la sección 2) y `docs/CONTENIDO-REDES-Y-BODAS.md` (resumen de reglas y plantillas de respuesta para `/paquetes` y redes).
- **Varios specs históricos** (`15-landing-v2-precio-proceso-editor.md`, `18-landing-v3-visibilidad-gratis-y-planners.md`, `10-seo-lanzamiento-posicionamiento-organico.md`, entre otros) mencionan los precios anteriores ($2,000/$2,400, y antes $2,200/$2,600) como parte de decisiones ya tomadas en su momento. Se dejan intactos como registro histórico, igual que no se reescribe un commit viejo.
- **No hay ningún otro lugar con precios distintos entre sí** (se revisó `messages/` i18n, componentes de hoteles/mockData —que son precios de hospedaje de ejemplo, sin relación— y el resto de archivos `.md` del repo).

## Alcance

**Incluye:**

- `lib/marketing-content.ts`: cambiar el tipo `PackageContent['price']` de `2000 | 2400` a `1100 | 1400`, y los valores `PACKAGES[0].price` (Básico) a `1100` y `PACKAGES[1].price` (Personalizado) a `1400`.
- `app/page.tsx`: corregir a mano el literal de la meta description de `'...Desde $2,000 MXN.'` a `'...Desde $1,100 MXN.'`.
- `docs/BRAND-FOUNDATIONS.md`: actualizar la tabla de la sección 4 (`$2,000 MXN` → `$1,100 MXN`, `$2,400 MXN` → `$1,400 MXN`) y el ejemplo de la regla de estilo de la sección 2 (`"$2,000 MXN"` → `"$1,100 MXN"`).
- `docs/CONTENIDO-REDES-Y-BODAS.md`: actualizar las cuatro menciones de precio (resumen de reglas, plantilla de respuesta de `/paquetes`, y las dos líneas de resumen de paquetes) con los nuevos montos.
- Verificación de que el cambio se propaga correctamente, sin tocar su código, a: `components/landing/PriceStrip.tsx`, `components/landing/Packages.tsx` (incluida la frase de diferencia, que pasa de "$400" a "$300"), `app/paquetes/page.tsx`, `app/disenos/[slug]/page.tsx`, el JSON-LD de `lib/seo-schema.ts` (`packagesSchema`), y las respuestas de precio en `FAQ_ITEMS`.

**No incluye (queda fuera de este spec):**

- Copy de oferta/promoción ("antes $2,000, ahora $1,100", tachados, fecha de vigencia). Es un cambio permanente de precio de lista, no una promoción temporal — decisión explícita del usuario.
- Editar los specs históricos que mencionan los precios anteriores (`15`, `18`, `10`, etc.). Quedan intactos como registro de las decisiones tomadas en su momento — decisión explícita del usuario.
- Cualquier dato persistido en Firestore relacionado a precio: no existe hoy y este spec no lo introduce.
- Cambios a `/wedding-planners` (no muestra precios desde spec 18) ni a los niveles de partner/wholesale negociados por WhatsApp.
- Cambios al mecanismo de `formatPrice` (el formateo con comas de miles ya funciona igual para 1,100/1,400 que para los montos anteriores).

## Modelo de datos

No aplica. Este spec no introduce ni modifica estructuras de datos: el precio vive únicamente como constante de contenido en `lib/marketing-content.ts` y en los dos documentos de referencia de marca/redes, sin persistencia en Firestore.

## Plan de implementación

1. **Fuente única de verdad.** En `lib/marketing-content.ts`: cambiar el tipo `price: 2000 | 2400` a `price: 1100 | 1400` en `PackageContent`, `PACKAGES[0].price` de `2000` a `1100`, y `PACKAGES[1].price` de `2400` a `1400`. Prueba: `npm run build` compila sin errores de tipos (ningún otro archivo usa los literales `2000`/`2400` directamente, según la revisión de esta sesión).
2. **Meta description de la portada.** En `app/page.tsx`, corregir el literal de la línea 7 de `'...Desde $2,000 MXN.'` a `'...Desde $1,100 MXN.'`. Prueba manual: ver el código fuente de `/` (o las etiquetas `og:description`/`twitter:description`) y confirmar el nuevo monto.
3. **Verificación visual de propagación automática.** Sin tocar código adicional, recorrer: landing (`PriceStrip` en el primer scroll y la sección `Packages` con ambas tarjetas y la frase de diferencia, que debe decir "$300 MXN más que el Básico"), `/paquetes` (tarjetas y meta description), `/disenos/[slug]` (cualquier diseño, texto de disponibilidad de paquetes), y la FAQ (landing y `/preguntas-frecuentes`, pregunta `'¿Cuánto cuesta una invitación digital de boda con Invyta?'`). Todos deben mostrar $1,100 MXN y $1,400 MXN sin haber sido tocados directamente.
4. **JSON-LD / schema.org.** Confirmar en el HTML renderizado de `/paquetes` (bloque `<script type="application/ld+json">` de `packagesSchema`) que los `Offer.price` ahora son `1100` y `1400`.
5. **Documento de marca.** Actualizar `docs/BRAND-FOUNDATIONS.md`: la tabla de la sección 4 (fila "Precio") y el ejemplo de precio de la sección 2 ("Precios siempre con moneda"). Sin efecto en código, solo documentación de referencia para PDFs/piezas de marca.
6. **Documento de contenido para redes.** Actualizar `docs/CONTENIDO-REDES-Y-BODAS.md`: la línea de "Precios vigentes" al inicio, la plantilla de respuesta de `/paquetes`, y las dos líneas de resumen de Básico/Personalizado. Sin efecto en código.
7. **QA final.** `npm run build` sin errores nuevos. Repaso final de los cuatro puntos del paso 3 ya con los documentos actualizados, confirmando que no quedó ningún "$2,000" o "$2,400" visible en código ni en los dos documentos vivos tocados.

## Criterios de aceptación

- [ ] `PACKAGES[0].price` (Básico) es `1100` y `PACKAGES[1].price` (Personalizado) es `1400` en `lib/marketing-content.ts`, con el tipo `PackageContent['price']` actualizado a `1100 | 1400`.
- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos respecto al estado previo.
- [ ] La landing (sección de precio del primer scroll y sección de paquetes), `/paquetes`, `/disenos/[slug]` y la FAQ (landing y `/preguntas-frecuentes`) muestran $1,100 MXN y $1,400 MXN sin haber sido editados directamente (salvo `app/page.tsx`).
- [ ] La frase de diferencia de precio en la tarjeta del Paquete Personalizado dice "$300 MXN más que el Básico" (antes "$400").
- [ ] El JSON-LD de `/paquetes` (`packagesSchema`) expone `price: 1100` y `price: 1400` en sus dos `Offer`.
- [ ] La meta description de `/` (y sus equivalentes `og:description`/`twitter:description`) dicen "Desde $1,100 MXN."
- [ ] `docs/BRAND-FOUNDATIONS.md` y `docs/CONTENIDO-REDES-Y-BODAS.md` ya no mencionan $2,000 ni $2,400 en ningún punto; muestran $1,100 y $1,400.
- [ ] No queda ningún "$2,000" o "$2,400" en código fuente (`app/`, `components/`, `lib/`) fuera de los specs históricos ya excluidos a propósito.

## Decisiones tomadas y descartadas

- **Sí: cambio permanente de precio de lista, sin copy de oferta/promoción.** Decisión explícita del usuario; se reemplaza el número en todos lados sin mencionar el precio anterior, evitando ampliar el alcance con diseño/copy nuevo de "antes/ahora".
- **Sí: actualizar también los dos documentos vivos de marca/redes (`BRAND-FOUNDATIONS.md`, `CONTENIDO-REDES-Y-BODAS.md`).** Decisión explícita del usuario, consistente con pedir revisar "todos lados donde demos precios diferentes": son la fuente para PDFs y respuestas de WhatsApp/redes, y quedarían con cifras incorrectas si no se tocan.
- **Sí: corregir a mano el literal de `app/page.tsx`, sin dinamizarlo con `PACKAGES`.** Decisión explícita del usuario; es el único punto del código sin leer de la fuente única de verdad, pero se prefiere el cambio mínimo (un literal) en vez de añadir un import y una plantilla dinámica a un archivo de metadata estático.
- **No: editar los specs históricos que mencionan los precios anteriores.** Decisión explícita del usuario; quedan como registro de las decisiones tomadas en su momento (incluyendo que el precio ya había cambiado antes, de $2,200/$2,600 a $2,000/$2,400), igual que no se reescribe un commit viejo.
- **No: tocar `formatPrice` ni la lógica de cálculo de la diferencia de precio en `Packages.tsx`.** Ambos ya son genéricos (formatean cualquier número con comas de miles, y calculan la diferencia restando) y funcionan igual con los montos nuevos sin cambios.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Cachés de build/CDN (ISR, Vercel) o el caché de rastreo de buscadores podrían seguir mostrando el precio anterior por un tiempo tras el despliegue. | Aceptado como parte normal de cualquier despliegue de contenido; no requiere acción especial de este spec. |
| El tipo literal `2000 \| 2400` si quedó referenciado en algún lugar no detectado en esta revisión rompería la compilación al angostar la unión a `1100 \| 1400`. | `npm run build` (paso 7) lo detectaría de inmediato como error de tipos antes de desplegar. |

## Lo que **no** está en este spec

- Copy de oferta/promoción ("antes/ahora", tachados, vigencia).
- Edición de los specs históricos que mencionan los precios anteriores.
- Cualquier dato de precio persistido en Firestore.
- Cambios a `/wedding-planners` o a los niveles de partner/wholesale.
- Cambios al mecanismo de `formatPrice`.

Cada uno de estos, si se decide hacer, va en su propio spec.
