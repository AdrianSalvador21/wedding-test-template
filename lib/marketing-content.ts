// Fuente única de contenido de marketing (spec 10): la landing, las páginas nuevas
// y los datos estructurados leen de aquí, así precios, textos y schema no divergen.
// Voz y hechos: docs/BRAND-FOUNDATIONS.md. Solo se afirma lo que el producto hace hoy.

// ---------- Diseños ----------

export interface DesignContent {
  slug: 'clasico' | 'moderno' | 'botanica-editorial' | 'jardin-editorial';
  templateId: 'template-01' | 'template-02' | 'template-03' | 'template-04';
  name: string;
  crumb: string; // texto de la miga de pan
  h1: string;
  tagline: string; // descripción corta por tipo de boda (galería de la landing y "otros diseños")
  audience: string; // para qué boda es, sobre el nombre en la galería (spec 26)
  badge: string; // etiqueta sobre la imagen en la galería (spec 26)
  lead: string; // párrafo bajo el h1
  metaDescription: string; // ≤ 155 caracteres
  signature: { title: string; text: string }; // lo que distingue a este diseño
  fit: string; // "¿Para qué tipo de boda es?"
  demoHref: string; // sin prefijo de idioma: evita la redirección 307
  image: string;
  imageAlt: string;
}

export const DESIGNS: DesignContent[] = [
  {
    slug: 'clasico',
    templateId: 'template-01',
    name: 'Clásico',
    crumb: 'Diseño clásico',
    h1: 'Invitación digital de boda clásica',
    tagline: 'Sereno y formal, con monograma y detalles dorados. Para bodas tradicionales.',
    audience: 'Ceremonias formales',
    badge: 'Monograma',
    lead: 'Un diseño formal y sereno, pensado para bodas tradicionales. Tus invitados lo abren desde el celular con un enlace único.',
    metaDescription:
      'Invitación digital de boda clásica: serif elegante, monograma en sello y detalles botánicos. Enlace único por invitado y confirmación en tiempo real.',
    signature: {
      title: 'Serif y monograma en sello',
      text: 'Tipografía serif elegante con las iniciales de la pareja en un sello.',
    },
    fit: 'La tipografía serif y el monograma en sello le dan un tono formal. Es una buena elección para ceremonias tradicionales y celebraciones de estilo clásico.',
    demoHref: '/wedding/template-01-demo',
    image: '/assets/landing/design-template-01.png',
    imageAlt: 'Vista previa en el celular de la invitación de boda con el diseño Clásico',
  },
  {
    slug: 'moderno',
    templateId: 'template-02',
    name: 'Moderno',
    crumb: 'Diseño moderno',
    h1: 'Invitación digital de boda moderna',
    tagline: 'Limpio y actual, para parejas que prefieren menos adorno y más aire.',
    audience: 'Bodas contemporáneas',
    badge: 'Minimalista',
    lead: 'Un diseño limpio y contemporáneo, con tipografía geométrica y acentos de línea botánica. Se comparte por WhatsApp como cualquier mensaje.',
    metaDescription:
      'Invitación digital de boda moderna: tipografía geométrica, anillos concéntricos y acentos de línea botánica. Con confirmación de asistencia en tiempo real.',
    signature: {
      title: 'Anillos concéntricos',
      text: 'Tipografía sans-serif geométrica con anillos concéntricos y acentos de línea botánica.',
    },
    fit: 'La tipografía geométrica y los anillos concéntricos le dan un aire contemporáneo. Encaja con parejas que prefieren una invitación limpia y actual.',
    demoHref: '/wedding/template-02-demo',
    image: '/assets/landing/design-template-02.png',
    imageAlt: 'Vista previa en el celular de la invitación de boda con el diseño Moderno',
  },
  {
    slug: 'botanica-editorial',
    templateId: 'template-03',
    name: 'Botánica Editorial',
    crumb: 'Diseño botánica editorial',
    h1: 'Invitación digital de boda botánica editorial',
    tagline: 'Tu fotografía en arco, flores dibujadas a mano y cuenta regresiva en vivo.',
    audience: 'Si tus fotos son lo principal',
    badge: 'Tus fotos al centro',
    lead: 'Un diseño editorial que pone la fotografía de la pareja al centro, con motivos botánicos dibujados a mano y cuenta regresiva en vivo.',
    metaDescription:
      'Invitación digital de boda botánica editorial: fotografía en arco, motivos dibujados a mano y cuenta regresiva en vivo. Confirmación en tiempo real.',
    signature: {
      title: 'Fotografía en arco',
      text: 'Fotografía de la pareja en arco, motivos botánicos dibujados a mano y cuenta regresiva en vivo.',
    },
    fit: 'La fotografía en arco y los motivos botánicos dibujados a mano le dan un carácter editorial y cálido. Es ideal para parejas que quieren que sus fotos sean las protagonistas.',
    demoHref: '/wedding/valentina-mateo-2026',
    image: '/assets/landing/design-template-03.png',
    imageAlt: 'Vista previa en el celular de la invitación de boda con el diseño Botánica Editorial',
  },
  {
    slug: 'jardin-editorial',
    templateId: 'template-04',
    name: 'Jardín Editorial',
    crumb: 'Diseño jardín editorial',
    h1: 'Invitación digital de boda jardín editorial',
    tagline: 'Verde oliva y papel crema, con un tono elegante y sereno, como una revista de bodas.',
    audience: 'Jardín y hacienda',
    badge: 'Fotos en arco',
    lead: 'Un diseño editorial con fondo verde oliva oscuro y papel crema, numerales romanos como guía de cada sección y fotografías con marco en arco.',
    metaDescription:
      'Invitación digital de boda jardín editorial: verde oliva oscuro, papel crema, fotos en arco y numerales romanos. Confirmación en tiempo real.',
    signature: {
      title: 'Verde oliva y numerales romanos',
      text: 'Fondo verde oliva oscuro y papel crema, con numerales romanos que guían cada sección de la invitación.',
    },
    fit: 'El verde oliva oscuro y los numerales romanos le dan un carácter editorial y sereno. Es una buena elección para parejas que buscan un tono elegante y con estructura de revista.',
    demoHref: '/wedding/template-04-demo',
    image: '/assets/landing/design-template-04.png',
    imageAlt: 'Vista previa en el celular de la invitación de boda con el diseño Jardín Editorial',
  },
];

export const getDesign = (slug: string) => DESIGNS.find((d) => d.slug === slug);

// Orden en que la landing muestra los diseños (hero, galería y pie), spec 26.
export const LANDING_DESIGNS: DesignContent[] = (
  ['jardin-editorial', 'clasico', 'moderno', 'botanica-editorial'] as const
).map((slug) => getDesign(slug)!);

// ---------- Paquetes ----------

export interface PackageContent {
  id: 'basico' | 'personalizado';
  name: string; // "Paquete Básico"
  price: 1100 | 1400; // fuente única del precio: landing, /paquetes y schema
  currency: 'MXN';
  forWho: string; // descripción del Offer en el JSON-LD (lib/seo-schema.ts)
  tagline: string; // frase corta bajo el precio en la comparativa (spec 26)
}

// Qué incluye cada paquete vive en PACKAGE_COMPARISON (más abajo), compartido por la landing y /paquetes.
export const PACKAGES: PackageContent[] = [
  {
    id: 'basico',
    name: 'Paquete Básico',
    price: 1100,
    currency: 'MXN',
    forWho: 'Invyta arma tu invitación y hace los cambios por ti.',
    tagline: 'Nosotros hacemos todo',
  },
  {
    id: 'personalizado',
    name: 'Paquete Personalizado',
    price: 1400,
    currency: 'MXN',
    forWho: 'Tu invitación con panel para editar, una invitación por invitado y asistente con IA.',
    tagline: 'Tú tienes el control',
  },
];

