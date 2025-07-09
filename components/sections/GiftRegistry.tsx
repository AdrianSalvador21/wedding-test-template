'use client';

import { useWedding } from '../../src/store/hooks';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { getFloralBackgroundStyle } from '../../lib/floral-patterns';
import { useTranslations } from '../../lib/translations';

export default function GiftRegistry() {
  const { t } = useTranslations('giftRegistry');
  const { currentWedding } = useWedding();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isBankExpanded, setIsBankExpanded] = useState(false);
  const [isRegistryExpanded, setIsRegistryExpanded] = useState(false);

  if (!currentWedding?.giftRegistry?.enabled) {
    return null;
  }

  const { giftRegistry } = currentWedding;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <section 
      id="gift-registry" 
      className="py-12 bg-gray-50 mb-12 relative overflow-hidden"
      style={getFloralBackgroundStyle(1, '200px')}
    >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
        {/* Título */}
        <div className="text-center mb-12">
          <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
          <div className="w-16 h-0.5 bg-accent mx-auto mb-6"></div>
          {giftRegistry.message && (
            <p className="section-subtitle">
              {giftRegistry.message}
            </p>
          )}
        </div>

        {/* Mesas de Regalos Online */}
        {giftRegistry.registries.length > 0 && (
          <div className="mb-6 max-w-2xl mx-auto">
            <div className="bg-white border border-border rounded-lg">
              <button
                onClick={() => setIsRegistryExpanded(!isRegistryExpanded)}
                className="w-full p-5 flex items-center justify-between hover:border-primary/30 transition-colors"
              >
                <h3 className="text-base font-body text-dark">
                  {t('onlineRegistries')}
                </h3>
                {isRegistryExpanded ? (
                  <ChevronUp className="w-5 h-5 text-dark" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-dark" />
                )}
              </button>
              
              {isRegistryExpanded && (
                <div className="px-5 pb-5 border-t border-border">
                  <div className="grid gap-3 md:grid-cols-2 mt-4">
                    {giftRegistry.registries.map((registry) => (
                      <a
                        key={registry.id}
                        href={registry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-50 border border-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors duration-300 block"
                      >
                        <h4 className="text-base font-body text-dark hover:text-primary transition-colors">
                          {registry.name}
                        </h4>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

                {/* Cuenta Bancaria */}
        {giftRegistry.bankAccount && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-border rounded-lg">
              <button
                onClick={() => setIsBankExpanded(!isBankExpanded)}
                className="w-full p-5 flex items-center justify-between hover:border-primary/30 transition-colors"
              >
                <h3 className="text-base font-body text-dark">
                  {t('bankTransfer')}
                </h3>
                {isBankExpanded ? (
                  <ChevronUp className="w-5 h-5 text-dark" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-dark" />
                )}
              </button>
              
              {isBankExpanded && (
                <div className="px-5 pb-5 border-t border-border">
                  {giftRegistry.bankAccount.description && (
                    <p className="text-text font-body text-center mb-6 mt-4 text-sm">
                      {giftRegistry.bankAccount.description}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-body text-text/70">{t('bank')}</p>
                        <p className="font-body font-medium text-dark">{giftRegistry.bankAccount.bankName}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-body text-text/70">{t('accountHolder')}</p>
                        <p className="font-body font-medium text-dark">{giftRegistry.bankAccount.accountName}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-body text-text/70">{t('accountNumber')}</p>
                        <p className="font-body font-medium text-dark">{giftRegistry.bankAccount.accountNumber}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(giftRegistry.bankAccount?.accountNumber || '', 'account')}
                        className="p-2 text-text/70 hover:text-primary transition-colors"
                        title={t('copyAccountNumber')}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {giftRegistry.bankAccount.clabe && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-body text-text/70">{t('clabe')}</p>
                          <p className="font-body font-medium text-dark">{giftRegistry.bankAccount.clabe}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(giftRegistry.bankAccount?.clabe || '', 'clabe')}
                          className="p-2 text-text/70 hover:text-primary transition-colors"
                          title={t('copyClabe')}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {copiedField && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-body text-green-800 text-center">
                        {copiedField === 'account' ? t('accountCopied') : t('clabeCopied')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 