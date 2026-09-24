# 06 — Visión general: funcionalidades de IA para el paquete Personalizado

**Estado:** Exploración — documento general de referencia; de aquí se derivarán specs individuales por función antes de construir cada una
**Depende de:** Ninguno (documento de producto, no de implementación directa)
**Fecha:** 2026-09-23

## Objetivo

Definir qué funcionalidades de IA tiene sentiel tiempo, no es predecible. Deben quedar fuera del bundle base, con límite de uso o como fase futura con modelo de cobro distinto.

Este es el criterio usado para ordenar las funciones abajo.

## Propuesta

### Ola 1 — Panel de la pareja / admin (prioridad de desarrollo)

**Nivel 1 — Bajo costo y bajo esfuerzo** (candidatas fuertes para ir incluidas en el nuevo precio base):

| Función | Qué hace | Dónde engancha | Por qué genera valor |
|---|---|---|---|
| Redactor de "Nuestra Historia" / bienvenida | La pareja responde 3–4 preguntas (cómo se conocieron, anécdota, tono) y la IA redacta el texto de "Nuestra Historia" y el mensaje de bienvenida | Sección `couple` del wedding-editor (`app/[locale]/admin/wedding-editor/[weddingId]/page.tsx`) | Resuelve el "síndrome de la hoja en blanco", razón #1 por la que estas secciones quedan a medias |
| Traducción automática ES↔EN de contenido propio | Un botón "Traducir con IA" llena el segundo idioma de cualquier texto libre (historia, bienvenida, notas de itinerario) | Reutiliza la infraestructura de `next-intl` ya existente (`messages/es.json`, sitios bilingües) | Beneficia directamente a bodas de destino / con invitados extranjeros, segmento que Invyta ya vende (personalización por invitado con idioma individual) |
| Generador de itinerario sugerido | A partir del tipo de evento y hora, la IA propone un itinerario típico (ceremonia, cóctel, cena, baile) editable | Sección `timeline` del wedding-editor | Acelera una de las secciones más tediosas de llenar desde cero |
| Redacción asistida de Dress Code / Lugares recomendados | La pareja da datos sueltos (ciudad, restaurantes) y la IA redacta el texto final con buen tono | Secciones `dressCode` / `recommendedPlaces` | Copy pulido sin que la pareja tenga que redactar |
| Sugerencia de lugares recomendados por ciudad | Además de redactar el texto de un lugar que la pareja ya agregó, la IA puede proponer lugares nuevos que aún no están en la lista (hospedaje, restaurantes, actividades), usando la ciudad/ubicación del evento ya capturada en la sección `Evento`, cuando ese dato existe | Sección `recommendedPlaces`, lee `event.location`/ciudad ya guardada | Evita que la pareja tenga que investigar y escribir cada lugar desde cero; la pareja siempre revisa antes de agregar (no se publica nada sin confirmar) |

Costo estimado: 1 llamada a un modelo de texto económico por generación (equivalente a Haiku/GPT-mini), con 3–5 regeneraciones permitidas por sección. Costo por boda: céntimos de dólar.

**Nota sobre "Sugerencia de lugares recomendados por ciudad":** nombrar negocios reales (un hotel o restaurante específico) tiene riesgo de alucinación si el modelo no tiene una fuente confiable de datos actualizados — podría sugerir un lugar cerrado, con otro nombre, o que no aplica a esa ciudad. Mientras no haya una fuente de datos verificada (ej. Google Places API), conviene: (a) que la pareja siempre confirme antes de agregar (ya contemplado en el diseño: nada se publica sin que la pareja lo acepte), y (b) evaluar si conviene empezar solo con categorías genéricas ("un hotel boutique cerca del salón", "un restaurante para cena de bienvenida") en vez de nombres reales, hasta contar con esa fuente de datos.

**Nivel 2 — Complejidad media** (fuerte valor, costo acotado por el tamaño de la lista de invitados):

| Función | Qué hace | Dónde engancha | Por qué genera valor |
|---|---|---|---|
| Asistente de seguimiento de RSVP | Redacta mensajes personalizados de recordatorio (WhatsApp/email) para invitados que no han confirmado, usando nombre + fecha límite | `services/rsvpService.ts`, `services/guestService.ts`, panel de `guests` | Automatiza la tarea más tediosa hoy: perseguir confirmaciones. La pareja revisa y envía manualmente (evita riesgo de auto-envío) |
| Resumen ejecutivo del panel de invitados | Texto tipo "32% aún no confirma, la mayoría son del lado de la novia, faltan 12 días" sobre las estadísticas ya existentes | Panel `admin/guests/[weddingId]` | Envoltura ligera de IA sobre datos ya calculados; alto valor percibido con poco esfuerzo |
| Asistente de distribución de mesas | Con número de invitados, capacidad de mesas y grupos simples (familia novia/novio, amigos, niños), la IA propone un primer acomodo ajustable | Requiere UI nueva de drag-and-drop + campo de "grupo" en el modelo de invitado | Cierra brecha de paridad directa contra Zola/The Knot |

**Nivel 3 — Alto impacto, mayor esfuerzo/costo** (candidatas a función bandera premium, no para incluir a la ligera en el bundle base):

| Función | Qué hace | Por qué es más cara/compleja |
|---|---|---|
| Onboarding conversacional ("arma tu boda hablando con la IA", al estilo Aisle) | Un wizard de chat pre-llena varias de las 9 secciones del editor a partir de una conversación | Requiere mapear conversación → todos los modelos de datos (`src/types/wedding.ts`). Alto esfuerzo, pero reduce el trabajo manual que hoy hace el equipo de Invyta para armar el sitio Personalizado — puede financiar parte del aumento de precio como ahorro operativo. Pilotear primero con 2–3 secciones (pareja + evento), no las 9 de golpe |
| Paleta/estilo sugerido a partir de una foto | La pareja sube una foto (compromiso, venue) y la IA sugiere una paleta de color aplicada sobre las plantillas existentes | Requiere análisis de imagen + integrarlo al sistema de tokens de color de `Template01/02/03`. Buen efecto de demo, no crítico para el flujo core |

### Ola 2 — Sitio del invitado (documentado para alcance, no se construye todavía)

Su modelo de costo no encaja bien en un pago único (uso abierto por cada invitado, sin límite natural). Evaluar cuando exista un mecanismo de límite de uso o cobro adicional (créditos, o franja "IA Plus").

| Función | Qué hace | Nivel de esfuerzo | Nota de costo |
|---|---|---|---|
| Chatbot de invitados en el sitio público | Responde preguntas de cada invitado (vestimenta, ubicación, hospedaje, regalo) usando los datos reales de esa boda | Medio-alto (UI de chat + acotar respuestas a los datos del wedding) | Costo no acotado: cualquier invitado puede preguntar sin límite. El diferenciador más fuerte frente a la competencia en español, y el más riesgoso en costo |
| RSVP conversacional ("sí, vamos 2, mi hija es vegetariana" en vez de formulario) | Convierte lenguaje natural en los campos estructurados de RSVP | Alto (NLU + integración con WhatsApp Business API) | Muy valioso para invitados de mayor edad, común en bodas mexicanas; el más caro de construir |
| Traducción en vivo del sitio para invitados extranjeros | Extiende la traducción automática (Nivel 1, Ola 1) para que cada invitado vea el contenido libre en su propio idioma | Bajo-medio, reutiliza la función de traducción de la Ola 1 | Costo acotado, buen candidato a subir de fase 2 a fase 1 |
| Recapitulación de recuerdos post-boda | Después del evento, la IA compila mensajes del libro de invitados/fotos en un resumen para compartir | Bajo (trabajo por lote, una sola vez) | Costo acotado y bajo — buen touchpoint de retención post-venta |

## Recomendación de empaquetado

1. **Incluir en el nuevo precio de Personalizado (financia la subida de precio):** todo el Nivel 1 + Resumen ejecutivo de invitados (Nivel 2). Costo de IA por boda mínimo, valor percibido alto — argumento de venta directo ("tu sitio se escribe solo, en dos idiomas").
2. **Incluir con límite razonable (ej. "regenera hasta N veces"):** Asistente de seguimiento de RSVP y Asistente de mesas (Nivel 2) — mensaje de venta: "la IA te ayuda a cerrar tu lista de invitados sin perseguir a nadie por WhatsApp".
3. **Función bandera, desarrollo por fases:** Onboarding conversacional — pilotear primero puertas adentro (reduce el trabajo del equipo Invyta al armar cada sitio) antes de exponerlo como feature de venta.
4. **Roadmap declarado, no vendido todavía:** todo lo de la Ola 2 — mencionarlo en ventas como "lo que viene" sin comprometer margen antes de tener un mecanismo de límite de uso.

## Cómo validar antes de comprometerse

