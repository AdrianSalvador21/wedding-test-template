'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useAppSelector } from '../src/store/hooks';
import { selectCurrentWedding } from '../src/store/slices/weddingSlice';
import { getMockInvitation } from '../src/data/mockInvitations';
import { useThemePatterns, useTheme } from '../lib/theme-context';
import { useTranslations } from '../lib/translations';
import type { WeddingInvitation, FirebaseGuest } from '../src/types/wedding';

interface InvitationOverlayProps {
  guestId: string;
  weddingId: string;
  guestInfo?: FirebaseGuest | null;
  onClose: () => void;
  isDemoMode?: boolean;
}

const InvitationOverlay: React.FC<InvitationOverlayProps> = ({ guestId, weddingId, guestInfo, onClose, isDemoMode = false }) => {
  const [isVisible, setIsVisible] = useState(true);
  const currentWedding = useAppSelector(selectCurrentWedding);
  const [invitation, setInvitation] = useState<WeddingInvitation | null>(null);
  const { t } = useTranslations('invitationOverlay');
  const { getBackgroundStyle } = useThemePatterns();
  const { currentTheme } = useTheme();
  const params = useParams();
  const currentLocale = params.locale as string;

  // Clases condicionales basadas en el tema
  const isLuxuryTheme = currentTheme.id === 'luxury';
  const isPremiumTheme = currentTheme.id === 'premium';
  const isCorporateTheme = currentTheme.id === 'corporate';
  const isThemeWithCustomColors = isLuxuryTheme || isPremiumTheme || isCorporateTheme;
  
  const buttonClass = isThemeWithCustomColors 
    ? 'w-full btn-theme-primary font-body font-medium py-3 px-6 rounded-xl transition-all duration-300 text-sm tracking-wide'
    : 'w-full bg-stone-600 hover:bg-stone-700 text-white font-body font-medium py-3 px-6 rounded-xl transition-all duration-300 text-sm tracking-wide';

  useEffect(() => {
    if (isDemoMode) {
      // Crear invitación de demostración
      const demoInvitation: WeddingInvitation = {
        wedding: currentWedding!,
        guest: {
          id: 'demo-guest',
          name: 'Ricardo Verdi',
          email: 'ricardo.verdi@demo.com',
          allowedGuests: 2,
          guestType: 'friends',
          table: 'Mesa Demo',
          specialMessage: currentLocale === 'en' 
            ? 'You are very important to us, we are waiting for you!'
            : '¡Eres muy importante para nosotros, te esperamos!',
          isConfirmed: false,
          notes: 'Invitación de demostración'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setInvitation(demoInvitation);
    } else {
      // Obtener la invitación específica
      const invitationData = getMockInvitation(weddingId, guestId);
      setInvitation(invitationData);
    }
  }, [weddingId, guestId, isDemoMode, currentWedding, currentLocale]);

  useEffect(() => {
    // Bloquear scroll en mobile cuando el overlay está activo
    const isMobile = window.innerWidth < 768;
    if (isVisible && isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'unset';
    }

    // Cleanup al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'unset';
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'unset';
      onClose();
    }, 500); // Esperar a que termine la animación
  };

  if (!currentWedding) {
    return null;
  }

  // Usar información real del invitado si está disponible, sino usar mock
  const guest = guestInfo ? {
    name: guestInfo.name,
    allowedGuests: guestInfo.guestCount,
    specialMessage: guestInfo.coupleMessage || null
  } : (invitation?.guest || {
    name: 'Invitado',
    allowedGuests: 1,
    specialMessage: null
  });

  const { bride, groom } = currentWedding.couple;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-start justify-center p-0 md:p-8 md:items-center overflow-hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0" 
            onClick={handleClose}
          />
          
          {/* Invitation Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ duration: 0.5, type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full h-screen md:h-auto md:max-w-md mx-auto md:my-auto"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 md:-top-3 md:-right-3 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 hover:shadow-xl transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Invitation Card - Fondo completo */}
            <div 
              className="h-screen md:h-auto flex flex-col justify-center items-center p-6 md:p-8 relative overflow-hidden"
              style={{
                ...getBackgroundStyle(5, '500px'),
                backgroundColor: '#f8f6f3'
              }}
            >
              {/* Card Interna Centrada */}
              <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 max-w-xs mx-auto w-full">
                {/* Header Simple */}
                <div className="relative bg-gradient-to-b from-stone-50 to-white p-6 pt-8 text-center">
                  {/* Couple Names */}
                  <h1 className="text-xl font-heading text-stone-800 leading-tight mb-4">
                    {bride.name} & {groom.name}
                  </h1>
                  
                  <div className="w-16 h-px bg-stone-300 mx-auto"></div>
                </div>

                {/* Invitation Info */}
                <div className="px-6 py-6 text-center space-y-6">
                  <div>
                    <h3 className="text-xl font-heading text-stone-800 mb-2">
                      {guest.name}
                    </h3>
                    
                    <p className="text-base text-stone-600 font-body">
                      {guest.allowedGuests === 1 
                        ? t('guestCount.single')
                        : t('guestCount.multiple').replace('{count}', guest.allowedGuests.toString())
                      }
                    </p>
                  </div>

                  {/* Special Message */}
                  {guest.specialMessage && (
                    <div className="bg-stone-50 rounded-2xl p-4">
                      <p className="text-sm text-stone-600 italic leading-relaxed font-body">
                        &ldquo;{guest.specialMessage}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Button */}
                <div className="px-6 pb-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className={buttonClass}
                  >
                    {t('openInvitation')}
                  </motion.button>
                </div>

                {/* Decorative Detail Below Button */}
                <div className="px-6 py-3 flex items-center justify-center">
                  <div className="flex items-center justify-center w-full max-w-24">
                    {/* Left Line */}
                    <div className="flex-1 h-px bg-stone-300 opacity-50"></div>
                    
                    {/* Heart Icon */}
                    <div className="mx-3">
                      <svg 
                        width="10" 
                        height="10" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        className="text-stone-400"
                      >
                        <path 
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                          fill="currentColor"
                          opacity="0.4"
                        />
                      </svg>
                    </div>
                    
                    {/* Right Line */}
                    <div className="flex-1 h-px bg-stone-300 opacity-50"></div>
                  </div>
                </div>

                {/* Decorative Footer */}
                <div 
                  className="h-8 bg-gradient-to-b from-white to-stone-50 relative overflow-hidden"
                  style={{
                    ...getBackgroundStyle(4, '60px'),
                  }}
                >
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-px bg-stone-200"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InvitationOverlay; 