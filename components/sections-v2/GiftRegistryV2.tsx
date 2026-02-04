'use client';

import { useState } from 'react';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useWedding } from '../../src/store/hooks';
import { useThemePatterns } from '../../lib/theme-context';
import { useTranslations } from '../../lib/translations';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V2Card, V2Container, V2Section, V2Title } from './ui';

export default function GiftRegistryV2() {
  const { t } = useTranslations('giftRegistry');
  const { currentWedding } = useWedding();
  const { getBackgroundStyle } = useThemePatterns();
  const params = useParams();
  const currentLocale = params.locale as string;
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isBankExpanded, setIsBankExpanded] = useState(true);
  const [isRegistryExpanded, setIsRegistryExpanded] = useState(true);

  if (!currentWedding?.giftRegistry?.enabled) {
    return null;
  }

  const { giftRegistry } = currentWedding;

  const hasRegistries = giftRegistry.registries && giftRegistry.registries.length > 0;
  const hasBankAccount = giftRegistry.bankAccount && (
    giftRegistry.bankAccount.bankName ||
    giftRegistry.bankAccount.accountName ||
    giftRegistry.bankAccount.accountNumber
  );

  if (!hasRegistries && !hasBankAccount) {
    return null;
  }

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
    <V2Section
      id="gift-registry"
      className="relative overflow-hidden"
      style={getBackgroundStyle(1, '200px')}
    >
      <V2Container className="py-12">
        <V2Title title={t('title')} subtitle={giftMessage ? formatTextWithLineBreaks(giftMessage) : undefined} />

        <div className="mt-10 max-w-3xl mx-auto space-y-5">
          {giftRegistry.registries.length > 0 && (
            <V2Card>
              <button
                onClick={() => setIsRegistryExpanded(!isRegistryExpanded)}
                className="w-full px-6 py-5 flex items-center justify-between"
              >
                <span className="font-serif text-base text-[#3b342b]">{t('onlineRegistries')}</span>
                {isRegistryExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[#6f6254]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#6f6254]" />
                )}
              </button>
              {isRegistryExpanded && (
                <div className="px-6 pb-6 border-t border-[#efe6dc]">
                  <div className="grid gap-3 md:grid-cols-2 mt-5">
                    {giftRegistry.registries.map((registry) => (
                      <a
                        key={registry.id}
                        href={registry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-[22px] border border-[#e7dccf] bg-white/70 px-4 py-4 text-center hover:opacity-90 transition-opacity"
                      >
                        <span className="font-serif text-[#3b342b]">{registry.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </V2Card>
          )}

          {giftRegistry.bankAccount && (
            <V2Card>
              <button
                onClick={() => setIsBankExpanded(!isBankExpanded)}
                className="w-full px-6 py-5 flex items-center justify-between"
              >
                <span className="font-serif text-base text-[#3b342b]">{t('bankTransfer')}</span>
                {isBankExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[#6f6254]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#6f6254]" />
                )}
              </button>

              {isBankExpanded && (
                <div className="px-6 pb-6 border-t border-[#efe6dc]">
                  {(() => {
                    const descriptionData = giftRegistry.bankAccount.description;
                    const bankDescription = typeof descriptionData === 'object'
                      ? (descriptionData[currentLocale as 'es' | 'en'] || descriptionData.es)
                      : descriptionData;

                    return bankDescription && (
                      <p className="mt-5 text-center text-sm text-[#6f6254]">
                        {bankDescription}
                      </p>
                    );
                  })()}

                  <div className="mt-6 space-y-3">
                    {giftRegistry.bankAccount.bankName && (
                      <div className="rounded-[22px] border border-[#e7dccf] bg-white/70 p-4">
                        <p className="text-[11px] tracking-[0.28em] uppercase text-[#8a7c6b]">{t('bank')}</p>
                        <p className="mt-2 text-sm text-[#3b342b] font-medium">{giftRegistry.bankAccount.bankName}</p>
                      </div>
                    )}

                    {giftRegistry.bankAccount.accountName && (
                      <div className="rounded-[22px] border border-[#e7dccf] bg-white/70 p-4">
                        <p className="text-[11px] tracking-[0.28em] uppercase text-[#8a7c6b]">{t('accountHolder')}</p>
                        <p className="mt-2 text-sm text-[#3b342b] font-medium">{giftRegistry.bankAccount.accountName}</p>
                      </div>
                    )}

                    {giftRegistry.bankAccount.accountNumber && (
                      <div className="rounded-[22px] border border-[#e7dccf] bg-white/70 p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[11px] tracking-[0.28em] uppercase text-[#8a7c6b]">{t('accountNumber')}</p>
                          <p className="mt-2 text-sm text-[#3b342b] font-medium break-all">{giftRegistry.bankAccount.accountNumber}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(giftRegistry.bankAccount?.accountNumber || '', 'account')}
                          className="shrink-0 w-10 h-10 rounded-full border border-[#e7dccf] bg-white/80 flex items-center justify-center hover:opacity-90 transition-opacity"
                          title={t('copyAccountNumber')}
                        >
                          <Copy className="w-4 h-4 text-[#6f6254]" />
                        </button>
                      </div>
                    )}

                    {giftRegistry.bankAccount.clabe && (
                      <div className="rounded-[22px] border border-[#e7dccf] bg-white/70 p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[11px] tracking-[0.28em] uppercase text-[#8a7c6b]">{t('clabe')}</p>
                          <p className="mt-2 text-sm text-[#3b342b] font-medium break-all">{giftRegistry.bankAccount.clabe}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(giftRegistry.bankAccount?.clabe || '', 'clabe')}
                          className="shrink-0 w-10 h-10 rounded-full border border-[#e7dccf] bg-white/80 flex items-center justify-center hover:opacity-90 transition-opacity"
                          title={t('copyClabe')}
                        >
                          <Copy className="w-4 h-4 text-[#6f6254]" />
                        </button>
                      </div>
                    )}
                  </div>

                  {copiedField && (
                    <div className="mt-5 rounded-[22px] border border-[#eadfd3] bg-white/70 p-4">
                      <p className="text-sm text-center text-[#6f6254]">
                        {copiedField === 'account' ? t('accountCopied') : t('clabeCopied')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </V2Card>
          )}
        </div>
      </V2Container>
    </V2Section>
  );
}
