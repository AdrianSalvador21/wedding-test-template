'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Users, Plus, Edit2, Trash2, Save, X, UserPlus, Calendar, Copy, Check, Link, ChevronDown, ChevronUp } from 'lucide-react';
import { guestService } from '../../../../../services/guestService';
import { FirebaseGuest } from '../../../../../src/types/wedding';

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
  guestCount: number | string; // Permitir string temporalmente para edición
  language: 'es' | 'en';
  coupleMessage: string;
}

const AdminGuestsPage = () => {
  const params = useParams();
  const weddingId = params.weddingId as string;

  const [guests, setGuests] = useState<FirebaseGuest[]>([]);
  const [stats, setStats] = useState<GuestStats>({ total: 0, totalGuestCount: 0, confirmed: 0, declined: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<FirebaseGuest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<GuestFormData>({
    name: '',
    email: '',
    phone: '',
    guestCount: 1,
    language: 'es',
    coupleMessage: ''
  });

  // Obtener nombre de la boda más elegante
  const getWeddingTitle = (id: string) => {
    switch (id) {
      case 'friends-test':
        return 'Núriban & Juan';
      case 'maria-carlos-2025':
        return 'María & Carlos';
      default:
        return id.replace('-', ' & ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Cargar invitados
  useEffect(() => {
    const loadGuests = async () => {
      if (!weddingId) {
        setError('ID de boda no proporcionado.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

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
    } else if (name === 'guestCount') {
      // Permitir campo vacío temporalmente, pero almacenar como número
      const numValue = value === '' ? '' : parseInt(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Resetear formulario
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

  // Abrir formulario para editar
  const handleEdit = (guest: FirebaseGuest) => {
    setFormData({
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      guestCount: guest.guestCount,
      language: guest.language || 'es',
      coupleMessage: guest.coupleMessage || ''
    });
    setEditingGuest(guest);
    setShowForm(true);
  };

  // Guardar invitado
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    // Validar número de invitados
    const guestCount = typeof formData.guestCount === 'string' ? parseInt(formData.guestCount) : formData.guestCount;
    if (!guestCount || guestCount < 1 || guestCount > 10 || isNaN(guestCount)) {
      setError('El número de invitados debe ser un número válido entre 1 y 10');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingGuest) {
        // Actualizar invitado existente
        await guestService.updateGuest(editingGuest.id, {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          guestCount: guestCount,
          plusOneAllowed: false, // Siempre false ya que no aplica
          language: formData.language,
          coupleMessage: formData.coupleMessage.trim() || undefined
        });
      } else {
        // Crear nuevo invitado
        await guestService.createGuest({
          weddingId,
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          guestCount: guestCount,
          plusOneAllowed: false, // Siempre false ya que no aplica
          language: formData.language,
          coupleMessage: formData.coupleMessage.trim() || undefined,
          rsvpStatus: 'pending'
        });
      }

      // Recargar datos
      const [updatedGuests, updatedStats] = await Promise.all([
        guestService.getWeddingGuests(weddingId),
        guestService.getWeddingGuestStats(weddingId)
      ]);

      setGuests(updatedGuests);
      setStats(updatedStats);
      resetForm();

    } catch (err) {
      console.error('Error guardando invitado:', err);
      setError('Error al guardar el invitado. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar invitado
  const handleDelete = async (guestId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este invitado?')) {
      return;
    }

    try {
      await guestService.deleteGuest(guestId);
      
      // Recargar datos
      const [updatedGuests, updatedStats] = await Promise.all([
        guestService.getWeddingGuests(weddingId),
        guestService.getWeddingGuestStats(weddingId)
      ]);

      setGuests(updatedGuests);
      setStats(updatedStats);

    } catch (err) {
      console.error('Error eliminando invitado:', err);
      setError('Error al eliminar el invitado. Intenta de nuevo.');
    }
  };

  // Toggle expansión de card
  const toggleCardExpansion = (guestId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(guestId)) {
      newExpanded.delete(guestId);
    } else {
      newExpanded.add(guestId);
    }
    setExpandedCards(newExpanded);
  };

  // Copiar URL de invitación
  const handleCopyInvitationUrl = async (guest: FirebaseGuest) => {
    try {
      // Usar el guestId almacenado o generar uno si no existe
      let guestId = guest.guestId;
      if (!guestId) {
        const cleanName = guest.name.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        guestId = `${cleanName}-${guest.id.slice(-4)}`;
      }
      
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

  // Función temporal para reparar guestIds faltantes
  const handleFixGuestIds = async () => {
    try {
      setIsSubmitting(true);
      await guestService.fixMissingGuestIds(weddingId);
      
      // Recargar invitados
      const [updatedGuests, updatedStats] = await Promise.all([
        guestService.getWeddingGuests(weddingId),
        guestService.getWeddingGuestStats(weddingId)
      ]);

      setGuests(updatedGuests);
      setStats(updatedStats);
      
      alert('✅ GuestIds reparados exitosamente');
    } catch (err) {
      console.error('Error reparando guestIds:', err);
      setError('Error al reparar guestIds');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full mx-auto mb-4"></div>
          <p className="text-stone-600 font-light">Cargando invitados...</p>
        </div>
      </div>
    );
  }

  if (error && !showForm) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="text-6xl font-extralight text-stone-300 mb-6">⚠</div>
          <h3 className="text-2xl font-extralight text-stone-600 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Error
          </h3>
          <p className="text-stone-500 font-light">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header Minimalista y Elegante */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extralight text-stone-900 mb-4 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 5vw, 3.75rem)' }}>
              {getWeddingTitle(weddingId)}
            </h1>
            <div className="w-24 h-px bg-stone-300 mx-auto mb-6"></div>
            <p className="text-lg text-stone-600 font-light tracking-wide">
              Gestión de Invitados
            </p>
          </div>
          
          {/* Estadísticas Compactas */}
          <div className="mt-8 md:mt-16">
            {/* Móvil: Diseño en grid como la imagen */}
            <div className="md:hidden">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/30">
                <div className="grid grid-cols-2 gap-6">
                  {/* Invitados */}
                  <div className="text-center">
                    <div className="text-3xl font-light text-stone-900 mb-2">{stats.total}</div>
                    <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">INVITADOS</div>
                  </div>
                  
                  {/* Confirmados */}
                  <div className="text-center">
                    <div className="text-3xl font-light text-stone-900 mb-2">{stats.confirmed}</div>
                    <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">CONFIRMADOS</div>
                  </div>
                  
                  {/* Declinaron */}
                  <div className="text-center">
                    <div className="text-3xl font-light text-stone-900 mb-2">{stats.declined}</div>
                    <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">DECLINARON</div>
                  </div>
                  
                  {/* Pendientes */}
                  <div className="text-center">
                    <div className="text-3xl font-light text-stone-900 mb-2">{stats.pending}</div>
                    <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">PENDIENTES</div>
                  </div>
                </div>
                
                {/* Total Personas - Centrado abajo */}
                <div className="text-center mt-8 pt-6 border-t border-stone-100">
                  <div className="text-4xl font-light text-stone-900 mb-2">{stats.totalGuestCount}</div>
                  <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">TOTAL PERSONAS</div>
                </div>
              </div>
            </div>

            {/* Desktop: Diseño en grid como la imagen */}
            <div className="hidden md:block max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200/30">
                <div className="grid grid-cols-2 gap-12 mb-12">
                  {/* Invitados */}
                  <div className="text-center">
                    <div className="text-5xl font-light text-stone-900 mb-3">{stats.total}</div>
                    <div className="text-sm text-stone-500 uppercase tracking-wide font-medium">INVITADOS</div>
                  </div>
                  
                  {/* Confirmados */}
                  <div className="text-center">
                    <div className="text-5xl font-light text-stone-900 mb-3">{stats.confirmed}</div>
                    <div className="text-sm text-stone-500 uppercase tracking-wide font-medium">CONFIRMADOS</div>
                  </div>
                  
                  {/* Declinaron */}
                  <div className="text-center">
                    <div className="text-5xl font-light text-stone-900 mb-3">{stats.declined}</div>
                    <div className="text-sm text-stone-500 uppercase tracking-wide font-medium">DECLINARON</div>
                  </div>
                  
                  {/* Pendientes */}
                  <div className="text-center">
                    <div className="text-5xl font-light text-stone-900 mb-3">{stats.pending}</div>
                    <div className="text-sm text-stone-500 uppercase tracking-wide font-medium">PENDIENTES</div>
                  </div>
                </div>
                
                {/* Total Personas - Centrado abajo */}
                <div className="text-center pt-8 border-t border-stone-100">
                  <div className="text-6xl font-light text-stone-900 mb-3">{stats.totalGuestCount}</div>
                  <div className="text-sm text-stone-500 uppercase tracking-wide font-medium">TOTAL PERSONAS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles y Lista */}
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-12">
        {/* Header Elegante */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-3 px-6 py-3 bg-stone-900 text-white hover:bg-stone-800 transition-all duration-200 text-sm tracking-wide uppercase font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Nuevo Invitado
            </button>
          </div>
        </div>

        {/* Filtro Simple */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'confirmed' | 'declined' | 'pending')}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white text-stone-700 font-medium focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors"
            >
              <option value="all">Todos ({stats.total})</option>
              <option value="confirmed">Confirmados ({stats.confirmed})</option>
              <option value="declined">Declinaron ({stats.declined})</option>
              <option value="pending">Pendientes ({stats.pending})</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-xl border border-stone-200/60 p-8 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-light text-stone-900">
                {editingGuest ? 'Editar Invitado' : 'Nuevo Invitado'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-stone-600 font-medium mb-3">Nombre *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-0 border-b border-stone-300 bg-transparent focus:border-stone-900 focus:outline-none transition-colors text-stone-900 placeholder-stone-400"
                    placeholder="Nombre del invitado"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-stone-600 font-medium mb-3">Email (opcional)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-0 border-b border-stone-300 bg-transparent focus:border-stone-900 focus:outline-none transition-colors text-stone-900 placeholder-stone-400"
                      placeholder="email@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-medium mb-3">Teléfono (opcional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-0 border-b border-stone-300 bg-transparent focus:border-stone-900 focus:outline-none transition-colors text-stone-900 placeholder-stone-400"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-stone-600 font-medium mb-3">Número de Invitados *</label>
                    <input
                      type="number"
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      min="1"
                      required
                      placeholder="Ej: 2"
                      className="w-full px-4 py-3 border-0 border-b border-stone-300 bg-transparent focus:border-stone-900 focus:outline-none transition-colors text-stone-900 placeholder-stone-400"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-medium mb-3">Idioma de la Invitación</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-0 border-b border-stone-300 bg-transparent focus:border-stone-900 focus:outline-none transition-colors text-stone-900 appearance-none cursor-pointer"
                    >
                      <option value="es">🇪🇸 Español</option>
                      <option value="en">🇺🇸 English</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-3">Mensaje de los Novios (opcional)</label>
                <textarea
                  name="coupleMessage"
                  value={formData.coupleMessage}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors resize-none bg-stone-50/50"
                  placeholder="Mensaje personalizado para este invitado..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white hover:bg-stone-800 transition-colors text-sm tracking-wide uppercase font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-stone-700 border border-stone-300 hover:border-stone-900 hover:text-stone-900 transition-colors text-sm tracking-wide uppercase font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Invitados */}
        <div className="bg-white">
          {(() => {
            // Filtrar invitados según el estado seleccionado
            const filteredGuests = guests.filter(guest => {
              if (filterStatus === 'all') return true;
              return guest.rsvpStatus === filterStatus;
            });

            if (filteredGuests.length === 0) {
              return (
                <div className="text-center py-24">
              <div className="text-6xl font-extralight text-stone-300 mb-6">👥</div>
              <h3 className="text-2xl font-extralight text-stone-600 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {guests.length === 0 ? 'Sin invitados aún' : `Sin invitados ${filterStatus === 'confirmed' ? 'confirmados' : filterStatus === 'declined' ? 'que hayan declinado' : 'pendientes'}`}
              </h3>
              <p className="text-stone-400 font-light">
                {guests.length === 0 ? 'Comienza agregando tu primer invitado' : 'Prueba con otro filtro'}
              </p>
                </div>
              );
            }

            return (
              <div className="space-y-6 md:space-y-0">
                {filteredGuests.map((guest, index) => (
                <div 
                  key={guest.id} 
                  className={`
                    md:border-b md:border-stone-100 md:py-8 md:px-0 md:hover:bg-stone-50/50 transition-colors
                    relative bg-white border border-stone-200/60 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200
                    md:bg-transparent md:border-0 md:rounded-none md:p-0 md:shadow-none md:hover:shadow-none md:relative
                    ${index === 0 ? 'md:border-t' : ''}
                  `}
                >
                  {/* Badge de estado de confirmación */}
                  <div className={`absolute top-0 right-0 px-3 py-2 text-xs font-medium ${
                    guest.rsvpStatus === 'confirmed' 
                      ? 'bg-emerald-600 text-white' 
                      : guest.rsvpStatus === 'declined'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-600 text-white'
                  }`} style={{ borderBottomLeftRadius: '0.75rem' }}>
                    {guest.rsvpStatus === 'confirmed' ? '✓ Confirmado' : 
                     guest.rsvpStatus === 'declined' ? '✗ Declinó' : '⏳ Pendiente'}
                  </div>

                  {/* Diseño móvil (tarjetas) */}
                  <div className="block md:hidden">
                    {/* Header con nombre */}
                    <div className="mb-4 pr-24">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-light text-stone-900">{guest.name}</h3>
                        <button
                          onClick={() => toggleCardExpansion(guest.id)}
                          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all duration-200"
                          title={expandedCards.has(guest.id) ? "Contraer detalles" : "Expandir detalles"}
                        >
                          {expandedCards.has(guest.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="space-y-1">
                        {guest.email && (
                          <p className="text-stone-500 text-sm">{guest.email}</p>
                        )}
                        {guest.phone && (
                          <div className="flex items-center gap-3">
                            <p className="text-stone-500 text-sm">{guest.phone}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(guest)}
                                className="p-1.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-all duration-200"
                                title="Editar invitado"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(guest.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200"
                                title="Eliminar invitado"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                        {!guest.phone && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleEdit(guest)}
                              className="p-1.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-all duration-200"
                              title="Editar invitado"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(guest.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200"
                              title="Eliminar invitado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información en filas - Colapsable */}
                    {expandedCards.has(guest.id) && (
                      <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between py-4 border-b border-stone-100/80">
                        <span className="text-stone-600 font-medium">Invitados</span>
                        <span className="text-stone-700 text-sm font-medium">
                          {guest.guestCount} {guest.plusOneAllowed ? '(+1 permitido)' : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-stone-100/80">
                        <span className="text-stone-600 font-medium">Idioma</span>
                        <span className="text-stone-700 text-sm font-medium">
                          {guest.language === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-stone-100/80">
                        <span className="text-stone-600 font-medium">Creado</span>
                        <span className="text-stone-700 text-sm font-medium">
                          {new Date(guest.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>

                      {guest.coupleMessage && (
                        <div className="pt-5">
                          <div className="text-stone-600 font-medium mb-4">Mensaje de los Novios</div>
                          <div className="bg-stone-50/80 rounded-xl p-5 border border-stone-100">
                            <p className="text-stone-700 text-sm leading-relaxed font-light">"{guest.coupleMessage}"</p>
                          </div>
                        </div>
                      )}

                      {guest.rsvpConfirmation?.message && (
                        <div className="pt-5">
                          <div className="text-stone-600 font-medium mb-4">Mensaje del Invitado</div>
                          <div className="bg-stone-50/80 rounded-xl p-5 border border-stone-100">
                            <p className="text-stone-700 text-sm leading-relaxed font-light">"{guest.rsvpConfirmation.message}"</p>
                          </div>
                        </div>
                      )}
                      </div>
                    )}

                    {/* Acciones */}
                      <div className="pt-6 border-t border-stone-100">
                        <button
                          onClick={() => handleCopyInvitationUrl(guest)}
                          className={`w-full flex items-center justify-center gap-3 px-5 py-4 transition-all duration-200 text-sm rounded-xl font-medium shadow-sm ${
                            copiedGuestId === guest.id
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-100'
                              : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:shadow-md'
                          }`}
                        >
                          {copiedGuestId === guest.id ? (
                            <>
                              <Check className="w-5 h-5" />
                              ¡URL Copiada!
                            </>
                          ) : (
                            <>
                              <Link className="w-5 h-5" />
                              Copiar Invitación
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Diseño desktop (lista) */}
                  <div className="hidden md:flex md:items-start md:gap-8 lg:items-center lg:justify-between">
                    {/* Información del invitado */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-stone-900 mb-2">{guest.name}</h3>
                      <div className="space-y-1 mb-3">
                        {guest.email && (
                          <p className="text-stone-500 text-sm">{guest.email}</p>
                        )}
                        {guest.phone && (
                          <p className="text-stone-500 text-sm">{guest.phone}</p>
                        )}
                      </div>
                      {(guest.coupleMessage || guest.rsvpConfirmation?.message) && (
                        <div className="space-y-2">
                          {guest.coupleMessage && (
                            <p className="text-stone-600 italic text-sm max-w-md">
                              <span className="text-xs text-stone-500 uppercase tracking-wide font-medium">Novios:</span> "{guest.coupleMessage}"
                            </p>
                          )}
                          {guest.rsvpConfirmation?.message && (
                            <p className="text-stone-600 italic text-sm max-w-md">
                              <span className="text-xs text-stone-500 uppercase tracking-wide font-medium">Invitado:</span> "{guest.rsvpConfirmation.message}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Detalles y acciones */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                      {/* Invitados */}
                      <div className="text-center lg:text-left">
                        <div className="text-xs text-stone-400 uppercase tracking-widest mb-1">Invitados</div>
                        <div className="text-sm font-medium text-stone-700">
                          {guest.guestCount} {guest.plusOneAllowed ? '(+1)' : ''}
                        </div>
                      </div>

                      {/* Idioma */}
                      <div className="text-center lg:text-left">
                        <div className="text-xs text-stone-400 uppercase tracking-widest mb-1">Idioma</div>
                        <div className="text-sm font-medium text-stone-700">
                          {guest.language === 'en' ? '🇺🇸 EN' : '🇪🇸 ES'}
                        </div>
                      </div>

                      {/* Fecha */}
                      <div className="text-center lg:text-right">
                        <div className="text-xs text-stone-400 uppercase tracking-widest mb-1">Creado</div>
                        <div className="text-sm text-stone-600">
                          {new Date(guest.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyInvitationUrl(guest)}
                          className={`p-2 transition-colors ${
                            copiedGuestId === guest.id
                              ? 'text-emerald-600 hover:text-emerald-800'
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                          title="Copiar URL de invitación"
                        >
                          {copiedGuestId === guest.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Link className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(guest)}
                          className="p-2 text-stone-600 hover:text-stone-800 transition-colors"
                          title="Editar invitado"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          title="Eliminar invitado"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
        </div>

        {/* Resumen al final */}
        {guests.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-stone-500 font-light">
              {guests.length} invitados • {stats.totalGuestCount} personas en total
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGuestsPage;