export const getPackage = (id: PackageContent['id']) => PACKAGES.find((p) => p.id === id)!;

// "$1,100" — sin depender de la configuración regional del servidor o del navegador.
export const formatPrice = (price: number) => `$${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

// ---------- Forma de pago y tiempo de respuesta (spec 26) ----------

// Forma de pago (fuente única: hero, TrustSection, PaymentAndProcess, FAQ, StickyCtaBar).
export const PAYMENT = {
  depositMxn: 500, // anticipo para apartar fecha y empezar
  method: 'transferencia',
  balanceOn: 'entrega', // el resto se paga al recibir la invitación terminada
  invoice: false, // hoy no se emite factura
} as const;

// "$500": el anticipo listo para usarse en frases.
export const depositLabel = formatPrice(PAYMENT.depositMxn);

// Promesa de respuesta por WhatsApp (texto, no número, para usarlo en frases).
export const RESPONSE_TIME = 'menos de una hora';

// ---------- Comparativa de paquetes (landing y /paquetes) ----------

// `text` solo en filas donde cada paquete tiene un valor propio en lugar de sí/no.
export interface ComparisonRow {
  label: string;
  basico: boolean;
  personalizado: boolean;
  text?: { basico: string; personalizado: string };
}

export interface ComparisonGroup {
  title: string;
  rows: ComparisonRow[];
}

export const PACKAGE_COMPARISON: ComparisonGroup[] = [
  {
    title: 'Tu invitación',
    rows: [
      { label: 'Uno de los 4 diseños, lista en 7 días hábiles', basico: true, personalizado: true },
      { label: 'Historia, galería, cuenta regresiva, cronograma y mapa', basico: true, personalizado: true },
      { label: 'Regalos, hospedaje, vestimenta y sección solo adultos', basico: true, personalizado: true },
      { label: 'Confirmación de asistencia y lista de confirmados', basico: true, personalizado: true },
      { label: 'Revisiones ilimitadas antes de la entrega', basico: true, personalizado: true },
    ],
  },
  {
    title: 'Después de publicar',
    rows: [
      {
        label: 'Cambios de datos',
        basico: true,
        personalizado: true,
        text: { basico: 'Los hacemos por ti', personalizado: 'Tú, desde tu panel' },
      },
      { label: 'Enlace y bienvenida con el nombre de cada invitado', basico: false, personalizado: true },
      { label: 'Lugares por invitado, idioma ES/EN y canción', basico: false, personalizado: true },
      { label: 'Asistente con IA para textos y traducción', basico: false, personalizado: true },
      { label: 'Soporte extendido la semana de tu boda', basico: false, personalizado: true },
    ],
  },
];

// ---------- Preguntas frecuentes ----------

export interface FaqItem {
  question: string;
  answer: string;
  group: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Tengo que diseñar mi invitación?',
    answer: 'No. Tú eliges un diseño, completamos juntos la información de tu boda, y nosotros la preparamos.',
    group: 'Antes de empezar',
  },
  {
    question: '¿Mis invitados necesitan descargar una aplicación?',
    answer: 'No. La invitación funciona directo desde el navegador del celular.',
    group: 'Invitados y confirmaciones',
  },
  {
    question: '¿Cómo reciben la invitación mis invitados?',
    answer: 'Por WhatsApp, mensaje, correo o el medio que prefieras — es un enlace único.',
    group: 'Invitados y confirmaciones',
  },
  {
    question: '¿Puedo saber quién confirmó?',
    answer: 'Sí. Las confirmaciones aparecen en tu panel en tiempo real.',
    group: 'Invitados y confirmaciones',
  },
  {
    question: '¿Puedo limitar cuántos invitados puede llevar cada persona?',
    answer:
      'Sí, en el Paquete Personalizado, que incluye invitaciones individuales con número de lugares por invitado.',
    group: 'Invitados y confirmaciones',
  },
  {
    question: '¿Puedo cambiar la información después de publicar?',
    answer:
      'Sí. Con el Personalizado ajustas tus datos tú desde tu panel, y si quieres un cambio visual nos escribes; con el Básico, Invyta hace los cambios por ti.',
    group: 'Cambios, idioma y duración',
  },
  {
    question: '¿Cuánto tarda la entrega?',
    answer: '7 días hábiles desde que tenemos tu información y tus fotos.',
    group: 'Antes de empezar',
  },
  {
    question: '¿Puedo tener mi invitación en otro idioma?',
    answer:
      'Sí, en el Paquete Personalizado puedes personalizar el idioma de tu invitación, eligiendo entre español e inglés para cada uno de tus invitados.',
    group: 'Cambios, idioma y duración',
  },
  {
    question: '¿La IA publica cosas en mi invitación sin que yo lo sepa?',
    answer:
      'Nunca. Todo lo que genera aparece como borrador en tu editor y solo se publica cuando tú das clic en Guardar.',
    group: 'Asistente con IA',
  },
  {
    question: '¿La IA viene en el Paquete Básico?',
    answer:
      'No, es parte del Paquete Personalizado, junto con el panel de edición y las invitaciones individuales por invitado.',
    group: 'Asistente con IA',
  },
  {
    // Spec 16: organizar invitados y mesas sin plantilla ya es gratis, con cuenta propia (sin
    // pasar por ningún paquete); el Paquete Personalizado sigue siendo lo que suma diseño,
    // panel de edición e IA sobre esa misma boda.
    question: '¿La gestión de mesas viene en el Paquete Básico?',
    answer:
      'Organizar invitados y mesas ya es gratis, sin necesidad de contratar ningún paquete: crea tu cuenta y úsalo de inmediato. Si además quieres tu invitación con diseño, panel de edición e IA, eso es el Paquete Personalizado.',
    group: 'Gestión de mesas',
  },
];

// Más preguntas para /preguntas-frecuentes, que muestra todas. Cuáles y en qué orden va la
// landing lo define LANDING_FAQ_QUESTIONS (más abajo).
// Respuestas tomadas de docs/BRAND-FOUNDATIONS.md y de components/landing (Packages).
FAQ_ITEMS.push(
  {
    question: '¿Cuánto cuesta una invitación digital de boda con Invyta?',
    answer: `Organizar tus invitados y mesas es gratis, sin comprar ningún paquete: crea tu cuenta y úsalo de inmediato. Si además quieres tu invitación con diseño, el Paquete Básico cuesta ${formatPrice(PACKAGES[0].price)} MXN y el Personalizado ${formatPrice(PACKAGES[1].price)} MXN. No hay costo extra por cada invitación que envíes.`,
    group: 'Antes de empezar',
  },
  {
    // Spec 26: la respuesta sale de PAYMENT para que el anticipo viva en un solo lugar.
    question: '¿Cómo se paga?',
    answer: `Por ${PAYMENT.method}. Empiezas con ${depositLabel} MXN de anticipo y pagas el resto cuando recibes tu invitación terminada.${
      PAYMENT.invoice ? '' : ' Por ahora no emitimos factura.'
    }`,
    group: 'Antes de empezar',
  },
  {
    question: '¿Por qué no mandar un PDF o una imagen?',
    answer:
      'Un PDF no te dice quién confirmó. Con Invyta cada respuesta llega a tu lista, tus invitados tienen mapa, horarios y regalos en un solo lugar, y si cambia un dato no tienes que reenviar nada.',
    group: 'Antes de empezar',
  },
  {
    question: '¿Cuándo conviene enviarla?',
    answer:
      'Lo ideal es enviarla de 2 a 3 meses antes. Si tu boda es en menos de un mes, escríbenos hoy: con 7 días hábiles de entrega todavía llegas.',
    group: 'Antes de empezar',
  },
  {
    question: '¿Cuál es la diferencia entre el Paquete Básico y el Personalizado?',
    answer:
      'En el Básico, Invyta gestiona los cambios de contenido de tu invitación. El Personalizado suma un panel para que edites tú y gestiones a tus invitados, un asistente con IA, personalización por invitado y soporte extendido durante los 7 días previos al evento.',
    group: 'Antes de empezar',
  },
  {
    question: '¿Puedo ver cómo se ve antes de contratar?',
    answer: 'Sí, hay cuatro demos reales que puedes abrir desde el celular.',
    group: 'Antes de empezar',
  },
  {
    question: '¿Qué diseños puedo elegir?',
    answer: 'Cuatro: Clásico, Moderno, Botánica Editorial y Jardín Editorial. Puedes abrir una demo real de cada uno desde tu celular.',
    group: 'Antes de empezar',
  },
  {
    question: '¿Qué información necesito para empezar?',
    answer:
      'Fecha y hora de tu boda, lugar y ubicación, lista de invitados, fotos para tu galería y código de vestimenta.',
    group: 'Antes de empezar',
  },
  {
    question: '¿Puedo contratar Invyta si soy wedding planner?',
    answer:
      'Sí. Cada boda tiene su propia invitación y su propio panel, y ves todas las bodas de tus clientes desde una sola cuenta, con un solo inicio de sesión. Cuéntanos cuántas bodas manejas y te explicamos cómo lo organizamos.',
    group: 'Antes de empezar',
  },
  {
    question: '¿Cuántas invitaciones puedo enviar?',
    answer: 'Todas las que necesites, sin costo extra por invitado.',
    group: 'Invitados y confirmaciones',
  },
  {
    question: '¿Mis invitados mayores sabrán usarla?',
    answer:
      'Se comparte por WhatsApp como cualquier mensaje: un enlace, un toque y se abre. Para confirmar solo eligen “Sí, ahí estaré”.',
    group: 'Invitados y confirmaciones',
  },
  {
    question: '¿Cuánto tiempo estará activa mi invitación?',
    answer: 'Está en línea hasta 15 días después de tu boda.',
    group: 'Cambios, idioma y duración',
  },
  {
    question: '¿Qué hace el asistente con IA?',
    answer:
      'Redacta tu historia y tu código de vestimenta, traduce a inglés y sugiere itinerario, hoteles y lugares. Es parte del Paquete Personalizado.',
    group: 'Asistente con IA',
  },
  {
    question: '¿Qué es la gestión de mesas?',
    answer:
      'Organiza a tus invitados confirmados en mesas desde una vista de cuadrícula o un plano visual de tu salón, con arrastrar y soltar. Es gratis con cualquier cuenta, sin contratar ningún paquete.',
    group: 'Gestión de mesas',
  },
);

export const getFaq = (question: string) => FAQ_ITEMS.find((item) => item.question === question)!;

// Preguntas de la landing, en el orden en que se muestran (spec 26). Son textos exactos de
// FAQ_ITEMS: no se renombran porque /paquetes, /wedding-planners y /disenos las buscan con getFaq.
export const LANDING_FAQ_QUESTIONS = [
  '¿Cómo se paga?',
  '¿Mis invitados necesitan descargar una aplicación?',
  '¿Mis invitados mayores sabrán usarla?',
  '¿Por qué no mandar un PDF o una imagen?',
  '¿Cuánto tarda la entrega?',
  '¿Puedo cambiar la información después de publicar?',
  '¿Cuánto tiempo estará activa mi invitación?',
  '¿Cuándo conviene enviarla?',
];

// Agrupa por tema respetando el orden de primera aparición.
export function groupFaq(items: FaqItem[]): { group: string; items: FaqItem[] }[] {
  const groups: { group: string; items: FaqItem[] }[] = [];
  for (const item of items) {
    let entry = groups.find((g) => g.group === item.group);
    if (!entry) {
      entry = { group: item.group, items: [] };
      groups.push(entry);
    }
    entry.items.push(item);
  }
  return groups;
}
