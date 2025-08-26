'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';
import { WeddingData, AccommodationOption, GiftRegistryItem } from '../../../../../src/types/wedding';
import WeddingNotFound from '../../../../../components/WeddingNotFound';
import { 
  Save, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Heart, 
  Gift, 
  Settings,
  Loader2,
  Check
} from 'lucide-react';

// Función para migrar/completar datos bilingües faltantes
const migrateWeddingData = (data: Record<string, unknown>): WeddingData => {
  const migrated = { ...data } as unknown as WeddingData;
  
  // Migrar giftRegistry.message
  if (migrated.giftRegistry?.message && typeof migrated.giftRegistry.message === 'string') {
    migrated.giftRegistry.message = {
      es: migrated.giftRegistry.message,
      en: ''
    };
  } else if (!migrated.giftRegistry?.message) {
    migrated.giftRegistry = migrated.giftRegistry || {};
    migrated.giftRegistry.message = { es: '', en: '' };
  }
  
  // Migrar adultOnlyEvent.message
  if (migrated.adultOnlyEvent?.message && typeof migrated.adultOnlyEvent.message === 'string') {
    migrated.adultOnlyEvent.message = {
      es: migrated.adultOnlyEvent.message,
      en: ''
    };
  } else if (!migrated.adultOnlyEvent?.message) {
    migrated.adultOnlyEvent = migrated.adultOnlyEvent || {};
    migrated.adultOnlyEvent.message = { es: '', en: '' };
  }
  
  // Migrar accommodation.hotels descriptions
  if (migrated.accommodation?.hotels) {
    migrated.accommodation.hotels = (migrated.accommodation.hotels as unknown as Record<string, unknown>[]).map((hotel) => {
      if (hotel.description && typeof hotel.description === 'string') {
        return {
          ...hotel,
          description: { es: hotel.description, en: '' }
        };
      } else if (!hotel.description) {
        return {
          ...hotel,
          description: { es: '', en: '' }
        };
      }
      return hotel;
    }) as unknown as AccommodationOption[];
  }
  
  // Migrar accommodation.recommendedPlaces descriptions
  if (migrated.accommodation?.recommendedPlaces) {
    migrated.accommodation.recommendedPlaces = (migrated.accommodation.recommendedPlaces as unknown as Record<string, unknown>[]).map((place) => {
      if (place.description && typeof place.description === 'string') {
        return {
          ...place,
          description: { es: place.description, en: '' }
        };
      } else if (!place.description) {
        return {
          ...place,
          description: { es: '', en: '' }
        };
      }
      return place;
    }) as unknown as AccommodationOption[];
  }
  
  // Migrar giftRegistry.registries descriptions
  if (migrated.giftRegistry?.registries) {
    migrated.giftRegistry.registries = (migrated.giftRegistry.registries as unknown as Record<string, unknown>[]).map((registry) => {
      if (registry.description && typeof registry.description === 'string') {
        return {
          ...registry,
          description: { es: registry.description, en: '' }
        };
      } else if (!registry.description) {
        return {
          ...registry,
          description: { es: '', en: '' }
        };
      }
      return registry;
    }) as unknown as GiftRegistryItem[];
  }
  
  // Migrar giftRegistry.bankAccount.description
  if (migrated.giftRegistry?.bankAccount?.description && typeof migrated.giftRegistry.bankAccount.description === 'string') {
    migrated.giftRegistry.bankAccount.description = {
      es: migrated.giftRegistry.bankAccount.description,
      en: ''
    };
  } else if (migrated.giftRegistry?.bankAccount && !migrated.giftRegistry.bankAccount.description) {
    migrated.giftRegistry.bankAccount.description = { es: '', en: '' };
  }
  
  return migrated as WeddingData;
};

