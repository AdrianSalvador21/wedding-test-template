'use client';

import { useParams } from 'next/navigation';
import { Instagram, Facebook, Mail, MessageCircle } from 'lucide-react';
import { openExternalLink } from '@/lib/utils';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V4Container, V4Divider, V4Reveal, v4Colors } from './ui';

export default function FooterV4() {
  const { t } = useTranslations('footer');
  const params = useParams();
  const currentLocale = params.locale as string;
  const weddingData = useAppSelector(selectCurrentWedding);

  const couple = weddingData?.couple;
  const brideName = couple?.bride.name || 'María';
  const groomName = couple?.groom.name || 'Carlos';
  const bridePhone = couple?.bride.phone || '';
  const groomPhone = couple?.groom.phone || '';
  const brideInstagram = couple?.bride.instagram;
  const groomInstagram = couple?.groom.instagram;
  const brideFacebook = couple?.bride.facebook;
  const groomFacebook = couple?.groom.facebook;
  const coupleEmail = couple?.coupleEmail || 'contacto@email.com';

  const showInstagram = weddingData?.hasInstagram !== false;
  const showFacebook = weddingData?.hasFacebook !== false;

  const handleInstagramClick = () => {
    const handle = brideInstagram || groomInstagram;
    if (handle) openExternalLink(`https://instagram.com/${handle.replace('@', '')}`);
  };
  const handleFacebookClick = () => {
    const handle = brideFacebook || groomFacebook;
    if (handle) openExternalLink(`https://facebook.com/${handle}`);
  };
  const getWhatsAppUrl = (phone: string) => `https://wa.me/${phone.replace(/\D/g, '')}`;
  const handleEmailClick = () => openExternalLink(`mailto:${coupleEmail}`);

  return (
    <footer className="font-georgia" style={{ background: v4Colors.ink, color: v4Colors.paper }}>
      <V4Container className="py-16 md:py-20 text-center">
        <V4Reveal>
          <p className="text-3xl">
            {brideName.charAt(0)} &amp; {groomName.charAt(0)}
          </p>
          <p className="mt-4 text-[15px]" style={{ color: 'rgba(244,239,227,.8)' }}>
            {t('cta')}
          </p>
        </V4Reveal>

        {((showInstagram && (brideInstagram || groomInstagram)) ||
          (showFacebook && (brideFacebook || groomFacebook)) ||
          coupleEmail) && (
          <V4Reveal delay={0.1} className="flex items-center justify-center gap-3 mt-7">
            {showInstagram && (brideInstagram || groomInstagram) && (
              <button
                type="button"
                onClick={handleInstagramClick}
                className="w-9 h-9 rounded-full border flex items-center justify-center hover:opacity-75"
                style={{ borderColor: 'rgba(244,239,227,.25)' }}
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </button>
            )}
            {showFacebook && (brideFacebook || groomFacebook) && (
              <button
                type="button"
                onClick={handleFacebookClick}
                className="w-9 h-9 rounded-full border flex items-center justify-center hover:opacity-75"
                style={{ borderColor: 'rgba(244,239,227,.25)' }}
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleEmailClick}
              className="w-9 h-9 rounded-full border flex items-center justify-center hover:opacity-75"
              style={{ borderColor: 'rgba(244,239,227,.25)' }}
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </button>
          </V4Reveal>
        )}

        {(bridePhone || groomPhone) && (
          <V4Reveal delay={0.15} className="mt-7 flex flex-col items-center gap-2">
            {bridePhone && (
              <a
                href={getWhatsAppUrl(bridePhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm hover:opacity-80"
                style={{ color: 'rgba(244,239,227,.8)' }}
              >
                <MessageCircle className="w-4 h-4" style={{ color: v4Colors.gold }} />
                {brideName} · {bridePhone}
              </a>
            )}
            {groomPhone && (
              <a
                href={getWhatsAppUrl(groomPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm hover:opacity-80"
                style={{ color: 'rgba(244,239,227,.8)' }}
              >
                <MessageCircle className="w-4 h-4" style={{ color: v4Colors.gold }} />
                {groomName} · {groomPhone}
              </a>
            )}
          </V4Reveal>
        )}

        <V4Divider light className="mt-10" />

        <p className="mt-8 text-[11px] font-sans tracking-[0.18em] uppercase" style={{ color: v4Colors.gold }}>
          {t('copyright').replace('{brideName}', brideName).replace('{groomName}', groomName)}
        </p>
      </V4Container>
    </footer>
  );
}
