'use client';

import React from 'react';
import { Heart, Mail, Phone, Instagram, Facebook } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { openExternalLink } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';

const Footer = () => {
  const t = useTranslations('footer');
  const { isMobile, isLoaded } = useIsMobile();

  const handleInstagramClick = () => {
    openExternalLink('https://instagram.com/mariaycarlos2025');
  };

  const handleFacebookClick = () => {
    openExternalLink('https://facebook.com/mariaycarlos2025');
  };

  const handleWhatsAppClick = () => {
    openExternalLink('https://wa.me/5599999999');
  };

  const handleEmailClick = () => {
    openExternalLink('mailto:maria.carlos@email.com');
  };

  // Versión estática para móvil
  if (isMobile) {
    return (
      <footer className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-16">
        <div className="section-container">
          <div className="text-center space-y-8">
            {/* Título principal */}
            <div>
              <h2 className="text-3xl font-heading font-bold mb-2">
                {t('title')}
              </h2>
              <p className="text-lg opacity-90 mb-6">
                {t('subtitle')}
              </p>
            </div>

            {/* Información de contacto */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-heading font-semibold mb-4">
                {t('contact.title')}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium opacity-90">{t('contact.bride')}</p>
                    <button
                      onClick={handleWhatsAppClick}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      +52 55 1234-5678
                    </button>
                  </div>
                  <div>
                    <p className="font-medium opacity-90">{t('contact.groom')}</p>
                    <button
                      onClick={handleWhatsAppClick}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      +52 55 8765-4321
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleEmailClick}
                  className="flex items-center justify-center space-x-2 text-white/80 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>maria.carlos@email.com</span>
                </button>
              </div>
            </div>

            {/* Redes sociales */}
            <div>
              <h3 className="text-lg font-heading font-semibold mb-4">
                {t('social.title')}
              </h3>
              <div className="flex justify-center space-x-6">
                <button
                  onClick={handleInstagramClick}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Instagram className="w-6 h-6" />
                </button>
                <button
                  onClick={handleFacebookClick}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Facebook className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Cita y mensaje final */}
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Heart className="w-8 h-8 mx-auto mb-4 text-white" />
                <p className="italic text-lg leading-relaxed">
                  {t('quote')}
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-lg font-medium">
                  {t('cta')}
                </p>
                <p className="text-sm opacity-80">
                  {t('copyright')}
                </p>
              </div>
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
              {t('title')}
            </h3>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-12 h-px bg-accent opacity-60"></div>
              <Heart className="w-5 h-5 text-accent" />
              <div className="w-12 h-px bg-accent opacity-60"></div>
            </div>

            <p className="text-white/80 font-body mb-8 max-w-md mx-auto italic">
              {t('quote')}
            </p>

            <p className="text-white/90 text-lg font-medium">
              {t('cta')}
            </p>
          </div>

          {/* Información de contacto minimalista */}
          <div className="grid md:grid-cols-3 gap-8 text-center mb-12 animation-delay-400">
            <button
              onClick={handleEmailClick}
              className="flex items-center justify-center space-x-3 hover:text-accent transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">maria.carlos@email.com</span>
            </button>
            <button
              onClick={handleWhatsAppClick}
              className="flex items-center justify-center space-x-3 hover:text-accent transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">{t('contact.whatsapp')}</span>
            </button>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleInstagramClick}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={handleFacebookClick}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
              >
                <Facebook className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Footer bottom */}
          <div className="border-t border-white/20 pt-8 text-center space-y-2 animation-delay-600">
            <p className="text-sm text-white/80">
              {t('copyright')}
            </p>
            <p className="text-sm text-white/60">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 