'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Calendar, Clock, MapPin, Shirt, Send, Check } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';

const RSVP = () => {
  const { t } = useTranslations('rsvp');
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Datos dinámicos con fallbacks
  const venue = weddingData?.event.venue;
  const venueName = venue?.name || t('eventInfo.venue');
  const venueAddress = venue?.address || t('eventInfo.address');
  const weddingDate = weddingData?.event.date ? new Date(weddingData.event.date) : new Date('2025-11-21T16:00:00');
  const eventTime = weddingData?.event.time || '16:00';
  const dressCodeStyle = weddingData?.event.dressCode?.style || t('eventInfo.dressCode');
  const rsvpDeadline = weddingData?.event.rsvpDeadline ? new Date(weddingData.event.rsvpDeadline) : new Date('2025-10-15T23:59:59');
  const coupleEmail = weddingData?.couple.coupleEmail || 'pareja@email.com';

  // Formatear fecha y hora
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Schema de validación usando traducciones donde sea posible
  const rsvpSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
    attendance: z.enum(['yes', 'no']),
    guests: z.number().min(0).max(5),
    guestNames: z.string().optional(),
    dietaryRestrictions: z.string().optional(),
    song: z.string().optional(),
    message: z.string().optional(),
  });

  type RSVPFormData = z.infer<typeof rsvpSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      attendance: 'yes',
      guests: 0
    }
  });

  const attendance = watch('attendance');
  const guestCount = watch('guests');

  const onSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true);
    
    // Simular envío de formulario con datos dinámicos
    const rsvpData = {
      ...data,
      weddingId: weddingData?.id || 'default',
      eventDate: weddingDate.toISOString(),
      venue: venueName
    };
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('RSVP Data:', rsvpData);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="py-12 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
                {t('success')}
              </h2>
              <p className="text-text">
                ¡Nos vemos el {formatDate(weddingDate)} en {venueName}!
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
      <section className="py-12 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <p className="section-subtitle">
              {t('description')}
            </p>
            
            {/* Ornamento */}
            <div className="flex items-center justify-center mt-8 mb-12">
              <div className="w-16 h-px bg-accent" />
              <Heart className="mx-4 w-6 h-6 text-accent" />
              <div className="w-16 h-px bg-accent" />
            </div>
          </div>

          <div className="max-w-lg mx-auto space-y-8">
            {/* Información del evento */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-heading font-semibold text-primary mb-4 text-center">
                {t('eventInfo.title')}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-accent mr-3" />
                  <span className="text-text">{formatDate(weddingDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-accent mr-3" />
                  <span className="text-text">{formatTime(eventTime)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-accent mr-3" />
                  <div>
                    <div className="text-text">{venueName}</div>
                    <div className="text-sm text-text opacity-70">{venueAddress}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Shirt className="w-5 h-5 text-accent mr-3" />
                  <span className="text-text">{dressCodeStyle}</span>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    {t('form.name')} *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    {t('form.email')} *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    {t('form.phone')} *
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Asistencia */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-3">
                    {t('form.attendance')} *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        {...register('attendance')}
                        type="radio"
                        value="yes"
                        className="w-4 h-4 text-accent focus:ring-accent"
                      />
                      <span className="ml-3 text-text">{t('form.attendanceOptions.yes')}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        {...register('attendance')}
                        type="radio"
                        value="no"
                        className="w-4 h-4 text-accent focus:ring-accent"
                      />
                      <span className="ml-3 text-text">{t('form.attendanceOptions.no')}</span>
                    </label>
                  </div>
                </div>

                {/* Acompañantes (solo si asiste) */}
                {attendance === 'yes' && (
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      {t('form.guests')}
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        {...register('guests', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        max="5"
                        className="w-24 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-colors text-center"
                      />
                      <span className="text-text text-sm">{t('form.guestsHelp')}</span>
                    </div>
                  </div>
                )}

                {/* Nombres de acompañantes */}
                {attendance === 'yes' && guestCount > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      {t('form.guestNames')}
                    </label>
                    <textarea
                      {...register('guestNames')}
                      rows={3}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
                      placeholder={t('form.guestNamesPlaceholder')}
                    />
                  </div>
                )}

                {/* Restricciones alimentarias */}
                {attendance === 'yes' && (
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      {t('form.dietary')}
                    </label>
                    <textarea
                      {...register('dietaryRestrictions')}
                      rows={2}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
                      placeholder={t('form.dietaryPlaceholder')}
                    />
                  </div>
                )}

                {/* Canción especial */}
                {attendance === 'yes' && (
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      {t('form.song')}
                    </label>
                    <input
                      {...register('song')}
                      type="text"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                      placeholder={t('form.songPlaceholder')}
                    />
                  </div>
                )}

                {/* Mensaje especial */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    {t('form.message')}
                  </label>
                  <textarea
                    {...register('message')}
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
                    placeholder={t('form.messagePlaceholder')}
                  />
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-primary text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('form.submitting')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{t('form.submit')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-br from-light to-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-heading font-semibold text-primary mb-3 text-center">
                {t('additionalInfo.title')}
              </h3>
              <div className="space-y-2 text-center text-text text-sm">
                <p>{t('additionalInfo.deadline')}: {formatDate(rsvpDeadline)}</p>
                <p>{t('additionalInfo.questions')}: {coupleEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <section id="rsvp" className="py-12 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
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
    <section id="rsvp" className="py-12 bg-gradient-to-br from-light via-white to-light">
      <div className="section-container">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-16 animation-delay-200">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
            <p className="section-subtitle">
              {t('description')}
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* Información del evento */}
              <div className="space-y-8 animation-delay-400">
                
                {/* Detalles del evento */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-2xl font-heading font-semibold text-primary mb-6 text-center">
                    {t('eventInfo.title')}
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center p-4 bg-light rounded-xl">
                      <Calendar className="w-6 h-6 text-accent mr-4" />
                      <div>
                        <div className="font-medium text-dark">{formatDate(weddingDate)}</div>
                        <div className="text-sm text-text opacity-70">{t('eventInfo.dateLabel')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-light rounded-xl">
                      <Clock className="w-6 h-6 text-accent mr-4" />
                      <div>
                        <div className="font-medium text-dark">{formatTime(eventTime)}</div>
                        <div className="text-sm text-text opacity-70">{t('eventInfo.timeLabel')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-light rounded-xl">
                      <MapPin className="w-6 h-6 text-accent mr-4" />
                      <div>
                        <div className="font-medium text-dark">{venueName}</div>
                        <div className="text-sm text-text opacity-70">{venueAddress}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-light rounded-xl">
                      <Shirt className="w-6 h-6 text-accent mr-4" />
                      <div>
                        <div className="font-medium text-dark">{dressCodeStyle}</div>
                        <div className="text-sm text-text opacity-70">{t('eventInfo.dressCodeLabel')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="bg-gradient-to-br from-light to-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-heading font-semibold text-primary mb-6 text-center">
                    {t('additionalInfo.title')}
                  </h3>
                  <div className="space-y-4 text-center">
                    <div className="p-4 bg-white rounded-xl">
                      <p className="text-dark font-medium">{t('additionalInfo.deadline')}</p>
                      <p className="text-accent font-semibold">{formatDate(rsvpDeadline)}</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl">
                      <p className="text-dark font-medium">{t('additionalInfo.questions')}</p>
                      <p className="text-accent">{coupleEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario */}
              <div className="animation-delay-600">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Información personal */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark mb-2">
                          {t('form.name')} *
                        </label>
                        <input
                          {...register('name')}
                          type="text"
                          className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-dark mb-2">
                          {t('form.phone')} *
                        </label>
                        <input
                          {...register('phone')}
                          type="tel"
                          className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        {t('form.email')} *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Asistencia */}
                    <div>
                      <label className="block text-sm font-medium text-dark mb-3">
                        {t('form.attendance')} *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center p-4 bg-light rounded-xl hover:bg-accent hover:bg-opacity-10 transition-colors cursor-pointer">
                          <input
                            {...register('attendance')}
                            type="radio"
                            value="yes"
                            className="w-4 h-4 text-accent focus:ring-accent mr-3"
                          />
                          <span className="text-text font-medium">{t('form.attendanceOptions.yes')}</span>
                        </label>
                        <label className="flex items-center p-4 bg-light rounded-xl hover:bg-accent hover:bg-opacity-10 transition-colors cursor-pointer">
                          <input
                            {...register('attendance')}
                            type="radio"
                            value="no"
                            className="w-4 h-4 text-accent focus:ring-accent mr-3"
                          />
                          <span className="text-text font-medium">{t('form.attendanceOptions.no')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Campos condicionales para asistencia */}
                    {attendance === 'yes' && (
                      <>
                        {/* Acompañantes */}
                        <div>
                          <label className="block text-sm font-medium text-dark mb-2">
                            {t('form.guests')}
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              {...register('guests', { valueAsNumber: true })}
                              type="number"
                              min="0"
                              max="5"
                              className="w-24 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-colors text-center"
                            />
                            <span className="text-text">{t('form.guestsHelp')}</span>
                          </div>
                        </div>

                        {/* Nombres de acompañantes */}
                        {guestCount > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-dark mb-2">
                              {t('form.guestNames')}
                            </label>
                            <textarea
                              {...register('guestNames')}
                              rows={3}
                              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
                              placeholder={t('form.guestNamesPlaceholder')}
                            />
                          </div>
                        )}

                        {/* Restricciones alimentarias */}
                        <div>
                          <label className="block text-sm font-medium text-dark mb-2">
                            {t('form.dietary')}
                          </label>
                          <textarea
                            {...register('dietaryRestrictions')}
                            rows={2}
                            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
                            placeholder={t('form.dietaryPlaceholder')}
                          />
                        </div>

                        {/* Canción especial */}
                        <div>
                          <label className="block text-sm font-medium text-dark mb-2">
                            {t('form.song')}
                          </label>
                          <input
                            {...register('song')}
                            type="text"
                            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                            placeholder={t('form.songPlaceholder')}
                          />
                        </div>
                      </>
                    )}

                    {/* Mensaje especial */}
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        {t('form.message')}
                      </label>
                      <textarea
                        {...register('message')}
                        rows={4}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
                        placeholder={t('form.messagePlaceholder')}
                      />
                    </div>

                    {/* Botón de envío */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-primary text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('form.submitting')}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6" />
                          <span>{t('form.submit')}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RSVP; 