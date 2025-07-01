'use client';

import React from 'react';
import { Clock, MapPin, Heart, Camera, Music, Utensils, Sparkles } from 'lucide-react';
import { scrollToSection } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';

const Timeline = () => {
  const { isMobile, isLoaded } = useIsMobile();

  const handleLocationClick = () => {
    scrollToSection('location');
  };

  const events = [
    {
      time: "15:30",
      title: "Llegada de Invitados",
      description: "Recepción y bienvenida en los jardines",
      icon: MapPin,
      color: "from-primary to-secondary"
    },
    {
      time: "16:00",
      title: "Ceremonia Civil",
      description: "¡El momento más esperado! Intercambio de votos",
      icon: Heart,
      color: "from-secondary to-accent",
      highlight: true
    },
    {
      time: "16:45",
      title: "Sesión de Fotos",
      description: "Fotos con familiares y amigos cercanos",
      icon: Camera,
      color: "from-accent to-primary"
    },
    {
      time: "18:00",
      title: "Cóctel de Celebración",
      description: "Aperitivos y bebidas mientras preparamos la recepción",
      icon: Utensils,
      color: "from-primary to-secondary"
    },
    {
      time: "19:30",
      title: "Cena y Brindis",
      description: "Cena especial con nuestros seres queridos",
      icon: Utensils,
      color: "from-secondary to-accent"
    },
    {
      time: "21:00",
      title: "¡A Bailar!",
      description: "Música, baile y diversión hasta altas horas",
      icon: Music,
      color: "from-accent to-primary"
    }
  ];

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section className="py-20 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Cronograma del Día</h2>
            <p className="section-subtitle">
              Todo lo que necesitas saber sobre nuestro día especial
            </p>
            
            {/* Ornamento */}
            <div className="flex items-center justify-center mt-8 mb-12">
              <div className="w-16 h-px bg-accent" />
              <Clock className="mx-4 w-6 h-6 text-accent" />
              <div className="w-16 h-px bg-accent" />
            </div>
          </div>

          {/* Timeline simplificado para móvil */}
          <div className="max-w-lg mx-auto space-y-6">
            {events.map((event, index) => {
              const IconComponent = event.icon;
              
              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl p-6 shadow-lg ${
                    event.highlight 
                      ? 'ring-2 ring-primary ring-opacity-20 bg-gradient-to-br from-white to-light' 
                      : ''
                  }`}
                >
                  {/* Icono y hora */}
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center mr-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className={`text-xl font-heading font-bold bg-gradient-to-r ${event.color} bg-clip-text text-transparent`}>
                      {event.time}
                    </div>
                  </div>
                  
                  {/* Título */}
                  <h3 className={`text-lg font-semibold mb-2 flex items-center ${
                    event.highlight ? 'text-primary' : 'text-dark'
                  }`}>
                    {event.title}
                    {event.highlight && (
                      <Sparkles className="w-4 h-4 ml-2 text-accent" />
                    )}
                  </h3>
                  
                  {/* Descripción */}
                  <p className="text-text opacity-80 leading-relaxed text-sm">
                    {event.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Información adicional */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-heading font-semibold text-primary mb-4">
              Información Importante
            </h3>
            <div className="space-y-3 text-text">
              <p className="flex items-center justify-center">
                <MapPin className="w-5 h-5 mr-2 text-accent" />
                <span>Jardines del Edén, Salón de Eventos</span>
              </p>
              <p className="text-sm opacity-80">
                Te recomendamos llegar 15 minutos antes de cada evento
              </p>
              <p className="text-sm opacity-80">
                Habrá servicio de valet parking disponible
              </p>
            </div>
            
            {/* Botón de ubicación */}
            <button
              onClick={handleLocationClick}
              className="mt-6 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-6 rounded-full hover:shadow-lg transition-all duration-300 active:scale-95"
            >
              Ver Ubicación
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <section className="py-20 bg-gradient-to-br from-light via-white to-light">
        <div className="section-container">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
            <div className="space-y-6 max-w-4xl mx-auto">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Versión para desktop con animaciones CSS
  return (
    <section className="py-20 bg-gradient-to-br from-light via-white to-light">
      <div className="section-container">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-16 animation-delay-200">
            <h2 className="section-title mb-4">Cronograma del Día</h2>
            <p className="section-subtitle">
              Todo lo que necesitas saber sobre nuestro día especial
            </p>
            
            {/* Ornamento */}
            <div className="flex items-center justify-center mt-8 mb-12">
              <div className="w-16 h-px bg-accent" />
              <Clock className="mx-4 w-6 h-6 text-accent" />
              <div className="w-16 h-px bg-accent" />
            </div>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Línea vertical central */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-secondary to-accent rounded-full opacity-30" />
              
              {events.map((event, index) => {
                const IconComponent = event.icon;
                const isLeft = index % 2 === 0;
                const delay = 400 + (index * 200);
                
                return (
                  <div
                    key={index}
                    className={`relative flex items-center mb-12 animation-delay-${delay} ${
                      isLeft ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {/* Contenido del evento */}
                    <div className={`w-5/12 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div
                        className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102 ${
                          event.highlight 
                            ? 'ring-2 ring-primary ring-opacity-20 bg-gradient-to-br from-white to-light' 
                            : ''
                        }`}
                      >
                        {/* Hora */}
                        <div className={`text-2xl font-heading font-bold mb-3 bg-gradient-to-r ${event.color} bg-clip-text text-transparent`}>
                          {event.time}
                        </div>
                        
                        {/* Título */}
                        <h3 className={`text-xl font-semibold mb-2 flex items-center ${
                          isLeft ? 'justify-end' : 'justify-start'
                        } ${event.highlight ? 'text-primary' : 'text-dark'}`}>
                          {isLeft && event.highlight && (
                            <Sparkles className="w-4 h-4 mr-2 text-accent" />
                          )}
                          {event.title}
                          {!isLeft && event.highlight && (
                            <Sparkles className="w-4 h-4 ml-2 text-accent" />
                          )}
                        </h3>
                        
                        {/* Descripción */}
                        <p className="text-text opacity-80 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    {/* Icono central */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Espacio vacío del otro lado */}
                    <div className="w-5/12" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto text-center animation-delay-1600">
            <h3 className="text-2xl font-heading font-semibold text-primary mb-4">
              Información Importante
            </h3>
            <div className="space-y-3 text-text">
              <p className="flex items-center justify-center">
                <MapPin className="w-5 h-5 mr-2 text-accent" />
                <span>Jardines del Edén, Salón de Eventos</span>
              </p>
              <p className="text-sm opacity-80">
                Te recomendamos llegar 15 minutos antes de cada evento
              </p>
              <p className="text-sm opacity-80">
                Habrá servicio de valet parking disponible
              </p>
            </div>
            
            {/* Botón de ubicación */}
            <button
              onClick={handleLocationClick}
              className="mt-6 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-6 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Ver Ubicación
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline; 