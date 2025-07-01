'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Calendar, Clock, MapPin, Shirt, Send, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useIsMobile } from '@/lib/motion';

const RSVP = () => {
  const t = useTranslations('rsvp');
  const { isMobile, isLoaded } = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    
    // Simular envío de formulario
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('RSVP Data:', data);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-gradient-to-br from-light via-white to-light">
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
                ¡Nos vemos el 21 de noviembre en Jardines del Edén!
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
      <section className="py-20 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">{t('title')}</h2>
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
                  <span className="text-text">{t('eventInfo.date')}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-accent mr-3" />
                  <span className="text-text">{t('eventInfo.time')}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-accent mr-3" />
                  <div>
                    <div className="text-text">{t('eventInfo.venue')}</div>
                    <div className="text-sm text-text opacity-70">{t('eventInfo.address')}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Shirt className="w-5 h-5 text-accent mr-3" />
                  <span className="text-text">{t('eventInfo.dressCode')}</span>
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

                {/* Campos condicionales si asiste */}
                {attendance === 'yes' && (
                  <>
                    {/* Número de acompañantes */}
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        {t('form.guests')}
                      </label>
                      <select
                        {...register('guests', { valueAsNumber: true })}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                      >
                        {[0, 1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    {/* Nombres de acompañantes */}
                    {guestCount > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-dark mb-2">
                          {t('form.guestNames')}
                        </label>
                        <textarea
                          {...register('guestNames')}
                          rows={2}
                          className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
                        />
                      </div>
                    )}

                    {/* Restricciones alimentarias */}
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        {t('form.dietaryRestrictions')}
                      </label>
                      <input
                        {...register('dietaryRestrictions')}
                        type="text"
                        placeholder={t('form.dietaryPlaceholder')}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                      />
                    </div>

                    {/* Canción favorita */}
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        {t('form.song')}
                      </label>
                      <input
                        {...register('song')}
                        type="text"
                        placeholder={t('form.songPlaceholder')}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
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
                    rows={3}
                    placeholder={t('form.messagePlaceholder')}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
                  />
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('loading')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t('form.submit')}
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
      <section id="rsvp" className="py-20 bg-white">
        <div className="section-container">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-2xl" />
              <div className="h-96 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Versión con animaciones para desktop
  return (
    <section id="rsvp" className="py-20 bg-gradient-to-br from-light via-white to-light">
      <div className="section-container">
        
        {/* Título */}
        <div className="text-center mb-16 animation-delay-200">
          <h2 className="section-title mb-4">{t('title')}</h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            {t('description')}
          </p>
          
          {/* Ornamento */}
          <div className="flex items-center justify-center mt-8 mb-12">
            <div className="w-16 h-px bg-accent" />
            <Heart className="mx-4 w-6 h-6 text-accent" />
            <div className="w-16 h-px bg-accent" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          
          {/* Información del Evento */}
          <div className="lg:col-span-1 space-y-6 animation-delay-400">
            
            {/* Detalles del evento */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-heading font-semibold text-primary mb-6">
                {t('eventInfo.title')}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-dark">{t('eventInfo.date')}</div>
                    <div className="text-text">{t('eventInfo.time')}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-dark">{t('eventInfo.venue')}</div>
                    <div className="text-text">{t('eventInfo.address')}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <Shirt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-dark">{t('eventInfo.dressCode')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-primary rounded-2xl p-8 text-white">
              <h3 className="text-xl font-heading font-semibold mb-4">
                {t('eventInfo.title')}
              </h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• {t('description')}</li>
                <li>• Habrá transporte desde el hotel recomendado</li>
                <li>• La celebración será al aire libre con opciones bajo techo</li>
              </ul>
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2 animation-delay-600">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="space-y-6">
                
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    {t('form.name')} *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    {t('form.email')} *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    {t('form.phone')} *
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                {/* Asistencia */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-3">
                    {t('form.attendance')} *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="cursor-pointer">
                      <input
                        {...register('attendance')}
                        type="radio"
                        value="yes"
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                        attendance === 'yes'
                          ? 'border-primary bg-primary text-white shadow-lg'
                          : 'border-border bg-white text-dark hover:border-primary'
                      }`}>
                        <div className="font-semibold">{t('form.attendanceOptions.yes')}</div>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        {...register('attendance')}
                        type="radio"
                        value="no"
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                        attendance === 'no'
                          ? 'border-red-500 bg-red-500 text-white shadow-lg'
                          : 'border-border bg-white text-dark hover:border-red-500'
                      }`}>
                        <div className="font-semibold">{t('form.attendanceOptions.no')}</div>
                      </div>
                    </label>
                  </div>
                  {errors.attendance && (
                    <p className="mt-1 text-sm text-red-500">{errors.attendance.message}</p>
                  )}
                </div>

                {/* Campos condicionales si asiste */}
                {attendance === 'yes' && (
                  <>
                    {/* Número de acompañantes */}
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        {t('form.guests')}
                      </label>
                      <select
                        {...register('guests', { valueAsNumber: true })}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      >
                        {[0, 1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    {/* Nombres de acompañantes */}
                    {guestCount > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-dark mb-2">
                          {t('form.guestNames')}
                        </label>
                        <textarea
                          {...register('guestNames')}
                          rows={2}
                          className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        />
                      </div>
                    )}

                    {/* Restricciones alimentarias */}
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        {t('form.dietaryRestrictions')}
                      </label>
                      <input
                        {...register('dietaryRestrictions')}
                        type="text"
                        placeholder={t('form.dietaryPlaceholder')}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Canción favorita */}
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        {t('form.song')}
                      </label>
                      <input
                        {...register('song')}
                        type="text"
                        placeholder={t('form.songPlaceholder')}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Mensaje especial */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    {t('form.message')}
                  </label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    placeholder={t('form.messagePlaceholder')}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-primary text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('loading')}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="w-5 h-5 mr-2" />
                      {t('form.submit')}
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RSVP; 