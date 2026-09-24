'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { saveWeddingDoc } from '../../../../../lib/weddingSave';
import { db } from '../../../../../lib/firebase';
import { WeddingData, AccommodationOption, GiftRegistryItem } from '../../../../../src/types/wedding';
import WeddingNotFound from '../../../../../components/WeddingNotFound';
import { AdminTopBar, AdminPageNav, AdminSidebarNavItem, AdminSectionChip, AdminButton, AiButton, AiBadge, manrope, displayFont } from '../../../../../components/admin/ui';
import { getEnglishProgress, resolveHasEnglish, setByPath } from '../../../../../lib/wedding-language';
import { flattenUsage, limitForKey } from '../../../../../lib/aiLimits';
import {
  EditorAiProvider,
  EnField,
  EnglishPanel,
  AiStoryModal,
  requestDraft,
  postAi,
  usageHint,
  useAiPlaceSuggestions,
  useEditorAi,
  AI_TEXT,
} from './ai-parts';
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
  Sparkles,
  Globe,
  Info
} from 'lucide-react';

// Función para migrar/completar datos bilingües faltantes
const migrateWeddingData = (data: Record<string, unknown>): WeddingData => {
  const migrated = { ...data } as unknown as WeddingData;
  
  // Preservar keys personalizadas si existen
  if (data.selectedGuestTickets !== undefined) {
    migrated.selectedGuestTickets = data.selectedGuestTickets as boolean;
  }
  if (data.hasDiet !== undefined) {
    migrated.hasDiet = data.hasDiet as boolean;
  }
  if (data.hasInstagram !== undefined) {
    migrated.hasInstagram = data.hasInstagram as boolean;
  }
  if (data.hasFacebook !== undefined) {
    migrated.hasFacebook = data.hasFacebook as boolean;
  }
  if (data.showGuestsInput !== undefined) {
    migrated.showGuestsInput = data.showGuestsInput as boolean;
  }
  if (data.showRecommendedPlaces !== undefined) {
    migrated.showRecommendedPlaces = data.showRecommendedPlaces as boolean;
  }
  if (data.showConfirmCta !== undefined) {
    migrated.showConfirmCta = data.showConfirmCta as boolean;
  }
  
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

export default function WeddingEditorPage() {
  const params = useParams();
  const weddingId = params.weddingId as string;
  const locale = (params.locale as string) || 'es';

  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('couple');
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [aiUsage, setAiUsage] = useState<Record<string, number>>({});
  const [englishPanelOpen, setEnglishPanelOpen] = useState(false);
  const hasEnglish = resolveHasEnglish(weddingData);

  // Usos de IA restantes por contador (los consumidos vienen del documento y de cada respuesta del servidor).
  const remaining = (key: string) => Math.max(0, limitForKey(key) - (aiUsage[key] ?? 0));
  const setUsage = (key: string, used: number) => setAiUsage((prev) => ({ ...prev, [key]: used }));
  const translateLimit = remaining('translate') <= 0;

  // Cambios sin guardar: compara contra lo último cargado o guardado. Los usos de IA
  // consumen intentos, así que perder un borrador sin guardar cuesta algo real.
  const savedSnapshot = useRef<string | null>(null);
  const serializeForDirty = (d: WeddingData | null) => (d ? JSON.stringify({ ...d, aiUsage: undefined, updatedAt: undefined }) : '');
  const isDirty = !!weddingData && savedSnapshot.current !== null && serializeForDirty(weddingData) !== savedSnapshot.current;

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

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
        setAiUsage(flattenUsage(data.aiUsage));
        
        // Verificar si la boda tiene información básica
        const hasBasicInfo = data.couple?.bride?.name || data.couple?.groom?.name || data.event?.date;
        
        if (hasBasicInfo) {
          // Tiene información, migrar y cargar datos existentes
          const migratedData = migrateWeddingData(data as unknown as Record<string, unknown>);
          
          // Debug: verificar keys después de migración
          console.log('🔍 loadWeddingData - Keys después de migración:', {
            selectedGuestTickets: migratedData.selectedGuestTickets,
            hasDiet: migratedData.hasDiet,
            hasInstagram: migratedData.hasInstagram,
            hasFacebook: migratedData.hasFacebook,
            showGuestsInput: migratedData.showGuestsInput,
            showRecommendedPlaces: migratedData.showRecommendedPlaces
          });
          
          setWeddingData(migratedData);
          savedSnapshot.current = serializeForDirty(migratedData);
          
          // Guardar datos migrados en Firebase
          await saveWeddingDoc(docRef, migratedData);
        } else {
          // Existe pero sin información, crear estructura base
          const initialData = createInitialWeddingData(weddingId);
          setWeddingData(initialData);
          savedSnapshot.current = serializeForDirty(initialData);
          await saveWeddingDoc(docRef, initialData);
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
      
      // Debug: verificar si las keys personalizadas están presentes
      console.log('🔍 handleSave - Keys personalizadas:', {
        selectedGuestTickets: weddingData.selectedGuestTickets,
        hasDiet: weddingData.hasDiet,
        hasInstagram: weddingData.hasInstagram,
        hasFacebook: weddingData.hasFacebook,
        showGuestsInput: weddingData.showGuestsInput,
        showRecommendedPlaces: weddingData.showRecommendedPlaces
      });
      
      const updatedData = {
        ...weddingData,
        updatedAt: new Date().toISOString()
      };
      
      await saveWeddingDoc(docRef, updatedData);
      setWeddingData(updatedData);
      savedSnapshot.current = serializeForDirty(updatedData);
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
    
    // Actualización funcional: varias llamadas seguidas (ej. story.es y story.en)
    // parten del estado más reciente en vez de pisarse entre sí.
    setWeddingData((prev) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      setByPath(newData, path, value);
      return newData;
    });
  };

  const setI18nMeta = (key: string, source: string | null) => {
    setWeddingData((prev) => {
      if (!prev) return prev;
      const meta = { ...(prev.i18nMeta || {}) };
      if (source === null) {
        if (!(key in meta)) return prev;
        delete meta[key];
      } else {
        meta[key] = source;
      }
      return { ...prev, i18nMeta: meta };
    });
  };

  const applyEnglish = (rows: { field: { id: string; path: string; es: string }; en: string }[]) => {
    setWeddingData((prev) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const meta = { ...(newData.i18nMeta || {}) };
      rows.forEach((row) => {
        setByPath(newData, row.field.path, row.en);
        meta[row.field.id] = row.field.es;
      });
      newData.i18nMeta = meta;
      return newData;
    });
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
              ? (hotel.description.es && (!hasEnglish || hotel.description.en))
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
              ? (place.description.es && (!hasEnglish || place.description.en))
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
          return !!(message.es && message.es.trim() && (!hasEnglish || (message.en && message.en.trim())));
        } else {
          // Si es string simple, debe estar completo
          return !!(message && message.trim());
        }
      default:
        return false;
    }
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
    { id: 'settings', label: 'Solo adultos', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#111111] mx-auto mb-4" />
          <p className="text-[#3F3F46]" style={manrope}>Cargando editor...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <WeddingNotFound weddingId={weddingId} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center" style={manrope}>
          <p className="text-[#B91C1C] mb-4">{error}</p>
          <AdminButton onClick={() => window.location.reload()}>Reintentar</AdminButton>
        </div>
      </div>
    );
  }

  const completedCount = tabs.filter((tab) => isSectionComplete(tab.id)).length;
  const englishProgress = getEnglishProgress(weddingData);
  const ceremonyInfo = {
    name: weddingData?.event?.ceremonyVenue?.name?.es || '',
    address: weddingData?.event?.ceremonyVenue?.address || '',
  };
  const receptionInfo = {
    name: weddingData?.event?.receptionVenue?.name?.es || '',
    address: weddingData?.event?.receptionVenue?.address || '',
  };

  return (
    <EditorAiProvider
      value={{
        weddingId,
        hasEnglish,
        meta: weddingData?.i18nMeta || {},
        setMeta: setI18nMeta,
        translateLimit,
        setTranslateLimit: (v) => {
          if (v) setUsage('translate', limitForKey('translate'));
        },
        setUsage,
        remaining,
        goToTab: setActiveTab,
      }}
    >
    <div className="admin-form min-h-screen bg-[#FAFAFA]" style={manrope}>
      {/* Navbar Invyta — mismo padding horizontal que AdminTopBar para que el logo quede alineado con el título de abajo */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.06)] px-4 sm:px-10 py-3.5 flex items-center justify-between gap-4">
        <a
          href="/"
          className="text-xl sm:text-2xl text-[#0A0A0A] hover:opacity-70 transition-opacity"
          style={displayFont}
        >
          invyta
        </a>
        {weddingId && <AdminPageNav weddingId={weddingId} locale={locale} active="editor" />}
      </div>

      <AdminTopBar
        title="Editor de Invitación"
        meta={
          <div className="flex items-center gap-3 w-full max-w-[300px]">
            <div className="flex-1 h-1.5 rounded-full bg-[#E4E4E7] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#111111] transition-all"
                style={{ width: `${(completedCount / tabs.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#3F3F46] whitespace-nowrap">
              {completedCount}/{tabs.length} secciones
            </span>
          </div>
        }
        actions={
          <>
            {isDirty && !saving && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#71717A]">
                <span className="h-2 w-2 rounded-full bg-[#6D28D9]" />
                Cambios sin guardar
              </span>
            )}
            {saveMessage && !isDirty && (
              <span className="hidden sm:inline text-sm font-semibold text-[#15803D]">{saveMessage}</span>
            )}
            {hasEnglish && (
              <button
                type="button"
                onClick={() => setEnglishPanelOpen(true)}
                aria-pressed={englishPanelOpen}
                className="inline-flex items-center gap-2 h-11 pl-4 pr-2 rounded-full bg-[#F5F3FF] text-[#6D28D9] border border-[rgba(109,40,217,0.25)] hover:bg-[#EDE9FE] text-[13px] font-bold transition-colors"
              >
                <Globe className="h-[15px] w-[15px]" />
                Inglés
                <span className="inline-flex items-center h-7 px-2.5 rounded-full bg-white text-[12px]">
                  {englishProgress.done}/{englishProgress.total}
                </span>
              </button>
            )}
            <AdminButton onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Guardando...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Guardar cambios</span>
                  <span className="sm:hidden">Guardar</span>
                </>
              )}
            </AdminButton>
          </>
        }
      />

      <div className="flex flex-col md:flex-row md:items-start">
        {/* Sidebar de navegación — escritorio */}
        <div className="hidden md:flex md:w-[260px] md:flex-shrink-0 md:flex-col bg-white border-r border-[rgba(0,0,0,0.08)] p-4 md:sticky md:top-0 md:min-h-[calc(100vh-129px)]">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#71717A] px-2.5 mb-2">
            Contenido de la boda
          </div>
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <AdminSidebarNavItem
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                active={activeTab === tab.id}
                complete={isSectionComplete(tab.id)}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>

        {/* Chips de sección — móvil */}
        <div className="md:hidden bg-white border-b border-[rgba(0,0,0,0.08)] px-4 py-3 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <AdminSectionChip
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Contenido de la sección activa */}
        <div className="flex-1 min-w-0 p-4 sm:p-8 pb-28 md:pb-8">
          <div className="max-w-5xl">
            {activeTab === 'couple' && (
              <CoupleSection
                data={(weddingData?.couple || {}) as Record<string, unknown>}
                onChange={(field, value) => updateWeddingData(`couple.${field}`, value)}
                onRootChange={(field, value) => updateWeddingData(field, value)}
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
                ceremonyTime={weddingData?.event?.time || ''}
                ceremony={ceremonyInfo}
                reception={receptionInfo}
              />
            )}
            {activeTab === 'accommodation' && (
              <AccommodationSection
                data={(weddingData?.accommodation || {}) as Record<string, unknown>}
                onChange={(field, value) => updateWeddingData(`accommodation.${field}`, value)}
                ceremony={ceremonyInfo}
                reception={receptionInfo}
              />
            )}
            {activeTab === 'recommendedPlaces' && (
              <RecommendedPlacesSection
                data={(weddingData?.accommodation || {}) as Record<string, unknown>}
                onChange={(field, value) => updateWeddingData(`accommodation.${field}`, value)}
                ceremony={ceremonyInfo}
                reception={receptionInfo}
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

      {/* Barra fija de guardado — móvil */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[rgba(0,0,0,0.08)] px-4 pt-3 z-40"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        {isDirty && !saving && <p className="text-center text-xs font-semibold text-[#71717A] mb-2">Cambios sin guardar</p>}
        {isDirty && !saving && <p className="text-center text-xs font-semibold text-[#71717A] mb-2">Cambios sin guardar</p>}
        <AdminButton onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar cambios
            </>
          )}
        </AdminButton>
      </div>

      <EnglishPanel
        open={englishPanelOpen}
        onClose={() => setEnglishPanelOpen(false)}
        done={englishProgress.done}
        total={englishProgress.total}
        pending={englishProgress.pending}
        onApply={applyEnglish}
      />
    </div>
    </EditorAiProvider>
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

interface VenueInfo {
  name: string;
  address: string;
}

interface VenuesSectionProps {
  ceremonyVenue: Record<string, unknown>;
  receptionVenue: Record<string, unknown>;
  onChange: (field: string, value: string | number | boolean | object | null) => void;
}

function CoupleSection({
  data,
  onChange,
  onRootChange,
}: SectionProps & { onRootChange: SectionProps['onChange'] }) {
  const ai = useEditorAi();
  const [showStoryModal, setShowStoryModal] = useState(false);
  const storyLimitReached = ai.remaining('storyGenerate') <= 0;
  const [storyGeneratedByAi, setStoryGeneratedByAi] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-[26px] text-[#0A0A0A] mb-6" style={displayFont}>Información de la Pareja</h2>
      
      {/* Nombres */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-[15px] font-bold text-[#0A0A0A] border-b border-[rgba(0,0,0,0.08)] pb-2">Nombres</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Nombre de la persona 2
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'bride.name')}
              onChange={(e) => onChange('bride.name', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="María"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Nombre de la persona 1
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'groom.name')}
              onChange={(e) => onChange('groom.name', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="Carlos"
            />
          </div>
        </div>
      </div>

      {/* Teléfonos */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-[15px] font-bold text-[#0A0A0A] border-b border-[rgba(0,0,0,0.08)] pb-2">Teléfonos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Teléfono de la persona 2
            </label>
            <input
              type="tel"
              value={getSafeValue(data, 'bride.phone')}
              onChange={(e) => onChange('bride.phone', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="+52 55 1234-5678"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Teléfono de la persona 1
            </label>
            <input
              type="tel"
              value={getSafeValue(data, 'groom.phone')}
              onChange={(e) => onChange('groom.phone', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="+52 55 8765-4321"
            />
          </div>
        </div>
      </div>

      {/* ¿Invitaciones en inglés? */}
      <div className="border border-[rgba(0,0,0,0.1)] bg-white rounded-xl px-4 sm:px-5 py-4 space-y-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="has-english"
            checked={ai.hasEnglish}
            onChange={(e) => onRootChange('hasEnglish', e.target.checked)}
            className="h-[18px] w-[18px] mt-0.5 accent-[#111111] flex-shrink-0"
          />
          <label htmlFor="has-english" className="flex flex-col gap-1 cursor-pointer">
            <span className="text-[15px] font-bold text-[#0A0A0A]">¿Tendrás invitaciones en inglés?</span>
            <span className="text-[13px] leading-relaxed text-[#71717A]">
              Por defecto tus invitados ven la invitación solo en español. Actívalo si alguno la necesitará en inglés.
            </span>
          </label>
        </div>
        {ai.hasEnglish && (
          <div className="flex items-start gap-2.5 bg-[#F5F3FF] border border-[rgba(109,40,217,0.25)] rounded-[10px] px-3.5 py-3 text-[13px] leading-relaxed text-[#4C1D95]">
            <Globe className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#6D28D9]" />
            <span>
              Ahora verás campos en inglés en cada sección. Tradúcelos con IA campo por campo, o todos a la vez desde el botón <strong>Inglés</strong> de la barra superior.
            </span>
          </div>
        )}
      </div>

      {/* Historia de amor */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(0,0,0,0.08)] pb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-bold text-[#0A0A0A]">Historia de Amor</h3>
            {storyGeneratedByAi && <AiBadge>Generado con IA</AiBadge>}
          </div>
          <AiButton onClick={() => setShowStoryModal(true)} disabled={storyLimitReached}>
            <Sparkles className="h-3.5 w-3.5" />
            {storyLimitReached ? 'Ya usaste tus 5 generaciones para esto' : `Redactor de textos con IA${usageHint(ai, 'storyGenerate')}`}
          </AiButton>
        </div>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Historia en Español
            </label>
            <textarea
              rows={4}
              value={getSafeValue(data, 'story.es')}
              onChange={(e) => { onChange('story.es', e.target.value); setStoryGeneratedByAi(false); }}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="Hace más de 6 años, el destino nos unió en una cafetería de la ciudad..."
            />
          </div>
          <EnField
            label="Historia en Inglés"
            rows={4}
            value={getSafeValue(data, 'story.en')}
            onChange={(v) => onChange('story.en', v)}
            source={getSafeValue(data, 'story.es')}
            metaKey="couple|story"
            placeholder="More than 6 years ago, destiny brought us together in a city café..."
          />
        </div>
      </div>

      {showStoryModal && (
        <AiStoryModal
          weddingId={ai.weddingId}
          withEnglish={ai.hasEnglish}
          onClose={() => setShowStoryModal(false)}
          onUseText={(es, en) => {
            onChange('story.es', es);
            if (en !== null) {
              onChange('story.en', en);
              ai.setMeta('couple|story', es);
            }
            setStoryGeneratedByAi(true);
            setShowStoryModal(false);
          }}
        />
      )}

      {/* Frase especial */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-[15px] font-bold text-[#0A0A0A] border-b border-[rgba(0,0,0,0.08)] pb-2">Frase Especial</h3>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Frase en Español
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'quote.es')}
              onChange={(e) => onChange('quote.es', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="El amor no es solo mirarse el uno al otro, sino mirar juntos en la misma dirección."
            />
          </div>
          <EnField
            label="Frase en Inglés"
            value={getSafeValue(data, 'quote.en')}
            onChange={(v) => onChange('quote.en', v)}
            source={getSafeValue(data, 'quote.es')}
            metaKey="couple|quote"
            placeholder="Love is not just looking at each other, but looking together in the same direction."
          />
        </div>
      </div>
    </div>
  );
}

function EventSection({ data, onChange }: SectionProps) {
  const ai = useEditorAi();
  const [dresscodeLoading, setDresscodeLoading] = useState(false);
  const [dresscodeError, setDresscodeError] = useState<string | null>(null);
  const dresscodeLimitReached = ai.remaining('dresscodeGenerate') <= 0;
  const [dresscodeGeneratedByAi, setDresscodeGeneratedByAi] = useState(false);

  const handleGenerateDresscode = async () => {
    setDresscodeLoading(true);
    setDresscodeError(null);
    const result = await requestDraft(ai, '/api/ai/dresscode', {
      weddingId: ai.weddingId,
      style: getSafeValue(data, 'dressCode.style.es'),
      withEnglish: ai.hasEnglish,
    });
    if (result.ok) {
      onChange('dressCode.description.es', result.es);
      if (ai.hasEnglish && result.en) {
        onChange('dressCode.description.en', result.en);
        ai.setMeta('dressCode|description', result.es);
      }
      setDresscodeGeneratedByAi(true);
    } else if (result.limit) {
      setDresscodeError(AI_TEXT.LIMIT_TEXT);
    } else {
      setDresscodeError(AI_TEXT.ERROR_TEXT);
    }
    setDresscodeLoading(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-[26px] text-[#0A0A0A] mb-6" style={displayFont}>Información del Evento</h2>

      {/* Fecha y hora */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-[15px] font-bold text-[#0A0A0A] border-b border-[rgba(0,0,0,0.08)] pb-2">Fecha y Hora</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Fecha de la boda
            </label>
            <input
              type="date"
              value={getSafeValue(data, 'date') ? getSafeValue(data, 'date').split('T')[0] : ''}
              onChange={(e) => onChange('date', e.target.value + 'T16:00:00.000Z')}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Hora del evento
            </label>
            <input
              type="time"
              value={getSafeValue(data, 'time')}
              onChange={(e) => onChange('time', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Código de vestimenta */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-[15px] font-bold text-[#0A0A0A] border-b border-[rgba(0,0,0,0.08)] pb-2">Código de Vestimenta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Estilo en Español
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'dressCode.style.es')}
              onChange={(e) => onChange('dressCode.style.es', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="Formal / Cocktail"
            />
          </div>
          <EnField
            label="Estilo en Inglés"
            value={getSafeValue(data, 'dressCode.style.en')}
            onChange={(v) => onChange('dressCode.style.en', v)}
            source={getSafeValue(data, 'dressCode.style.es')}
            metaKey="dressCode|style"
            placeholder="Formal / Cocktail"
          />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <label className="block text-[13px] font-semibold text-[#27272A]">
                  Descripción en Español
                </label>
                {dresscodeGeneratedByAi && <AiBadge>Generado con IA</AiBadge>}
              </div>
              <AiButton onClick={handleGenerateDresscode} disabled={dresscodeLoading || dresscodeLimitReached}>
                <Sparkles className="h-3.5 w-3.5" />
                {dresscodeLoading
                  ? 'Redactando...'
                  : dresscodeLimitReached
                    ? 'Ya usaste tus 5 generaciones para esto'
                    : `Redactar con IA${usageHint(ai, 'dresscodeGenerate')}`}
              </AiButton>
            </div>
            <textarea
              rows={3}
              value={getSafeValue(data, 'dressCode.description.es')}
              onChange={(e) => { onChange('dressCode.description.es', e.target.value); setDresscodeGeneratedByAi(false); }}
              readOnly={dresscodeLoading}
              className={`w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors ${dresscodeLoading ? 'ai-field-loading' : ''}`}
              placeholder="Queremos que te sientas elegante y cómodo en nuestra celebración"
            />
            {dresscodeError && (
              <p className="mt-1.5 text-[12px] font-semibold text-[#B91C1C]">{dresscodeError}</p>
            )}
          </div>
          <EnField
            label="Descripción en Inglés"
            rows={3}
            value={getSafeValue(data, 'dressCode.description.en')}
            onChange={(v) => onChange('dressCode.description.en', v)}
            source={getSafeValue(data, 'dressCode.description.es')}
            metaKey="dressCode|description"
            placeholder="We want you to feel elegant and comfortable at our celebration"
          />
        </div>
      </div>
    </div>
  );
}

function VenuesSection({ ceremonyVenue, receptionVenue, onChange }: VenuesSectionProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-[26px] text-[#0A0A0A] mb-6" style={displayFont}>Lugares del Evento</h2>
      
      {/* Lugar de ceremonia */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-[15px] font-bold text-[#0A0A0A] border-b border-[rgba(0,0,0,0.08)] pb-2">Ceremonia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Nombre en Español
            </label>
            <input
              type="text"
              value={getSafeValue(ceremonyVenue, 'name.es')}
              onChange={(e) => onChange('ceremonyVenue.name.es', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="Iglesia del Sagrado Corazón"
            />
          </div>
          <EnField
            label="Nombre en Inglés"
            value={getSafeValue(ceremonyVenue, 'name.en')}
            onChange={(v) => onChange('ceremonyVenue.name.en', v)}
            source={getSafeValue(ceremonyVenue, 'name.es')}
            metaKey="ceremonyVenue|name"
            placeholder="Sacred Heart Church"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={getSafeValue(ceremonyVenue, 'address')}
              onChange={(e) => onChange('ceremonyVenue.address', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="Calle de los Santos 456, Ciudad, Estado 12345"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              URL de Google Maps
            </label>
            <input
              type="url"
              value={getSafeValue(ceremonyVenue, 'mapsUrl')}
              onChange={(e) => onChange('ceremonyVenue.mapsUrl', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </div>

      {/* Lugar de recepción */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-[15px] font-bold text-[#0A0A0A] border-b border-[rgba(0,0,0,0.08)] pb-2">Recepción</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Nombre en Español
            </label>
            <input
              type="text"
              value={getSafeValue(receptionVenue, 'name.es')}
              onChange={(e) => onChange('receptionVenue.name.es', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="Jardines del Edén"
            />
          </div>
          <EnField
            label="Nombre en Inglés"
            value={getSafeValue(receptionVenue, 'name.en')}
            onChange={(v) => onChange('receptionVenue.name.en', v)}
            source={getSafeValue(receptionVenue, 'name.es')}
            metaKey="receptionVenue|name"
            placeholder="Eden Gardens"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={getSafeValue(receptionVenue, 'address')}
              onChange={(e) => onChange('receptionVenue.address', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="Av. Principal 123, Ciudad, Estado 12345"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              URL de Google Maps
            </label>
            <input
              type="url"
              value={getSafeValue(receptionVenue, 'mapsUrl')}
              onChange={(e) => onChange('receptionVenue.mapsUrl', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface TimelineSuggestion {
  time: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
  icon: string;
}

function TimelineSection({
  data,
  onChange,
  ceremonyTime,
  ceremony,
  reception,
}: SectionProps & { ceremonyTime: string; ceremony: VenueInfo; reception: VenueInfo }) {
  const ai = useEditorAi();
  // Asegurar que data sea siempre un array
  const timelineData = Array.isArray(data) ? data : [];

  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const suggestLimitReached = ai.remaining('timelineSuggest') <= 0;
  const [suggestions, setSuggestions] = useState<TimelineSuggestion[]>([]);

  const handleSuggest = async () => {
    setSuggestLoading(true);
    setSuggestError(null);
    try {
      const { status, data: json } = await postAi(ai, '/api/ai/timeline-suggest', {
        weddingId: ai.weddingId,
        ceremonyTime,
        ceremony,
        reception,
        withEnglish: ai.hasEnglish,
        existingEvents: timelineData.map((e: { time?: string }) => ({ time: e.time || '', title: getSafeValue(e as Record<string, unknown>, 'title.es') })),
      });
      if (status === 429) {
        setSuggestError(AI_TEXT.LIMIT_TEXT);
        return;
      }
      if (status !== 200) throw new Error('request failed');
      setSuggestions(Array.isArray(json.events) ? (json.events as TimelineSuggestion[]) : []);
    } catch {
      setSuggestError(AI_TEXT.ERROR_TEXT);
    } finally {
      setSuggestLoading(false);
    }
  };

  const toEvent = (event: TimelineSuggestion, index: number) => ({
    id: `event-${Date.now()}-${index}`,
    time: event.time,
    title: event.title,
    description: event.description,
    icon: event.icon,
  });

  // Los eventos sugeridos se insertan en su lugar por hora, no al final.
  const byTime = (list: { time?: string }[]) => [...list].sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));

  const acceptSuggestion = (index: number) => {
    onChange('timeline', byTime([...timelineData, toEvent(suggestions[index], index)]));
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const discardSuggestion = (index: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const acceptAllSuggestions = () => {
    onChange('timeline', byTime([...timelineData, ...suggestions.map(toEvent)]));
    setSuggestions([]);
  };

  const discardAllSuggestions = () => setSuggestions([]);

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
        <h2 className="text-[26px] text-[#0A0A0A]" style={displayFont}>Cronograma del Evento</h2>
        <AiButton onClick={handleSuggest} disabled={suggestLoading || suggestLimitReached}>
          <Sparkles className="h-3.5 w-3.5" />
          {suggestLoading
            ? 'Generando...'
            : suggestLimitReached
              ? 'Ya usaste tus 5 generaciones para esto'
              : `Sugerir itinerario con IA${usageHint(ai, 'timelineSuggest')}`}
        </AiButton>
      </div>

      {suggestError && <p className="text-[13px] font-semibold text-[#B91C1C]">{suggestError}</p>}

      {suggestLoading && <div className="h-28 rounded-xl ai-field-loading" />}

      {(suggestions.length > 0 || suggestLoading) && (
        <div className="flex items-start gap-2.5 bg-[#F5F3FF] border border-[rgba(109,40,217,0.25)] rounded-[10px] px-3.5 py-3 text-[13px] leading-relaxed text-[#4C1D95]">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#6D28D9]" />
          <span className="flex-1">
            <strong>Basado en tu información:</strong> hora del evento {ceremonyTime || 'sin definir'}
            {(ceremony.name || ceremony.address) && <> · ceremonia en {ceremony.name || ceremony.address}</>}
            {(reception.name || reception.address) && <> · recepción en {[reception.name, reception.address].filter(Boolean).join(', ')}</>}.
          </span>
          <button type="button" onClick={() => ai.goToTab('event')} className="font-bold text-[#6D28D9] hover:text-[#5B21B6] whitespace-nowrap">
            Editar en Evento
          </button>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="bg-[#F5F3FF] border border-[rgba(109,40,217,0.2)] rounded-xl p-3 sm:p-4 lg:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[#6D28D9]">Itinerario sugerido</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={acceptAllSuggestions}
                className="text-[12px] font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] px-3 py-1.5 rounded-full transition-colors"
              >
                Agregar todas
              </button>
              <button
                type="button"
                onClick={discardAllSuggestions}
                className="text-[12px] font-bold text-[#6D28D9] border border-[rgba(109,40,217,0.3)] hover:bg-white px-3 py-1.5 rounded-full transition-colors"
              >
                Descartar todas
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {suggestions.map((event, index) => (
              <div
                key={`${event.time}-${index}`}
                className="bg-white rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-[rgba(109,40,217,0.15)]"
              >
                <div>
                  <div className="text-[12px] font-bold text-[#6D28D9]">{event.time} · {event.icon}</div>
                  <div className="text-sm font-bold text-[#0A0A0A]">{event.title.es}</div>
                  <div className="text-[13px] text-[#3F3F46]">{event.description.es}</div>
                  {event.title.en && (
                    <div className="text-[12px] text-[#71717A]">
                      <span className="font-bold">EN</span> {event.title.en} · {event.description.en}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => acceptSuggestion(index)}
                    className="text-[12px] font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] px-3 py-1.5 rounded-full transition-colors"
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => discardSuggestion(index)}
                    className="text-[12px] font-bold text-[#71717A] border border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA] px-3 py-1.5 rounded-full transition-colors"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {timelineData.map((event: {id: string; title?: {es: string; en: string}; time?: string; description?: {es: string; en: string}; icon?: string}, index: number) => (
          <div key={event.id} className="bg-[#FAFAFA] p-3 sm:p-4 lg:p-6 rounded-xl border border-[rgba(0,0,0,0.08)]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <h3 className="text-base font-bold text-[#0A0A0A]">Evento #{index + 1}</h3>
              <button
                onClick={() => removeTimelineEvent(index)}
                className="self-start sm:self-center text-[#B91C1C] hover:text-[#7F1D1D] text-sm font-semibold px-3 py-1 border border-[rgba(185,28,28,0.3)] rounded-full hover:bg-[rgba(185,28,28,0.06)] transition-colors"
              >
                Eliminar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  value={event.time}
                  onChange={(e) => updateTimelineEvent(index, 'time', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                  Icono
                </label>
                <select
                  value={event.icon}
                  onChange={(e) => updateTimelineEvent(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                >
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                  Título (Español)
                </label>
                <input
                  type="text"
                  value={getSafeValue(event, 'title.es')}
                  onChange={(e) => updateTimelineEvent(index, 'title.es', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                />
              </div>
              <EnField
                size="sm"
                label="Título (Inglés)"
                value={getSafeValue(event, 'title.en')}
                onChange={(v) => updateTimelineEvent(index, 'title.en', v)}
                source={getSafeValue(event, 'title.es')}
                metaKey={`timeline|${event.id}|title`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                  Descripción (Español)
                </label>
                <textarea
                  rows={2}
                  value={getSafeValue(event, 'description.es')}
                  onChange={(e) => updateTimelineEvent(index, 'description.es', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                />
              </div>
              <EnField
                size="sm"
                rows={2}
                label="Descripción (Inglés)"
                value={getSafeValue(event, 'description.en')}
                onChange={(v) => updateTimelineEvent(index, 'description.en', v)}
                source={getSafeValue(event, 'description.es')}
                metaKey={`timeline|${event.id}|description`}
              />
            </div>
          </div>
        ))}

        {timelineData.length === 0 ? (
          <div className="text-center py-8 text-[#71717A]">
            <p className="mb-4">No hay eventos en el cronograma</p>
            <p className="text-sm mb-6">Crea el primer evento para comenzar a construir tu cronograma</p>
          </div>
        ) : null}

        {/* Botón para agregar evento - siempre visible */}
        <div className="text-center pt-4 border-t border-[rgba(0,0,0,0.08)] mt-6">
          <button
            type="button"
            onClick={addTimelineEvent}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] text-white rounded-full hover:bg-black focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.15)] focus:ring-offset-2 transition-colors text-sm font-bold shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
          >
            + {timelineData.length === 0 ? 'Agregar Primer Evento' : 'Agregar Evento'}
          </button>
        </div>
      </div>
    </div>
  );
}

function venuesLabel(ceremony: VenueInfo, reception: VenueInfo): string {
  return [ceremony.name || ceremony.address, reception.name || reception.address].filter(Boolean).join(' y ');
}

function AccommodationSection({
  data,
  onChange,
  ceremony,
  reception,
}: SectionProps & { ceremony: VenueInfo; reception: VenueInfo }) {
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

  const suggest = useAiPlaceSuggestions({
    endpoint: '/api/ai/hotels-suggest',
    usageKey: 'hotelsSuggest',
    idPrefix: 'hotel',
    buttonLabel: 'Sugerir hoteles con IA',
    heading: 'Hoteles sugeridos',
    subtitle: `Cerca de ${venuesLabel(ceremony, reception)}`,
    helpText: 'Agrega la dirección de la ceremonia o de la recepción para recibir sugerencias de hoteles con IA.',
    existingNames: hotelsData.map((h: { name?: string }) => h.name || ''),
    ceremony,
    reception,
    onAdd: (items) => onChange('hotels', [...hotelsData, ...items]),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-[26px] text-[#0A0A0A]" style={displayFont}>Hoteles Recomendados</h2>
        <div className="flex flex-wrap items-center gap-2">
          {suggest.button}
          <button
            onClick={addHotel}
            className="bg-[#111111] text-white px-4 py-2 rounded-full hover:bg-black focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.15)] focus:ring-offset-2 transition-colors text-sm font-bold"
          >
            + Agregar Hotel
          </button>
        </div>
      </div>

      {suggest.panel}

      <div className="space-y-4">
        {hotelsData.map((hotel: {id: string; name?: string; description?: string | { es: string; en: string }; mapsUrl?: string}, index: number) => {
          const descriptionEs = typeof hotel.description === 'object' ? hotel.description?.es || '' : hotel.description || '';
          const descriptionEn = typeof hotel.description === 'object' ? hotel.description?.en || '' : '';

          return (
            <div key={hotel.id} className="bg-[#FAFAFA] p-3 sm:p-4 lg:p-6 rounded-xl border border-[rgba(0,0,0,0.08)]">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <h3 className="text-base font-bold text-[#0A0A0A]">Hotel #{index + 1}</h3>
                <button
                  onClick={() => removeHotel(index)}
                  className="self-start sm:self-center text-[#B91C1C] hover:text-[#7F1D1D] text-sm font-semibold px-3 py-1 border border-[rgba(185,28,28,0.3)] rounded-full hover:bg-[rgba(185,28,28,0.06)] transition-colors"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                    Nombre del Hotel
                  </label>
                  <input
                    type="text"
                    value={hotel.name || ''}
                    onChange={(e) => updateHotel(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                    placeholder="Hotel Boutique Plaza"
                  />
                </div>

                {/* Descripción en Español */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                    Descripción (Español)
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionEs}
                    onChange={(e) => updateHotel(index, 'description', {
                      es: e.target.value,
                      en: descriptionEn
                    })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                    placeholder="Descripción del hotel en español..."
                  />
                </div>

                {/* Descripción en Inglés */}
                <EnField
                  size="sm"
                  rows={3}
                  label="Descripción (English)"
                  value={descriptionEn}
                  onChange={(v) => updateHotel(index, 'description', { es: descriptionEs, en: v })}
                  source={descriptionEs}
                  metaKey={`hotels|${hotel.id}|description`}
                  placeholder="Hotel description in English..."
                />

                <div>
                  <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                    URL de Google Maps
                  </label>
                  <input
                    type="url"
                    value={hotel.mapsUrl || ''}
                    onChange={(e) => updateHotel(index, 'mapsUrl', e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>
          );
        })}

        {hotelsData.length === 0 && (
          <div className="text-center py-8 text-[#71717A]">
            <p className="mb-4">No hay hoteles agregados</p>
            <p className="text-sm">Agrega el primer hotel para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendedPlacesSection({
  data,
  onChange,
  ceremony,
  reception,
}: SectionProps & { ceremony: VenueInfo; reception: VenueInfo }) {
  const ai = useEditorAi();
  const placesData = Array.isArray(data?.recommendedPlaces) ? data.recommendedPlaces : [];
  const hotelsData = Array.isArray(data?.hotels) ? data.hotels : [];

  const [placeGenerateLoading, setPlaceGenerateLoading] = useState<Record<string, boolean>>({});
  const [placeGenerateError, setPlaceGenerateError] = useState<Record<string, string>>({});

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

  const handleGeneratePlaceDescription = async (placeId: string, placeName: string, index: number) => {
    setPlaceGenerateLoading((prev) => ({ ...prev, [placeId]: true }));
    setPlaceGenerateError((prev) => ({ ...prev, [placeId]: '' }));
    const result = await requestDraft(ai, '/api/ai/place-description', {
      weddingId: ai.weddingId,
      placeId,
      placeName,
      withEnglish: ai.hasEnglish,
    });
    if (result.ok) {
      const currentDescription = placesData[index]?.description;
      const currentEn = typeof currentDescription === 'object' ? currentDescription?.en || '' : '';
      const useEn = ai.hasEnglish && result.en;
      updatePlace(index, 'description', { es: result.es, en: useEn ? result.en : currentEn });
      if (useEn) ai.setMeta(`places|${placeId}|description`, result.es);
    } else if (result.limit) {
      setPlaceGenerateError((prev) => ({ ...prev, [placeId]: AI_TEXT.LIMIT_TEXT }));
    } else {
      setPlaceGenerateError((prev) => ({ ...prev, [placeId]: AI_TEXT.ERROR_TEXT }));
    }
    setPlaceGenerateLoading((prev) => ({ ...prev, [placeId]: false }));
  };

  const suggest = useAiPlaceSuggestions({
    endpoint: '/api/ai/places-suggest',
    usageKey: 'placesSuggest',
    idPrefix: 'place',
    buttonLabel: 'Sugerir lugares con IA',
    heading: 'Lugares sugeridos',
    subtitle: 'Para visitar cerca de la boda. Los hoteles van en su propia sección.',
    helpText: 'Agrega la dirección de la ceremonia o de la recepción para recibir sugerencias de lugares con IA.',
    existingNames: [
      ...placesData.map((p: { name?: string }) => p.name || ''),
      ...hotelsData.map((h: { name?: string }) => h.name || ''),
    ],
    ceremony,
    reception,
    onAdd: (items) => onChange('recommendedPlaces', [...placesData, ...items]),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-[26px] text-[#0A0A0A]" style={displayFont}>Lugares Recomendados</h2>
        <div className="flex flex-wrap items-center gap-2">
          {suggest.button}
          <button
            onClick={addPlace}
            className="bg-[#111111] text-white px-4 py-2 rounded-full hover:bg-black focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.15)] focus:ring-offset-2 transition-colors text-sm font-bold"
          >
            + Agregar Lugar
          </button>
        </div>
      </div>

      {suggest.panel}

      <div className="space-y-4">
        {placesData.map((place: {id: string; name?: string; description?: string | { es: string; en: string }; mapsUrl?: string}, index: number) => {
          const descriptionEs = typeof place.description === 'object' ? place.description?.es || '' : place.description || '';
          const descriptionEn = typeof place.description === 'object' ? place.description?.en || '' : '';

          return (
            <div key={place.id} className="bg-[#FAFAFA] p-3 sm:p-4 lg:p-6 rounded-xl border border-[rgba(0,0,0,0.08)]">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <h3 className="text-base font-bold text-[#0A0A0A]">Lugar #{index + 1}</h3>
                <button
                  onClick={() => removePlace(index)}
                  className="self-start sm:self-center text-[#B91C1C] hover:text-[#7F1D1D] text-sm font-semibold px-3 py-1 border border-[rgba(185,28,28,0.3)] rounded-full hover:bg-[rgba(185,28,28,0.06)] transition-colors"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                    Nombre del Lugar
                  </label>
                  <input
                    type="text"
                    value={place.name || ''}
                    onChange={(e) => updatePlace(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                    placeholder="Restaurante La Terraza"
                  />
                </div>

                {/* Descripción en Español */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="block text-[13px] font-semibold text-[#27272A]">
                      Descripción (Español)
                    </label>
                    <AiButton
                      onClick={() => handleGeneratePlaceDescription(place.id, place.name || '', index)}
                      disabled={!!placeGenerateLoading[place.id] || ai.remaining(`placeGenerate.${place.id}`) <= 0}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {placeGenerateLoading[place.id]
                        ? 'Redactando...'
                        : ai.remaining(`placeGenerate.${place.id}`) <= 0
                          ? 'Ya usaste tus 5 generaciones para esto'
                          : `Redactar con IA${usageHint(ai, `placeGenerate.${place.id}`)}`}
                    </AiButton>
                  </div>
                  <textarea
                    rows={3}
                    value={descriptionEs}
                    onChange={(e) => updatePlace(index, 'description', {
                      es: e.target.value,
                      en: descriptionEn
                    })}
                    readOnly={!!placeGenerateLoading[place.id]}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] ${placeGenerateLoading[place.id] ? 'ai-field-loading' : ''}`}
                    placeholder="Descripción del lugar en español..."
                  />
                  {placeGenerateError[place.id] && (
                    <p className="mt-1.5 text-[12px] font-semibold text-[#B91C1C]">{placeGenerateError[place.id]}</p>
                  )}
                </div>

                {/* Descripción en Inglés */}
                <EnField
                  size="sm"
                  rows={3}
                  label="Descripción (English)"
                  value={descriptionEn}
                  onChange={(v) => updatePlace(index, 'description', { es: descriptionEs, en: v })}
                  source={descriptionEs}
                  metaKey={`places|${place.id}|description`}
                  placeholder="Place description in English..."
                />

                <div>
                  <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                    URL de Google Maps
                  </label>
                  <input
                    type="url"
                    value={place.mapsUrl || ''}
                    onChange={(e) => updatePlace(index, 'mapsUrl', e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>
          );
        })}

        {placesData.length === 0 && (
          <div className="text-center py-8 text-[#71717A]">
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
      <h2 className="text-[26px] text-[#0A0A0A] mb-6" style={displayFont}>Mesa de Regalos</h2>
      
      {/* Habilitar mesa de regalos */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="gift-registry-enabled"
            checked={giftRegistryData.enabled}
            onChange={(e) => onChange('giftRegistry.enabled', e.target.checked)}
            className="h-4 w-4 accent-[#111111] border-[rgba(0,0,0,0.2)] rounded"
          />
          <label htmlFor="gift-registry-enabled" className="ml-2 block text-sm font-semibold text-[#0A0A0A]">
            Habilitar mesa de regalos
          </label>
        </div>

        {giftRegistryData.enabled && (
          <>
            {/* Mensaje bilingüe */}
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                  Mensaje para los invitados (Español)
                </label>
                <textarea
                  rows={3}
                  value={typeof giftRegistryData.message === 'object' ? giftRegistryData.message?.es || '' : giftRegistryData.message || ''}
                  onChange={(e) => {
                    const currentMessage = typeof giftRegistryData.message === 'object' ? giftRegistryData.message : { es: giftRegistryData.message || '', en: '' };
                    onChange('giftRegistry.message', { ...currentMessage, es: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
                  placeholder="Tu presencia es nuestro regalo más valioso, pero si deseas hacernos un obsequio, hemos preparado algunas opciones:"
                />
              </div>
              <EnField
                rows={3}
                size="sm"
                label="Mensaje para los invitados (English)"
                value={typeof giftRegistryData.message === 'object' ? giftRegistryData.message?.en || '' : ''}
                onChange={(v) => {
                  const currentMessage = typeof giftRegistryData.message === 'object' ? giftRegistryData.message : { es: giftRegistryData.message || '', en: '' };
                  onChange('giftRegistry.message', { ...currentMessage, en: v });
                }}
                source={typeof giftRegistryData.message === 'object' ? giftRegistryData.message?.es || '' : giftRegistryData.message || ''}
                metaKey="gifts|message"
                placeholder="Your presence is our most valuable gift, but if you wish to give us a present, we have prepared some options:"
              />
            </div>

            {/* Lista de registros */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-base font-bold text-[#0A0A0A]">Tiendas de Regalos</h3>
                <button
                  onClick={addRegistry}
                  className="bg-[#111111] text-white px-4 py-2 rounded-full hover:bg-black focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.15)] focus:ring-offset-2 transition-colors text-sm font-bold"
                >
                  + Agregar Tienda
                </button>
              </div>

              <div className="space-y-4">
                {(giftRegistryData.registries as {id: string; name?: string; url?: string; description?: string | { es: string; en: string }}[]).map((registry, index: number) => {
                  const descriptionEs = typeof registry.description === 'object' ? registry.description?.es || '' : registry.description || '';
                  const descriptionEn = typeof registry.description === 'object' ? registry.description?.en || '' : '';
                  
                  return (
                    <div key={registry.id} className="bg-[#FAFAFA] p-3 sm:p-4 lg:p-6 rounded-xl border border-[rgba(0,0,0,0.08)]">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <h4 className="text-base font-bold text-[#0A0A0A]">Tienda #{index + 1}</h4>
                        <button
                          onClick={() => removeRegistry(index)}
                          className="self-start sm:self-center text-[#B91C1C] hover:text-[#7F1D1D] text-sm font-semibold px-3 py-1 border border-[rgba(185,28,28,0.3)] rounded-full hover:bg-[rgba(185,28,28,0.06)] transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                            Nombre de la Tienda
                          </label>
                          <input
                            type="text"
                            value={registry.name || ''}
                            onChange={(e) => updateRegistry(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                            placeholder="Liverpool, El Palacio de Hierro, Amazon..."
                          />
                        </div>
                        <div>
                          <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                            URL de la Mesa de Regalos
                          </label>
                          <input
                            type="url"
                            value={registry.url || ''}
                            onChange={(e) => updateRegistry(index, 'url', e.target.value)}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                            placeholder="https://mesaderegalos.liverpool.com.mx/..."
                          />
                        </div>
                        
                        {/* Descripción en Español */}
                        <div className="md:col-span-2">
                          <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                            Descripción (Español)
                          </label>
                          <textarea
                            rows={2}
                            value={descriptionEs}
                            onChange={(e) => updateRegistry(index, 'description', { 
                              es: e.target.value, 
                              en: descriptionEn 
                            })}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                            placeholder="Mesa de regalos con todo lo que necesitamos para nuestro hogar"
                          />
                        </div>
                        
                        {/* Descripción en Inglés */}
                        <div className="md:col-span-2">
                          <EnField
                            rows={2}
                            size="sm"
                            label="Descripción (English)"
                            value={descriptionEn}
                            onChange={(v) => updateRegistry(index, 'description', { es: descriptionEs, en: v })}
                            source={descriptionEs}
                            metaKey={`registries|${registry.id}|description`}
                            placeholder="Gift registry with everything we need for our home"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {giftRegistryData.registries.length === 0 && (
                  <div className="text-center py-8 text-[#71717A]">
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
                  className="h-4 w-4 accent-[#111111] border-[rgba(0,0,0,0.2)] rounded"
                />
                <label htmlFor="bank-account-enabled" className="ml-2 block text-sm font-semibold text-[#0A0A0A]">
                  Agregar cuenta bancaria
                </label>
              </div>

              {!!giftRegistryData.bankAccount && (
                <div className="bg-[#FAFAFA] p-3 sm:p-4 lg:p-6 rounded-xl border border-[rgba(0,0,0,0.08)]">
                  <h4 className="text-base font-bold text-[#0A0A0A] mb-4">Información Bancaria</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                        Nombre del Banco
                      </label>
                      <input
                        type="text"
                        value={getSafeValue(giftRegistryData.bankAccount as Record<string, unknown>, 'bankName')}
                        onChange={(e) => updateBankAccount('bankName', e.target.value)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                        placeholder="Banco BBVA, Santander, Banorte..."
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                        Titular de la Cuenta
                      </label>
                      <input
                        type="text"
                        value={getSafeValue(giftRegistryData.bankAccount as Record<string, unknown>, 'accountName')}
                        onChange={(e) => updateBankAccount('accountName', e.target.value)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                        placeholder="Nombre completo del titular"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                        Número de Cuenta
                      </label>
                      <input
                        type="text"
                        value={getSafeValue(giftRegistryData.bankAccount as Record<string, unknown>, 'accountNumber')}
                        onChange={(e) => updateBankAccount('accountNumber', e.target.value)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                        CLABE Interbancaria
                      </label>
                      <input
                        type="text"
                        value={getSafeValue(giftRegistryData.bankAccount as Record<string, unknown>, 'clabe')}
                        onChange={(e) => updateBankAccount('clabe', e.target.value)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                        placeholder="012345678901234567"
                        maxLength={18}
                      />
                    </div>
                    {/* Descripción en Español */}
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
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
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                        placeholder="También puedes contribuir directamente a nuestra cuenta bancaria"
                      />
                    </div>
                    
                    {/* Descripción en Inglés */}
                    <div className="md:col-span-2">
                      <EnField
                        rows={2}
                        size="sm"
                        label="Descripción (English)"
                        value={(() => {
                          const description = (giftRegistryData.bankAccount as Record<string, unknown>)?.description;
                          return typeof description === 'object' && description ? (description as {es: string; en: string}).en || '' : '';
                        })()}
                        onChange={(v) => {
                          const bankAccount = giftRegistryData.bankAccount as Record<string, unknown>;
                          const currentDescription = typeof bankAccount?.description === 'object' ? bankAccount.description as {es: string; en: string} : { es: bankAccount?.description as string || '', en: '' };
                          updateBankAccount('description', { ...currentDescription, en: v });
                        }}
                        source={(() => {
                          const description = (giftRegistryData.bankAccount as Record<string, unknown>)?.description;
                          return typeof description === 'object' && description ? (description as {es: string; en: string}).es || '' : typeof description === 'string' ? description : '';
                        })()}
                        metaKey="bank|description"
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
      <h2 className="text-[26px] text-[#0A0A0A] mb-6" style={displayFont}>Redes Sociales</h2>
      
      {/* Hashtag de la boda */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-[15px] font-bold text-[#0A0A0A] border-b border-[rgba(0,0,0,0.08)] pb-2">Hashtag de la Boda</h3>
        <div>
          <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
            Hashtag Principal
          </label>
          <input
            type="text"
            value={getSafeValue(data, 'hashtag')}
            onChange={(e) => onChange('hashtag', e.target.value)}
            className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
            placeholder="#MariaYCarlos2025"
          />
          <p className="text-sm text-[#71717A] mt-2">
            Este hashtag aparecerá en la invitación para que los invitados lo usen en redes sociales
          </p>
        </div>
      </div>

      {/* Redes sociales de la pareja */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-[15px] font-bold text-[#0A0A0A] border-b border-[rgba(0,0,0,0.08)] pb-2">Redes Sociales de la Pareja</h3>
        
        {/* Instagram de la novia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Instagram de la Novia
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'bride.instagram')}
              onChange={(e) => onChange('bride.instagram', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="@maria_gonzalez"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Instagram del Novio
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'groom.instagram')}
              onChange={(e) => onChange('groom.instagram', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="@carlos_lopez"
            />
          </div>
        </div>

        {/* Facebook de la pareja */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Facebook de la Novia
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'bride.facebook')}
              onChange={(e) => onChange('bride.facebook', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="Maria Gonzalez"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
              Facebook del Novio
            </label>
            <input
              type="text"
              value={getSafeValue(data, 'groom.facebook')}
              onChange={(e) => onChange('groom.facebook', e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
              placeholder="Carlos Lopez"
            />
          </div>
        </div>
      </div>

      {/* Email de contacto */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-[15px] font-bold text-[#0A0A0A] border-b border-[rgba(0,0,0,0.08)] pb-2">Contacto</h3>
        <div>
          <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
            Email de la Pareja
          </label>
          <input
            type="email"
            value={getSafeValue(data, 'coupleEmail')}
            onChange={(e) => onChange('coupleEmail', e.target.value)}
            className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
            placeholder="maria.carlos@ejemplo.com"
          />
          <p className="text-sm text-[#71717A] mt-2">
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
      <h2 className="text-[26px] text-[#0A0A0A] mb-6" style={displayFont}>Solo adultos</h2>
      
      {/* Evento solo para adultos */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-[15px] font-bold text-[#0A0A0A] border-b border-[rgba(0,0,0,0.08)] pb-2">Evento Solo para Adultos</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="adult-only-enabled"
            checked={adultOnlyData.enabled}
            onChange={(e) => onChange('adultOnlyEvent.enabled', e.target.checked)}
            className="h-4 w-4 accent-[#111111] border-[rgba(0,0,0,0.2)] rounded"
          />
          <label htmlFor="adult-only-enabled" className="ml-2 block text-sm font-semibold text-[#0A0A0A]">
            Este evento es solo para adultos
          </label>
        </div>

        {adultOnlyData.enabled && (
          <div className="space-y-4">
            {/* Mensaje en Español */}
            <div>
              <label className="block text-[13px] font-semibold text-[#27272A] mb-2">
                Mensaje para los invitados (Español)
              </label>
              <textarea
                rows={4}
                value={typeof adultOnlyData.message === 'object' ? adultOnlyData.message?.es || '' : adultOnlyData.message || ''}
                onChange={(e) => {
                  const currentMessage = typeof adultOnlyData.message === 'object' ? adultOnlyData.message : { es: adultOnlyData.message || '', en: '' };
                  onChange('adultOnlyEvent.message', { ...currentMessage, es: e.target.value });
                }}
                className="w-full px-4 py-3 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
                placeholder="Aunque adoramos a los pequeños de la familia, hemos decidido que nuestra celebración sea solo para adultos. Esperamos que puedan acompañarnos en esta noche especial."
              />
            </div>
            
            {/* Mensaje en Inglés */}
            <EnField
                rows={4}
                label="Mensaje para los invitados (English)"
                value={typeof adultOnlyData.message === 'object' ? adultOnlyData.message?.en || '' : ''}
                onChange={(v) => {
                  const currentMessage = typeof adultOnlyData.message === 'object' ? adultOnlyData.message : { es: adultOnlyData.message || '', en: '' };
                  onChange('adultOnlyEvent.message', { ...currentMessage, en: v });
                }}
                source={typeof adultOnlyData.message === 'object' ? adultOnlyData.message?.es || '' : adultOnlyData.message || ''}
                metaKey="adults|message"
                placeholder="Although we adore the little ones in our family, we have decided that our celebration will be adults only. We hope you can join us for this special night."
              />
            
            <p className="text-sm text-[#71717A]">
              Este mensaje aparecerá en la invitación para informar a los invitados sobre la política de solo adultos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}