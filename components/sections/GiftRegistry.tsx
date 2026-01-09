'use client';

import { useWedding } from '../../src/store/hooks';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useThemePatterns } from '../../lib/theme-context';
import { useTranslations } from '../../lib/translations';
import { GiftRegistryIcon } from '../icons';
import { formatTextWithLineBreaks } from '../../lib/text-utils';

export default function GiftRegistry() {
  const { t } = useTranslations('giftRegistry');
  const { currentWedding } = useWedding();
  const { getBackgroundStyle } = useThemePatterns();
  const params = useParams();
  const currentLocale = params.locale as string;
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isBankExpanded, setIsBankExpanded] = useState(true);
  const [isRegistryExpanded, setIsRegistryExpanded] = useState(true);

  // No mostrar si no está habilitado
  if (!currentWedding?.giftRegistry?.enabled) {
    return null;
  }

  const { giftRegistry } = currentWedding;

  // No mostrar si no hay tiendas NI cuenta bancaria configuradas
  const hasRegistries = giftRegistry.registries && giftRegistry.registries.length > 0;
  const hasBankAccount = giftRegistry.bankAccount && (
    giftRegistry.bankAccount.bankName || 
    giftRegistry.bankAccount.accountName || 
    giftRegistry.bankAccount.accountNumber
  );

  if (!hasRegistries && !hasBankAccount) {
    return null;
  }
  
  // Procesar mensaje bilingüe
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
    <section 
      id="gift-registry" 
      className="py-12 bg-gray-50 relative overflow-hidden"
      style={getBackgroundStyle(1, '200px')}
    >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
        {/* Título */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center mb-6">
            <GiftRegistryIcon 
              size={28} 
              className="text-accent mr-3 opacity-80" 
            />
            <h2 className="section-title text-stone-600 opacity-90">{t('title')}</h2>
          </div>
          <motion.div 
            className="title-decorative-line mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 64 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          ></motion.div>
          {giftMessage && (
            <motion.p 
              className="section-subtitle"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              {formatTextWithLineBreaks(giftMessage)}
            </motion.p>
          )}
        </motion.div>

        {/* Mesas de Regalos Online */}
        {giftRegistry.registries.length > 0 && (
          <motion.div 
            className="mb-6 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          >
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
          </motion.div>
        )}

                {/* Cuenta Bancaria */}
        {giftRegistry.bankAccount && (
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
          >
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
                  {(() => {
                    const descriptionData = giftRegistry.bankAccount.description;
                    const bankDescription = typeof descriptionData === 'object' 
                      ? (descriptionData[currentLocale as 'es' | 'en'] || descriptionData.es)
                      : descriptionData;
                    
                    return bankDescription && (
                      <p className="text-text font-body text-center mb-6 mt-4 text-sm">
                        {bankDescription}
                      </p>
                    );
                  })()}
                  
                  <div className="space-y-3 mt-4">
                    {giftRegistry.bankAccount.bankName && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-body text-text/70">{t('bank')}</p>
                          <p className="font-body font-medium text-dark">{giftRegistry.bankAccount.bankName}</p>
                        </div>
                      </div>
                    )}
                    
                    {giftRegistry.bankAccount.accountName && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-body text-text/70">{t('accountHolder')}</p>
                          <p className="font-body font-medium text-dark">{giftRegistry.bankAccount.accountName}</p>
                        </div>
                      </div>
                    )}
                    
                    {giftRegistry.bankAccount.accountNumber && (
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
                    )}
                    
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
                    <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                      <p className="text-sm font-body text-accent text-center font-medium">
                        {copiedField === 'account' ? t('accountCopied') : t('clabeCopied')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
} 