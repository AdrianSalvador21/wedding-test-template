'use client';

import { useParams } from 'next/navigation';
import { Instagram, Facebook, Mail, MessageCircle } from 'lucide-react';
import { openExternalLink } from '@/lib/utils';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { V3Branch, V3Container, V3Divider, V3Monogram, V3Reveal, v3Colors } from './ui';

export default function FooterV3() {
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

  const coupleQuote = typeof couple?.quote === 'object' && couple.quote
    ? (couple.quote[currentLocale as 'es' | 'en'] || couple.quote.es || '')
    : ((couple?.quote as unknown as string) || t('quote'));

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
    <footer className="relative overflow-hidden bg-[#2E2A24] text-[#EFE7D8]">
      <V3Branch
        width={150}
        height={98}
        color="#EFE7D8"
        accentColor="#EFE7D8"
        className="absolute"
        style={{ left: 30, top: 30, opacity: 0.3 }}
      />
      <V3Branch
        width={150}
        height={98}
        mirrored
        color="#EFE7D8"
        accentColor="#EFE7D8"
        className="absolute"
        style={{ right: 30, top: 30, opacity: 0.3 }}
      />
      <V3Container className="py-20 md:py-24 text-center">
        <V3Reveal>
          <V3Monogram
            initials={<>{brideName.charAt(0)}<span style={{ color: v3Colors.accent }}>&amp;</span>{groomName.charAt(0)}</>}
            size={78}
            className="mx-auto"
          />
        </V3Reveal>

        <V3Reveal delay={0.1}>
          <p className="mt-7 font-cormorant italic text-2xl md:text-[28px]">{t('cta')}</p>
          <p className="mt-2 font-jost text-sm text-[#B9AE98]">
            {brideName} &amp; {groomName}
          </p>
          {coupleQuote && (
            <p className="mt-4 font-jost text-xs text-[#8C8172] max-w-md mx-auto italic">&ldquo;{coupleQuote}&rdquo;</p>
          )}
        </V3Reveal>

        {(showInstagram && (brideInstagram || groomInstagram)) ||
        (showFacebook && (brideFacebook || groomFacebook)) ||
        coupleEmail ? (
          <V3Reveal delay={0.15} className="flex items-center justify-center gap-3 mt-8">
            {showInstagram && (brideInstagram || groomInstagram) && (
              <button
                onClick={handleInstagramClick}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#EFE7D8]/20 hover:border-[#EFE7D8]/50 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </button>
            )}
            {showFacebook && (brideFacebook || groomFacebook) && (
              <button
                onClick={handleFacebookClick}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#EFE7D8]/20 hover:border-[#EFE7D8]/50 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleEmailClick}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#EFE7D8]/20 hover:border-[#EFE7D8]/50 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </button>
          </V3Reveal>
        ) : null}

        {(bridePhone || groomPhone) && (
          <V3Reveal delay={0.2} className="mt-8 flex flex-col items-center gap-2">
            {bridePhone && (
              <a
                href={getWhatsAppUrl(bridePhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-jost text-sm text-[#B9AE98] hover:text-[#EFE7D8] transition-colors"
              >
                <MessageCircle className="w-4 h-4" style={{ color: v3Colors.accent }} />
                {brideName} · {bridePhone}
              </a>
            )}
            {groomPhone && (
              <a
                href={getWhatsAppUrl(groomPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-jost text-sm text-[#B9AE98] hover:text-[#EFE7D8] transition-colors"
              >
                <MessageCircle className="w-4 h-4" style={{ color: v3Colors.accent }} />
                {groomName} · {groomPhone}
              </a>
            )}
          </V3Reveal>
        )}

        <V3Divider light className="mt-12" />

        <p className="mt-9 font-jost text-[11px] tracking-[0.18em] uppercase text-[#8C8172]">
          {t('copyright').replace('{brideName}', brideName).replace('{groomName}', groomName)}
        </p>
      </V3Container>
    </footer>
  );
}
