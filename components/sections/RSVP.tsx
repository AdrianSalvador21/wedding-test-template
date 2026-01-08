'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, ChevronDown } from 'lucide-react';
import { useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { RSVPIcon } from '../icons';

import { guestService } from '../../services/guestService';
import { FirebaseRSVP, FirebaseGuest } from '../../src/types/wedding';

const RSVPContent = () => {
  const { t } = useTranslations('rsvp');
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();
  const searchParams = useSearchParams();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingRSVP, setExistingRSVP] = useState<FirebaseRSVP | null>(null);
  const [guestInfo, setGuestInfo] = useState<FirebaseGuest | null>(null);

  // Obtener parámetros de la URL
  const params = useParams();
  const currentLocale = params.locale as string;
  const guestId = searchParams.get('guest');
  const weddingId = weddingData?.id || 'friends-test';

  // Datos dinámicos con fallbacks
  const receptionVenue = weddingData?.event.receptionVenue;
  const venueName = typeof receptionVenue?.name === 'object' && receptionVenue.name
    ? (receptionVenue.name[currentLocale as 'es' | 'en'] || receptionVenue.name.es || '')
    : (receptionVenue?.name as unknown as string || t('eventInfo.venue'));
  const weddingDate = weddingData?.event.date ? new Date(weddingData.event.date) : new Date('2025-11-21T16:00:00');

  // Formatear fecha y hora
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Cargar confirmación RSVP existente al montar el componente
  useEffect(() => {
    const loadExistingRSVP = async () => {
      if (!guestId) {
        setError('Not available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Buscar el invitado y verificar si ya tiene confirmación
        const guest = await guestService.getGuestByGuestId(guestId, weddingId);
        
        if (guest) {
          setGuestInfo(guest); // Guardar información del invitado
        }
        
        if (guest && guest.rsvpConfirmation) {
          // Convertir la confirmación del invitado al formato RSVP para compatibilidad
          const rsvpData: FirebaseRSVP = {
            id: guest.id,
            weddingId: guest.weddingId,
            guestId: guest.guestId || guestId,
            guestName: guest.name,
            guestEmail: guest.rsvpConfirmation.guestEmail || '',
            attending: guest.rsvpConfirmation.attending,
            guestCount: guest.guestCount,
            message: guest.rsvpConfirmation.message,
            dietaryRestrictions: guest.rsvpConfirmation.dietaryRestrictions,
            plusOne: guest.rsvpConfirmation.plusOne,
            submittedAt: guest.rsvpConfirmation.submittedAt,
            updatedAt: guest.updatedAt
          };
          
          setExistingRSVP(rsvpData);
          setIsSubmitted(true);
        }

      } catch (err) {
        console.error('Error verificando RSVP existente:', err);
        // No mostrar error aquí, solo log - el invitado puede confirmar por primera vez
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingRSVP();
  }, [guestId, weddingId]);

  // Schema de validación dinámico - si el invitado existe, no requerir nombre ni email
  const rsvpSchema = z.object({
    name: guestInfo ? z.string().optional() : z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: guestInfo ? z.string().optional() : z.string().email('Email inválido').optional().or(z.literal('')),
    attendance: z.enum(['yes', 'no'], {
      required_error: t('form.selectOption')
    }),
    guestCount: weddingData?.selectedGuestTickets ? z.enum(['1', '2']) : z.string().optional(),
    plusOneName: z.string().optional(),
    plusOneAttendance: z.enum(['yes', 'no']).optional(),
    dietaryRestrictions: z.string().optional(),
    dietaryRestriction: weddingData?.hasDiet ? z.enum(['vegetarian', 'glutenFree', 'other'], {
      required_error: t('form.selectOption')
    }) : z.string().optional(),
    message: z.string().optional(),
  });

  type RSVPFormData = z.infer<typeof rsvpSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    mode: 'onChange'
  });

  // Pre-llenar el formulario si ya existe una confirmación
  useEffect(() => {
    if (existingRSVP) {
      setValue('name', existingRSVP.guestName);
      setValue('email', existingRSVP.guestEmail || '');
      setValue('attendance', existingRSVP.attending ? 'yes' : 'no');
      setValue('message', existingRSVP.message || '');
      setValue('dietaryRestrictions', existingRSVP.dietaryRestrictions || '');
      setValue('dietaryRestriction', existingRSVP.dietaryRestriction || '');
      
      if (existingRSVP.plusOne) {
        setValue('plusOneAttendance', existingRSVP.plusOne.attending ? 'yes' : 'no');
        setValue('plusOneName', existingRSVP.plusOne.name || '');
      }
    }
  }, [existingRSVP, setValue]);

  const onSubmit = async (data: RSVPFormData) => {
    if (!guestId) {
      setError('ID de invitado no disponible');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Obtener información del invitado para el guestCount
      let guestCount = 1; // Default
      let targetGuest = guestInfo; // Usar la información ya cargada
      
      // Si no tenemos información del invitado cargada, intentar obtenerla
      if (!targetGuest) {
        try {
          // Primero intentar por guestId
          targetGuest = await guestService.getGuestByGuestId(guestId, weddingId);
          
          // Si no encuentra por guestId, buscar por nombre (fallback)
          if (!targetGuest && data.name) {
            const allGuests = await guestService.getWeddingGuests(weddingId);
            targetGuest = allGuests.find(g => 
              g.name.toLowerCase().trim() === data.name!.toLowerCase().trim()
            ) || null;
          }
        } catch {
          console.warn('No se pudo obtener información del invitado, usando guestCount por defecto');
        }
      }

      // Determinar el guestCount a usar
      if (weddingData?.selectedGuestTickets && data.guestCount) {
        guestCount = parseInt(data.guestCount);
      }

      // Preparar datos de confirmación RSVP
      const rsvpConfirmation = {
        attending: data.attendance === 'yes',
        guestCount: weddingData?.selectedGuestTickets && data.guestCount ? parseInt(data.guestCount) : undefined,
        guestEmail: data.email || undefined,
        message: data.message?.trim() || undefined,
        dietaryRestrictions: data.dietaryRestrictions?.trim() || undefined,
        dietaryRestriction: data.dietaryRestriction?.trim() || undefined,
        plusOne: data.plusOneAttendance ? {
          attending: data.plusOneAttendance === 'yes',
          name: data.plusOneName?.trim() || undefined
        } : undefined,
        submittedAt: new Date().toISOString()
      };

      // Limpiar campos undefined
      Object.keys(rsvpConfirmation).forEach(key => {
        if (rsvpConfirmation[key as keyof typeof rsvpConfirmation] === undefined) {
          delete rsvpConfirmation[key as keyof typeof rsvpConfirmation];
        }
      });

      // Actualizar el invitado con la confirmación RSVP
      const rsvpStatus = data.attendance === 'yes' ? 'confirmed' : 'declined';
      
      if (targetGuest) {
        guestCount = targetGuest.guestCount;
      }
      
      if (!targetGuest && data.name) {
        // Si no encontramos el invitado por guestId, buscar por nombre
        const allGuests = await guestService.getWeddingGuests(weddingId);
        targetGuest = allGuests.find(g => 
          g.name.toLowerCase().trim() === data.name!.toLowerCase().trim()
        ) || null;
      }
      
      if (targetGuest) {
        console.log('🔍 Actualizando invitado:', {
          id: targetGuest.id,
          name: targetGuest.name,
          currentStatus: targetGuest.rsvpStatus,
          newStatus: rsvpStatus,
          confirmation: rsvpConfirmation
        });
        
        await guestService.updateGuest(targetGuest.id, {
          rsvpStatus,
          rsvpConfirmation
        });
        
        console.log('✅ Invitado actualizado correctamente');
      } else {
        console.warn('⚠️ No se encontró el invitado para actualizar la confirmación');
      }
      
      console.log('✅ RSVP guardado exitosamente:', {
        weddingId,
        guestId,
        attending: data.attendance === 'yes',
        rsvpStatus
      });
      
      // Actualizar estado local para mostrar confirmación
      setExistingRSVP({
        id: 'guest-rsvp',
        weddingId,
        guestId,
        guestName: targetGuest?.name || data.name || '',
        guestEmail: data.email || targetGuest?.email || '',
        attending: data.attendance === 'yes',
        guestCount,
        message: data.message?.trim(),
        dietaryRestrictions: data.dietaryRestrictions?.trim(),
        dietaryRestriction: data.dietaryRestriction?.trim(),
        plusOne: rsvpConfirmation.plusOne,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setIsSubmitted(true);
      
    } catch (err) {
      console.error('❌ Error guardando RSVP:', err);
      setError('Error al guardar la confirmación. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estado de carga
  if (isLoading) {
    return (
      <section 
        id="rsvp" 
        className="bg-gray-50 relative overflow-hidden"
        style={getBackgroundStyle(3, '160px')}
      >
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <RSVPIcon 
                size={28} 
                className="text-accent mr-3 opacity-80" 
              />
              <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
            </div>
            <div className="title-decorative-line mb-6"></div>
          </div>

          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="animate-spin w-8 h-8 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-text font-body">Cargando información del invitado...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Estado de error
  if (error) {
    return (
      <section 
        id="rsvp" 
        className="bg-gray-50 relative overflow-hidden"
        style={getBackgroundStyle(3, '160px')}
      >
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <RSVPIcon 
                size={28} 
                className="text-accent mr-3 opacity-80" 
              />
              <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
            </div>
            <div className="title-decorative-line mb-6"></div>
          </div>

          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <p className="text-text font-body mb-6">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors font-body font-medium"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isSubmitted) {
    return (
      <section 
        id="rsvp" 
        className="bg-gray-50 relative overflow-hidden"
        style={getBackgroundStyle(3, '160px')}
      >
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
          {/* Título */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <RSVPIcon 
                size={28} 
                className="text-accent mr-3 opacity-80" 
              />
              <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
            </div>
            <div className="title-decorative-line mb-6"></div>
            <p className="section-subtitle font-body">
              {t('description')}
            </p>
          </div>

          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-blockquote font-semibold text-primary mb-4">
                {existingRSVP?.attending ? t('confirmation.received') : t('confirmation.registered')}
              </h2>
              <p className="text-text font-body mb-4">
                {existingRSVP?.attending 
                  ? t('confirmation.seeYouThere').replace('{date}', formatDate(weddingDate)).replace('{venue}', venueName)
                  : t('confirmation.sorryToMiss')
                }
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section 
        id="rsvp"
        className="bg-gray-50 relative overflow-hidden"
        style={getBackgroundStyle(3, '160px')}
              >
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
          {/* Título */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <RSVPIcon 
                size={28} 
                className="text-accent mr-3 opacity-80" 
              />
              <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
            </div>
            <div className="title-decorative-line mb-6"></div>
            <p className="section-subtitle font-body">
              {t('description')}
            </p>
          </div>

          <div className="max-w-lg mx-auto space-y-8">
            {/* Formulario */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nombre - Solo mostrar si NO hay información del invitado */}
                {!guestInfo && (
                  <div>
                    <label className="block text-sm font-body font-medium text-dark mb-2">
                      {t('form.name')} *
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors font-body"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm font-body mt-1">{errors.name.message}</p>
                    )}
                  </div>
                )}

                {/* Email - Solo mostrar si NO hay información del invitado */}
                {!guestInfo && (
                  <div>
                    <label className="block text-sm font-body font-medium text-dark mb-2">
                      {t('form.email')} (opcional)
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors font-body"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm font-body mt-1">{errors.email.message}</p>
                    )}
                  </div>
                )}

                {/* Asistencia */}
                <div>
                  <label className="block text-sm font-body font-medium text-dark mb-2">
                    {t('form.attendance')} *
                  </label>
                  <div className="relative">
                    <select
                      {...register('attendance')}
                      className="w-full px-4 py-3 pr-10 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors bg-white appearance-none font-body"
                    >
                      <option value=""></option>
                      <option value="yes">{t('form.attendanceOptions.yes')}</option>
                      <option value="no">{t('form.attendanceOptions.no')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.attendance && (
                    <p className="text-red-500 text-sm font-body mt-1">{t('form.selectOption')}</p>
                  )}
                </div>

                {/* Número de invitados - Solo mostrar si selectedGuestTickets está activo */}
                {weddingData?.selectedGuestTickets && (
                  <div>
                    <label className="block text-sm font-body font-medium text-dark mb-2">
                      {t('form.guestCount')} *
                    </label>
                    <div className="relative">
                      <select
                        {...register('guestCount')}
                        disabled={watch('attendance') === 'no'}
                        className="w-full px-4 py-3 pr-10 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors bg-white appearance-none font-body disabled:bg-gray-100 disabled:text-gray-500"
                        defaultValue="1"
                      >
                        <option value="1">{t('form.guestCountOptions.1')}</option>
                        <option value="2">{t('form.guestCountOptions.2')}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.guestCount && (
                      <p className="text-red-500 text-sm font-body mt-1">{t('form.selectOption')}</p>
                    )}
                    {/* Disclaimer sobre más boletos */}
                    <p className="text-xs text-gray-600 mt-2 font-body">
                      {t('form.guestCountDisclaimer')}
                    </p>
                  </div>
                )}

                {/* Restricción dietética - Solo mostrar si hasDiet está activo */}
                {weddingData?.hasDiet && (
                  <div>
                    <label className="block text-sm font-body font-medium text-dark mb-2">
                      {t('form.dietaryRestriction')} *
                    </label>
                    <div className="relative">
                      <select
                        {...register('dietaryRestriction')}
                        disabled={watch('attendance') === 'no'}
                        className="w-full px-4 py-3 pr-10 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors bg-white appearance-none font-body disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        <option value=""></option>
                        <option value="vegetarian">{t('form.dietaryOptions.vegetarian')}</option>
                        <option value="glutenFree">{t('form.dietaryOptions.glutenFree')}</option>
                        <option value="other">{t('form.dietaryOptions.other')}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.dietaryRestriction && (
                      <p className="text-red-500 text-sm font-body mt-1">{t('form.selectOption')}</p>
                    )}
                  </div>
                )}

                {/* Mensaje para los novios */}
                <div>
                  <label className="block text-sm font-body font-medium text-dark mb-2">
                    {t('form.messageForCouple')}
                  </label>
                  <textarea
                    {...register('message')}
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none font-body"
                    placeholder=""
                  />
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-accent text-accent hover:text-accent-dark hover:border-accent-dark font-body font-medium py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-accent border-t-transparent rounded-full animate-spin" />
                      <span className="font-body">{t('form.submitting')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span className="font-body">{t('form.submit')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>


          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <section id="rsvp" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded-2xl" />
                <div className="h-96 bg-gray-200 rounded-2xl" />
              </div>
              <div className="h-96 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Versión para desktop con animaciones
  return (
    <section 
      id="rsvp" 
      className="bg-gray-50 relative overflow-hidden"
      style={getBackgroundStyle(3, '160px')}
          >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-12 animation-delay-200">
            <div className="flex items-center justify-center mb-6">
              <RSVPIcon 
                size={28} 
                className="text-accent mr-3 opacity-80" 
              />
              <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
            </div>
            <div className="title-decorative-line mb-6"></div>
            <p className="section-subtitle font-body">
              {t('description')}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Formulario */}
            <div className="animation-delay-600">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-body font-medium text-dark mb-2">
                        {t('form.name')} *
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors font-body"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm font-body mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-body font-medium text-dark mb-2">
                        {t('form.email')} (opcional)
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors font-body"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm font-body mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Asistencia */}
                    <div>
                      <label className="block text-sm font-body font-medium text-dark mb-2">
                        {t('form.attendance')} *
                      </label>
                      <div className="relative">
                        <select
                          {...register('attendance')}
                          className="w-full px-4 py-3 pr-10 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors bg-white appearance-none font-body"
                        >
                          <option value=""></option>
                          <option value="yes">{t('form.attendanceOptions.yes')}</option>
                          <option value="no">{t('form.attendanceOptions.no')}</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.attendance && (
                        <p className="text-red-500 text-sm font-body mt-1">{t('form.selectOption')}</p>
                      )}
                    </div>

                    {/* Número de invitados - Solo mostrar si selectedGuestTickets está activo */}
                    {weddingData?.selectedGuestTickets && (
                      <div>
                        <label className="block text-sm font-body font-medium text-dark mb-2">
                          {t('form.guestCount')} *
                        </label>
                        <div className="relative">
                          <select
                            {...register('guestCount')}
                            disabled={watch('attendance') === 'no'}
                            className="w-full px-4 py-3 pr-10 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors bg-white appearance-none font-body disabled:bg-gray-100 disabled:text-gray-500"
                            defaultValue="1"
                          >
                            <option value="1">{t('form.guestCountOptions.1')}</option>
                            <option value="2">{t('form.guestCountOptions.2')}</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.guestCount && (
                          <p className="text-red-500 text-sm font-body mt-1">{t('form.selectOption')}</p>
                        )}
                        {/* Disclaimer sobre más boletos */}
                        <p className="text-xs text-gray-600 mt-2 font-body">
                          {t('form.guestCountDisclaimer')}
                        </p>
                      </div>
                    )}

                    {/* Mensaje para los novios */}
                    <div>
                      <label className="block text-sm font-body font-medium text-dark mb-2">
                        {t('form.messageForCouple')}
                      </label>
                      <textarea
                        {...register('message')}
                        rows={4}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none font-body"
                        placeholder=""
                      />
                    </div>

                    {/* Botón de envío */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-transparent border-accent text-accent hover:text-accent-dark hover:border-accent-dark font-body font-medium py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-6 h-6 border-accent border-t-transparent rounded-full animate-spin" />
                          <span className="font-body">{t('form.submitting')}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6" />
                          <span className="font-body">{t('form.submit')}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
};

const RSVP = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-stone-300 border-t-stone-900 rounded-full"></div>
      </div>
    }>
      <RSVPContent />
    </Suspense>
  );
};

export default RSVP; 