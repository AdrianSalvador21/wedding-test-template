'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useWedding } from '../../src/store/hooks';
import { useTranslations } from '../../lib/translations';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V4Container, V4Reveal, V4Section, V4SectionHeading, v4Colors } from './ui';

export default function GiftRegistryV4() {
  const { t } = useTranslations('giftRegistry');
  const { currentWedding } = useWedding();
  const params = useParams();
  const currentLocale = params.locale as string;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!currentWedding?.giftRegistry?.enabled) return null;

  const { giftRegistry } = currentWedding;
  const hasRegistries = giftRegistry.registries && giftRegistry.registries.length > 0;
  const hasBankAccount = giftRegistry.bankAccount && (
    giftRegistry.bankAccount.bankName || giftRegistry.bankAccount.accountName || giftRegistry.bankAccount.accountNumber
  );

  if (!hasRegistries && !hasBankAccount) return null;

  const messageData = giftRegistry.message;
  const giftMessage = typeof messageData === 'object'
    ? (messageData[currentLocale as 'es' | 'en'] || messageData.es || t('message'))
    : (messageData || t('message'));

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <V4Section id="gift-registry" dark>
      <V4Container className="py-16 md:py-24 text-center">
        <V4Reveal>
          <V4SectionHeading numeral="VII" eyebrow={t('title')} light />
        </V4Reveal>

        {giftMessage && (
          <V4Reveal delay={0.08}>
            <p className="mt-6 italic text-lg leading-relaxed max-w-md mx-auto" style={{ color: v4Colors.paper }}>
              {formatTextWithLineBreaks(giftMessage)}
            </p>
          </V4Reveal>
        )}

        <div className="mt-10 max-w-md mx-auto space-y-4 text-left">
          {hasBankAccount && (
            <V4Reveal>
              <div className="border p-6" style={{ borderColor: 'rgba(244,239,227,.3)' }}>
                <p className="text-[10px] font-sans tracking-[0.2em] uppercase mb-3" style={{ color: v4Colors.gold }}>
                  {t('bankTransfer')}
                </p>
                {giftRegistry.bankAccount?.bankName && (
                  <p className="text-[15px]">{giftRegistry.bankAccount.bankName}{giftRegistry.bankAccount.accountName ? ` — ${giftRegistry.bankAccount.accountName}` : ''}</p>
                )}
                {giftRegistry.bankAccount?.accountNumber && (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-[13px] font-sans tracking-[0.06em]" style={{ color: 'rgba(244,239,227,.8)' }}>
                      {t('accountNumber')}: {giftRegistry.bankAccount.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(giftRegistry.bankAccount?.accountNumber || '', 'account')}
                      className="shrink-0 w-8 h-8 rounded-full border flex items-center justify-center hover:opacity-75"
                      style={{ borderColor: 'rgba(244,239,227,.3)' }}
                      aria-label={t('copyAccountNumber')}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {giftRegistry.bankAccount?.clabe && (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-[13px] font-sans tracking-[0.06em]" style={{ color: 'rgba(244,239,227,.8)' }}>
                      {t('clabe')}: {giftRegistry.bankAccount.clabe}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(giftRegistry.bankAccount?.clabe || '', 'clabe')}
                      className="shrink-0 w-8 h-8 rounded-full border flex items-center justify-center hover:opacity-75"
                      style={{ borderColor: 'rgba(244,239,227,.3)' }}
                      aria-label={t('copyClabe')}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {copiedField && (
                  <p className="mt-3 text-[12px] font-sans" style={{ color: v4Colors.gold }}>
                    {copiedField === 'account' ? t('accountCopied') : t('clabeCopied')}
                  </p>
                )}
              </div>
            </V4Reveal>
          )}

          {hasRegistries && (
            <V4Reveal delay={0.1}>
              <div className="grid grid-cols-2 gap-3">
                {giftRegistry.registries.map((registry) => (
                  <a
                    key={registry.id}
                    href={registry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border p-4 text-center hover:opacity-75 transition-opacity"
                    style={{ borderColor: 'rgba(244,239,227,.3)' }}
                  >
                    <div className="text-[15px]">{registry.name}</div>
                    <div className="mt-1 text-[9px] font-sans tracking-[0.18em] uppercase" style={{ color: v4Colors.gold }}>
                      {t('onlineRegistries')} →
                    </div>
                  </a>
                ))}
              </div>
            </V4Reveal>
          )}
        </div>
      </V4Container>
    </V4Section>
  );
}
