'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit2, Trash2, Save, X, Check, Link, MessageSquare, ChevronUp, ChevronDown, ArrowUpDown, Search, Users, Clock } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { saveWeddingDoc } from '../../../../../lib/weddingSave';
import { db } from '../../../../../lib/firebase';
import { guestService } from '../../../../../services/guestService';
import { FirebaseGuest, WeddingData, AccommodationOption, GiftRegistryItem } from '../../../../../src/types/wedding';
import { resolveHasEnglish } from '../../../../../lib/wedding-language';
import WeddingNotFound from '../../../../../components/WeddingNotFound';
import { AdminTopBar, AdminPageNav, AdminStatCard, AdminStatusPill, AdminButton, AdminCard, manrope, displayFont } from '../../../../../components/admin/ui';

interface GuestStats {
  total: number;
  totalGuestCount: number;
  totalConfirmedPersons: number;
  confirmed: number;
  declined: number;
  pending: number;
}

interface GuestFormData {
  name: string;
  email: string;
  phone: string;
  guestCount: number | string;
  language: 'es' | 'en';
  coupleMessage: string;
}

const AdminGuestsPage = () => {
  const params = useParams();
  const weddingId = params.weddingId as string;
  const locale = (params.locale as string) || 'es';

  const [guests, setGuests] = useState<FirebaseGuest[]>([]);
  const [stats, setStats] = useState<GuestStats>({ total: 0, totalGuestCount: 0, totalConfirmedPersons: 0, confirmed: 0, declined: 0, pending: 0 });
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<FirebaseGuest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'language' | 'status' | 'createdAt'>('createdAt');
  const hasEnglish = resolveHasEnglish(weddingData);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [formData, setFormData] = useState<GuestFormData>({
    name: '',
    email: '',
    phone: '',
    guestCount: 1,
    language: 'es',
    coupleMessage: ''
  });

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

  // Crear datos iniciales para nueva boda
  const createInitialWeddingData = (weddingId: string): WeddingData => ({
    id: weddingId,
    couple: {
      bride: { name: '', fullName: '', phone: '', email: '', instagram: '', facebook: '' },
      groom: { name: '', fullName: '', phone: '', email: '', instagram: '', facebook: '' },
      coupleEmail: '', hashtag: '', story: { es: '', en: '' }, quote: { es: '', en: '' }
    },
    event: {
      weddingId: weddingId, date: '', time: '16:00', rsvpDeadline: '',
      ceremony: { time: '16:00', duration: 45 }, reception: { time: '19:30', duration: 300 },
      ceremonyVenue: { name: { es: '', en: '' }, address: '', coordinates: { lat: 0, lng: 0 }, description: '', mapsUrl: '' },
      receptionVenue: { name: { es: '', en: '' }, address: '', coordinates: { lat: 0, lng: 0 }, description: '', mapsUrl: '', features: [] },
      dressCode: { style: { es: '', en: '' }, description: { es: '', en: '' }, recommendations: { ladies: [], gentlemen: [] }, colors: { recommended: [], avoid: [] } }
    },
    timeline: [], accommodation: { hotels: [], recommendedPlaces: [] },
    giftRegistry: { enabled: false, message: '', registries: [] },
    adultOnlyEvent: { enabled: false, message: '' },
    rsvp: { enabled: true, deadline: '', maxGuests: 2, dietaryOptions: true, customQuestions: [] },
    selectedGuestTickets: true, // Mantener funcionalidad de selección de boletos
    hasDiet: false, // Campo de restricción dietética
    hasInstagram: true, // Mostrar iconos de Instagram por defecto
    hasFacebook: true, // Mostrar iconos de Facebook por defecto
    showGuestsInput: true, // Mostrar campo de número de invitados por defecto
    showRecommendedPlaces: true, // Mostrar lugares recomendados por defecto
    showConfirmCta: true, // Mostrar botón de confirmación en Hero por defecto
    gallery: [], heroImage: { url: '', alt: '' }, specialMoments: [], relationshipStats: { yearsTogther: 0, adventures: 0, memories: 0, dreams: 0 },
    transport: { parking: false, valetParking: false, shuttleService: { available: false, pickupPoints: [], schedule: [] }, publicTransport: '', rideshare: false },
    music: { enabled: false, spotifyTrackId: '', spotifyPlaylistId: '', fileName: '', title: '', artist: '', autoplay: false, volume: 0.5, showControls: true, startTime: 0 },
    recommendedPlaces: { enabled: false, title: '', subtitle: '', places: [] },
    theme: { id: 'classic' }, status: 'draft', languages: ['es', 'en'], defaultLanguage: 'es', isActive: false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  });

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

  // Cargar invitados
  useEffect(() => {
    const loadGuests = async () => {
      if (!weddingId) {
        setError('ID de boda no proporcionado.');
        setIsLoading(false);
        return;
      }

      // Validar formato del ID
      if (!isValidWeddingId(weddingId)) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Verificar si la boda existe en Firebase
        const docRef = doc(db, 'weddings', weddingId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as WeddingData;
          
          // Verificar si la boda tiene información básica
          const hasBasicInfo = data.couple?.bride?.name || data.couple?.groom?.name || data.event?.date;
          
          if (hasBasicInfo) {
            // Tiene información, migrar datos si es necesario
            const migratedData = migrateWeddingData(data as unknown as Record<string, unknown>);
            await saveWeddingDoc(docRef, migratedData);
            setWeddingData(migratedData);
          } else {
            // Existe pero sin información, crear estructura base
            const initialData = createInitialWeddingData(weddingId);
            await saveWeddingDoc(docRef, initialData);
            setWeddingData(initialData);
          }
        } else {
          // No existe el documento en Firebase → 404
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        // Cargar invitados y estadísticas
        const [fetchedGuests, fetchedStats] = await Promise.all([
          guestService.getWeddingGuests(weddingId),
          guestService.getWeddingGuestStats(weddingId)
        ]);

        setGuests(fetchedGuests);
        setStats(fetchedStats);
        
        // Debug: verificar estados de invitados
        console.log('🔍 Debug - Invitados cargados:', fetchedGuests.map(g => ({
          name: g.name,
          rsvpStatus: g.rsvpStatus,
          hasConfirmation: !!g.rsvpConfirmation,
          attending: g.rsvpConfirmation?.attending
        })));

      } catch (err) {
        console.error('Error cargando invitados:', err);
        setError('Error al cargar los invitados. Intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadGuests();
  }, [weddingId]);

  // Manejar formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      guestCount: 1,
      language: 'es',
      coupleMessage: ''
    });
    setEditingGuest(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre es requerido.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const guestData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        // Si selectedGuestTickets es true, usar 1 por defecto, sino usar el valor del form
        guestCount: weddingData?.selectedGuestTickets ? 1 : Number(formData.guestCount),
        language: formData.language,
        coupleMessage: formData.coupleMessage.trim(),
        weddingId,
        // Solo establecer rsvpStatus como 'pending' si es un nuevo invitado
        rsvpStatus: editingGuest ? editingGuest.rsvpStatus : ('pending' as const),
        // Preservar la confirmación RSVP si existe
        rsvpConfirmation: editingGuest?.rsvpConfirmation,
        plusOneAllowed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingGuest) {
        await guestService.updateGuest(editingGuest.id, {
          ...guestData,
          updatedAt: new Date().toISOString()
        });
        
        // Actualizar el estado local con los nuevos datos
        setGuests(prev => prev.map(g => 
          g.id === editingGuest.id 
            ? { ...g, ...guestData, updatedAt: new Date().toISOString() }
            : g
        ));
      } else {
        const newGuestId = await guestService.createGuest(guestData);
        
        // Obtener el invitado completo recién creado
        const newGuest = await guestService.getGuest(newGuestId);
        
        if (newGuest) {
          // Actualizar la lista local de invitados
          setGuests(prev => [...prev, newGuest]);
          
          // Actualizar estadísticas
          setStats(prev => ({
            ...prev,
            total: prev.total + 1,
            totalGuestCount: prev.totalGuestCount + Number(formData.guestCount),
            pending: prev.pending + 1
          }));
        }
      }

      resetForm();
    } catch (err) {
      console.error('Error guardando invitado:', err);
      setError('Error al guardar el invitado. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (guest: FirebaseGuest) => {
    setFormData({
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      guestCount: guest.guestCount,
      language: guest.language,
      coupleMessage: guest.coupleMessage || ''
    });
    setEditingGuest(guest);
    setShowForm(true);
  };

  const handleDelete = async (guestId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este invitado?')) {
      return;
    }

    try {
      const guest = guests.find(g => g.id === guestId);
      await guestService.deleteGuest(guestId);
      
      setGuests(prev => prev.filter(g => g.id !== guestId));
      
      // Actualizar estadísticas
      if (guest) {
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          totalGuestCount: prev.totalGuestCount - guest.guestCount,
          [guest.rsvpStatus]: prev[guest.rsvpStatus] - 1
        }));
      }
    } catch (err) {
      console.error('Error eliminando invitado:', err);
      setError('Error al eliminar el invitado. Intenta de nuevo.');
    }
  };

  const handleCopyLink = async (guest: FirebaseGuest) => {
    try {
      const guestId = guest.guestId; // Usar el guestId correcto de Firebase
      
      // Usar el idioma del invitado para la URL
      const locale = guest.language || 'es';
      const invitationUrl = `${window.location.origin}/${locale}/wedding/${weddingId}?guest=${guestId}`;
      
      await navigator.clipboard.writeText(invitationUrl);
      setCopiedGuestId(guest.id);
      
      // Limpiar el estado después de 2 segundos
      setTimeout(() => {
        setCopiedGuestId(null);
      }, 2000);
      
    } catch (err) {
      console.error('Error copiando URL:', err);
      setError('Error al copiar la URL. Intenta de nuevo.');
    }
  };

  const handleShowMessage = (message: string) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const handleCloseModal = () => {
    setShowMessageModal(false);
    setSelectedMessage('');
  };

  const handleSort = (column: 'name' | 'language' | 'status') => {
    if (sortBy === column) {
      // Si ya está ordenando por esta columna, cambiar el orden
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es una nueva columna, establecer orden ascendente por defecto
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedGuests = guests.filter(guest => {
    const term = searchTerm.trim().toLowerCase();
    if (term && !guest.name.toLowerCase().includes(term) && !(guest.email || '').toLowerCase().includes(term)) {
      return false;
    }

    if (filterStatus === 'all') return true;

    // Usar lógica basada en rsvpConfirmation.attending
    if (filterStatus === 'confirmed') {
      return guest.rsvpConfirmation?.attending === true;
    } else if (filterStatus === 'declined') {
      return guest.rsvpConfirmation?.attending === false;
    } else if (filterStatus === 'pending') {
      return !guest.rsvpConfirmation || guest.rsvpConfirmation.attending === undefined;
    }

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'language') {
      comparison = a.language.localeCompare(b.language);
    } else if (sortBy === 'status') {
      // Ordenar por estado: Confirmado, Pendiente, Declinó
      const getStatusValue = (guest: FirebaseGuest) => {
        if (guest.rsvpConfirmation?.attending === true) return 1; // Confirmado
        if (guest.rsvpConfirmation?.attending === false) return 3; // Declinó
        return 2; // Pendiente
      };
      comparison = getStatusValue(a) - getStatusValue(b);
    } else if (sortBy === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[rgba(0,0,0,0.14)] border-t-[#111111] rounded-full mx-auto mb-4"></div>
          <p className="text-[#3F3F46]" style={manrope}>Cargando invitados...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <WeddingNotFound weddingId={weddingId} />;
  }

  if (error && !showForm) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center" style={manrope}>
        <div className="text-center py-12">
          <div className="text-6xl text-[#D4D4D8] mb-6">⚠</div>
          <h3 className="text-2xl text-[#0A0A0A] mb-3" style={displayFont}>Error</h3>
          <p className="text-[#3F3F46]">{error}</p>
        </div>
      </div>
    );
  }

  const filterChipClass = (active: boolean) =>
    `px-3.5 py-2 text-[13px] font-bold rounded-full border transition-colors ${
      active
        ? 'bg-[#111111] text-white border-[#111111]'
        : 'bg-[#FAFAFA] text-[#3F3F46] border-[rgba(0,0,0,0.1)] hover:bg-white'
    }`;

  return (
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
        {weddingId && <AdminPageNav weddingId={weddingId} locale={locale} active="guests" />}
      </div>

      <AdminTopBar
        title="Gestión de Invitados"
        actions={
          <AdminButton onClick={() => setShowForm(true)} disabled={isLoading}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Invitado</span>
            <span className="sm:hidden">Nuevo</span>
          </AdminButton>
        }
      />

      <div className="px-4 sm:px-10 py-8">

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <AdminStatCard icon={Users} label="Total invitaciones" value={stats.total} tone="ink" />
          <AdminStatCard icon={Check} label="Confirmadas" value={stats.confirmed} tone="success" />
          <AdminStatCard icon={Clock} label="Pendientes" value={stats.pending} tone="pending" />
          <AdminStatCard icon={Users} label="Personas invitadas" value={stats.totalGuestCount} tone="accent" />
          <AdminStatCard icon={Check} label="Personas confirmadas" value={stats.totalConfirmedPersons} tone="success" />
        </div>

        {/* Búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="h-4 w-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o email"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[rgba(0,0,0,0.14)] text-sm text-[#0A0A0A] bg-white focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterStatus('all')} className={filterChipClass(filterStatus === 'all')}>
              Todos ({stats.total})
            </button>
            <button onClick={() => setFilterStatus('confirmed')} className={filterChipClass(filterStatus === 'confirmed')}>
              Confirmados ({stats.confirmed})
            </button>
            <button onClick={() => setFilterStatus('pending')} className={filterChipClass(filterStatus === 'pending')}>
              Pendientes ({stats.pending})
            </button>
            <button onClick={() => setFilterStatus('declined')} className={filterChipClass(filterStatus === 'declined')}>
              No asisten ({stats.declined})
            </button>
          </div>
        </div>

        {/* Lista de invitados */}
        <AdminCard className="overflow-hidden">
          {/* Tabla — escritorio */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full divide-y divide-[rgba(0,0,0,0.08)]">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#71717A] uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 hover:text-[#0A0A0A] transition-colors text-xs font-bold text-[#71717A] uppercase tracking-wider"
                    >
                      <span>Invitado</span>
                      {sortBy === 'name' ? (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#71717A] uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#71717A] uppercase tracking-wider">
                    Personas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#71717A] uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 hover:text-[#0A0A0A] transition-colors text-xs font-bold text-[#71717A] uppercase tracking-wider"
                    >
                      <span>Estado</span>
                      {sortBy === 'status' ? (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </button>
                  </th>
                  {weddingData?.hasDiet && (
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#71717A] uppercase tracking-wider">
                      Restricción Dietética
                    </th>
                  )}
                  {hasEnglish && (
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#71717A] uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('language')}
                        className="flex items-center space-x-1 hover:text-[#0A0A0A] transition-colors text-xs font-bold text-[#71717A] uppercase tracking-wider"
                      >
                        <span>Idioma</span>
                        {sortBy === 'language' ? (
                          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </button>
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-bold text-[#71717A] uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[rgba(0,0,0,0.06)]">
                {filteredAndSortedGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#0A0A0A]">{guest.name}</div>
                      {guest.coupleMessage && (
                        <div className="text-sm text-[#71717A] truncate max-w-xs">
                          {guest.coupleMessage}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#0A0A0A]">{guest.email}</div>
                      <div className="text-sm text-[#71717A]">{guest.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0A0A0A]">
                      {weddingData?.selectedGuestTickets ? (
                        // Si selectedGuestTickets es true, mostrar el número seleccionado por el usuario o "Pendiente"
                        guest.rsvpConfirmation?.attending ?
                          (guest.rsvpConfirmation?.guestCount || 1) :
                          <span className="text-[#71717A] italic">Pendiente</span>
                      ) : (
                        // Comportamiento normal
                        guest.guestCount
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <AdminStatusPill
                          tone={
                            guest.rsvpConfirmation?.attending === true
                              ? 'confirmed'
                              : guest.rsvpConfirmation?.attending === false
                              ? 'declined'
                              : 'pending'
                          }
                        >
                          {guest.rsvpConfirmation?.attending === true ? 'Confirmado' :
                           guest.rsvpConfirmation?.attending === false ? 'Declinó' : 'Pendiente'}
                        </AdminStatusPill>
                        {guest.rsvpConfirmation?.message && (
                          <button
                            onClick={() => handleShowMessage(guest.rsvpConfirmation!.message!)}
                            className="p-1 hover:bg-[rgba(0,0,0,0.06)] rounded-full transition-colors"
                            title="Ver mensaje del invitado"
                          >
                            <MessageSquare className="h-4 w-4 text-[#111111]" />
                          </button>
                        )}
                      </div>
                    </td>
                    {weddingData?.hasDiet && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0A0A0A]">
                        {guest.rsvpConfirmation?.attending === true ? (
                          guest.rsvpConfirmation?.dietaryRestriction ? (
                            <span className="text-sm text-[#0A0A0A]">
                              {guest.rsvpConfirmation.dietaryRestriction === 'vegetarian' ? 'Vegetariano' :
                               guest.rsvpConfirmation.dietaryRestriction === 'glutenFree' ? 'Sin gluten' :
                               guest.rsvpConfirmation.dietaryRestriction === 'other' ? 'Otro' :
                               'Otro'}
                            </span>
                          ) : (
                            <span className="text-sm text-[#0A0A0A]">Otro</span>
                          )
                        ) : guest.rsvpConfirmation?.attending === false ? (
                          <span className="text-[#D4D4D8] italic">-</span>
                        ) : (
                          <span className="text-[#71717A] italic">Pendiente</span>
                        )}
                      </td>
                    )}
                    {hasEnglish && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0A0A0A]">
                      {guest.language === 'es' ? 'Español' : 'English'}
                    </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleCopyLink(guest)}
                          className="text-[#3F3F46] hover:text-[#111111] p-2 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                          title="Copiar enlace"
                        >
                          {copiedGuestId === guest.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Link className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(guest)}
                          className="text-[#3F3F46] hover:text-[#0A0A0A] p-2 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id)}
                          className="text-[#B91C1C] hover:text-[#7F1D1D] p-2 rounded-lg hover:bg-[rgba(185,28,28,0.06)] transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas — móvil */}
          <div className="md:hidden divide-y divide-[rgba(0,0,0,0.06)]">
            {filteredAndSortedGuests.map((guest) => (
              <div key={guest.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#0A0A0A] truncate">{guest.name}</div>
                    {guest.email && <div className="text-xs text-[#71717A] mt-1 truncate">{guest.email}</div>}
                    {guest.phone && <div className="text-xs text-[#71717A] truncate">{guest.phone}</div>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-none">
                    <AdminStatusPill
                      tone={
                        guest.rsvpConfirmation?.attending === true
                          ? 'confirmed'
                          : guest.rsvpConfirmation?.attending === false
                          ? 'declined'
                          : 'pending'
                      }
                    >
                      {guest.rsvpConfirmation?.attending === true ? 'Confirmado' :
                       guest.rsvpConfirmation?.attending === false ? 'Declinó' : 'Pendiente'}
                    </AdminStatusPill>
                    {guest.rsvpConfirmation?.message && (
                      <button
                        onClick={() => handleShowMessage(guest.rsvpConfirmation!.message!)}
                        className="p-1 hover:bg-[rgba(0,0,0,0.06)] rounded-full transition-colors flex-none"
                        title="Ver mensaje del invitado"
                      >
                        <MessageSquare className="h-4 w-4 text-[#111111]" />
                      </button>
                    )}
                  </div>
                </div>

                {guest.coupleMessage && (
                  <div className="text-xs text-[#71717A] mt-2 line-clamp-2">{guest.coupleMessage}</div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(0,0,0,0.06)]">
                  <div className="text-xs text-[#71717A]">
                    {(weddingData?.selectedGuestTickets
                      ? (guest.rsvpConfirmation?.attending ? (guest.rsvpConfirmation?.guestCount || 1) : 'Pendiente')
                      : guest.guestCount)}{' '}
                    {weddingData?.selectedGuestTickets && !guest.rsvpConfirmation?.attending ? '' : 'personas'}
                    {hasEnglish && <>{' · '}{guest.language === 'es' ? 'ES' : 'EN'}</>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyLink(guest)}
                      className="text-[#3F3F46] hover:text-[#111111] p-2 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                      title="Copiar enlace"
                    >
                      {copiedGuestId === guest.id ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(guest)}
                      className="text-[#3F3F46] hover:text-[#0A0A0A] p-2 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(guest.id)}
                      className="text-[#B91C1C] hover:text-[#7F1D1D] p-2 rounded-lg hover:bg-[rgba(185,28,28,0.06)] transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedGuests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-[#D4D4D8] text-4xl mb-4">👥</div>
              <h3 className="text-lg text-[#0A0A0A] mb-2" style={displayFont}>
                {filterStatus === 'all' && !searchTerm ? 'No hay invitados' : `No hay invitados ${
                  filterStatus === 'confirmed' ? 'confirmados' :
                  filterStatus === 'declined' ? 'que hayan declinado' :
                  filterStatus === 'pending' ? 'pendientes' : 'que coincidan'
                }`}
              </h3>
              <p className="text-[#3F3F46]">
                {filterStatus === 'all' && !searchTerm ? 'Agrega tu primer invitado para comenzar' : 'Cambia el filtro o la búsqueda para ver otros invitados'}
              </p>
            </div>
          )}
        </AdminCard>
      </div>

      {/* Modal del Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={manrope}>
          <div className="flex items-center justify-center min-h-screen pt-0 px-0 pb-0 text-center sm:pt-4 sm:px-4 sm:pb-20 sm:block sm:p-0">
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] transition-opacity" onClick={resetForm}></div>

            <div className="inline-block align-bottom bg-white w-full h-full sm:rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:h-auto">
              <form onSubmit={handleSubmit} className="h-full flex flex-col sm:h-auto sm:block">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-1 overflow-y-auto sm:flex-none sm:overflow-visible">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[22px] text-[#0A0A0A]" style={displayFont}>
                      {editingGuest ? 'Editar Invitado' : 'Nuevo Invitado'}
                    </h3>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-[#71717A] hover:text-[#0A0A0A] p-1 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
                        placeholder="Nombre del invitado"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
                        placeholder="+52 999 123 4567"
                      />
                    </div>

                    {/* Solo mostrar número de personas si selectedGuestTickets no está activo */}
                    {!weddingData?.selectedGuestTickets && (
                      <div>
                        <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">
                          Número de Personas
                        </label>
                        <input
                          type="number"
                          name="guestCount"
                          value={formData.guestCount}
                          onChange={handleInputChange}
                          min="1"
                          max="10"
                          className="w-full px-3.5 py-2.5 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
                        />
                      </div>
                    )}

                    {hasEnglish && (
                    <div>
                      <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">
                        Idioma de la Invitación
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    )}

                    <div>
                      <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">
                        Mensaje Personal (Opcional)
                      </label>
                      <textarea
                        name="coupleMessage"
                        value={formData.coupleMessage}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3.5 py-2.5 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
                        placeholder="Un mensaje especial para este invitado..."
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-[rgba(185,28,28,0.08)] border border-[rgba(185,28,28,0.3)] text-[#B91C1C] rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                </div>

                <div className="bg-[#FAFAFA] px-4 py-3 sm:px-6 flex flex-col sm:flex-row-reverse gap-3 sm:gap-3 flex-shrink-0">
                  <AdminButton type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {editingGuest ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editingGuest ? 'Actualizar' : 'Guardar'}
                      </>
                    )}
                  </AdminButton>
                  <AdminButton type="button" variant="ghost" onClick={resetForm} className="w-full sm:w-auto">
                    Cancelar
                  </AdminButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar mensaje del invitado */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] overflow-y-auto h-full w-full z-50" style={manrope}>
          <div className="relative top-20 mx-auto p-6 w-11/12 max-w-md shadow-xl rounded-xl bg-white">
            <div>
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[19px] text-[#0A0A0A]" style={displayFont}>
                  Mensaje del Invitado
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-[#71717A] hover:text-[#0A0A0A] p-1 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Contenido del mensaje */}
              <div className="mb-6">
                <div className="bg-[#FAFAFA] rounded-xl p-4 border-l-4 border-[#111111]">
                  <p className="text-[#27272A] leading-relaxed whitespace-pre-wrap">
                    &ldquo;{selectedMessage}&rdquo;
                  </p>
                </div>
              </div>

              {/* Footer del modal */}
              <div className="flex justify-end">
                <AdminButton onClick={handleCloseModal}>Cerrar</AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGuestsPage;