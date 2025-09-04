'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit2, Trash2, Save, X, Check, Link, MessageSquare } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';
import { guestService } from '../../../../../services/guestService';
import { FirebaseGuest, WeddingData, AccommodationOption, GiftRegistryItem } from '../../../../../src/types/wedding';
import WeddingNotFound from '../../../../../components/WeddingNotFound';

interface GuestStats {
  total: number;
  totalGuestCount: number;
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

  const [guests, setGuests] = useState<FirebaseGuest[]>([]);
  const [stats, setStats] = useState<GuestStats>({ total: 0, totalGuestCount: 0, confirmed: 0, declined: 0, pending: 0 });
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<FirebaseGuest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string>('');

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
            await setDoc(docRef, migratedData);
            setWeddingData(migratedData);
          } else {
            // Existe pero sin información, crear estructura base
            const initialData = createInitialWeddingData(weddingId);
            await setDoc(docRef, initialData);
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
        rsvpStatus: 'pending' as const,
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

  const filteredGuests = guests.filter(guest => {
    if (filterStatus === 'all') return true;
    return guest.rsvpStatus === filterStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-amber-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando invitados...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <WeddingNotFound weddingId={weddingId} />;
  }

  if (error && !showForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="text-6xl text-gray-300 mb-6">⚠</div>
          <h3 className="text-2xl text-gray-600 mb-3">Error</h3>
          <p className="text-gray-500">{error}</p>
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Gestión de Invitados</h1>
              
              {/* Métricas en el header */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-600">Total Invitados:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {stats.total}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-600">Confirmados:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {stats.confirmed}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-600">Pendientes:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {stats.pending}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-600">Total Personas:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {stats.totalGuestCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botón Nuevo Invitado en el header */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowForm(true)}
                disabled={isLoading}
                className="inline-flex items-center px-3 sm:px-4 py-2 bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Nuevo Invitado</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filterStatus === 'all' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('confirmed')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filterStatus === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Confirmados ({stats.confirmed})
              </button>
              <button
                onClick={() => setFilterStatus('declined')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filterStatus === 'declined' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Declinaron ({stats.declined})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filterStatus === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pendientes ({stats.pending})
              </button>
            </div>
          </div>
        </div>

        {/* Tabla Responsiva */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invitado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Personas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idioma
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                      {guest.coupleMessage && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {guest.coupleMessage}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.email}</div>
                      <div className="text-sm text-gray-500">{guest.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {weddingData?.selectedGuestTickets ? (
                        // Si selectedGuestTickets es true, mostrar el número seleccionado por el usuario o "Pendiente"
                        guest.rsvpConfirmation?.attending ? 
                          (guest.rsvpConfirmation?.guestCount || 1) : 
                          <span className="text-gray-500 italic">Pendiente</span>
                      ) : (
                        // Comportamiento normal
                        guest.guestCount
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          guest.rsvpStatus === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : guest.rsvpStatus === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {guest.rsvpStatus === 'confirmed' ? 'Confirmado' : 
                           guest.rsvpStatus === 'declined' ? 'Declinó' : 'Pendiente'}
                        </span>
                        {guest.rsvpConfirmation?.message && (
                          <button
                            onClick={() => handleShowMessage(guest.rsvpConfirmation!.message!)}
                            className="p-1 hover:bg-blue-50 rounded-full transition-colors"
                            title="Ver mensaje del invitado"
                          >
                            <MessageSquare className="h-4 w-4 text-blue-500 hover:text-blue-600" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.language === 'es' ? 'Español' : 'English'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleCopyLink(guest)}
                          className="text-amber-600 hover:text-amber-900 p-1"
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
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id)}
                          className="text-red-600 hover:text-red-900 p-1"
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

          {filteredGuests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filterStatus === 'all' ? 'No hay invitados' : `No hay invitados ${
                  filterStatus === 'confirmed' ? 'confirmados' :
                  filterStatus === 'declined' ? 'que hayan declinado' : 'pendientes'
                }`}
              </h3>
              <p className="text-gray-600">
                {filterStatus === 'all' ? 'Agrega tu primer invitado para comenzar' : 'Cambia el filtro para ver otros invitados'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal del Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-0 px-0 pb-0 text-center sm:pt-4 sm:px-4 sm:pb-20 sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetForm}></div>

            <div className="inline-block align-bottom bg-white w-full h-full sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:h-auto">
              <form onSubmit={handleSubmit} className="h-full flex flex-col sm:h-auto sm:block">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-1 overflow-y-auto sm:flex-none sm:overflow-visible">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingGuest ? 'Editar Invitado' : 'Nuevo Invitado'}
                    </h3>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Nombre del invitado"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="+52 999 123 4567"
                      />
                    </div>

                    {/* Solo mostrar número de personas si selectedGuestTickets no está activo */}
                    {!weddingData?.selectedGuestTickets && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de Personas
                        </label>
                        <input
                          type="number"
                          name="guestCount"
                          value={formData.guestCount}
                          onChange={handleInputChange}
                          min="1"
                          max="10"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Idioma de la Invitación
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje Personal (Opcional)
                      </label>
                      <textarea
                        name="coupleMessage"
                        value={formData.coupleMessage}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Un mensaje especial para este invitado..."
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row-reverse gap-3 sm:gap-0 flex-shrink-0">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        {editingGuest ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingGuest ? 'Actualizar' : 'Guardar'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar mensaje del invitado */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Mensaje del Invitado
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Contenido del mensaje */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    &ldquo;{selectedMessage}&rdquo;
                  </p>
                </div>
              </div>
              
              {/* Footer del modal */}
              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGuestsPage;