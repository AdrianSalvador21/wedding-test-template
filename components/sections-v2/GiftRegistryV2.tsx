'use client';

import { ArrowUpRight } from 'lucide-react';
import { useWedding } from '../../src/store/hooks';
import { useTranslations } from '../../lib/translations';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import {
  V2_COLORS,
  V2Container,
  V2CopyButton,
  V2Rings,
  V2Section,
  V2SectionHeading,
  V2SectionLayout,
  V2Stagger,
  V2StaggerItem,
  v2DisplayStyle,
} from './ui';
import { useV2SectionNumber, v2Fill, v2HasGiftContent, v2Localized } from './sections';

export default function GiftRegistryV2() {
  const { t, currentLanguage } = useTranslations('template02');
  const { t: tGift } = useTranslations('giftRegistry');
  const { currentWedding } = useWedding();
  const number = useV2SectionNumber('gifts');

  if (!currentWedding || !v2HasGiftContent(currentWedding)) {
    return null;
  }

  const { giftRegistry } = currentWedding;
  const registries = giftRegistry.registries || [];
  const bank = giftRegistry.bankAccount;
  const hasBank = !!bank && !!(bank.bankName || bank.accountName || bank.accountNumber);
  const giftMessage = v2Localized(giftRegistry.message, currentLanguage) || tGift('message');
  const bankDescription = v2Localized(bank?.description, currentLanguage);

  return (
    <V2Section id="gift-registry">
      <V2Container className="py-[72px] pb-16 lg:py-24">
        <V2SectionLayout
            heading={
              <V2SectionHeading number={number} overline={t('gifts.overline')} title={t('gifts.title')}>
                {giftMessage && (
                  <p className="m-0 mt-1 text-base leading-[1.7]" style={{ color: V2_COLORS.graphite }}>
                    {formatTextWithLineBreaks(giftMessage)}
                  </p>
                )}
              </V2SectionHeading>
            }
          >
            {registries.length > 0 && (
              <V2Stagger as="ul" className="m-0 list-none p-0" style={{ borderTop: `1px solid ${V2_COLORS.rule}` }}>
                {registries.map((registry) => {
                  const description = v2Localized(registry.description, currentLanguage);
                  return (
                    <V2StaggerItem as="li" key={registry.id || registry.name} style={{ borderBottom: `1px solid ${V2_COLORS.rule}` }}>
                      <a
                        href={registry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={v2Fill(t('gifts.openRegistry'), { name: registry.name })}
                        className="flex min-h-[76px] items-center gap-4 py-[14px] no-underline transition-opacity hover:opacity-80"
                        style={{ color: V2_COLORS.ink }}
                      >
                        <span className="flex flex-grow flex-col gap-1">
                          <span style={v2DisplayStyle(24, 400, -0.02)}>{registry.name}</span>
                          {description && (
                            <span className="text-sm" style={{ color: V2_COLORS.graphite }}>
                              {description}
                            </span>
                          )}
                        </span>
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                          style={{ border: `1px solid ${V2_COLORS.ink}` }}
                          aria-hidden="true"
                        >
                          <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
                        </span>
                      </a>
                    </V2StaggerItem>
                  );
                })}
              </V2Stagger>
            )}

            {hasBank && bank && (
              <div
                className="relative flex flex-col gap-5 overflow-hidden rounded-lg p-6 lg:p-8"
                style={{ backgroundColor: V2_COLORS.ink, color: V2_COLORS.stone }}
              >
                <V2Rings
                  width={200}
                  strokeWidth={0.35}
                  color={V2_COLORS.bronzeOnInk}
                  className="pointer-events-none absolute -right-[50px] -top-[22px] opacity-55"
                />
                <div className="relative flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: V2_COLORS.bronzeOnInk }}>
                    {t('gifts.transfer')}
                  </span>
                  {bank.bankName && <span style={v2DisplayStyle(28, 400, -0.02)}>{bank.bankName}</span>}
                </div>

                {bank.accountName && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs" style={{ color: V2_COLORS.mutedOnInk }}>
                      {t('gifts.holder')}
                    </span>
                    <span className="text-base font-medium">{bank.accountName}</span>
                  </div>
                )}

                {bank.accountNumber && (
                  <div
                    className="flex items-center justify-between gap-3 pt-4"
                    style={{ borderTop: `1px solid ${V2_COLORS.ruleOnInk}` }}
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-xs" style={{ color: V2_COLORS.mutedOnInk }}>
                        {t('gifts.accountNumber')}
                      </span>
                      <span className="break-all text-[17px] font-medium tracking-[0.08em]">{bank.accountNumber}</span>
                    </div>
                    <V2CopyButton
                      value={bank.accountNumber}
                      label={t('gifts.copy')}
                      copiedLabel={t('gifts.copied')}
                      ariaLabel={t('gifts.copyAccount')}
                      onInk
                    />
                  </div>
                )}

                {bank.clabe && (
                  <div
                    className="flex items-center justify-between gap-3 pt-4"
                    style={{ borderTop: `1px solid ${V2_COLORS.ruleOnInk}` }}
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-xs" style={{ color: V2_COLORS.mutedOnInk }}>
                        {t('gifts.clabe')}
                      </span>
                      <span className="break-all text-[17px] font-medium tracking-[0.06em]">{bank.clabe}</span>
                    </div>
                    <V2CopyButton
                      value={bank.clabe}
                      label={t('gifts.copy')}
                      copiedLabel={t('gifts.copied')}
                      ariaLabel={t('gifts.copyClabe')}
                      onInk
                    />
                  </div>
                )}

                {bankDescription && (
                  <p className="m-0 text-[13px] leading-[1.55]" style={{ color: V2_COLORS.mutedOnInk }}>
                    {bankDescription}
                  </p>
                )}
              </div>
            )}
          </V2SectionLayout>
      </V2Container>
    </V2Section>
  );
}
