'use client';

import { useState } from 'react';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useWedding } from '../../src/store/hooks';
import { useTranslations } from '../../lib/translations';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V3BgMotif, V3Card, V3Container, V3CornerFlourish, V3EyebrowTitle, V3Reveal, V3Section, v3Colors } from './ui';

export default function GiftRegistryV3() {
  const { t } = useTranslations('giftRegistry');
  const { currentWedding } = useWedding();
  const params = useParams();
  const currentLocale = params.locale as string;
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isBankExpanded, setIsBankExpanded] = useState(true);
  const [isRegistryExpanded, setIsRegistryExpanded] = useState(true);

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
    <V3Section id="gift-registry" tinted>
      <V3BgMotif patternId="v3-lp-giftregistry" tileSize={250} rotate={9} />
      <V3CornerFlourish corner="bottom-left" width={150} height={100} opacity={0.5} />
      <V3Container className="py-16 md:py-24">
        <V3Reveal>
          <V3EyebrowTitle title={t('title')} />
          {giftMessage && (
            <p className="mt-5 font-jost text-sm md:text-[15px] text-[#6B6255] max-w-xl mx-auto">
              {formatTextWithLineBreaks(giftMessage)}
            </p>
          )}
        </V3Reveal>

        <div className="mt-12 max-w-2xl mx-auto space-y-5">
          {hasRegistries && (
            <V3Reveal>
              <V3Card>
                <button
                  onClick={() => setIsRegistryExpanded(!isRegistryExpanded)}
                  className="w-full px-6 py-5 flex items-center justify-between"
                >
                  <span className="font-cormorant italic text-lg text-[#34302A]">{t('onlineRegistries')}</span>
                  {isRegistryExpanded ? <ChevronUp className="w-5 h-5 text-[#6B6255]" /> : <ChevronDown className="w-5 h-5 text-[#6B6255]" />}
                </button>
                {isRegistryExpanded && (
                  <div className="px-6 pb-6 pt-1 border-t" style={{ borderColor: `${v3Colors.accent}26` }}>
                    <div className="grid gap-3 md:grid-cols-2 mt-5">
                      {giftRegistry.registries.map((registry) => (
                        <a
                          key={registry.id}
                          href={registry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-[4px] border px-4 py-4 text-center font-jost text-sm text-[#34302A] hover:opacity-80 transition-opacity"
                          style={{ borderColor: `${v3Colors.accent}3D` }}
                        >
                          {registry.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </V3Card>
            </V3Reveal>
          )}

          {giftRegistry.bankAccount && (
            <V3Reveal delay={0.1}>
              <V3Card>
                <button
                  onClick={() => setIsBankExpanded(!isBankExpanded)}
                  className="w-full px-6 py-5 flex items-center justify-between"
                >
                  <span className="font-cormorant italic text-lg text-[#34302A]">{t('bankTransfer')}</span>
                  {isBankExpanded ? <ChevronUp className="w-5 h-5 text-[#6B6255]" /> : <ChevronDown className="w-5 h-5 text-[#6B6255]" />}
                </button>

                {isBankExpanded && (
                  <div className="px-6 pb-6 pt-1 border-t" style={{ borderColor: `${v3Colors.accent}26` }}>
                    {(() => {
                      const descriptionData = giftRegistry.bankAccount.description;
                      const bankDescription = typeof descriptionData === 'object'
                        ? (descriptionData[currentLocale as 'es' | 'en'] || descriptionData.es)
                        : descriptionData;
                      return bankDescription && (
                        <p className="mt-5 text-center font-jost text-sm text-[#6B6255]">{bankDescription}</p>
                      );
                    })()}

                    <div className="mt-6 space-y-3">
                      {giftRegistry.bankAccount.bankName && (
                        <div className="rounded-[4px] border p-4" style={{ borderColor: `${v3Colors.accent}3D` }}>
                          <p className="font-jost text-[11px] tracking-[0.2em] uppercase text-[#8C8172]">{t('bank')}</p>
                          <p className="mt-2 font-jost text-sm text-[#34302A] font-medium">{giftRegistry.bankAccount.bankName}</p>
                        </div>
                      )}
                      {giftRegistry.bankAccount.accountName && (
                        <div className="rounded-[4px] border p-4" style={{ borderColor: `${v3Colors.accent}3D` }}>
                          <p className="font-jost text-[11px] tracking-[0.2em] uppercase text-[#8C8172]">{t('accountHolder')}</p>
                          <p className="mt-2 font-jost text-sm text-[#34302A] font-medium">{giftRegistry.bankAccount.accountName}</p>
                        </div>
                      )}
                      {giftRegistry.bankAccount.accountNumber && (
                        <div className="rounded-[4px] border p-4 flex items-center justify-between gap-4" style={{ borderColor: `${v3Colors.accent}3D` }}>
                          <div className="min-w-0">
                            <p className="font-jost text-[11px] tracking-[0.2em] uppercase text-[#8C8172]">{t('accountNumber')}</p>
                            <p className="mt-2 font-jost text-sm text-[#34302A] font-medium break-all">{giftRegistry.bankAccount.accountNumber}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(giftRegistry.bankAccount?.accountNumber || '', 'account')}
                            className="shrink-0 w-10 h-10 rounded-full border flex items-center justify-center hover:opacity-80 transition-opacity"
                            style={{ borderColor: `${v3Colors.accent}3D` }}
                            title={t('copyAccountNumber')}
                          >
                            <Copy className="w-4 h-4 text-[#6B6255]" />
                          </button>
                        </div>
                      )}
                      {giftRegistry.bankAccount.clabe && (
                        <div className="rounded-[4px] border p-4 flex items-center justify-between gap-4" style={{ borderColor: `${v3Colors.accent}3D` }}>
                          <div className="min-w-0">
                            <p className="font-jost text-[11px] tracking-[0.2em] uppercase text-[#8C8172]">{t('clabe')}</p>
                            <p className="mt-2 font-jost text-sm text-[#34302A] font-medium break-all">{giftRegistry.bankAccount.clabe}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(giftRegistry.bankAccount?.clabe || '', 'clabe')}
                            className="shrink-0 w-10 h-10 rounded-full border flex items-center justify-center hover:opacity-80 transition-opacity"
                            style={{ borderColor: `${v3Colors.accent}3D` }}
                            title={t('copyClabe')}
                          >
                            <Copy className="w-4 h-4 text-[#6B6255]" />
                          </button>
                        </div>
                      )}
                    </div>

                    {copiedField && (
                      <div className="mt-5 rounded-[4px] border p-4" style={{ borderColor: `${v3Colors.accent}26` }}>
                        <p className="font-jost text-sm text-center text-[#6B6255]">
                          {copiedField === 'account' ? t('accountCopied') : t('clabeCopied')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </V3Card>
            </V3Reveal>
          )}
        </div>
      </V3Container>
    </V3Section>
  );
}