- Prototipar primero el Nivel 1 (redactor de textos + traducción): menor riesgo técnico y de costo, se puede probar con 3–5 bodas reales para medir cuánto se usa realmente.
- Medir cuántas veces se regenera contenido por boda para calibrar el límite de "regeneraciones incluidas" antes de fijar el precio final de Personalizado.
- Para el chatbot de invitados (Ola 2), correr un piloto cerrado con 1–2 bodas para medir volumen real de preguntas por invitado antes de decidir el modelo de cobro.
- Nota técnica pendiente: los paneles de admin (`admin/wedding-editor`, `admin/guests`) hoy no tienen autenticación — antes de dar a la pareja botones de IA que escriben directo en su sitio o gastan créditos, conviene resolver ese punto.

## Próximos specs a derivar de este documento

Cada función (o grupo pequeño de funciones relacionadas) del Nivel 1/2 de la Ola 1 debe convertirse en su propio spec de implementación (formato igual a specs 01–05: Objetivo, Contexto, Alcance con Incluye/No incluye) antes de construirse. Sugerido, en orden de prioridad de desarrollo:

1. Redactor de textos con IA (historia, bienvenida, dress code, lugares recomendados) + traducción automática ES↔EN — se agrupan porque comparten la mido incorporar al paquete Personalizado de Invyta, organizadas por complejidad y costo, para decidir cuáles quedan incluidas en el nuevo precio base y cuáles se dejan como roadmap futuro. Este documento no es un spec de implementación: es el mapa general del que se sacarán specs concretos (uno por función o grupo de funciones) siguiendo el mismo formato que los specs 01–05.

## Contexto

Invyta vende hoy dos paquetes de pago único: **Básico** ($2,000 MXN, solo plantilla) y **Personalizado** ($2,400 MXN, panel de autogestión + personalización por invitado, ver `components/landing/Packages.tsx`). No existe ningún tipo de suscripción ni funcionalidad de IA en el código actual — es terreno greenfield.

La pareja fundadora decidió que **el precio de Personalizado va a subir y debe incluir IA de forma nativa**, no como upsell aparte. Por eso se necesitaba un menú de funciones de IA organizado por **complejidad y costo**, para decidir cuáles entran al paquete base y cuáles quedan para una fase posterior. La primera ola de desarrollo se enfoca en el **panel de la pareja/admin** (donde hoy hay más fricción: un editor de 9 secciones y gestión manual de invitados sin ayuda alguna). También se documentan ideas para el **sitio del invitado**, como mapa de alcance a futuro, sin comprometerse a construirlas ahora.

### Panorama competitivo

- **Zola**: "Split the Decisions" (reparte tareas entre la pareja) y un generador de notas de agradecimiento.
- **Joy (antes WithJoy)**: asistente de IA que redacta votos, brindis, mensaje de bienvenida del sitio y respuestas de FAQ "con tu voz".
- **Aisle**: configura el sitio completo por conversación (fecha, lugar, itinerario) en ~5 minutos.
- **The Knot / industria en general**: generador automático de acomodo de mesas, recordatorios de RSVP predictivos.
- **México/Latam**: la oferta existente (ej. Glya) apunta a *planners* y venues, no a que la propia pareja tenga un copiloto de IA en su sitio. El estudio de The Knot indica que 1 de cada 5 parejas ya usa alguna herramienta de IA al planear su boda (2025), y en México ~78% de wedding planners usan IA en algún punto (ZipDo 2025).

**Conclusión:** el mercado ya espera IA como estándar (redacción de textos, mesas, RSVP), pero **nadie en español/Latam ofrece un copiloto de IA integrado al propio sitio de la boda** dirigido a la pareja e invitados. Ahí está el espacio para diferenciarse, no solo para alcanzar paridad.

### Principio económico para decidir qué va incluido

Como Personalizado sigue siendo **pago único** (no suscripción), el costo de IA por boda debe ser **acotado y predecible** para no comerse el margen:

- **Costo acotado (cabe bien en pago único):** generación de texto de una sola vez, traducción, resúmenes — se usan pocas veces por boda (ej. 5–15 llamadas a IA en toda la vida de la boda). Candidatas naturales para ir **incluidas en el precio base nuevo**.
- **Costo no acotado / continuo (no cabe bien en pago único):** un chatbot que cualquier invitado puede usar sin límite, o RSVP conversacional en vivo — el uso escala con el número de invitados y sma infraestructura de "botón de IA en un campo de texto del wedding-editor".
2. Generador de itinerario sugerido.
3. Resumen ejecutivo del panel de invitados + asistente de seguimiento de RSVP — comparten el mismo panel (`admin/guests`).
4. Asistente de distribución de mesas.
5. Onboarding conversacional (spec separado, mayor alcance, requiere su propia validación de piloto antes de escribirse en detalle).
