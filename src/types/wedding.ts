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
  story: string;
  quote: string;
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
  venue: {
    name: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    description: string;
    features: string[];
  };
  dressCode: {
    style: string;
    description: string;
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
  title: string;
  description: string;
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
  name: string;
  distance: string;
  price: string;
  phone?: string;
  website?: string;
  amenities?: string[];
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

// Tipo principal que contiene toda la información de la boda
export interface WeddingData {
  id: string;
  couple: Couple;
  event: EventInfo;
  timeline: TimelineEvent[];
  gallery: GalleryImage[];
  specialMoments: SpecialMoment[];
  relationshipStats: RelationshipStats;
  accommodation: AccommodationOption[];
  transport: TransportInfo;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontPrimary: string;
    fontSecondary: string;
  };
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