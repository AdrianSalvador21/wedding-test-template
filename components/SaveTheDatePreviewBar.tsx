'use client';

import { useTranslations } from '../lib/translations';

// Spec 27 — franja fija sobre la invitación completa cuando un admin o dueño la abre con
// `?vista=completa` mientras el save the date está activo. Solo la ve quien tiene sesión.
export default function SaveTheDatePreviewBar({ weddingId }: { weddingId: string }) {
  const { t, currentLanguage } = useTranslations('saveTheDate');
  const guestViewHref = (() => {
    if (typeof window === 'undefined') return `/${currentLanguage}/wedding/${weddingId}`;
    const url = new URL(window.location.href);
    url.searchParams.delete('vista');
    return url.pathname + url.search;
  })();

  return (
    <div
      role="status"
      className="sticky top-0 z-[60] flex flex-wrap items-center gap-x-4 gap-y-2.5 bg-[#111111] px-3.5 py-2.5 text-white sm:px-10"
      style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
    >
      <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-[#AE5730] px-2.5 text-xs font-extrabold uppercase tracking-[0.04em]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {t('preview.label')}
      </span>
      <span className="min-w-0 flex-[1_1_260px] text-[13px] font-medium leading-snug text-[#E4E4E7] sm:text-sm">{t('preview.text')}</span>
      <div className="flex w-full gap-2 sm:w-auto">
        <a
          href={guestViewHref}
          className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-white/30 px-3.5 text-[13px] font-bold text-white no-underline hover:bg-white/10 sm:flex-none"
        >
          {t('preview.asGuest')}
        </a>
        <a
          href={`/${currentLanguage}/admin/panel/${weddingId}/editor`}
          className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-white px-3.5 text-[13px] font-bold text-[#111111] no-underline hover:bg-[#F4F4F5] sm:flex-none"
        >
          {t('preview.backToEditor')}
        </a>
      </div>
    </div>
  );
}
