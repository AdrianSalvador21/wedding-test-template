// Fuente única de contenido de marketing (spec 10): la landing, las páginas nuevas
// y los datos estructurados leen de aquí, así precios, textos y schema no divergen.
// Voz y hechos: docs/BRAND-FOUNDATIONS.md. Solo se afirma lo que el producto hace hoy.

// ---------- Diseños ----------

export interface DesignContent {
  slug: 'clasico' | 'moderno' | 'botanica-editorial';
  templateId: 'template-01' | 'template-02' | 'template-03';
  name: string;
  crumb: string; // texto de la miga de pan
  h1: string;
  tagline: string; // descripción corta (la de la galería de la landing)
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
    tagline: 'Serif elegante, monograma en sello y detalles botánicos mínimos.',
    lead: 'Un diseño formal y sereno, pensado para bodas tradicionales. Tus invitados lo abren desde el celular con un enlace único.',
    metaDescription:
      'Invitación digital de boda clásica: serif elegante, monograma en sello y detalles botánicos. Enlace único por invitado y confirmación en tiempo real.',
    signature: {
      title: 'Serif y monograma en sello',
      text: 'Tipografía serif elegante con las iniciales de la pareja en un sello.',
    },
    fit: 'La tipografía serif y el monograma en sello le dan un tono formal. Es una buena elección para ceremonias tradicionales y celebraciones de estilo clásico.',
    demoHref: '/wedding/template-01-demo',
    image: '/assets/landing/design-template-01.jpg',
    imageAlt: 'Vista previa en el celular de la invitación de boda con el diseño Clásico',
  },
  {
    slug: 'moderno',
    templateId: 'template-02',
    name: 'Moderno',
    crumb: 'Diseño moderno',
    h1: 'Invitación digital de boda moderna',
    tagline: 'Sans-serif geométrica, anillos concéntricos y acentos de línea botánica.',
    lead: 'Un diseño limpio y contemporáneo, con tipografía geométrica y acentos de línea botánica. Se comparte por WhatsApp como cualquier mensaje.',
    metaDescription:
      'Invitación digital de boda moderna: tipografía geométrica, anillos concéntricos y acentos de línea botánica. Con confirmación de asistencia en tiempo real.',
    signature: {
      title: 'Anillos concéntricos',
      text: 'Tipografía sans-serif geométrica con anillos concéntricos y acentos de línea botánica.',
    },
    fit: 'La tipografía geométrica y los anillos concéntricos le dan un aire contemporáneo. Encaja con parejas que prefieren una invitación limpia y actual.',
    demoHref: '/wedding/template-02-demo',
    image: '/assets/landing/design-template-02.jpg',
    imageAlt: 'Vista previa en el celular de la invitación de boda con el diseño Moderno',
  },
  {
    slug: 'botanica-editorial',
    templateId: 'template-03',
    name: 'Botánica Editorial',
    crumb: 'Diseño botánica editorial',
    h1: 'Invitación digital de boda botánica editorial',
    tagline: 'Fotografía de novios en arco, motivos botánicos dibujados a mano y countdown en vivo.',
    lead: 'Un diseño editorial que pone la fotografía de la pareja al centro, con motivos botánicos dibujados a mano y cuenta regresiva en vivo.',
    metaDescription:
      'Invitación digital de boda botánica editorial: fotografía en arco, motivos dibujados a mano y cuenta regresiva en vivo. Confirmación en tiempo real.',
    signature: {
      title: 'Fotografía en arco',
      text: 'Fotografía de la pareja en arco, motivos botánicos dibujados a mano y cuenta regresiva en vivo.',
    },
    fit: 'La fotografía en arco y los motivos botánicos dibujados a mano le dan un carácter editorial y cálido. Es ideal para parejas que quieren que sus fotos sean las protagonistas.',
    demoHref: '/wedding/valentina-mateo-2026',
    image: '/assets/landing/design-template-03.jpg',
    imageAlt: 'Vista previa en el celular de la invitación de boda con el diseño Botánica Editorial',
  },
];

export const getDesign = (slug: string) => DESIGNS.find((d) => d.slug === slug);

// ---------- Paquetes ----------

export interface PackageGroup {
  title: string;
  text: string;
  isNew?: boolean;
}

