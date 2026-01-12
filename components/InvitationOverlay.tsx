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
            initial={{ scale: 0.8, opacity: 0, y: 50, rotateX: -15 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -30, rotateX: 10 }}
            transition={{ 
              duration: 0.6, 
              type: "spring", 
              damping: 20, 
              stiffness: 200,
              opacity: { duration: 0.4 }
            }}
            className="relative w-full h-screen md:h-auto md:max-w-md mx-auto md:my-auto"
            style={{ perspective: '1000px' }}
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
              className="h-screen md:h-auto md:rounded-2xl flex flex-col justify-center items-center p-6 md:p-8 relative overflow-hidden"
              style={{
                ...getBackgroundStyle(5, '500px'),
                backgroundColor: '#f8f6f3'
              }}
            >
              {/* Card Interna Centrada */}
              <motion.div 
                className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 max-w-xs mx-auto w-full"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              >
                {/* Header Simple */}
                <div className="relative bg-gradient-to-b from-stone-50 to-white p-6 pt-8 text-center">
                  {/* Couple Names */}
                  <motion.h1 
                    className="text-xl font-blockquote text-stone-800 leading-tight mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                  >
                    {bride.name} & {groom.name}
                  </motion.h1>
                  
                  <motion.div 
                    className="w-16 h-px bg-stone-300 mx-auto"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 64, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  ></motion.div>
                </div>

                {/* Invitation Info */}
                <div className="px-6 py-6 text-center space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
                  >
                    <motion.h3 
                      className="text-xl font-blockquote text-stone-800 mb-2"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.0, duration: 0.4, ease: "easeOut" }}
                    >
                      {guest.name}
                    </motion.h3>
                    
                    {/* Solo mostrar número de boletos si selectedGuestTickets no está activo */}
                    {!currentWedding.selectedGuestTickets && (
                      <motion.p 
                        className="text-base text-stone-600 font-body"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.4 }}
                      >
                        {guest.allowedGuests === 1 
                          ? t('guestCount.single')
                          : t('guestCount.multiple').replace('{count}', guest.allowedGuests.toString())
                        }
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Special Message */}
                  {guest.specialMessage && (
                    <motion.div 
                      className="bg-stone-50 rounded-2xl p-4"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 1.4, duration: 0.5, ease: "easeOut" }}
                    >
                      <p className="text-sm text-stone-600 italic leading-relaxed font-body">
                        &ldquo;{guest.specialMessage}&rdquo;
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Button */}
                <div className="px-6 pb-0">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.5, ease: "easeOut" }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className={buttonClass}
                  >
                    {t('openInvitation')}
                  </motion.button>
                </div>

                {/* Decorative Detail Below Button */}
                <motion.div 
                  className="px-6 py-3 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                >
                  <div className="flex items-center justify-center w-full max-w-24">
                    {/* Left Line */}
                    <motion.div 
                      className="flex-1 h-px bg-stone-300 opacity-50"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 2.0, duration: 0.8, ease: "easeOut" }}
                    ></motion.div>
                    
                    {/* Heart Icon */}
                    <motion.div 
                      className="mx-3"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 2.2, duration: 0.6, type: "spring", damping: 15 }}
                    >
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
                    </motion.div>
                    
                    {/* Right Line */}
                    <motion.div 
                      className="flex-1 h-px bg-stone-300 opacity-50"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 2.0, duration: 0.8, ease: "easeOut" }}
                    ></motion.div>
                  </div>
                </motion.div>

                {/* Decorative Footer */}
                <motion.div 
                  className="h-8 bg-gradient-to-b from-white to-stone-50 relative overflow-hidden"
                  style={{
                    ...getBackgroundStyle(4, '60px'),
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.4, duration: 0.4 }}
                >
                  <motion.div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-px bg-stone-200"
                    initial={{ width: 0, x: "-50%" }}
                    animate={{ width: 64, x: "-50%" }}
                    transition={{ delay: 2.6, duration: 0.6, ease: "easeOut" }}
                  ></motion.div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InvitationOverlay; 