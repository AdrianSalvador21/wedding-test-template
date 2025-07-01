'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle, Users, MessageCircle, Calendar } from 'lucide-react';
import { useIsMobile } from '@/lib/motion';

// Schema de validación
const rsvpSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
  attendance: z.enum(['yes', 'no'], {
    required_error: 'Por favor selecciona si asistirás'
  }),
  guests: z.number().min(1).max(10).optional(),
  dietaryRestrictions: z.string().optional(),
  message: z.string().optional()
});

type RSVPForm = z.infer<typeof rsvpSchema>;

const RSVP = () => {
  const { isMobile, isLoaded } = useIsMobile();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RSVPForm>({
    resolver: zodResolver(rsvpSchema)
  });

  const attendance = watch('attendance');

  const onSubmit = async (data: RSVPForm) => {
    setIsSubmitting(true);
    
    // Simular envío del formulario
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('RSVP Data:', data);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  // Estado de confirmación enviada
  if (isSubmitted) {
    return (
      <section id="rsvp" className="py-20 bg-gradient-to-br from-primary via-secondary to-accent">
        <div className="section-container">
          <div className="text-center text-white max-w-2xl mx-auto">
            <CheckCircle className="w-24 h-24 mx-auto mb-8 text-white" />
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              ¡Gracias por Confirmar!
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Tu confirmación ha sido recibida. Te enviaremos más detalles pronto.
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <p className="text-lg">
                Esperamos con ansias celebrar contigo este día tan especial.
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
      <section id="rsvp" className="py-20 bg-white">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Confirma tu Asistencia</h2>
            <p className="section-subtitle">
              Por favor confirma si podrás acompañarnos en nuestro día especial
            </p>
            
            {/* Ornamento */}
            <div className="flex items-center justify-center mt-8 mb-12">
              <div className="w-16 h-px bg-accent" />
              <Calendar className="mx-4 w-6 h-6 text-accent" />
              <div className="w-16 h-px bg-accent" />
            </div>
          </div>

          <div className="max-w-lg mx-auto space-y-8">
            
            {/* Información del evento */}
            <div className="bg-gradient-to-br from-light to-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-heading font-semibold text-primary mb-4">
                Detalles del Evento
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-dark text-sm">Fecha y Hora</div>
                    <div className="text-text text-sm">21 de Noviembre, 2025 - 4:00 PM</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-dark text-sm">Celebración</div>
                    <div className="text-text text-sm">Ceremonia, Cóctel, Cena y Baile</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-dark text-sm">Código de Vestimenta</div>
                    <div className="text-text text-sm">Formal / Cocktail</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Importante */}
            <div className="bg-gradient-primary rounded-2xl p-6 text-white">
              <h3 className="text-lg font-heading font-semibold mb-3">
                Información Importante
              </h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• Por favor confirma antes del 15 de octubre</li>
                <li>• Incluye en tu confirmación cualquier restricción alimentaria</li>
                <li>• Habrá transporte desde el hotel recomendado</li>
                <li>• La celebración será al aire libre con opciones bajo techo</li>
              </ul>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="space-y-4">
                
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Tu nombre completo"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Email *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Teléfono *
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="+52 999 999 9999"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                {/* Asistencia */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-3">
                    ¿Asistirás? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="cursor-pointer">
                      <input
                        {...register('attendance')}
                        type="radio"
                        value="yes"
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-xl border-2 text-center transition-all ${
                        attendance === 'yes'
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-white text-dark hover:border-primary'
                      }`}>
                        <div className="text-sm font-semibold">Sí, asistiré</div>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        {...register('attendance')}
                        type="radio"
                        value="no"
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-xl border-2 text-center transition-all ${
                        attendance === 'no'
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-border bg-white text-dark hover:border-red-500'
                      }`}>
                        <div className="text-sm font-semibold">No podré asistir</div>
                      </div>
                    </label>
                  </div>
                  {errors.attendance && (
                    <p className="mt-1 text-sm text-red-500">{errors.attendance.message}</p>
                  )}
                </div>

                {/* Número de invitados - solo si asiste */}
                {attendance === 'yes' && (
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      ¿Cuántos invitados incluye tu confirmación?
                    </label>
                    <select
                      {...register('guests', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value={1}>Solo yo</option>
                      <option value={2}>2 personas</option>
                      <option value={3}>3 personas</option>
                      <option value={4}>4 personas</option>
                      <option value={5}>5 personas</option>
                    </select>
                  </div>
                )}

                {/* Restricciones alimentarias */}
                {attendance === 'yes' && (
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Restricciones Alimentarias
                    </label>
                    <textarea
                      {...register('dietaryRestrictions')}
                      rows={3}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                      placeholder="¿Alguna alergia o restricción alimentaria?"
                    />
                  </div>
                )}

                {/* Mensaje */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Mensaje para los Novios
                  </label>
                  <textarea
                    {...register('message')}
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="Escríbenos un mensaje especial..."
                  />
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-primary text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="w-5 h-5 mr-2" />
                      Confirmar Asistencia
                    </div>
                  )}
                </button>
              </div>
            </form>
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

  // Versión para desktop con animaciones CSS
  return (
    <section id="rsvp" className="py-20 bg-white">
      <div className="section-container">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-16 animation-delay-200">
            <h2 className="section-title mb-4">Confirma tu Asistencia</h2>
            <p className="section-subtitle">
              Por favor confirma si podrás acompañarnos en nuestro día especial
            </p>
            
            {/* Ornamento */}
            <div className="flex items-center justify-center mt-8 mb-12">
              <div className="w-16 h-px bg-accent" />
              <Calendar className="mx-4 w-6 h-6 text-accent" />
              <div className="w-16 h-px bg-accent" />
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              
              {/* Información del evento */}
              <div className="space-y-8 animation-delay-400">
                <div className="bg-gradient-to-br from-light to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-2xl font-heading font-semibold text-primary mb-6">
                    Detalles del Evento
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-dark">Fecha y Hora</div>
                        <div className="text-text">21 de Noviembre, 2025 - 4:00 PM</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-dark">Celebración</div>
                        <div className="text-text">Ceremonia, Cóctel, Cena y Baile</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-dark">Código de Vestimenta</div>
                        <div className="text-text">Formal / Cocktail</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-primary rounded-2xl p-8 text-white hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-heading font-semibold mb-4">
                    Información Importante
                  </h3>
                  <ul className="space-y-2 text-sm opacity-90">
                    <li>• Por favor confirma antes del 15 de octubre</li>
                    <li>• Incluye en tu confirmación cualquier restricción alimentaria</li>
                    <li>• Habrá transporte desde el hotel recomendado</li>
                    <li>• La celebración será al aire libre con opciones bajo techo</li>
                  </ul>
                </div>
              </div>

              {/* Formulario */}
              <div className="animation-delay-600">
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="space-y-6">
                    
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Tu nombre completo"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Email *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="tu@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Teléfono *
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="+52 999 999 9999"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Asistencia */}
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-3">
                        ¿Asistirás? *
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
                            <div className="font-semibold">Sí, asistiré</div>
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
                            <div className="font-semibold">No podré asistir</div>
                          </div>
                        </label>
                      </div>
                      {errors.attendance && (
                        <p className="mt-1 text-sm text-red-500">{errors.attendance.message}</p>
                      )}
                    </div>

                    {/* Número de invitados - solo si asiste */}
                    {attendance === 'yes' && (
                      <div>
                        <label className="block text-sm font-semibold text-dark mb-2">
                          ¿Cuántos invitados incluye tu confirmación?
                        </label>
                        <select
                          {...register('guests', { valueAsNumber: true })}
                          className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        >
                          <option value={1}>Solo yo</option>
                          <option value={2}>2 personas</option>
                          <option value={3}>3 personas</option>
                          <option value={4}>4 personas</option>
                          <option value={5}>5 personas</option>
                        </select>
                      </div>
                    )}

                    {/* Restricciones alimentarias */}
                    {attendance === 'yes' && (
                      <div>
                        <label className="block text-sm font-semibold text-dark mb-2">
                          Restricciones Alimentarias
                        </label>
                        <textarea
                          {...register('dietaryRestrictions')}
                          rows={3}
                          className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                          placeholder="¿Alguna alergia o restricción alimentaria?"
                        />
                      </div>
                    )}

                    {/* Mensaje */}
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Mensaje para los Novios
                      </label>
                      <textarea
                        {...register('message')}
                        rows={4}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        placeholder="Escríbenos un mensaje especial..."
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
                          Enviando...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Send className="w-5 h-5 mr-2" />
                          Confirmar Asistencia
                        </div>
                      )}
                    </button>
                  </div>
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