export interface PackageContent {
  id: 'basico' | 'personalizado';
  name: string; // "Paquete Básico"
  price: 2200 | 2600; // fuente única del precio: landing, /paquetes y schema
  currency: 'MXN';
  forWho: string;
  groups: PackageGroup[];
  notIncluded?: string;
}

export const PACKAGES: PackageContent[] = [
  {
    id: 'basico',
    name: 'Paquete Básico',
    price: 2200,
    currency: 'MXN',
    forWho: 'Perfecto para bodas tradicionales',
    groups: [
      {
        title: 'Tu página web',
        text: 'Página tipo plantilla, enlace único para compartir, dominio/hosting incluido hasta 15 días después del evento, entrega en 7 días hábiles.',
      },
      {
        title: 'Contenido de tu boda',
        text: 'Bienvenida, cuenta regresiva, detalles del evento, nuestra historia, galería de fotos, cronograma y código de vestimenta.',
      },
      {
        title: 'Logística para invitados',
        text: 'Mesa de regalos, hospedaje recomendado y sección de solo adultos.',
      },
      {
        title: 'Confirmación y gestión',
        text: 'Formulario de confirmación y gestión de invitados confirmados.',
      },
    ],
    notIncluded:
      'Personalización por invitado (URL, mensaje, idioma, boletos o canción individuales) ni el asistente con IA.',
  },
  {
    id: 'personalizado',
    name: 'Paquete Personalizado',
    price: 2600,
    currency: 'MXN',
    forWho: 'Experiencia completamente personalizada',
    groups: [
      {
        title: 'Tu página web',
        text: 'Completamente personalizada, enlace único para redes, dominio/hosting incluido, entrega rápida en 7 días hábiles.',
      },
      {
        title: 'Contenido a tu medida',
        text: 'Bienvenida personalizada, cuenta regresiva dinámica, detalles completos, nuestra historia, galería profesional, cronograma detallado y código de vestimenta elegante.',
      },
      {
        title: 'Logística para invitados',
        text: 'Mesa de regalos integrada, hospedaje recomendado y sección solo adultos.',
      },
      {
        title: 'Panel de edición y gestión',
        text: 'Cambia tu invitación y controla confirmaciones e invitados cuando quieras, sin depender de nosotros.',
      },
      {
        title: 'Asistente con IA',
        text: 'Redacta tu historia y tu código de vestimenta, traduce a inglés y sugiere itinerario, hoteles y lugares para tus invitados.',
        isNew: true,
      },
      {
        title: 'Personalización 1:1',
        text: 'URL y bienvenida únicas por invitado, idioma (ES/EN) y canción en la invitación.',
      },
      {
        title: 'Soporte',
        text: 'Extendido, 7 días antes del evento.',
      },
    ],
  },
];

export const getPackage = (id: PackageContent['id']) => PACKAGES.find((p) => p.id === id)!;

