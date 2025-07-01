'use client';

import React from 'react';
import { MapPin, Clock, Car, Phone, Navigation, ExternalLink, Star, Utensils, Wifi, Users } from 'lucide-react';
import { openExternalLink } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';

const Location = () => {
  const { isMobile, isLoaded } = useIsMobile();

  const handleGoogleMapsClick = () => {
    openExternalLink('https://maps.google.com/?q=Jardines+del+Eden+CDMX');
  };

  const handleWazeClick = () => {
    openExternalLink('https://waze.com/ul?q=Jardines+del+Eden+CDMX');
  };

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section id="location" className="py-20 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Ubicación del Evento</h2>
            <p className="section-subtitle">
              Aquí celebraremos nuestro amor rodeados de naturaleza y elegancia
            </p>
            
            {/* Ornamento */}
            <div className="flex items-center justify-center mt-8 mb-12">
              <div className="w-16 h-px bg-accent" />
              <MapPin className="mx-4 w-6 h-6 text-accent" />
              <div className="w-16 h-px bg-accent" />
            </div>
          </div>

          <div className="max-w-lg mx-auto space-y-8">
            
            {/* Tarjeta principal del lugar */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-bold text-primary mb-2">
                    Jardines del Edén
                  </h3>
                  <p className="text-text mb-4">
                    Salón de Eventos y Jardines
                  </p>
                  <p className="text-sm text-text leading-relaxed">
                    Un lugar mágico rodeado de jardines exuberantes, perfecto para 
                    celebrar momentos especiales con elegancia y naturaleza.
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-accent" />
                    <div>
                      <div className="font-semibold text-dark text-sm">Horario</div>
                      <div className="text-sm text-text">15:30 - 23:00 hrs</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-accent" />
                    <div>
                      <div className="font-semibold text-dark text-sm">Contacto</div>
                      <div className="text-sm text-text">+52 55 1234-5678</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-heading font-semibold text-primary mb-4 flex items-center">
                <Navigation className="w-5 h-5 mr-2 text-accent" />
                Cómo Llegar
              </h3>
              
              <div className="space-y-4">
                <div className="bg-light rounded-xl p-4">
                  <div className="font-semibold text-dark mb-2 text-sm">Dirección Completa</div>
                  <p className="text-sm text-text">
                    Av. de los Jardines 123, Col. Vista Hermosa<br />
                    Ciudad de México, CDMX 12345
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Car className="w-4 h-4 text-accent mt-1" />
                    <div>
                      <div className="font-semibold text-dark text-sm">En Automóvil</div>
                      <div className="text-xs text-text">
                        Estacionamiento gratuito disponible.<br />
                        Servicio de valet parking incluido.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-accent mt-1" />
                    <div>
                      <div className="font-semibold text-dark text-sm">Transporte</div>
                      <div className="text-xs text-text">
                        Transporte disponible desde<br />
                        Hotel Marriott a las 15:00 hrs.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-light to-accent/20 relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <div className="text-lg font-heading font-semibold text-primary mb-2">
                      Jardines del Edén
                    </div>
                    <div className="text-sm text-text">
                      Vista satelital del lugar
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleMapsClick}
                className="w-full bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Ver en Google Maps</span>
              </button>
              
              <button
                onClick={handleWazeClick}
                className="w-full border-2 border-primary text-primary font-semibold py-3 px-6 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 flex items-center justify-center space-x-2"
              >
                <Navigation className="w-5 h-5" />
                <span>Abrir en Waze</span>
              </button>
            </div>

            {/* Facilidades */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-heading font-semibold text-primary mb-4">
                Facilidades del Lugar
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Star className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-sm font-semibold text-dark">Jardines</div>
                  <div className="text-xs text-text">Espacios naturales</div>
                </div>
                <div className="text-center">
                  <Utensils className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-sm font-semibold text-dark">Catering</div>
                  <div className="text-xs text-text">Cocina profesional</div>
                </div>
                <div className="text-center">
                  <Wifi className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-sm font-semibold text-dark">WiFi</div>
                  <div className="text-xs text-text">Conexión gratuita</div>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-sm font-semibold text-dark">Capacidad</div>
                  <div className="text-xs text-text">Hasta 150 personas</div>
                </div>
              </div>
            </div>

            {/* Hoteles recomendados */}
            <div className="bg-gradient-to-br from-light to-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-heading font-semibold text-primary mb-4">
                Hoteles Recomendados
              </h3>
              
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-4 border border-border">
                  <div className="font-semibold text-dark text-sm">Hotel Marriott</div>
                  <div className="text-xs text-text mb-2">A 10 minutos del lugar</div>
                  <div className="text-xs text-text opacity-80">
                    Transporte incluido desde el hotel
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-border">
                  <div className="font-semibold text-dark text-sm">Hotel Fiesta Inn</div>
                  <div className="text-xs text-text mb-2">A 15 minutos del lugar</div>
                  <div className="text-xs text-text opacity-80">
                    Tarifas preferenciales disponibles
                  </div>
                </div>
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
      <section id="location" className="py-20 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded-2xl" />
                <div className="h-48 bg-gray-200 rounded-2xl" />
              </div>
              <div className="h-96 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Versión para desktop con animaciones CSS
  return (
    <section id="location" className="py-20 bg-gradient-to-br from-light via-white to-light">
      <div className="section-container">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-16 animation-delay-200">
            <h2 className="section-title mb-4">Ubicación del Evento</h2>
            <p className="section-subtitle">
              Aquí celebraremos nuestro amor rodeados de naturaleza y elegancia
            </p>
            
            {/* Ornamento */}
            <div className="flex items-center justify-center mt-8 mb-12">
              <div className="w-16 h-px bg-accent" />
              <MapPin className="mx-4 w-6 h-6 text-accent" />
              <div className="w-16 h-px bg-accent" />
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              
              {/* Información del lugar */}
              <div className="space-y-8 animation-delay-400">
                
                {/* Tarjeta principal del lugar */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-heading font-bold text-primary mb-2">
                        Jardines del Edén
                      </h3>
                      <p className="text-lg text-text mb-4">
                        Salón de Eventos y Jardines
                      </p>
                      <p className="text-text leading-relaxed">
                        Un lugar mágico rodeado de jardines exuberantes, perfecto para 
                        celebrar momentos especiales con elegancia y naturaleza.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-accent" />
                        <div>
                          <div className="font-semibold text-dark">Horario</div>
                          <div className="text-sm text-text">15:30 - 23:00 hrs</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-accent" />
                        <div>
                          <div className="font-semibold text-dark">Contacto</div>
                          <div className="text-sm text-text">+52 55 1234-5678</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dirección y cómo llegar */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-heading font-semibold text-primary mb-6 flex items-center">
                    <Navigation className="w-6 h-6 mr-3 text-accent" />
                    Cómo Llegar
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-light rounded-xl p-4">
                      <div className="font-semibold text-dark mb-2">Dirección Completa</div>
                      <p className="text-text">
                        Av. de los Jardines 123, Col. Vista Hermosa<br />
                        Ciudad de México, CDMX 12345
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <Car className="w-5 h-5 text-accent mt-1" />
                        <div>
                          <div className="font-semibold text-dark">En Automóvil</div>
                          <div className="text-sm text-text">
                            Estacionamiento gratuito disponible.<br />
                            Servicio de valet parking incluido.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-accent mt-1" />
                        <div>
                          <div className="font-semibold text-dark">Transporte</div>
                          <div className="text-sm text-text">
                            Transporte disponible desde<br />
                            Hotel Marriott a las 15:00 hrs.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={handleGoogleMapsClick}
                    className="bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Ver en Google Maps</span>
                  </button>
                  
                  <button
                    onClick={handleWazeClick}
                    className="border-2 border-primary text-primary font-semibold py-3 px-6 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Navigation className="w-5 h-5" />
                    <span>Abrir en Waze</span>
                  </button>
                </div>
              </div>

              {/* Mapa y detalles adicionales */}
              <div className="space-y-8 animation-delay-600">
                
                {/* Mapa */}
                <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-light to-accent/20 relative">
                    {/* Placeholder del mapa - En producción sería un mapa real */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <div className="text-center">
                        <MapPin className="w-16 h-16 mx-auto mb-4 text-primary" />
                        <div className="text-xl font-heading font-semibold text-primary mb-2">
                          Jardines del Edén
                        </div>
                        <div className="text-text">
                          Vista satelital del lugar
                        </div>
                      </div>
                    </div>
                    
                    {/* Overlay de interacción */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 cursor-pointer flex items-center justify-center">
                      <div className="bg-white/90 rounded-lg p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="text-center">
                          <ExternalLink className="w-6 h-6 mx-auto mb-2 text-primary" />
                          <div className="text-sm font-semibold text-primary">
                            Ver mapa completo
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Facilidades del lugar */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-heading font-semibold text-primary mb-6">
                    Facilidades del Lugar
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <Star className="w-10 h-10 text-accent mx-auto mb-3" />
                      <div className="font-semibold text-dark mb-1">Jardines</div>
                      <div className="text-sm text-text">Espacios naturales para ceremonia</div>
                    </div>
                    <div className="text-center">
                      <Utensils className="w-10 h-10 text-accent mx-auto mb-3" />
                      <div className="font-semibold text-dark mb-1">Catering</div>
                      <div className="text-sm text-text">Cocina profesional in-house</div>
                    </div>
                    <div className="text-center">
                      <Wifi className="w-10 h-10 text-accent mx-auto mb-3" />
                      <div className="font-semibold text-dark mb-1">WiFi</div>
                      <div className="text-sm text-text">Conexión gratuita de alta velocidad</div>
                    </div>
                    <div className="text-center">
                      <Users className="w-10 h-10 text-accent mx-auto mb-3" />
                      <div className="font-semibold text-dark mb-1">Capacidad</div>
                      <div className="text-sm text-text">Hasta 150 invitados</div>
                    </div>
                  </div>
                </div>

                {/* Hoteles recomendados */}
                <div className="bg-gradient-to-br from-light to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-heading font-semibold text-primary mb-6">
                    Hoteles Recomendados
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-border hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-dark">Hotel Marriott</div>
                          <div className="text-sm text-text mb-1">A 10 minutos del lugar</div>
                          <div className="text-xs text-text opacity-80">
                            Transporte incluido desde el hotel
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary">Recomendado</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-border hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-dark">Hotel Fiesta Inn</div>
                          <div className="text-sm text-text mb-1">A 15 minutos del lugar</div>
                          <div className="text-xs text-text opacity-80">
                            Tarifas preferenciales disponibles
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-accent">Económico</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location; 