// Datos iniciales para nueva boda - SOLO campos que se usan en el template
const createInitialWeddingData = (weddingId: string): WeddingData => ({
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
    autoplay: false,
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

export default function WeddingEditorPage() {
  const params = useParams();
  const weddingId = params.weddingId as string;
  
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('couple');
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Validar si el ID de la boda es válido
  const isValidWeddingId = (id: string): boolean => {
    // Validaciones básicas del ID
    if (!id || id.length < 3 || id.length > 50) return false;
    if (!/^[a-zA-Z0-9\-_]+$/.test(id)) return false;
    
    // IDs reservados o no válidos
    const reservedIds = ['admin', 'api', 'auth', 'login', 'register', 'demo', 'test', 'null', 'undefined'];
    if (reservedIds.includes(id.toLowerCase())) return false;
    
    return true;
  };

  // Cargar datos de la boda
  const loadWeddingData = async () => {
    try {
      setLoading(true);
      
      // Validar formato del ID
      if (!isValidWeddingId(weddingId)) {
        setNotFound(true);
        return;
      }
      
      const docRef = doc(db, 'weddings', weddingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as WeddingData;
        
        // Verificar si la boda tiene información básica
        const hasBasicInfo = data.couple?.bride?.name || data.couple?.groom?.name || data.event?.date;
        
        if (hasBasicInfo) {
          // Tiene información, migrar y cargar datos existentes
          const migratedData = migrateWeddingData(data as unknown as Record<string, unknown>);
          setWeddingData(migratedData);
          
          // Guardar datos migrados en Firebase
          await setDoc(docRef, migratedData);
        } else {
          // Existe pero sin información, crear estructura base
          const initialData = createInitialWeddingData(weddingId);
          setWeddingData(initialData);
          await setDoc(docRef, initialData);
        }
      } else {
        // No existe el documento en Firebase → 404
        setNotFound(true);
        return;
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos de la boda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (weddingId) {
      loadWeddingData();
    }
  }, [weddingId]);

  // Guardar cambios
  const handleSave = async () => {
    if (!weddingData) return;
    
    try {
      setSaving(true);
      const docRef = doc(db, 'weddings', weddingId);
      const updatedData = {
        ...weddingData,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(docRef, updatedData);
      setWeddingData(updatedData);
      setSaveMessage('¡Cambios guardados exitosamente!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error guardando:', err);
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  // Actualizar datos anidados
  const updateWeddingData = (path: string, value: string | number | boolean | object | null) => {
    if (!weddingData) return;
    
    const keys = path.split('.');
    const newData = JSON.parse(JSON.stringify(weddingData));
    
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setWeddingData(newData);
  };

  // Verificar si una sección está completa
  const isSectionComplete = (section: string): boolean => {
    if (!weddingData) return false;
    
    switch (section) {
      case 'couple':
        return !!(
          weddingData.couple?.bride?.name &&
          weddingData.couple?.groom?.name &&
          weddingData.couple?.story?.es
        );
      case 'event':
        return !!(
          weddingData.event?.date &&
          weddingData.event?.time
        );
      case 'venues':
        return !!(
          getSafeValue(weddingData.event?.ceremonyVenue || {}, 'name.es') &&
          weddingData.event?.ceremonyVenue?.mapsUrl &&
          getSafeValue(weddingData.event?.receptionVenue || {}, 'name.es') &&
          weddingData.event?.receptionVenue?.mapsUrl
        );
      case 'timeline':
        return !!(weddingData.timeline && weddingData.timeline.length > 0);
      case 'accommodation':
        return !!(
          weddingData.accommodation?.hotels && 
          weddingData.accommodation.hotels.length > 0 &&
          weddingData.accommodation.hotels.every((hotel: {name?: string; description?: string | { es: string; en: string }; mapsUrl?: string}) => {
            const hasDescription = typeof hotel.description === 'object' 
              ? (hotel.description.es && hotel.description.en) 
              : hotel.description;
            return hotel.name && hasDescription && hotel.mapsUrl;
          })
        );
      case 'recommendedPlaces':
        return !!(
          weddingData.accommodation?.recommendedPlaces && 
          weddingData.accommodation.recommendedPlaces.length > 0 &&
          weddingData.accommodation.recommendedPlaces.every((place: {name?: string; description?: string | { es: string; en: string }; mapsUrl?: string}) => {
            const hasDescription = typeof place.description === 'object' 
              ? (place.description.es && place.description.en) 
              : place.description;
            return place.name && hasDescription && place.mapsUrl;
          })
        );
      case 'gifts':
        if (!weddingData.giftRegistry?.enabled) return false;
        
        // Al menos una tienda debe estar completa (con nombre y URL)
        const hasCompleteRegistry = weddingData.giftRegistry.registries && 
          weddingData.giftRegistry.registries.some((registry: {name?: string; url?: string}) => 
            registry.name && registry.url
          );
        
        // O debe tener cuenta bancaria completa
        const hasCompleteBankAccount = weddingData.giftRegistry.bankAccount && 
          weddingData.giftRegistry.bankAccount.bankName && 
          weddingData.giftRegistry.bankAccount.accountName;
        
        return !!(hasCompleteRegistry || hasCompleteBankAccount);
      case 'social':
        return !!(
          weddingData.couple?.hashtag &&
          (weddingData.couple?.bride?.instagram || weddingData.couple?.groom?.instagram ||
           weddingData.couple?.bride?.facebook || weddingData.couple?.groom?.facebook ||
           weddingData.couple?.coupleEmail)
        );
      case 'settings':
        // Si no está habilitado, se considera completo
        if (!weddingData.adultOnlyEvent?.enabled) return true;
        
        // Si está habilitado, debe tener mensaje
        const message = weddingData.adultOnlyEvent.message;
        if (typeof message === 'object') {
          // Si es bilingüe, ambos idiomas deben estar completos
          return !!(message.es && message.es.trim() && message.en && message.en.trim());
        } else {
          // Si es string simple, debe estar completo
          return !!(message && message.trim());
        }
      default:
        return false;
    }
  };

  // Verificar si todas las secciones están completas
  const isAllSectionsComplete = (): boolean => {
    const allSections = ['couple', 'event', 'venues', 'timeline', 'accommodation', 'recommendedPlaces', 'gifts', 'social', 'settings'];
    return allSections.every(section => isSectionComplete(section));
  };

  // NOTA: Galería OCULTA según solicitud del usuario
  const tabs = [
    { id: 'couple', label: 'Pareja', icon: Heart },
    { id: 'event', label: 'Evento', icon: Calendar },
    { id: 'venues', label: 'Lugares', icon: MapPin },
    { id: 'timeline', label: 'Cronograma', icon: Clock },
    { id: 'accommodation', label: 'Hoteles Recomendados', icon: MapPin },
    { id: 'recommendedPlaces', label: 'Lugares Recomendados', icon: MapPin },
    { id: 'gifts', label: 'Regalos', icon: Gift },
    { id: 'social', label: 'Social', icon: User },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <WeddingNotFound weddingId={weddingId} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Quicksand',sans-serif]">
      {/* Navbar Invyta */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <a
              href="/"
              className="text-2xl font-serif font-bold text-black hover:opacity-80 transition-opacity"
            >
              invyta
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Editor de Invitación</h1>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-600">ID:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900">{weddingId}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-600">Estado:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      weddingData?.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {weddingData?.status === 'active' ? '✓ Activa' : 'Borrador'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-600">Completado:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isAllSectionsComplete() 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isAllSectionsComplete() ? '✓ Completado' : '⏳ No completado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2 sm:space-x-4">
              {saveMessage && (
                <div className="hidden sm:flex items-center text-green-600 text-sm">
                  <Check className="h-4 w-4 mr-2" />
                  {saveMessage}
                </div>
              )}
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-3 sm:px-4 py-2 bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">Guardando...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Guardar Cambios</span>
                    <span className="sm:hidden">Guardar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="px-3 sm:px-6 py-3 sm:py-4">
              {/* Desktop tabs */}
              <div className="hidden md:flex space-x-1 overflow-x-auto pb-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isComplete = isSectionComplete(tab.id);
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex-shrink-0 ${
                        isActive
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-3 w-3 mr-1.5" />
                      {tab.label}
                      {isComplete && (
                        <Check className="h-3 w-3 ml-1.5 text-amber-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile tabs */}
              <div className="md:hidden">
                <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isComplete = isSectionComplete(tab.id);
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex flex-col items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors flex-shrink-0 min-w-[70px] ${
                          isActive
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="relative mb-1">
                          <Icon className="h-4 w-4" />
                          {isComplete && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-600 rounded-full flex items-center justify-center">
                              <Check className="h-2 w-2 text-white stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] leading-tight text-center px-1">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'couple' && (
              <CoupleSection 
                data={(weddingData?.couple || {}) as Record<string, unknown>}
                onChange={(field, value) => updateWeddingData(`couple.${field}`, value)}
              />
            )}
            {activeTab === 'event' && (
              <EventSection 
                data={(weddingData?.event || {}) as Record<string, unknown>}
                onChange={(field, value) => updateWeddingData(`event.${field}`, value)}
              />
            )}
            {activeTab === 'venues' && (
              <VenuesSection 
                ceremonyVenue={(weddingData?.event?.ceremonyVenue || {}) as Record<string, unknown>}
                receptionVenue={(weddingData?.event?.receptionVenue || {}) as Record<string, unknown>}
                onChange={(field, value) => updateWeddingData(`event.${field}`, value)}
              />
            )}
            {activeTab === 'timeline' && (
              <TimelineSection 
                data={(weddingData?.timeline || []) as unknown as Record<string, unknown>}
                onChange={(field, value) => updateWeddingData(field, value)}
              />
            )}
            {activeTab === 'accommodation' && (
              <AccommodationSection 
                data={(weddingData?.accommodation || {}) as Record<string, unknown>}
                onChange={(field, value) => updateWeddingData(`accommodation.${field}`, value)}
              />
            )}
            {activeTab === 'recommendedPlaces' && (
              <RecommendedPlacesSection 
                data={(weddingData?.accommodation || {}) as Record<string, unknown>}
                onChange={(field, value) => updateWeddingData(`accommodation.${field}`, value)}
              />
            )}
            {activeTab === 'gifts' && (
              <GiftsSection 
                data={(weddingData || {}) as Record<string, unknown>}
                onChange={(field, value) => updateWeddingData(field, value)}
              />
            )}
            {activeTab === 'social' && (
              <SocialSection 
                data={(weddingData?.couple || {}) as Record<string, unknown>}
                onChange={(field, value) => updateWeddingData(`couple.${field}`, value)}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsSection 
                data={(weddingData || {}) as Record<string, unknown>}
                onChange={(field, value) => updateWeddingData(field, value)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function para acceso seguro a propiedades anidadas
const getSafeValue = (obj: Record<string, unknown>, path: string, defaultValue: string | number | boolean = ''): string => {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return String(defaultValue);
    }
  }
  return String(current || defaultValue);
};

// Interfaces para props
interface SectionProps {
  data: Record<string, unknown>;
  onChange: (field: string, value: string | number | boolean | object | null) => void;
}

interface VenuesSectionProps {
  ceremonyVenue: Record<string, unknown>;
  receptionVenue: Record<string, unknown>;
  onChange: (field: string, value: string | number | boolean | object | null) => void;
}

function CoupleSection({ data, onChange }: SectionProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de la Pareja</h2>
      
      {/* Nombres */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Nombres</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la persona 2
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'bride.name')}
              onChange={(e) => onChange('bride.name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="María"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la persona 1
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'groom.name')}
              onChange={(e) => onChange('groom.name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Carlos"
            />
          </div>
        </div>
      </div>

      {/* Historia de amor */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Historia de Amor</h3>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Historia en Español
            </label>
            <textarea
              rows={4}
              value={getSafeValue(data, 'story.es')}
              onChange={(e) => onChange('story.es', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Hace más de 6 años, el destino nos unió en una cafetería de la ciudad..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Historia en Inglés
            </label>
            <textarea
              rows={4}
              value={getSafeValue(data, 'story.en')}
              onChange={(e) => onChange('story.en', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="More than 6 years ago, destiny brought us together in a city café..."
            />
          </div>
        </div>
      </div>

      {/* Frase especial */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Frase Especial</h3>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frase en Español
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'quote.es')}
              onChange={(e) => onChange('quote.es', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="El amor no es solo mirarse el uno al otro, sino mirar juntos en la misma dirección."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frase en Inglés
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'quote.en')}
              onChange={(e) => onChange('quote.en', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Love is not just looking at each other, but looking together in the same direction."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EventSection({ data, onChange }: SectionProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Información del Evento</h2>
      
      {/* Fecha y hora */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Fecha y Hora</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de la boda
            </label>
            <input
              type="date"
              value={getSafeValue(data, 'date') ? getSafeValue(data, 'date').split('T')[0] : ''}
              onChange={(e) => onChange('date', e.target.value + 'T16:00:00.000Z')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora del evento
            </label>
            <input
              type="time"
              value={getSafeValue(data, 'time')}
              onChange={(e) => onChange('time', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Código de vestimenta */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Código de Vestimenta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estilo en Español
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'dressCode.style.es')}
              onChange={(e) => onChange('dressCode.style.es', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Formal / Cocktail"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estilo en Inglés
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'dressCode.style.en')}
              onChange={(e) => onChange('dressCode.style.en', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Formal / Cocktail"
            />
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción en Español
            </label>
            <textarea
              rows={3}
              value={getSafeValue(data, 'dressCode.description.es')}
              onChange={(e) => onChange('dressCode.description.es', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Queremos que te sientas elegante y cómodo en nuestra celebración"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción en Inglés
            </label>
            <textarea
              rows={3}
              value={getSafeValue(data, 'dressCode.description.en')}
              onChange={(e) => onChange('dressCode.description.en', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="We want you to feel elegant and comfortable at our celebration"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function VenuesSection({ ceremonyVenue, receptionVenue, onChange }: VenuesSectionProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Lugares del Evento</h2>
      
      {/* Lugar de ceremonia */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Ceremonia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre en Español
            </label>
            <input
              type="text"
              value={getSafeValue(ceremonyVenue, 'name.es')}
              onChange={(e) => onChange('ceremonyVenue.name.es', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Iglesia del Sagrado Corazón"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre en Inglés
            </label>
            <input
              type="text"
              value={getSafeValue(ceremonyVenue, 'name.en')}
              onChange={(e) => onChange('ceremonyVenue.name.en', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Sacred Heart Church"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={getSafeValue(ceremonyVenue, 'address')}
              onChange={(e) => onChange('ceremonyVenue.address', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Calle de los Santos 456, Ciudad, Estado 12345"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de Google Maps
            </label>
            <input
              type="url"
              value={getSafeValue(ceremonyVenue, 'mapsUrl')}
              onChange={(e) => onChange('ceremonyVenue.mapsUrl', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </div>

      {/* Lugar de recepción */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Recepción</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre en Español
            </label>
            <input
              type="text"
              value={getSafeValue(receptionVenue, 'name.es')}
              onChange={(e) => onChange('receptionVenue.name.es', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Jardines del Edén"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre en Inglés
            </label>
            <input
              type="text"
              value={getSafeValue(receptionVenue, 'name.en')}
              onChange={(e) => onChange('receptionVenue.name.en', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Eden Gardens"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={getSafeValue(receptionVenue, 'address')}
              onChange={(e) => onChange('receptionVenue.address', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Av. Principal 123, Ciudad, Estado 12345"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de Google Maps
            </label>
            <input
              type="url"
              value={getSafeValue(receptionVenue, 'mapsUrl')}
              onChange={(e) => onChange('receptionVenue.mapsUrl', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineSection({ data, onChange }: SectionProps) {
  // Asegurar que data sea siempre un array
  const timelineData = Array.isArray(data) ? data : [];

  const addTimelineEvent = () => {
    const newEvent = {
      id: `event-${Date.now()}`,
      time: '16:00',
      title: { es: '', en: '' },
      description: { es: '', en: '' },
      icon: 'MapPin'
    };
    const newTimelineData = [...timelineData, newEvent];
    onChange('timeline', newTimelineData);
  };

  const removeTimelineEvent = (index: number) => {
    const newData = [...timelineData];
    newData.splice(index, 1);
    onChange('timeline', newData);
  };

  const updateTimelineEvent = (index: number, field: string, value: string | number | boolean | object | null) => {
    const newData = [...timelineData];
    const keys = field.split('.');
    let current = newData[index];
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onChange('timeline', newData);
  };

  const iconOptions = [
    'MapPin', 'Heart', 'Music', 'Utensils', 'Users', 'Wine', 'Clock', 'Star', 'Gift'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Cronograma del Evento</h2>
      </div>

      <div className="space-y-4">
        {timelineData.map((event: {id: string; title?: {es: string; en: string}; time?: string; description?: {es: string; en: string}; icon?: string}, index: number) => (
          <div key={event.id} className="bg-gray-50 p-3 sm:p-4 lg:p-6 rounded-lg border">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <h3 className="text-base font-medium text-gray-800">Evento #{index + 1}</h3>
              <button
                onClick={() => removeTimelineEvent(index)}
                className="self-start sm:self-center text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
              >
                Eliminar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  value={event.time}
                  onChange={(e) => updateTimelineEvent(index, 'time', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icono
                </label>
                <select
                  value={event.icon}
                  onChange={(e) => updateTimelineEvent(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título (Español)
                </label>
                <input
                  type="text"
                  value={getSafeValue(event, 'title.es')}
                  onChange={(e) => updateTimelineEvent(index, 'title.es', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título (Inglés)
                </label>
                <input
                  type="text"
                  value={getSafeValue(event, 'title.en')}
                  onChange={(e) => updateTimelineEvent(index, 'title.en', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (Español)
                </label>
                <textarea
                  rows={2}
                  value={getSafeValue(event, 'description.es')}
                  onChange={(e) => updateTimelineEvent(index, 'description.es', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (Inglés)
                </label>
                <textarea
                  rows={2}
                  value={getSafeValue(event, 'description.en')}
                  onChange={(e) => updateTimelineEvent(index, 'description.en', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        ))}

        {timelineData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No hay eventos en el cronograma</p>
            <p className="text-sm mb-6">Crea el primer evento para comenzar a construir tu cronograma</p>
          </div>
        ) : null}

        {/* Botón para agregar evento - siempre visible */}
        <div className="text-center pt-4 border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={addTimelineEvent}
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors text-sm font-medium shadow-sm cursor-pointer"
          >
            + {timelineData.length === 0 ? 'Agregar Primer Evento' : 'Agregar Evento'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AccommodationSection({ data, onChange }: SectionProps) {
  const hotelsData = Array.isArray(data?.hotels) ? data.hotels : [];

  const addHotel = () => {
    const newHotel = {
      id: `hotel-${Date.now()}`,
      name: '',
      description: { es: '', en: '' },
      mapsUrl: ''
    };
    const newHotelsData = [...hotelsData, newHotel];
    onChange('hotels', newHotelsData);
  };

  const removeHotel = (index: number) => {
    const newData = [...hotelsData];
    newData.splice(index, 1);
    onChange('hotels', newData);
  };

  const updateHotel = (index: number, field: string, value: string | number | boolean | object | null) => {
    const newData = [...hotelsData];
    newData[index] = { ...newData[index], [field]: value };
    onChange('hotels', newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Hoteles Recomendados</h2>
        <button
          onClick={addHotel}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors text-sm font-medium"
        >
          + Agregar Hotel
        </button>
      </div>

      <div className="space-y-4">
        {hotelsData.map((hotel: {id: string; name?: string; description?: string | { es: string; en: string }; mapsUrl?: string}, index: number) => {
          const descriptionEs = typeof hotel.description === 'object' ? hotel.description?.es || '' : hotel.description || '';
          const descriptionEn = typeof hotel.description === 'object' ? hotel.description?.en || '' : '';
          
          return (
            <div key={hotel.id} className="bg-gray-50 p-3 sm:p-4 lg:p-6 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <h3 className="text-base font-medium text-gray-800">Hotel #{index + 1}</h3>
                <button
                  onClick={() => removeHotel(index)}
                  className="self-start sm:self-center text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Hotel
                  </label>
                  <input
                    type="text"
                    value={hotel.name || ''}
                    onChange={(e) => updateHotel(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Hotel Boutique Plaza"
                  />
                </div>
                
                {/* Descripción en Español */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (Español)
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionEs}
                    onChange={(e) => updateHotel(index, 'description', { 
                      es: e.target.value, 
                      en: descriptionEn 
                    })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Descripción del hotel en español..."
                  />
                </div>
                
                {/* Descripción en Inglés */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (English)
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionEn}
                    onChange={(e) => updateHotel(index, 'description', { 
                      es: descriptionEs, 
                      en: e.target.value 
                    })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Hotel description in English..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Google Maps
                  </label>
                  <input
                    type="url"
                    value={hotel.mapsUrl || ''}
                    onChange={(e) => updateHotel(index, 'mapsUrl', e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>
          );
        })}

        {hotelsData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No hay hoteles agregados</p>
            <p className="text-sm">Agrega el primer hotel para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendedPlacesSection({ data, onChange }: SectionProps) {
  const placesData = Array.isArray(data?.recommendedPlaces) ? data.recommendedPlaces : [];

  const addPlace = () => {
    const newPlace = {
      id: `place-${Date.now()}`,
      name: '',
      description: { es: '', en: '' },
      mapsUrl: ''
    };
    const newPlacesData = [...placesData, newPlace];
    onChange('recommendedPlaces', newPlacesData);
  };

  const removePlace = (index: number) => {
    const newData = [...placesData];
    newData.splice(index, 1);
    onChange('recommendedPlaces', newData);
  };

  const updatePlace = (index: number, field: string, value: string | number | boolean | object | null) => {
    const newData = [...placesData];
    newData[index] = { ...newData[index], [field]: value };
    onChange('recommendedPlaces', newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Lugares Recomendados</h2>
        <button
          onClick={addPlace}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors text-sm font-medium"
        >
          + Agregar Lugar
        </button>
      </div>

      <div className="space-y-4">
        {placesData.map((place: {id: string; name?: string; description?: string | { es: string; en: string }; mapsUrl?: string}, index: number) => {
          const descriptionEs = typeof place.description === 'object' ? place.description?.es || '' : place.description || '';
          const descriptionEn = typeof place.description === 'object' ? place.description?.en || '' : '';
          
          return (
            <div key={place.id} className="bg-gray-50 p-3 sm:p-4 lg:p-6 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <h3 className="text-base font-medium text-gray-800">Lugar #{index + 1}</h3>
                <button
                  onClick={() => removePlace(index)}
                  className="self-start sm:self-center text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Lugar
                  </label>
                  <input
                    type="text"
                    value={place.name || ''}
                    onChange={(e) => updatePlace(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Restaurante La Terraza"
                  />
                </div>
                
                {/* Descripción en Español */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (Español)
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionEs}
                    onChange={(e) => updatePlace(index, 'description', { 
                      es: e.target.value, 
                      en: descriptionEn 
                    })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Descripción del lugar en español..."
                  />
                </div>
                
                {/* Descripción en Inglés */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (English)
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionEn}
                    onChange={(e) => updatePlace(index, 'description', { 
                      es: descriptionEs, 
                      en: e.target.value 
                    })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Place description in English..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Google Maps
                  </label>
                  <input
                    type="url"
                    value={place.mapsUrl || ''}
                    onChange={(e) => updatePlace(index, 'mapsUrl', e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>
          );
        })}

        {placesData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No hay lugares agregados</p>
            <p className="text-sm">Agrega el primer lugar para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GiftsSection({ data, onChange }: SectionProps) {
  const giftRegistryData = (data && typeof data === 'object' && 'giftRegistry' in data && data.giftRegistry) 
    ? data.giftRegistry as {enabled: boolean; message: string | { es: string; en: string }; registries: unknown[]; bankAccount: unknown}
    : { enabled: false, message: { es: '', en: '' }, registries: [], bankAccount: null };

  const addRegistry = () => {
    const newRegistry = {
      id: `registry-${Date.now()}`,
      name: '',
      description: { es: '', en: '' },
      url: ''
    };
    const newRegistries = [...giftRegistryData.registries, newRegistry];
    onChange('giftRegistry.registries', newRegistries);
  };

  const removeRegistry = (index: number) => {
    const newRegistries = [...giftRegistryData.registries];
    newRegistries.splice(index, 1);
    onChange('giftRegistry.registries', newRegistries);
  };

  const updateRegistry = (index: number, field: string, value: string | number | boolean | object | null) => {
    const newRegistries = [...giftRegistryData.registries];
    const currentItem = newRegistries[index] as Record<string, unknown> || {};
    newRegistries[index] = { ...currentItem, [field]: value };
    onChange('giftRegistry.registries', newRegistries);
  };

  const updateBankAccount = (field: string, value: string | number | boolean | object | null) => {
    const bankAccount = giftRegistryData.bankAccount as Record<string, unknown> || {};
    onChange('giftRegistry.bankAccount', { ...bankAccount, [field]: value });
  };

  const enableBankAccount = (enabled: boolean) => {
    if (enabled) {
      onChange('giftRegistry.bankAccount', {
        bankName: '',
        accountName: '',
        accountNumber: '',
        clabe: '',
        description: { es: '', en: '' }
      });
    } else {
      onChange('giftRegistry.bankAccount', null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Mesa de Regalos</h2>
      
      {/* Habilitar mesa de regalos */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="gift-registry-enabled"
            checked={giftRegistryData.enabled}
            onChange={(e) => onChange('giftRegistry.enabled', e.target.checked)}
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          />
          <label htmlFor="gift-registry-enabled" className="ml-2 block text-sm text-gray-900">
            Habilitar mesa de regalos
          </label>
        </div>

        {giftRegistryData.enabled && (
          <>
            {/* Mensaje bilingüe */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje para los invitados (Español)
                </label>
                <textarea
                  rows={3}
                  value={typeof giftRegistryData.message === 'object' ? giftRegistryData.message?.es || '' : giftRegistryData.message || ''}
                  onChange={(e) => {
                    const currentMessage = typeof giftRegistryData.message === 'object' ? giftRegistryData.message : { es: giftRegistryData.message || '', en: '' };
                    onChange('giftRegistry.message', { ...currentMessage, es: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  placeholder="Tu presencia es nuestro regalo más valioso, pero si deseas hacernos un obsequio, hemos preparado algunas opciones:"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje para los invitados (English)
                </label>
                <textarea
                  rows={3}
                  value={typeof giftRegistryData.message === 'object' ? giftRegistryData.message?.en || '' : ''}
                  onChange={(e) => {
                    const currentMessage = typeof giftRegistryData.message === 'object' ? giftRegistryData.message : { es: giftRegistryData.message || '', en: '' };
                    onChange('giftRegistry.message', { ...currentMessage, en: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  placeholder="Your presence is our most valuable gift, but if you wish to give us a present, we have prepared some options:"
                />
              </div>
            </div>

            {/* Lista de registros */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-base font-medium text-gray-800">Tiendas de Regalos</h3>
                <button
                  onClick={addRegistry}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                >
                  + Agregar Tienda
                </button>
              </div>

              <div className="space-y-4">
                {(giftRegistryData.registries as {id: string; name?: string; url?: string; description?: string | { es: string; en: string }}[]).map((registry, index: number) => {
                  const descriptionEs = typeof registry.description === 'object' ? registry.description?.es || '' : registry.description || '';
                  const descriptionEn = typeof registry.description === 'object' ? registry.description?.en || '' : '';
                  
                  return (
                    <div key={registry.id} className="bg-gray-50 p-3 sm:p-4 lg:p-6 rounded-lg border">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <h4 className="text-base font-medium text-gray-800">Tienda #{index + 1}</h4>
                        <button
                          onClick={() => removeRegistry(index)}
                          className="self-start sm:self-center text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la Tienda
                          </label>
                          <input
                            type="text"
                            value={registry.name || ''}
                            onChange={(e) => updateRegistry(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="Liverpool, El Palacio de Hierro, Amazon..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL de la Mesa de Regalos
                          </label>
                          <input
                            type="url"
                            value={registry.url || ''}
                            onChange={(e) => updateRegistry(index, 'url', e.target.value)}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="https://mesaderegalos.liverpool.com.mx/..."
                          />
                        </div>
                        
                        {/* Descripción en Español */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción (Español)
                          </label>
                          <textarea
                            rows={2}
                            value={descriptionEs}
                            onChange={(e) => updateRegistry(index, 'description', { 
                              es: e.target.value, 
                              en: descriptionEn 
                            })}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="Mesa de regalos con todo lo que necesitamos para nuestro hogar"
                          />
                        </div>
                        
                        {/* Descripción en Inglés */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción (English)
                          </label>
                          <textarea
                            rows={2}
                            value={descriptionEn}
                            onChange={(e) => updateRegistry(index, 'description', { 
                              es: descriptionEs, 
                              en: e.target.value 
                            })}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="Gift registry with everything we need for our home"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {giftRegistryData.registries.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">No hay tiendas agregadas</p>
                    <p className="text-sm">Agrega la primera tienda para comenzar tu mesa de regalos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cuenta Bancaria */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bank-account-enabled"
                  checked={!!giftRegistryData.bankAccount}
                  onChange={(e) => enableBankAccount(e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="bank-account-enabled" className="ml-2 block text-sm text-gray-900">
                  Agregar cuenta bancaria
                </label>
              </div>

              {!!giftRegistryData.bankAccount && (
                <div className="bg-gray-50 p-3 sm:p-4 lg:p-6 rounded-lg border">
                  <h4 className="text-base font-medium text-gray-800 mb-4">Información Bancaria</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Banco
                      </label>
                      <input
                        type="text"
                        value={getSafeValue(giftRegistryData.bankAccount as Record<string, unknown>, 'bankName')}
                        onChange={(e) => updateBankAccount('bankName', e.target.value)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Banco BBVA, Santander, Banorte..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titular de la Cuenta
                      </label>
                      <input
                        type="text"
                        value={getSafeValue(giftRegistryData.bankAccount as Record<string, unknown>, 'accountName')}
                        onChange={(e) => updateBankAccount('accountName', e.target.value)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Nombre completo del titular"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Cuenta
                      </label>
                      <input
                        type="text"
                        value={getSafeValue(giftRegistryData.bankAccount as Record<string, unknown>, 'accountNumber')}
                        onChange={(e) => updateBankAccount('accountNumber', e.target.value)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CLABE Interbancaria
                      </label>
                      <input
                        type="text"
                        value={getSafeValue(giftRegistryData.bankAccount as Record<string, unknown>, 'clabe')}
                        onChange={(e) => updateBankAccount('clabe', e.target.value)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="012345678901234567"
                        maxLength={18}
                      />
                    </div>
                    {/* Descripción en Español */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción (Español)
                      </label>
                      <textarea
                        rows={2}
                        value={(() => {
                          const bankAccount = giftRegistryData.bankAccount as Record<string, unknown>;
                          const description = bankAccount?.description;
                          return typeof description === 'object' && description ? (description as {es: string; en: string}).es || '' : typeof description === 'string' ? description : '';
                        })()}
                        onChange={(e) => {
                          const bankAccount = giftRegistryData.bankAccount as Record<string, unknown>;
                          const currentDescription = typeof bankAccount?.description === 'object' ? bankAccount.description as {es: string; en: string} : { es: bankAccount?.description as string || '', en: '' };
                          updateBankAccount('description', { ...currentDescription, es: e.target.value });
                        }}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="También puedes contribuir directamente a nuestra cuenta bancaria"
                      />
                    </div>
                    
                    {/* Descripción en Inglés */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción (English)
                      </label>
                      <textarea
                        rows={2}
                        value={(() => {
                          const bankAccount = giftRegistryData.bankAccount as Record<string, unknown>;
                          const description = bankAccount?.description;
                          return typeof description === 'object' && description ? (description as {es: string; en: string}).en || '' : '';
                        })()}
                        onChange={(e) => {
                          const bankAccount = giftRegistryData.bankAccount as Record<string, unknown>;
                          const currentDescription = typeof bankAccount?.description === 'object' ? bankAccount.description as {es: string; en: string} : { es: bankAccount?.description as string || '', en: '' };
                          updateBankAccount('description', { ...currentDescription, en: e.target.value });
                        }}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="You can also contribute directly to our bank account"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SocialSection({ data, onChange }: SectionProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Redes Sociales</h2>
      
      {/* Hashtag de la boda */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Hashtag de la Boda</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hashtag Principal
          </label>
          <input
            type="text"
            value={getSafeValue(data, 'hashtag')}
            onChange={(e) => onChange('hashtag', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            placeholder="#MariaYCarlos2025"
          />
          <p className="text-sm text-gray-500 mt-2">
            Este hashtag aparecerá en la invitación para que los invitados lo usen en redes sociales
          </p>
        </div>
      </div>

      {/* Redes sociales de la pareja */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Redes Sociales de la Pareja</h3>
        
        {/* Instagram de la novia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram de la Novia
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'bride.instagram')}
              onChange={(e) => onChange('bride.instagram', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="@maria_gonzalez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram del Novio
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'groom.instagram')}
              onChange={(e) => onChange('groom.instagram', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="@carlos_lopez"
            />
          </div>
        </div>

        {/* Facebook de la pareja */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook de la Novia
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'bride.facebook')}
              onChange={(e) => onChange('bride.facebook', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Maria Gonzalez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook del Novio
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'groom.facebook')}
              onChange={(e) => onChange('groom.facebook', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Carlos Lopez"
            />
          </div>
        </div>
      </div>

      {/* Email de contacto */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Contacto</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de la Pareja
          </label>
          <input
            type="email"
            value={getSafeValue(data, 'coupleEmail')}
            onChange={(e) => onChange('coupleEmail', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            placeholder="maria.carlos@ejemplo.com"
          />
          <p className="text-sm text-gray-500 mt-2">
            Email de contacto para preguntas sobre la boda
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ data, onChange }: SectionProps) {
  const adultOnlyData = (data && typeof data === 'object' && 'adultOnlyEvent' in data && data.adultOnlyEvent) 
    ? data.adultOnlyEvent as {enabled: boolean; message: string | { es: string; en: string }}
    : { enabled: false, message: { es: '', en: '' } };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración</h2>
      
      {/* Evento solo para adultos */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Evento Solo para Adultos</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="adult-only-enabled"
            checked={adultOnlyData.enabled}
            onChange={(e) => onChange('adultOnlyEvent.enabled', e.target.checked)}
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          />
          <label htmlFor="adult-only-enabled" className="ml-2 block text-sm text-gray-900">
            Este evento es solo para adultos
          </label>
        </div>

        {adultOnlyData.enabled && (
          <div className="space-y-4">
            {/* Mensaje en Español */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje para los invitados (Español)
              </label>
              <textarea
                rows={4}
                value={typeof adultOnlyData.message === 'object' ? adultOnlyData.message?.es || '' : adultOnlyData.message || ''}
                onChange={(e) => {
                  const currentMessage = typeof adultOnlyData.message === 'object' ? adultOnlyData.message : { es: adultOnlyData.message || '', en: '' };
                  onChange('adultOnlyEvent.message', { ...currentMessage, es: e.target.value });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="Aunque adoramos a los pequeños de la familia, hemos decidido que nuestra celebración sea solo para adultos. Esperamos que puedan acompañarnos en esta noche especial."
              />
            </div>
            
            {/* Mensaje en Inglés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje para los invitados (English)
              </label>
              <textarea
                rows={4}
                value={typeof adultOnlyData.message === 'object' ? adultOnlyData.message?.en || '' : ''}
                onChange={(e) => {
                  const currentMessage = typeof adultOnlyData.message === 'object' ? adultOnlyData.message : { es: adultOnlyData.message || '', en: '' };
                  onChange('adultOnlyEvent.message', { ...currentMessage, en: e.target.value });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="Although we adore the little ones in our family, we have decided that our celebration will be adults only. We hope you can join us for this special night."
              />
            </div>
            
            <p className="text-sm text-gray-500">
              Este mensaje aparecerá en la invitación para informar a los invitados sobre la política de solo adultos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}