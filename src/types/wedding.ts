// Tipos para Firebase RSVP
export interface FirebaseRSVP {
  id: string;
  weddingId: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  attending: boolean;
  guestCount?: number; // Número de invitados
  plusOne?: {
    attending: boolean;
    name?: string;
  };
  dietaryRestrictions?: string;
  dietaryRestriction?: string; // Campo específico para select de dieta
  message?: string;
  submittedAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface FirebaseGuest {
  id: string;
  weddingId: string;
  guestId?: string; // ID único para la URL de invitación
  name: string;
  email?: string;
  phone?: string;
  plusOneAllowed: boolean;
  guestCount: number; // Número total de invitados (incluyendo acompañante)
  coupleMessage?: string; // Mensaje personalizado de los novios
  language: 'es' | 'en'; // Idioma preferido del invitado
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  // Información de confirmación RSVP (cuando confirman asistencia)
  rsvpConfirmation?: {
    attending: boolean;
    guestCount?: number; // Número de invitados seleccionado por el usuario
    guestEmail?: string;
    message?: string;
    dietaryRestrictions?: string;
    dietaryRestriction?: string; // Campo específico para select de dieta
    plusOne?: {
      attending: boolean;
      name?: string;
    };
    submittedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  /** @deprecated (spec 12) Reemplazado por FirebaseTableSeat (spec 23). Solo se lee una vez para migrar sus sub-asientos; no se escribe más. */
  tableId?: string | null;
  // Spec 33 — invitación creada por una hostess para alguien que llegó sin invitación.
  addedAtDoor?: { by: string; at: string };
  // Spec 28 — mensaje de WhatsApp editado por la pareja para este invitado.
  // Ausente = se usa el mensaje por defecto. Se guarda ya con el nombre y el link escritos.
  whatsappMessages?: {
    invitation?: string;
    saveTheDate?: string;
    album?: string; // Spec 30 — link del álbum de fotos
  };
}

// Tipos para gestión de mesas (spec 12)
export interface FirebaseTable {
  id: string;
  weddingId: string;
  name: string; // "Mesa 1", "Mesa de Honor"
  capacity: number;
  shape?: 'round' | 'square' | 'rectangular' | 'imperial'; // decorativo, no afecta la lógica de capacidad
  posX?: number; // posición en el Plano; ausente = "sin colocar" (bandeja)
  posY?: number;
  createdAt: string;
  updatedAt: string;
}

// Asiento individual por persona dentro de una invitación (spec 23): reemplaza FirebaseGuest.tableId
export interface FirebaseTableSeat {
  id: string;
  weddingId: string;
  guestId: string; // FirebaseGuest al que pertenece este sub-asiento
  seatIndex: number; // 0 = titular, 1..N-1 = acompañantes
  tableId?: string | null; // mesa asignada a ESTA persona; ausente o null = sin mesa
  createdAt: string;
  updatedAt: string;
}

// Objetos del salón (pista, barra, mesa principal, etc.): sin invitados ni capacidad
export interface FirebaseVenueFixture {
  id: string;
  weddingId: string;
  type: 'dance_floor' | 'bar' | 'stage' | 'entrance' | 'custom';
  label: string; // "Pista de baile", "Barra", o texto libre si type = 'custom'
  posX?: number;
  posY?: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

// Tipos para la información de la pareja
export interface Couple {
  bride: {
    name: string;
    fullName: string;
    phone: string;
    email: string;
    instagram?: string;
    facebook?: string;
  };
  groom: {
    name: string;
    fullName: string;
    phone: string;
    email: string;
    instagram?: string;
    facebook?: string;
  };
  coupleEmail: string;
  hashtag: string;
  story: { es: string; en: string };
  quote: { es: string; en: string };
  image?: string; // Imagen específica para la sección About
}

// Tipos para la información del evento
export interface EventInfo {
  weddingId: string;
  date: string; // ISO string
  time: string;
  ceremony: {
    time: string;
    duration: number; // minutos
  };
  reception: {
    time: string;
    duration: number;
  };
  ceremonyVenue?: {
    name: { es: string; en: string };
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    description?: string;
    mapsUrl?: string;
  };
  receptionVenue: {
    name: { es: string; en: string };
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    description: string;
    mapsUrl?: string;
    features: string[];
  };
  dressCode: {
    style: { es: string; en: string };
    description: { es: string; en: string };
    recommendations: {
      ladies: string[];
      gentlemen: string[];
    };
    colors: {
      recommended: string[];
      avoid: string[];
    };
  };
  rsvpDeadline: string; // ISO string
}

// Tipos para el cronograma
export interface TimelineEvent {
  id: string;
  time: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
  icon: string;
  isHighlight?: boolean;
  location?: string;
  iconColor?: string;
  iconBackground?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: unknown;
}

// Tipos para la galería
export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  cols?: number;
  rows?: number;
}

// Tipos para momentos especiales
export interface SpecialMoment {
  year: string;
  title: string;
  description: string;
  image?: string;
}

// Tipos para estadísticas de la relación
export interface RelationshipStats {
  yearsTogther: number;
  adventures: number;
  memories: number;
  dreams: number;
}

// Tipos para hospedaje recomendado
export interface AccommodationOption {
  id?: string;
  name: string;
  distance?: string;
  price?: string;
  phone?: string;
  website?: string;
  amenities?: string[];
  description?: string | { es: string; en: string }; // Campo bilingüe
  mapsUrl?: string;
}

// Tipos para el transporte
export interface TransportInfo {
  parking: boolean;
  valetParking: boolean;
  shuttleService?: {
    available: boolean;
    pickupPoints?: string[];
    schedule?: string[];
  };
  publicTransport?: string;
  rideshare: boolean;
}

// Tipos para mesa de regalos
export interface GiftRegistryItem {
  id: string;
  name: string;
  url: string;
  description?: string | { es: string; en: string }; // Campo bilingüe
  logo?: string;
}

export interface BankAccountInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  clabe?: string;
  description?: string | { es: string; en: string }; // Campo bilingüe
}

export interface GiftRegistry {
  enabled: boolean;
  message?: string | { es: string; en: string }; // Campo bilingüe
  registries: GiftRegistryItem[];
  bankAccount?: BankAccountInfo;
}

// Tipos para evento solo adultos
export interface AdultOnlyEvent {
  enabled: boolean;
  message?: string | { es: string; en: string }; // Campo bilingüe
}

// Configuración de música de fondo
export interface MusicConfig {
  enabled: boolean;
  spotifyTrackId?: string;
  spotifyPlaylistId?: string;
  fileName?: string; // Nombre del archivo MP3 en /assets/music/
  title?: string;
  artist?: string;
  autoplay?: boolean;
  volume?: number; // 0-1
  showControls?: boolean;
  startTime?: number; // Tiempo de inicio en segundos
  useRealSpotify?: boolean; // true = intenta preview real, false = audio demo
}

// Lugar recomendado para invitados
export interface RecommendedPlace {
  id: string;
  name: string;
  category: 'hospedaje' | 'restaurante' | 'atraccion' | 'transporte';
  description: string | { es: string; en: string }; // Campo bilingüe
  address?: string;
  distance?: string; // ej: "2.5 km del evento"
  priceRange?: '$' | '$$' | '$$$';
  phone?: string;
  website?: string;
  mapsUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Configuración de lugares recomendados
export interface RecommendedPlacesConfig {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  places: RecommendedPlace[];
}

// Spec 27 — modo "Aparta la fecha": mientras está activo, el link de la invitación muestra solo
// la pantalla de save the date. `message` puede llegar como texto plano en el sitio público
// (processBilingualData lo resuelve al idioma del invitado).
export interface SaveTheDateConfig {
  enabled: boolean;
  place?: string; // texto libre: "Guadalajara, Jalisco". Vacío = no se muestra línea de lugar
  message?: string | { es: string; en: string }; // vacío = no se muestra
}

// Spec 32 — modo "Día del evento". Ausente = deshabilitado (bodas existentes no cambian).
// Ya habilitado, se activa solo de 00:00 del día de la boda a 06:00 del día siguiente (hora CDMX).
export interface EventDayConfig {
  enabled: boolean; // la pareja lo habilita; se activa solo en la ventana del día de la boda
  showTable: boolean; // mesa de cada persona de la invitación
  showFloorPlan: boolean; // plano del salón con sus mesas resaltadas
  showAlbum: boolean; // botón del álbum (solo si el álbum está en fase open o closed)
}

// Spec 33 — check-in el día del evento. Público y sin secretos: el código del link de hostess vive
// en `checkInAccess/{weddingId}`, que solo leen las rutas de servidor.
export interface CheckInConfig {
  enabled: boolean;
  enabledAt?: string; // ISO, primera activación
}

// Spec 33 — una persona (invitación + seatIndex) marcada como llegada. Id del documento:
// `${weddingId}__${guestDocId}__${seatIndex}`. Solo la leen y escriben rutas de servidor.
export interface CheckInRecord {
  weddingId: string;
  guestDocId: string;
  seatIndex: number;
  arrived: boolean; // false = se deshizo
  arrivedAt?: string;
  by: string; // nombre de la hostess
  at: string; // ISO de la acción; gana la más reciente
  updatedAt: string; // ISO del servidor
}

export type CheckInActivityType = 'arrived' | 'undone' | 'moved' | 'walk_in';

export interface CheckInActivity {
  id?: string;
  weddingId: string;
  type: CheckInActivityType;
  by: string;
  guestName: string;
  detail?: string;
  at: string;
}

// Acciones de la hostess (iguales en línea y sin conexión).
export type CheckInOp =
  | { opId: string; type: 'arrive' | 'undo'; guestDocId: string; seatIndex: number; at: string; by: string }
  | { opId: string; type: 'move'; guestDocId: string; seatIndex: number; tableId: string | null; at: string; by: string }
  | { opId: string; type: 'walkIn'; name: string; count: number; tableId: string | null; at: string; by: string };

export interface CheckInSnapshotGuest {
  docId: string;
  guestId: string;
  name: string;
  status: 'confirmed' | 'pending' | 'declined';
  count: number;
  seats: (string | null)[]; // tableId por seatIndex
  plusOneName: string | null;
  addedAtDoor: boolean;
}

// Foto de la boda para la hostess: solo lo necesario para recibir gente (sin teléfonos, correos,
// mensajes ni dietas).
export interface CheckInSnapshot {
  wedding: { id: string; bride: string; groom: string; date: string | null; tier: 'free' | 'template' };
  tables: Pick<FirebaseTable, 'id' | 'name' | 'capacity' | 'shape' | 'posX' | 'posY'>[];
  fixtures: Pick<FirebaseVenueFixture, 'id' | 'type' | 'label' | 'posX' | 'posY' | 'width' | 'height'>[];
  guests: CheckInSnapshotGuest[];
  checkIns: Record<string, { arrived: boolean; at: string; arrivedAt?: string; by: string }>; // clave `${guestDocId}__${seatIndex}`
  serverTime: string;
  version: string;
}

// Spec 29 — álbum de fotos de los invitados. Ausente = no activado.
export interface PhotoAlbumConfig {
  enabled: boolean; // lo escribe solo el operador
  mode: 'open' | 'disposable'; // lo elige la pareja; 'open' por defecto
  activatedAt: string; // ISO, la primera vez que el operador lo enciende
  uploadsClosed?: boolean; // la pareja cerró la subida antes de tiempo: el álbum queda solo para ver
  // Spec 30 — estilo del álbum en bodas gratis ('template-01' … 'template-04'). En bodas con diseño
  // manda el template de la invitación; si falta, el Moderno.
  style?: string;
}

// Spec 29 — una foto subida por un invitado (colección albumPhotos). Solo la lee y escribe el servidor.
export interface AlbumPhoto {
  id: string;
  weddingId: string;
  source: 'guest' | 'device'; // link personal o QR general
  guestId?: string;
  deviceId?: string;
  uploaderName?: string;
  storagePath: string;
  thumbPath: string;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  hidden: boolean;
  createdAt: string;
}

// Tipo principal que contiene toda la información de la boda
export interface WeddingData {
  id: string;
  couple: Couple;
  event: EventInfo;
  timeline: TimelineEvent[];
  gallery: GalleryImage[];
  heroImage: {
    url: string;
    alt: string;
  };
  specialMoments: SpecialMoment[];
  relationshipStats: RelationshipStats;
  accommodation: {
    hotels: AccommodationOption[];
    recommendedPlaces: AccommodationOption[];
  };
  transport: TransportInfo;
  giftRegistry: GiftRegistry;
  adultOnlyEvent: AdultOnlyEvent;
  rsvp: {
    enabled: boolean;
    deadline: string;
    maxGuests: number;
    dietaryOptions: boolean;
    customQuestions: string[];
  };
  selectedGuestTickets?: boolean; // Si es true, los invitados pueden seleccionar su número de boletos
  hasDiet?: boolean; // Si es true, se muestra campo de restricción dietética
  hasInstagram?: boolean; // Si es false, oculta iconos de Instagram en footer
  hasFacebook?: boolean; // Si es false, oculta iconos de Facebook en footer
  showGuestsInput?: boolean; // Si es false, oculta campo de número de invitados en RSVP
  showRecommendedPlaces?: boolean; // Si es false, oculta sección de lugares recomendados
  showConfirmCta?: boolean; // Si es false, oculta botón de confirmación en Hero
  hasEnglish?: boolean; // Si es true, el editor muestra inputs EN y traducción con IA (spec 07)
  aiUsage?: Record<string, unknown>; // Contadores de uso de IA por boda (spec 07)
  i18nMeta?: Record<string, string>; // Español fuente de cada traducción hecha con IA, para avisar si cambió (spec 07)
  music?: MusicConfig;
  recommendedPlaces?: RecommendedPlacesConfig;
  theme: {
    id: string; // ID del tema predefinido ('classic', 'romantic', 'modern', 'elegant')
  } | string; // Puede ser objeto legacy o string directo desde Firebase
  template?: {
    id: string;
  };
  tier?: 'free' | 'template'; // Spec 16 — ausente se interpreta como 'template' en todo el código
  plannerEmail?: string | null; // Spec 17 — correo del wedding planner atribuido a esta boda, si aplica
  saveTheDate?: SaveTheDateConfig; // Spec 27 — modo "Aparta la fecha"; ausente = apagado
  photoAlbum?: PhotoAlbumConfig; // Spec 29 — álbum de fotos de los invitados; ausente = no activado
  eventDay?: EventDayConfig; // Spec 32 — modo "Día del evento"; ausente = deshabilitado
  checkIn?: CheckInConfig; // Spec 33 — check-in el día del evento; ausente = desactivado
  status: 'draft' | 'active' | 'archived';
  languages: string[];
  defaultLanguage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Estados para Redux
export interface WeddingState {
  currentWedding: WeddingData | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Tipos para información del invitado
export interface GuestInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  allowedGuests: number; // Número de personas permitidas (incluyendo al invitado principal)
  guestType: 'family' | 'friends' | 'work' | 'close_family' | 'vip'; // Tipo de invitado
  table?: string; // Mesa asignada (opcional)
  specialMessage?: string; // Mensaje personalizado para este invitado
  dietaryRestrictions?: string[];
  isConfirmed?: boolean;
  confirmedGuests?: number;
  notes?: string; // Notas internas
}

// Tipos para formularios
export interface RSVPFormData {
  name: string;
  email: string;
  phone: string;
  attendance: 'yes' | 'no';
  guests: number;
  guestNames?: string;
  dietaryRestrictions?: string;
  song?: string;
  message?: string;
  weddingId: string;
}

// Respuesta de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Tipos para errores de la API
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Tipo que combina la información de la boda con la del invitado específico
export interface WeddingInvitation {
  wedding: WeddingData;
  guest: GuestInfo;
  createdAt: string;
  updatedAt: string;
}