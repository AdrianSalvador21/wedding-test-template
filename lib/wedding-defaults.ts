import type { WeddingData } from '../src/types/wedding';

// Fuente única de la boda vacía y de la validación del ID (spec 08). La usan el editor,
// la gestión de invitados y la ruta de alta del operador; no depende del navegador.

// Datos iniciales para nueva boda - SOLO campos que se usan en el template
export const createInitialWeddingData = (weddingId: string): WeddingData => ({
  id: weddingId,
  couple: {
    bride: {
      name: '', // ✅ Usado en Hero, About
      fullName: '',
      phone: '',
      email: '',
      instagram: '',
      facebook: ''
    },
    groom: {
      name: '', // ✅ Usado en Hero, About
      fullName: '',
      phone: '',
      email: '',
      instagram: '',
      facebook: ''
    },
    coupleEmail: '',
    hashtag: '',
    story: { es: '', en: '' }, // ✅ Usado en About
    quote: { es: '', en: '' }  // ✅ Usado en About
  },
  event: {
    weddingId: weddingId,
    date: '',
    time: '16:00',
    rsvpDeadline: '',
    ceremony: { time: '16:00', duration: 45 },
    reception: { time: '19:30', duration: 300 },
    ceremonyVenue: {
      name: { es: '', en: '' },
      address: '',
      coordinates: { lat: 0, lng: 0 },
      description: '',
      mapsUrl: ''
    },
    receptionVenue: {
      name: { es: '', en: '' },
      address: '',
      coordinates: { lat: 0, lng: 0 },
      description: '',
      mapsUrl: '',
      features: []
    },
    dressCode: {
      style: { es: '', en: '' },
      description: { es: '', en: '' },
      recommendations: {
        ladies: [],
        gentlemen: []
      },
      colors: {
        recommended: [],
        avoid: []
      }
    }
  },
  timeline: [],
  accommodation: {
    hotels: [],
    recommendedPlaces: []
  },
  giftRegistry: {
    enabled: false,
    message: { es: '', en: '' },
    registries: []
  },
  adultOnlyEvent: {
    enabled: false,
    message: { es: '', en: '' }
  },
  rsvp: {
    enabled: true,
    deadline: '',
    maxGuests: 2,
    dietaryOptions: true,
    customQuestions: []
  },
  selectedGuestTickets: true, // Mantener funcionalidad de selección de boletos
  hasDiet: false, // Campo de restricción dietética
  hasInstagram: true, // Mostrar iconos de Instagram por defecto
  hasFacebook: true, // Mostrar iconos de Facebook por defecto
      showGuestsInput: true, // Mostrar campo de número de invitados por defecto
      showRecommendedPlaces: true, // Mostrar lugares recomendados por defecto
      showConfirmCta: true, // Mostrar botón de confirmación en Hero por defecto
  gallery: [],
  heroImage: {
    url: '',
    alt: ''
  },
  specialMoments: [],
  relationshipStats: {
    yearsTogther: 0,
    adventures: 0,
    memories: 0,
    dreams: 0
  },
  transport: {
    parking: false,
    valetParking: false,
    shuttleService: {
      available: false,
      pickupPoints: [],
      schedule: []
    },
    publicTransport: '',
    rideshare: false
  },
  music: {
    enabled: false,
    spotifyTrackId: '',
    spotifyPlaylistId: '',
    fileName: '',
    title: '',
    artist: '',
    autoplay: true,
    volume: 0.5,
    showControls: true,
    startTime: 0
  },
  recommendedPlaces: {
    enabled: false,
    title: '',
    subtitle: '',
    places: []
  },
  theme: { id: 'classic' },
  status: 'draft',
  languages: ['es', 'en'],
  defaultLanguage: 'es',
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});


const RESERVED_WEDDING_IDS = ['admin', 'api', 'auth', 'login', 'register', 'demo', 'test', 'null', 'undefined'];

// Validar si el ID de la boda es válido
export const isValidWeddingId = (id: string): boolean => {
  // Validaciones básicas del ID
  if (!id || id.length < 3 || id.length > 50) return false;
  if (!/^[a-zA-Z0-9\-_]+$/.test(id)) return false;

  // IDs reservados o no válidos
  if (RESERVED_WEDDING_IDS.includes(id.toLowerCase())) return false;

  return true;
};

// Propone un ID a partir de los nombres: sin acentos, en minúsculas, "persona 2 y persona 1".
export const slugifyWeddingNames = (bride: string, groom: string): string => {
  const slug = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  return [slug(bride), slug(groom)].filter(Boolean).join('-y-');
};

// Spec 16 — genera automáticamente el ID de una boda gratuita (no se muestra como campo
// editable: no hay enlace público que dependa de él). Reutiliza `slugifyWeddingNames` y
// agrega un sufijo numérico si el slug ya existe. No importa `firebase-admin` directamente
// (este archivo lo usa el cliente): `exists` la provee quien llama, con el SDK que tenga
// a mano (admin en las rutas de servidor).
export async function generateFreeWeddingId(bride: string, groom: string, exists: (id: string) => Promise<boolean>): Promise<string> {
  const slug = slugifyWeddingNames(bride, groom).slice(0, 44);
  const base = isValidWeddingId(slug) ? slug : `boda-${Date.now().toString(36)}`;
  let candidate = base;
  for (let suffix = 2; suffix < 50; suffix += 1) {
    if (!(await exists(candidate))) return candidate;
    candidate = `${base}-${suffix}`;
  }
  // Extremadamente improbable con nombres reales; última salida para no colgar el alta.
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}
