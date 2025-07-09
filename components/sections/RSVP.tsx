'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Send, Check, ChevronDown } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { getFloralBackgroundStyle } from '../../lib/floral-patterns';

const RSVP = () => {
  const { t } = useTranslations('rsvp');
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Datos dinámicos con fallbacks
  const receptionVenue = weddingData?.event.receptionVenue;
  const venueName = receptionVenue?.name || t('eventInfo.venue');
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

  // Schema de validación simplificado
  const rsvpSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().optional(),
    attendance: z.enum(['yes', 'no'], {
      required_error: t('form.selectOption')
    }),
    message: z.string().optional(),
  });

  type RSVPFormData = z.infer<typeof rsvpSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    mode: 'onChange'
  });

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
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
                {t('success')}
              </h2>
              <p className="text-text font-body">
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
      <section 
        className="bg-gray-50 relative overflow-hidden"
        style={getFloralBackgroundStyle(3, '160px')}
              >
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <p className="section-subtitle font-body">
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
            {/* Formulario */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  className="w-full bg-gradient-primary text-white font-body font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
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
      style={getFloralBackgroundStyle(3, '160px')}
          >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-12 animation-delay-200">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-6"></div>
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
                      className="w-full bg-gradient-primary text-white font-body font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

export default RSVP; 