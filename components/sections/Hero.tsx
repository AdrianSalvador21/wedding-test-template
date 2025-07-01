'use client';

import React from 'react';
import Image from 'next/image';
import { scrollToSection } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';

const Hero = () => {
  const { isMobile, isLoaded } = useIsMobile();

  const handleRSVPClick = () => {
    scrollToSection('rsvp');
  };

  // Versión estática para móvil (sin JavaScript pesado)
  if (isMobile) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=50"
            alt="Foto de la pareja"
            fill
            priority
            className="object-cover"
            quality={50}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 text-center text-white px-4">
          <div className="max-w-4xl mx-auto">
            {/* Subtítulo */}
            <p className="text-sm font-semibold tracking-widest uppercase mb-4 opacity-90">
              Nuestra Boda
            </p>

            {/* Título principal */}
            <h1 className="font-heading text-4xl font-bold mb-6 leading-tight">
              Quetzalia{' '}
              <span className="inline-block mx-2 text-accent text-5xl">
                &
              </span>{' '}
              Adrián
            </h1>

            {/* Fecha */}
            <p className="text-lg font-body mb-8 opacity-95">
              21 de Noviembre, 2025
            </p>

            {/* Ornamento decorativo */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-16 h-px bg-white opacity-50" />
              <div className="text-white text-2xl">❤</div>
              <div className="w-16 h-px bg-white opacity-50" />
            </div>

            {/* Botón CTA */}
            <button
              onClick={handleRSVPClick}
              className="bg-gradient-to-r from-accent to-accent-dark text-white font-semibold py-3 px-8 rounded-full shadow-lg active:scale-95 transition-transform duration-100"
            >
              Confirmar Asistencia
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Mostrar loading mientras detecta dispositivo
  if (!isLoaded) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-accent to-accent-dark" />
        <div className="relative z-10 text-center text-white">
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded w-32 mx-auto mb-4" />
            <div className="h-12 bg-white/20 rounded w-64 mx-auto mb-4" />
            <div className="h-6 bg-white/20 rounded w-48 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  // Versión para desktop con animaciones (cargado dinámicamente)
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Foto de la pareja"
          fill
          priority
          className="object-cover"
          quality={80}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Contenido principal con animaciones CSS */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          {/* Subtítulo */}
          <p className="text-sm sm:text-base md:text-lg font-semibold tracking-widest uppercase mb-6 opacity-90 animation-delay-200">
            Nuestra Boda
          </p>

          {/* Título principal */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight animation-delay-400">
            Quetzalia{' '}
            <span className="inline-block mx-4 text-accent text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
              &
            </span>{' '}
            Adrián
          </h1>

          {/* Fecha */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-body mb-12 opacity-95 animation-delay-600">
            21 de Noviembre, 2025
          </p>

          {/* Ornamento decorativo */}
          <div className="ornament mb-12 animation-delay-800">
            <div className="ornament-line bg-white" />
            <div className="ornament-center text-white text-3xl">❤</div>
            <div className="ornament-line bg-white" />
          </div>

          {/* Botón CTA */}
          <div className="animation-delay-1000">
            <button
              onClick={handleRSVPClick}
              className="btn-primary text-lg px-12 py-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Confirmar Asistencia
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden md:block animation-delay-1200">
        <div className="animate-bounce">
          <svg
            className="w-6 h-6 text-white opacity-70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero; 