'use client';

import React from 'react';
import { Heart, Instagram, Facebook, Mail, Phone } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { openExternalLink } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useTheme } from '../../lib/theme-context';

const Footer = () => {
  const { t } = useTranslations('footer');
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const { currentTheme } = useTheme();

  // Datos dinámicos con fallbacks
  const couple = weddingData?.couple;
  const brideName = couple?.bride.name || 'María';
  const groomName = couple?.groom.name || 'Carlos';
  const bridPhone = couple?.bride.phone || '+52 55 1234-5678';
  const groomPhone = couple?.groom.phone || '+52 55 8765-4321';
  const brideInstagram = couple?.bride.instagram;
  const groomInstagram = couple?.groom.instagram;
  const brideFacebook = couple?.bride.facebook;
  const groomFacebook = couple?.groom.facebook;
  const coupleEmail = couple?.coupleEmail || 'maria.carlos@email.com';
  const coupleQuote = couple?.quote || t('quote');
  const hashtag = couple?.hashtag || '#MaríaYCarlos2025';

  // Clases condicionales basadas en el tema
  const isLuxuryTheme = currentTheme.id === 'luxury';
  const isPremiumTheme = currentTheme.id === 'premium';
  const isCorporateTheme = currentTheme.id === 'corporate';
  const isThemeWithCustomColors = isLuxuryTheme || isPremiumTheme || isCorporateTheme;
  
  const footerBgClass = isThemeWithCustomColors ? 'footer-theme-bg' : 'bg-gradient-to-br from-primary via-secondary to-accent';
  const footerTextClass = isThemeWithCustomColors ? 'footer-theme-text' : 'text-white';
  const footerAccentClass = isThemeWithCustomColors ? 'footer-theme-accent' : 'text-accent';
  const hoverClass = isThemeWithCustomColors ? 'hover-theme-accent' : 'hover:text-accent';

  const handleInstagramClick = () => {
    if (brideInstagram) {
      openExternalLink(`https://instagram.com/${brideInstagram.replace('@', '')}`);
    } else if (groomInstagram) {
      openExternalLink(`https://instagram.com/${groomInstagram.replace('@', '')}`);
    } else {
      openExternalLink('https://instagram.com/mariaycarlos2025');
    }
  };

  const handleFacebookClick = () => {
    if (brideFacebook) {
      openExternalLink(`https://facebook.com/${brideFacebook}`);
    } else if (groomFacebook) {
      openExternalLink(`https://facebook.com/${groomFacebook}`);
    } else {
      openExternalLink('https://facebook.com/mariaycarlos2025');
    }
  };

  const handleWhatsAppClick = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    openExternalLink(`https://wa.me/${cleanPhone}`);
  };

  const handleEmailClick = () => {
    openExternalLink(`mailto:${coupleEmail}`);
  };

  // Versión estática para móvil
  if (isMobile) {
    return (
      <footer className={`${footerBgClass} ${footerTextClass}`}>
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-8 sm:">
          <div className="text-center space-y-6 max-w-sm mx-auto">
            {/* Nombres de la pareja */}
            <div>
              <h2 className="text-2xl font-heading font-light mb-2">
                {brideName} & {groomName}
              </h2>
              
              {/* Línea decorativa */}
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-8 h-px bg-white/40"></div>
                <Heart className="w-4 h-4 text-white/60" />
                <div className="w-8 h-px bg-white/40"></div>
              </div>
            </div>

            {/* Redes sociales */}
            <div className="flex justify-center space-x-4">
              {(brideInstagram || groomInstagram) && (
                <button
                  onClick={handleInstagramClick}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </button>
              )}
              {(brideFacebook || groomFacebook) && (
                <button
                  onClick={handleFacebookClick}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleEmailClick}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>

            {/* Hashtag */}
            {hashtag && (
              <p className="text-white/80 text-base font-body font-medium">
                {hashtag}
              </p>
            )}

            {/* Copyright */}
            <p className="text-white/60 text-xs font-body mt-6">
              {t('copyright')}
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <footer className={`${footerBgClass} ${footerTextClass}`}>
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-8 sm:">
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
    <footer className={`${footerBgClass} ${footerTextClass}`}>
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-8 sm:">
        <div className="max-w-4xl mx-auto">
          
          {/* Contenido principal minimalista */}
          <div className="text-center mb-12 animate-fade-in-up animation-delay-200">
            <h3 className="text-2xl font-heading font-light mb-4">
              {brideName} & {groomName}
            </h3>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`w-12 h-px ${isLuxuryTheme ? 'bg-theme-accent' : 'bg-accent'} opacity-60`}></div>
              <Heart className={`w-5 h-5 ${footerAccentClass}`} />
              <div className={`w-12 h-px ${isLuxuryTheme ? 'bg-theme-accent' : 'bg-accent'} opacity-60`}></div>
            </div>

            <p className="text-white/80 font-body mb-8 max-w-md mx-auto italic">
              {coupleQuote}
            </p>

            <p className="text-white/90 text-lg font-body font-medium">
              {t('cta')}
            </p>

            {hashtag && (
              <p className={`${footerAccentClass} text-lg font-body font-medium mt-4`}>
                {hashtag}
              </p>
            )}
          </div>

          {/* Información de contacto minimalista */}
          <div className="grid md:grid-cols-3 gap-8 text-center mb-12 animation-delay-400">
            <button
              onClick={handleEmailClick}
              className={`flex items-center justify-center space-x-3 ${hoverClass} transition-colors`}
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm font-body">{coupleEmail}</span>
            </button>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handleWhatsAppClick(bridPhone)}
                className={`flex items-center space-x-2 ${hoverClass} transition-colors`}
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-body">{brideName}</span>
              </button>
              <span className="text-white/40">|</span>
              <button
                onClick={() => handleWhatsAppClick(groomPhone)}
                className={`flex items-center space-x-2 ${hoverClass} transition-colors`}
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-body">{groomName}</span>
              </button>
            </div>
            <div className="flex justify-center space-x-4">
              {(brideInstagram || groomInstagram) && (
                <button
                  onClick={handleInstagramClick}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
                >
                  <Instagram className="w-4 h-4 text-white" />
                </button>
              )}
              {(brideFacebook || groomFacebook) && (
                <button
                  onClick={handleFacebookClick}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
                >
                  <Facebook className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-white/60 text-sm font-body animation-delay-600">
            <p>{t('copyright')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 