// "$2,200" — sin depender de la configuración regional del servidor o del navegador.
export const formatPrice = (price: number) => `$${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

// ---------- Preguntas frecuentes ----------

export interface FaqItem {
  question: string;
  answer: string;
  group: string;
  onLanding: boolean; // la landing muestra estas; /preguntas-frecuentes muestra todas
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Tengo que diseñar mi invitación?',
    answer: 'No. Tú eliges un diseño, completamos juntos la información de tu boda, y nosotros la preparamos.',
    group: 'Antes de empezar',
    onLanding: true,
  },
  {
    question: '¿Mis invitados necesitan descargar una aplicación?',
    answer: 'No. La invitación funciona directo desde el navegador del celular.',
    group: 'Invitados y confirmaciones',
    onLanding: true,
  },
  {
    question: '¿Cómo reciben la invitación mis invitados?',
    answer: 'Por WhatsApp, mensaje, correo o el medio que prefieras — es un enlace único.',
    group: 'Invitados y confirmaciones',
    onLanding: true,
  },
  {
    question: '¿Puedo saber quién confirmó?',
    answer: 'Sí. Las confirmaciones aparecen en tu panel en tiempo real.',
    group: 'Invitados y confirmaciones',
    onLanding: true,
  },
  {
    question: '¿Puedo limitar cuántos invitados puede llevar cada persona?',
    answer:
      'Sí, en el Paquete Personalizado, que incluye invitaciones individuales con número de lugares por invitado.',
    group: 'Invitados y confirmaciones',
    onLanding: true,
  },
  {
    question: '¿Puedo cambiar la información después de publicar?',
    answer: 'Sí, tú editas tu invitación y gestionas tus invitados cuando quieras, sin depender de nosotros.',
    group: 'Cambios, idioma y duración',
    onLanding: true,
  },
  {
    question: '¿Cuánto tarda la entrega?',
    answer: '7 días hábiles.',
    group: 'Antes de empezar',
    onLanding: true,
  },
  {
    question: '¿Puedo tener mi invitación en otro idioma?',
    answer:
      'Sí, en el Paquete Personalizado puedes personalizar el idioma de tu invitación, eligiendo entre español e inglés para cada uno de tus invitados.',
    group: 'Cambios, idioma y duración',
    onLanding: true,
  },
  {
    question: '¿La IA publica cosas en mi invitación sin que yo lo sepa?',
    answer:
      'Nunca. Todo lo que genera aparece como borrador en tu editor y solo se publica cuando tú das clic en Guardar.',
    group: 'Asistente con IA',
    onLanding: true,
  },
  {
    question: '¿La IA viene en el Paquete Básico?',
    answer:
      'No, es parte del Paquete Personalizado, junto con el panel de edición y las invitaciones individuales por invitado.',
    group: 'Asistente con IA',
    onLanding: true,
  },
];

// Preguntas que solo muestra /preguntas-frecuentes (la landing conserva sus 10).
// Respuestas tomadas de docs/BRAND-FOUNDATIONS.md y de components/landing (Packages).
FAQ_ITEMS.push(
  {
    question: '¿Cuánto cuesta una invitación digital de boda con Invyta?',
    answer: `El Paquete Básico cuesta ${formatPrice(PACKAGES[0].price)} MXN y el Personalizado ${formatPrice(PACKAGES[1].price)} MXN. No hay costo extra por cada invitación que envíes.`,
    group: 'Antes de empezar',
    onLanding: false,
  },
  {
    question: '¿Cuál es la diferencia entre el Paquete Básico y el Personalizado?',
    answer:
      'En el Básico, Invyta gestiona los cambios de contenido de tu invitación. El Personalizado suma un panel para que edites tú y gestiones a tus invitados, un asistente con IA, personalización por invitado y soporte extendido durante los 7 días previos al evento.',
    group: 'Antes de empezar',
    onLanding: false,
  },
  {
    question: '¿Puedo ver cómo se ve antes de contratar?',
    answer: 'Sí, hay tres demos reales que puedes abrir desde el celular.',
    group: 'Antes de empezar',
    onLanding: false,
  },
  {
    question: '¿Qué diseños puedo elegir?',
    answer: 'Tres: Clásico, Moderno y Botánica Editorial. Puedes abrir una demo real de cada uno desde tu celular.',
    group: 'Antes de empezar',
    onLanding: false,
  },
  {
    question: '¿Qué información necesito para empezar?',
    answer:
      'Fecha y hora de tu boda, lugar y ubicación, lista de invitados, fotos para tu galería y código de vestimenta.',
    group: 'Antes de empezar',
    onLanding: false,
  },
  {
    question: '¿Puedo contratar Invyta si soy wedding planner?',
    answer:
      'Sí. Cada boda tiene su propia invitación y su panel de invitados. Cuéntanos cuántas bodas manejas y te explicamos cómo lo organizamos.',
    group: 'Antes de empezar',
    onLanding: false,
  },
  {
    question: '¿Cuántas invitaciones puedo enviar?',
    answer: 'Todas las que necesites, sin costo extra por invitado.',
    group: 'Invitados y confirmaciones',
    onLanding: false,
  },
  {
    question: '¿Mis invitados mayores sabrán usarla?',
    answer: 'Se comparte por WhatsApp como cualquier mensaje: un enlace, un toque y se abre.',
    group: 'Invitados y confirmaciones',
    onLanding: false,
  },
  {
    question: '¿Cuánto tiempo estará activa mi invitación?',
    answer: 'Incluye hosting hasta 15 días después del evento.',
    group: 'Cambios, idioma y duración',
    onLanding: false,
  },
  {
    question: '¿Qué hace el asistente con IA?',
    answer:
      'Redacta tu historia y tu código de vestimenta, traduce a inglés y sugiere itinerario, hoteles y lugares. Es parte del Paquete Personalizado.',
    group: 'Asistente con IA',
    onLanding: false,
  },
);

export const getFaq = (question: string) => FAQ_ITEMS.find((item) => item.question === question)!;

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
