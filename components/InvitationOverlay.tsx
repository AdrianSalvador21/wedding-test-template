'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { useAppSelector } from '../src/store/hooks';
import { selectCurrentWedding } from '../src/store/slices/weddingSlice';
import { getMockInvitation } from '../src/data/mockInvitations';
import { getFloralBackgroundStyle } from '../lib/floral-patterns';
import { useTranslations } from '../lib/translations';
import type { WeddingInvitation } from '../src/types/wedding';

interface InvitationOverlayProps {
  guestId: string;
  weddingId: string;
  onClose: () => void;
}

const InvitationOverlay: React.FC<InvitationOverlayProps> = ({ guestId, weddingId, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const currentWedding = useAppSelector(selectCurrentWedding);
  const [invitation, setInvitation] = useState<WeddingInvitation | null>(null);
  const { t } = useTranslations('invitationOverlay');

  useEffect(() => {
    // Obtener la invitación específica
    const invitationData = getMockInvitation(weddingId, guestId);
    setInvitation(invitationData);
  }, [weddingId, guestId]);

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

  if (!invitation || !currentWedding) {
    return null;
  }

  const { guest } = invitation;
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

            {/* Invitation Card */}
            <div className="bg-white shadow-2xl rounded-none md:rounded-3xl overflow-hidden border-0 md:border md:border-gray-200 h-screen md:h-auto flex flex-col">
              {/* Elegant Header */}
              <div className="relative bg-gradient-to-b from-stone-100 to-stone-50 p-6 pt-8 md:p-10 flex-shrink-0">
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 hidden md:block">
                  <div className="w-12 h-0.5 bg-stone-300"></div>
                </div>
                
                <div className="text-center pt-4 md:pt-0">
                  {/* Invitation Header */}
                  <div className="mb-6 md:mb-6">
                    <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-stone-500 mb-3 font-body font-medium">
                      {t('personalInvitation')}
                    </p>
                    <h1 className="text-lg md:text-xl font-heading text-stone-700 leading-relaxed">
                      {t('ourWedding')}
                    </h1>
                  </div>

                  {/* Couple Names */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3 md:space-x-4">
                      <h2 className="text-2xl md:text-4xl font-heading font-light text-stone-800 leading-tight">
                        {bride.name}
                      </h2>
                      <span className="text-2xl md:text-4xl text-stone-500 font-light">&</span>
                      <h2 className="text-2xl md:text-4xl font-heading font-light text-stone-800 leading-tight">
                        {groom.name}
                      </h2>
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-8 h-px bg-stone-300"></div>
                      <Heart className="w-4 h-4 text-stone-400" />
                      <div className="w-8 h-px bg-stone-300"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Information - Con patrón floral sutil */}
              <div 
                className="flex-1 flex flex-col justify-center px-6 md:px-10 py-8 md:py-8 text-center bg-gradient-to-b from-white to-stone-50 relative overflow-hidden"
                style={{
                  ...getFloralBackgroundStyle(4, '120px'),
                  // Debug temporal - puedes ver que se está aplicando
                  // border: '2px solid red',
                }}
              >
                <div className="space-y-6 md:space-y-6 relative z-10">
                  {/* Guest Info Card con patrón de fondo */}
                  <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                    <h3 className="text-xl md:text-2xl font-heading text-stone-800 mb-3">
                      {guest.name}
                    </h3>
                    
                    <p className="text-sm text-stone-600 font-body font-medium">
                      {guest.allowedGuests === 1 
                        ? t('guestCount.single')
                        : t('guestCount.multiple').replace('{count}', guest.allowedGuests.toString())
                      }
                    </p>
                  </div>

                  {/* Special Message */}
                  {guest.specialMessage && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 shadow-sm max-w-sm mx-auto">
                      <p className="text-sm md:text-base text-stone-600 italic leading-relaxed font-body font-light">
                        &ldquo;{guest.specialMessage}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Bottom Section */}
              <div className="flex-shrink-0 px-6 md:px-10 py-8 md:py-8 text-center bg-stone-50">
                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-stone-700 to-stone-600 text-white font-body font-semibold py-4 md:py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:from-stone-600 hover:to-stone-500 transition-all duration-300 text-base md:text-lg mb-4"
                >
                  {t('openInvitation')}
                </motion.button>

                {/* Elegant Footer */}
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-px bg-stone-300"></div>
                  <Heart className="w-3 h-3 text-stone-400" />
                  <div className="w-12 h-px bg-stone-300"></div>
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