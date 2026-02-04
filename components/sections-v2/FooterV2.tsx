'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Instagram, Facebook, Mail, MessageCircle, Heart } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { openExternalLink } from '@/lib/utils';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';

export default function FooterV2() {
  const { t } = useTranslations('footer');
  const params = useParams();
  const currentLocale = params.locale as string;
  const { isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const [monogramExists, setMonogramExists] = useState(false);

  useEffect(() => {
    const checkMonogram = async () => {
      if (weddingData?.id) {
        try {
          const response = await fetch(`/assets/wedding-images/${weddingData.id}/monogram.svg`);
          setMonogramExists(response.ok);
        } catch {
          setMonogramExists(false);
        }
      }
    };
    checkMonogram();
  }, [weddingData?.id]);

  const couple = weddingData?.couple;
  const brideName = couple?.bride.name || 'María';
  const groomName = couple?.groom.name || 'Carlos';
  const bridPhone = couple?.bride.phone || '';
  const groomPhone = couple?.groom.phone || '';
  const brideInstagram = couple?.bride.instagram;
  const groomInstagram = couple?.groom.instagram;
  const brideFacebook = couple?.bride.facebook;
  const groomFacebook = couple?.groom.facebook;
  const coupleEmail = couple?.coupleEmail || 'maria.carlos@email.com';

  const showInstagram = weddingData?.hasInstagram !== false;
  const showFacebook = weddingData?.hasFacebook !== false;

  const coupleQuote = typeof couple?.quote === 'object' && couple.quote
    ? (couple.quote[currentLocale as 'es' | 'en'] || couple.quote.es || '')
    : (couple?.quote as unknown as string || t('quote'));

  const hashtag = couple?.hashtag || '#MaríaYCarlos2025';

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

  const getWhatsAppUrl = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  const handleEmailClick = () => {
    openExternalLink(`mailto:${coupleEmail}`);
  };

  if (!isLoaded) {
    return (
      <footer className="bg-[#f1e6d8] text-[#3b342b]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-[#efe6dc] rounded w-48" />
            <div className="h-4 bg-[#f3ece4] rounded w-full max-w-2xl" />
            <div className="h-10 bg-[#efe6dc] rounded w-56" />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#f1e6d8] text-[#3b342b] border-t border-[#e7dccf]">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs tracking-[0.22em] uppercase text-[#8a7c6b]">
              {hashtag}
            </p>
            <h3 className="mt-3 text-3xl md:text-4xl font-serif font-light">
              {brideName} <span className="text-[#8a7c6b]">&</span> {groomName}
            </h3>
            <p className="mt-6 text-sm md:text-base text-[#6f6254] leading-relaxed">
              {coupleQuote}
            </p>
          </div>

          <div className="lg:col-span-7">
            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {monogramExists && weddingData?.id ? (
                    <img
                      src={`/assets/wedding-images/${weddingData.id}/monogram.svg`}
                      alt="Monograma"
                      className="w-8 h-8 object-contain opacity-80"
                    />
                  ) : (
                    <Heart className="w-5 h-5 text-[#b79a7a]" />
                  )}
                  <p className="text-sm text-[#6f6254]">
                    {t('copyright').replace('{brideName}', brideName).replace('{groomName}', groomName)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {showInstagram && (brideInstagram || groomInstagram) && (
                    <button
                      onClick={handleInstagramClick}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#e7dccf] bg-white/80 hover:opacity-90 transition-opacity"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5 text-[#6f6254]" />
                    </button>
                  )}
                  {showFacebook && (brideFacebook || groomFacebook) && (
                    <button
                      onClick={handleFacebookClick}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#e7dccf] bg-white/80 hover:opacity-90 transition-opacity"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-5 h-5 text-[#6f6254]" />
                    </button>
                  )}
                  <button
                    onClick={handleEmailClick}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#e7dccf] bg-white/80 hover:opacity-90 transition-opacity"
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5 text-[#6f6254]" />
                  </button>
                </div>
              </div>

              {(bridPhone || groomPhone) && (
                <div className="mt-6">
                  <p className="text-xs tracking-[0.22em] uppercase text-[#8a7c6b]">
                    WhatsApp
                  </p>
                  <div className="mt-3 space-y-2">
                    {bridPhone && (
                      <a
                        href={getWhatsAppUrl(bridPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[#6f6254] hover:text-[#3b342b] transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          handleWhatsAppClick(bridPhone);
                        }}
                      >
                        <MessageCircle className="w-4 h-4 text-[#b79a7a]" />
                        <span className="font-medium text-[#3b342b]">{brideName}</span>
                        <span className="text-[#8a7c6b]">{bridPhone}</span>
                      </a>
                    )}
                    {groomPhone && (
                      <a
                        href={getWhatsAppUrl(groomPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[#6f6254] hover:text-[#3b342b] transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          handleWhatsAppClick(groomPhone);
                        }}
                      >
                        <MessageCircle className="w-4 h-4 text-[#b79a7a]" />
                        <span className="font-medium text-[#3b342b]">{groomName}</span>
                        <span className="text-[#8a7c6b]">{groomPhone}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
