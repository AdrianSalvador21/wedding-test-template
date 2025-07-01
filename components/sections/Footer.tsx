'use client';

import React from 'react';
import { Heart, Mail, Phone, Instagram, Facebook } from 'lucide-react';
import { scrollToSection } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';

const Footer = () => {
  const { isMobile, isLoaded } = useIsMobile();
  const currentYear = new Date().getFullYear();
  
  const handleRSVPClick = () => {
    scrollToSection('rsvp');
  };

  // Versión estática para móvil
  if (isMobile) {
    return (
      <footer className="bg-primary text-white py-16">
        <div className="section-container">
          <div className="max-w-lg mx-auto">
            
            {/* Contenido principal minimalista */}
            <div className="text-center mb-12">
              <h3 className="text-2xl font-heading font-light mb-4">
                Quetzalia & Adrián
              </h3>
              
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-12 h-px bg-accent opacity-60"></div>
                <Heart className="w-5 h-5 text-accent" />
                <div className="w-12 h-px bg-accent opacity-60"></div>
              </div>

              <p className="text-white/80 font-body mb-8">
                &ldquo;Dos corazones que laten como uno&rdquo;
              </p>

              <button
                onClick={handleRSVPClick}
                className="bg-white text-primary px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-all duration-300 active:scale-95"
              >
                Confirmar Asistencia
              </button>
            </div>

            {/* Información de contacto simplificada para móvil */}
            <div className="space-y-4 text-center mb-12">
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-4 h-4 text-accent" />
                <span className="text-sm text-white/80">contacto@boda.com</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-4 h-4 text-accent" />
                <span className="text-sm text-white/80">+52 123 456 7890</span>
              </div>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                >
                  <Instagram className="w-4 h-4 text-white" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                >
                  <Facebook className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>

            {/* Footer bottom */}
            <div className="border-t border-white/20 pt-8 text-center space-y-2">
              <p className="text-sm text-white/60">
                © {currentYear} Quetzalia & Adrián
              </p>
              <p className="text-sm text-white/60">
                21 de Noviembre, 2025
              </p>
              <p className="text-sm text-accent">
                #QuetzaliaYAdrian2025
              </p>
            </div>

          </div>
        </div>
      </footer>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <footer className="bg-primary text-white py-16">
        <div className="section-container">
          <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
            <div className="h-8 bg-white/20 rounded w-64 mx-auto" />
            <div className="h-4 bg-white/20 rounded w-96 mx-auto" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="h-6 bg-white/20 rounded" />
              <div className="h-6 bg-white/20 rounded" />
              <div className="h-6 bg-white/20 rounded" />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Versión para desktop con animaciones CSS
  return (
    <footer className="bg-primary text-white py-16">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          
          {/* Contenido principal minimalista */}
          <div className="text-center mb-12 animate-fade-in-up animation-delay-200">
            <h3 className="text-2xl font-heading font-light mb-4">
              Quetzalia & Adrián
            </h3>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-12 h-px bg-accent opacity-60"></div>
              <Heart className="w-5 h-5 text-accent" />
              <div className="w-12 h-px bg-accent opacity-60"></div>
            </div>

            <p className="text-white/80 font-body mb-8 max-w-md mx-auto">
              &ldquo;Dos corazones que laten como uno&rdquo;
            </p>

            <button
              onClick={handleRSVPClick}
              className="bg-white text-primary px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-all duration-300 hover:scale-105"
            >
              Confirmar Asistencia
            </button>
          </div>

          {/* Información de contacto minimalista */}
          <div className="grid md:grid-cols-3 gap-8 text-center mb-12 animation-delay-400">
            <div className="flex items-center justify-center space-x-3">
              <Mail className="w-4 h-4 text-accent" />
              <span className="text-sm text-white/80">contacto@boda.com</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Phone className="w-4 h-4 text-accent" />
              <span className="text-sm text-white/80">+52 123 456 7890</span>
            </div>
            <div className="flex justify-center space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
              >
                <Facebook className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Footer bottom minimalista */}
          <div className="border-t border-white/20 pt-8 text-center animation-delay-600">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <p className="text-sm text-white/60">
                © {currentYear} Quetzalia & Adrián
              </p>
              <p className="text-sm text-white/60">
                21 de Noviembre, 2025
              </p>
              <p className="text-sm text-accent">
                #QuetzaliaYAdrian2025
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer; 