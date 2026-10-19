'use client';

import { Facebook, Instagram, Phone } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { formatTextWithLineBreaks } from '../../lib/text-utils';
import { V2_COLORS, V2_FONTS, V2Container, V2Rings, V2Stagger, V2StaggerItem, v2DisplayStyle } from './ui';
import { v2Fill, v2Initials, v2Localized, v2WeddingDate } from './sections';

interface Person {
  name: string;
  phone: string;
  instagram?: string;
  facebook?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const linkClass = 'flex min-h-11 items-center gap-2 text-sm no-underline hover:opacity-80';

export default function FooterV2() {
  const { t, currentLanguage } = useTranslations('template02');
  const { t: tFooter } = useTranslations('footer');
  const weddingData = useAppSelector(selectCurrentWedding);

  const couple = weddingData?.couple;
  const brideName = couple?.bride.name || 'María';
  const groomName = couple?.groom.name || 'Carlos';
  const showInstagram = weddingData?.hasInstagram !== false;
  const showFacebook = weddingData?.hasFacebook !== false;
  const quote = v2Localized(couple?.quote, currentLanguage) || tFooter('quote');
  const hashtag = couple?.hashtag;
  const initials = v2Initials(weddingData);
  const date = v2WeddingDate(weddingData);
  const dateLabel = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;

  const people: Person[] = [
    { name: brideName, phone: couple?.bride.phone || '', instagram: couple?.bride.instagram, facebook: couple?.bride.facebook },
    { name: groomName, phone: couple?.groom.phone || '', instagram: couple?.groom.instagram, facebook: couple?.groom.facebook },
  ];

  return (
    <footer style={{ backgroundColor: V2_COLORS.stone, color: V2_COLORS.ink, fontFamily: V2_FONTS.body }}>
      <V2Container className="py-16 pb-10 lg:py-24 lg:pb-12">
          <V2Stagger className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-16">
            <V2StaggerItem className="flex flex-col items-start gap-[18px] lg:col-span-5">
              <V2Rings width={56} strokeWidth={1.2} color={V2_COLORS.bronze} />
              {quote && (
                <p className="m-0 text-[26px] lg:text-[30px]" style={{ ...v2DisplayStyle(26, 300, -0.02), fontSize: undefined, lineHeight: 1.2 }}>
                  {formatTextWithLineBreaks(quote)}
                </p>
              )}
            </V2StaggerItem>

            <V2StaggerItem className="flex flex-col gap-8 lg:col-span-7">
              <div className="grid grid-cols-2" style={{ borderTop: `1px solid ${V2_COLORS.rule}` }}>
                {people.map((person, index) => (
                  <div
                    key={person.name + index}
                    className={`flex flex-col gap-[10px] py-[18px] ${index === 0 ? 'pr-3' : 'pl-4'}`}
                    style={index === 0 ? { borderRight: `1px solid ${V2_COLORS.rule}` } : undefined}
                  >
                    <span style={v2DisplayStyle(22, 400, -0.02)}>{person.name}</span>
                    {person.phone && (
                      <a
                        href={`tel:${person.phone.replace(/[^\d+]/g, '')}`}
                        className={linkClass}
                        style={{ color: V2_COLORS.ink }}
                        aria-label={v2Fill(t('footer.callLabel'), { name: person.name })}
                      >
                        <Phone className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} style={{ color: V2_COLORS.bronze }} />
                        {t('footer.call')}
                      </a>
                    )}
                    {showInstagram && person.instagram && (
                      <a
                        href={`https://instagram.com/${person.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${linkClass} min-w-0`}
                        style={{ color: V2_COLORS.ink }}
                        aria-label={v2Fill(t('footer.instagramLabel'), { name: person.name })}
                      >
                        <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={1.7} style={{ color: V2_COLORS.bronze }} />
                        <span className="truncate">{person.instagram.startsWith('@') ? person.instagram : `@${person.instagram}`}</span>
                      </a>
                    )}
                    {showFacebook && person.facebook && (
                      <a
                        href={`https://facebook.com/${person.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${linkClass} min-w-0`}
                        style={{ color: V2_COLORS.ink }}
                        aria-label={v2Fill(t('footer.facebookLabel'), { name: person.name })}
                      >
                        <Facebook className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={1.7} style={{ color: V2_COLORS.bronze }} />
                        <span className="truncate">{person.facebook}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1.5 pt-6" style={{ borderTop: `1px solid ${V2_COLORS.rule}` }}>
                <span style={{ ...v2DisplayStyle(56, 400, -0.05), lineHeight: 0.95 }} aria-hidden="true">
                  {initials.bride} &amp; {initials.groom}
                </span>
                <span className="text-[13px]" style={{ color: V2_COLORS.graphite }}>
                  {hashtag ? `${hashtag} · ${dateLabel}` : dateLabel}
                </span>
              </div>
              <span className="text-xs" style={{ color: V2_COLORS.graphite }}>
                {tFooter('copyright').replace('{brideName}', brideName).replace('{groomName}', groomName)}
              </span>
            </V2StaggerItem>
          </V2Stagger>
      </V2Container>
    </footer>
  );
}
