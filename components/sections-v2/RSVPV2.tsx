'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Check, X } from 'lucide-react';
import { useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { guestService } from '../../services/guestService';
import { isDemoId } from '../../lib/analytics/demos';
import { FirebaseRSVP, FirebaseGuest } from '../../src/types/wedding';
import { V2_COLORS, V2_FONTS, V2Container, V2Reveal, V2Rings, V2Section, V2SectionHeading, V2SectionLayout, V2Button, v2ButtonProps, v2DisplayStyle } from './ui';
import { useV2SectionNumber, v2Fill, v2FormatSentenceDate, v2Localized, v2WeddingDate } from './sections';
import AddToCalendarButtonV2 from './AddToCalendarButtonV2';

// Spec 25: solo cambia el marcado. Esquema zod, valores guardados y flujo de guardado
// (guestService.updateGuest / modo demo) son los mismos que antes del rediseño.

const fieldLegend = 'mb-3 p-0 text-[11px] font-semibold uppercase tracking-[0.2em]';

function RSVPShell({ children }: { children: React.ReactNode }) {
  return (
    <V2Section id="rsvp" tone="ink">
      <V2Rings
        width={360}
        strokeWidth={0.25}
        color={V2_COLORS.bronzeOnInk}
        className="pointer-events-none absolute -left-[170px] -top-[60px] opacity-45"
      />
      <V2Container className="py-16 lg:py-24">{children}</V2Container>
    </V2Section>
  );
}

const RSVPContentV2 = () => {
  const { t } = useTranslations('rsvp');
  const { t: t2 } = useTranslations('template02');
  const weddingData = useAppSelector(selectCurrentWedding);
  const searchParams = useSearchParams();
  const number = useV2SectionNumber('rsvp');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingRSVP, setExistingRSVP] = useState<FirebaseRSVP | null>(null);
  const [guestInfo, setGuestInfo] = useState<FirebaseGuest | null>(null);

  const params = useParams();
  const currentLocale = params.locale as string;
  const guestId = searchParams.get('guest');
  const weddingId = weddingData?.id || 'friends-test';

  // Demos oficiales sin guestId: el formulario se muestra y funciona en local, sin escribir a
  // Firebase. Una boda real sin `?guest=` sigue mostrando "Not available".
  const isDemoMode = !guestId && isDemoId(weddingId);

  const receptionVenue = weddingData?.event.receptionVenue;
  const venueName = v2Localized(receptionVenue?.name, currentLocale) || t('eventInfo.venue');
  const weddingDate = v2WeddingDate(weddingData);

  const showGuestCount = !!weddingData?.selectedGuestTickets && weddingData?.showGuestsInput !== false;
  const showDiet = !!weddingData?.hasDiet;

  useEffect(() => {
    const loadExistingRSVP = async () => {
      if (isDemoMode) {
        setError(null);
        setIsLoading(false);
        return;
      }

      if (!guestId) {
        setError('Not available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const guest = await guestService.getGuestByGuestId(guestId, weddingId);

        if (guest) {
          setGuestInfo(guest);
        }

        if (guest && guest.rsvpConfirmation) {
          const rsvpData: FirebaseRSVP = {
            id: guest.id,
            weddingId: guest.weddingId,
            guestId: guest.guestId || guestId,
            guestName: guest.name,
            guestEmail: guest.rsvpConfirmation.guestEmail || '',
            attending: guest.rsvpConfirmation.attending,
            guestCount: guest.guestCount,
            message: guest.rsvpConfirmation.message,
            dietaryRestrictions: guest.rsvpConfirmation.dietaryRestrictions,
            plusOne: guest.rsvpConfirmation.plusOne,
            submittedAt: guest.rsvpConfirmation.submittedAt,
            updatedAt: guest.updatedAt
          };

          setExistingRSVP(rsvpData);
          setIsSubmitted(true);
        }
      } catch (err) {
        console.error('Error verificando RSVP existente:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingRSVP();
  }, [isDemoMode, guestId, weddingId]);

  const rsvpSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    attendance: z.enum(['yes', 'no'], {
      required_error: t('form.selectOption')
    }),
    guestCount: (weddingData?.selectedGuestTickets && weddingData?.showGuestsInput !== false) ? z.enum(['1', '2']) : z.string().optional(),
    plusOneName: z.string().optional(),
    plusOneAttendance: z.enum(['yes', 'no']).optional(),
    dietaryRestrictions: z.string().optional(),
    dietaryRestriction: weddingData?.hasDiet ? z.enum(['vegetarian', 'glutenFree', 'other'], {
      required_error: t('form.selectOption')
    }) : z.string().optional(),
    message: z.string().optional(),
  });

  type RSVPFormData = z.infer<typeof rsvpSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    mode: 'onChange',
    // Mismo valor inicial que tenía el <select> de acompañantes ("1").
    defaultValues: showGuestCount ? { guestCount: '1' } : undefined,
  });

  useEffect(() => {
    if (existingRSVP) {
      setValue('name', existingRSVP.guestName);
      setValue('email', existingRSVP.guestEmail || '');
      setValue('attendance', existingRSVP.attending ? 'yes' : 'no');
      setValue('message', existingRSVP.message || '');
      setValue('dietaryRestrictions', existingRSVP.dietaryRestrictions || '');
      setValue('dietaryRestriction', existingRSVP.dietaryRestriction || '');

      if (existingRSVP.plusOne) {
        setValue('plusOneAttendance', existingRSVP.plusOne.attending ? 'yes' : 'no');
        setValue('plusOneName', existingRSVP.plusOne.name || '');
      }
    }
  }, [existingRSVP, setValue]);

  const onSubmit = async (data: RSVPFormData) => {
    if (isDemoMode) {
      // Modo demo: no escribe a Firebase, solo refleja el envío en el estado local.
      setIsSubmitting(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setExistingRSVP({
        id: 'demo-rsvp',
        weddingId,
        guestId: 'demo',
        guestName: data.name || '',
        guestEmail: data.email || '',
        attending: data.attendance === 'yes',
        guestCount: data.guestCount ? parseInt(data.guestCount, 10) : 1,
        message: data.message?.trim(),
        dietaryRestrictions: data.dietaryRestrictions?.trim(),
        dietaryRestriction: data.dietaryRestriction?.trim(),
        plusOne: data.plusOneAttendance
          ? { attending: data.plusOneAttendance === 'yes', name: data.plusOneName?.trim() || undefined }
          : undefined,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setIsSubmitted(true);
      setIsSubmitting(false);
      return;
    }

    if (!guestId) {
      setError('ID de invitado no disponible');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let guestCount = 1;
      let targetGuest = guestInfo;

      if (!targetGuest) {
        try {
          targetGuest = await guestService.getGuestByGuestId(guestId, weddingId);

          if (!targetGuest && data.name) {
            const allGuests = await guestService.getWeddingGuests(weddingId);
            targetGuest = allGuests.find(g =>
              g.name.toLowerCase().trim() === data.name!.toLowerCase().trim()
            ) || null;
          }
        } catch {
          console.warn('No se pudo obtener información del invitado, usando guestCount por defecto');
        }
      }

      if (weddingData?.selectedGuestTickets && weddingData?.showGuestsInput !== false && data.guestCount) {
        guestCount = parseInt(data.guestCount);
      }

      const rsvpConfirmation = {
        attending: data.attendance === 'yes',
        guestCount: (weddingData?.selectedGuestTickets && weddingData?.showGuestsInput !== false && data.guestCount) ? parseInt(data.guestCount) : undefined,
        guestEmail: data.email || undefined,
        message: data.message?.trim() || undefined,
        dietaryRestrictions: data.dietaryRestrictions?.trim() || undefined,
        dietaryRestriction: data.dietaryRestriction?.trim() || undefined,
        plusOne: data.plusOneAttendance ? {
          attending: data.plusOneAttendance === 'yes',
          name: data.plusOneName?.trim() || undefined
        } : undefined,
        submittedAt: new Date().toISOString()
      };

      Object.keys(rsvpConfirmation).forEach(key => {
        if (rsvpConfirmation[key as keyof typeof rsvpConfirmation] === undefined) {
          delete rsvpConfirmation[key as keyof typeof rsvpConfirmation];
        }
      });

      const rsvpStatus = data.attendance === 'yes' ? 'confirmed' : 'declined';

      if (targetGuest) {
        guestCount = targetGuest.guestCount;
      }

      if (!targetGuest && data.name) {
        const allGuests = await guestService.getWeddingGuests(weddingId);
        targetGuest = allGuests.find(g =>
          g.name.toLowerCase().trim() === data.name!.toLowerCase().trim()
        ) || null;
      }

      if (targetGuest) {
        await guestService.updateGuest(targetGuest.id, {
          rsvpStatus,
          rsvpConfirmation
        });
      } else {
        console.warn('⚠️ No se encontró el invitado para actualizar la confirmación');
      }

      setExistingRSVP({
        id: 'guest-rsvp',
        weddingId,
        guestId,
        guestName: targetGuest?.name || data.name || '',
        guestEmail: data.email || targetGuest?.email || '',
        attending: data.attendance === 'yes',
        guestCount,
        message: data.message?.trim(),
        dietaryRestrictions: data.dietaryRestrictions?.trim(),
        dietaryRestriction: data.dietaryRestriction?.trim(),
        plusOne: rsvpConfirmation.plusOne,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error('❌ Error guardando RSVP:', err);
      setError('Error al guardar la confirmación. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const heading = (
    <V2SectionHeading
      number={number}
      overline={t2('rsvp.overline')}
      title={t2('rsvp.title')}
      onInk
      titleSize={44}
      titleWeight={300}
    >
      <p className="m-0 text-[15px] leading-relaxed" style={{ color: V2_COLORS.mutedOnInk }}>
        {guestInfo?.name ? (
          <>
            {t2('rsvp.greeting').split('{name}')[0]}
            <span className="font-semibold" style={{ color: V2_COLORS.stone }}>{guestInfo.name}</span>
            {t2('rsvp.greeting').split('{name}')[1]}
          </>
        ) : (
          t2('rsvp.greetingGeneric')
        )}
      </p>
    </V2SectionHeading>
  );

  if (isLoading) {
    return (
      <RSVPShell>
        <div className="flex flex-col items-center gap-4 py-10 text-center" role="status">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: V2_COLORS.bronzeOnInk, borderTopColor: 'transparent' }} />
          <p className="m-0" style={{ color: V2_COLORS.mutedOnInk }}>{t2('rsvp.loading')}</p>
        </div>
      </RSVPShell>
    );
  }

  if (error) {
    return (
      <RSVPShell>
        <V2SectionLayout heading={heading}>
          <div className="flex flex-col items-start gap-6">
            <p className="m-0" style={{ color: V2_COLORS.lightOnInk }} role="alert">{error}</p>
            <V2Button variant="inverse" size="md" onClick={() => window.location.reload()}>
              {t2('rsvp.retry')}
            </V2Button>
          </div>
        </V2SectionLayout>
      </RSVPShell>
    );
  }

  if (isSubmitted) {
    const attending = !!existingRSVP?.attending;
    const dietValue = existingRSVP?.dietaryRestriction;
    const dietLabel = dietValue ? t(`form.dietaryOptions.${dietValue}`) : '';
    const summary = [
      ...(attending && existingRSVP?.guestCount ? [{ label: t2('rsvp.guests'), value: String(existingRSVP.guestCount) }] : []),
      ...(attending && showDiet && dietLabel ? [{ label: t2('rsvp.dietSummary'), value: dietLabel }] : []),
    ];

    return (
      <RSVPShell>
        <V2Reveal>
          <div className="flex max-w-[640px] flex-col gap-7">
            <p className="m-0 flex items-center gap-[10px] text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: V2_COLORS.bronzeOnInk }}>
              {number && <span>{number}</span>}
              <span aria-hidden="true" className="inline-block h-px w-6" style={{ backgroundColor: V2_COLORS.bronzeOnInk }} />
              <span>{t2('rsvp.sentOverline')}</span>
            </p>
            <div
              className="flex h-[88px] w-[88px] items-center justify-center rounded-full"
              style={{ backgroundColor: V2_COLORS.bronzeOnInk, color: V2_COLORS.ink }}
              aria-hidden="true"
            >
              <Check className="h-9 w-9" strokeWidth={1.8} />
            </div>
            <h2 className="m-0 text-[48px] lg:text-[56px]" role="status" style={{ ...v2DisplayStyle(48, 300, -0.045), fontSize: undefined, lineHeight: 1 }}>
              {attending ? t2('rsvp.sentTitle') : t2('rsvp.declinedTitle')}
            </h2>
            <p className="m-0 text-base leading-[1.65]" style={{ color: V2_COLORS.lightOnInk }}>
              {attending
                ? v2Fill(t2('rsvp.seeYouThere'), { date: v2FormatSentenceDate(weddingDate, currentLocale), venue: venueName })
                : t('confirmation.sorryToMiss')}
            </p>

            {summary.length > 0 && (
              <dl
                className="m-0 grid grid-cols-2"
                style={{ borderTop: `1px solid ${V2_COLORS.ruleOnInk}`, borderBottom: `1px solid ${V2_COLORS.ruleOnInk}` }}
              >
                {summary.map((item, index) => (
                  <div
                    key={item.label}
                    className={`py-4 ${index === 0 ? 'pr-3' : 'pl-4'} ${summary.length === 1 ? 'col-span-2' : ''}`}
                    style={index === 0 && summary.length > 1 ? { borderRight: `1px solid ${V2_COLORS.ruleOnInk}` } : undefined}
                  >
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: V2_COLORS.mutedOnInk }}>
                      {item.label}
                    </dt>
                    <dd className="m-0 mt-1.5" style={v2DisplayStyle(28, 400, -0.03)}>{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {attending && (
              <div className="flex flex-col gap-[10px] sm:flex-row">
                <AddToCalendarButtonV2 variant="inverse" size="lg" className="w-full sm:w-auto" />
                <a href="#location" {...v2ButtonProps('inverseOutline', 'md', 'w-full sm:h-14 sm:w-auto')}>
                  {t2('rsvp.directions')}
                </a>
              </div>
            )}
          </div>
        </V2Reveal>
      </RSVPShell>
    );
  }

  const attendance = watch('attendance');
  const guestCountValue = watch('guestCount');
  const dietValue = watch('dietaryRestriction');
  const declined = attendance === 'no';

  const optionStyle = (selected: boolean, disabled = false): React.CSSProperties => ({
    border: `1px solid ${selected ? V2_COLORS.stone : V2_COLORS.ruleOnInk}`,
    backgroundColor: selected ? V2_COLORS.stone : 'transparent',
    color: selected ? V2_COLORS.ink : V2_COLORS.stone,
    opacity: disabled ? 0.45 : 1,
  });

  return (
    <RSVPShell>
      <V2SectionLayout heading={heading}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7" noValidate>
            <fieldset className="m-0 flex flex-col border-0 p-0">
              <legend className={fieldLegend} style={{ color: V2_COLORS.mutedOnInk }}>
                {t2('rsvp.attendance')} *
              </legend>
              <div className="grid grid-cols-2 gap-[10px]">
                {(['yes', 'no'] as const).map((value) => {
                  const selected = attendance === value;
                  const Icon = value === 'yes' ? Check : X;
                  return (
                    <label
                      key={value}
                      className="relative flex min-h-[88px] cursor-pointer flex-col justify-between rounded-md p-[14px] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2"
                      style={{
                        ...(selected && value === 'yes'
                          ? { border: `1px solid ${V2_COLORS.bronzeOnInk}`, backgroundColor: V2_COLORS.bronzeOnInk, color: V2_COLORS.ink }
                          : optionStyle(selected)),
                        outlineColor: V2_COLORS.bronzeOnInk,
                      }}
                    >
                      <input type="radio" value={value} {...register('attendance')} className="sr-only" />
                      <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={value === 'yes' ? 2 : 1.8} />
                      <span className="text-[15px] font-semibold">{value === 'yes' ? t2('rsvp.yes') : t2('rsvp.no')}</span>
                    </label>
                  );
                })}
              </div>
              {errors.attendance && (
                <p className="m-0 mt-2 text-sm" role="alert" style={{ color: V2_COLORS.bronzeOnInk }}>{t('form.selectOption')}</p>
              )}
            </fieldset>

            {showGuestCount && (
              <fieldset className="m-0 border-0 p-0" disabled={declined}>
                <legend className={fieldLegend} style={{ color: V2_COLORS.mutedOnInk }}>
                  {t2('rsvp.guestCount')} *
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:max-w-[240px]">
                  {(['1', '2'] as const).map((value) => {
                    const selected = guestCountValue === value;
                    return (
                      <label
                        key={value}
                        className="relative flex h-[52px] cursor-pointer items-center justify-center rounded-full text-xl focus-within:outline focus-within:outline-2 focus-within:outline-offset-2"
                        style={{ ...optionStyle(selected, declined), fontFamily: V2_FONTS.display, outlineColor: V2_COLORS.bronzeOnInk }}
                      >
                        <input
                          type="radio"
                          value={value}
                          {...register('guestCount')}
                          disabled={declined}
                          className="sr-only"
                          aria-label={t(`form.guestCountOptions.${value}`)}
                        />
                        {value}
                      </label>
                    );
                  })}
                </div>
                {errors.guestCount && (
                  <p className="m-0 mt-2 text-sm" role="alert" style={{ color: V2_COLORS.bronzeOnInk }}>{t('form.selectOption')}</p>
                )}
                <p className="m-0 mt-[10px] text-xs leading-normal" style={{ color: V2_COLORS.mutedOnInk }}>
                  {t('form.guestCountDisclaimer')}
                </p>
              </fieldset>
            )}

            {showDiet && (
              <fieldset className="m-0 border-0 p-0" disabled={declined}>
                <legend className={fieldLegend} style={{ color: V2_COLORS.mutedOnInk }}>
                  {t2('rsvp.diet')} *
                </legend>
                <div className="flex flex-wrap gap-2">
                  {(['vegetarian', 'glutenFree', 'other'] as const).map((value) => {
                    const selected = dietValue === value;
                    return (
                      <label
                        key={value}
                        className="relative flex h-11 cursor-pointer items-center rounded-full px-[18px] text-sm font-medium focus-within:outline focus-within:outline-2 focus-within:outline-offset-2"
                        style={{ ...optionStyle(selected, declined), outlineColor: V2_COLORS.bronzeOnInk }}
                      >
                        <input type="radio" value={value} {...register('dietaryRestriction')} disabled={declined} className="sr-only" />
                        {t(`form.dietaryOptions.${value}`)}
                      </label>
                    );
                  })}
                </div>
                {errors.dietaryRestriction && (
                  <p className="m-0 mt-2 text-sm" role="alert" style={{ color: V2_COLORS.bronzeOnInk }}>{t('form.selectOption')}</p>
                )}
              </fieldset>
            )}

            <div className="flex flex-col gap-3">
              <label htmlFor="rsvp-v2-message" className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: V2_COLORS.mutedOnInk }}>
                {t2('rsvp.message')}
              </label>
              <textarea
                id="rsvp-v2-message"
                {...register('message')}
                rows={4}
                placeholder={t2('rsvp.messagePlaceholder')}
                className="w-full resize-none rounded-md px-4 py-[14px] text-[15px] leading-normal placeholder:text-[#A49C91] focus:outline focus:outline-2 focus:outline-offset-2"
                style={{
                  border: `1px solid ${V2_COLORS.ruleOnInk}`,
                  backgroundColor: V2_COLORS.fieldOnInk,
                  color: V2_COLORS.stone,
                  fontFamily: V2_FONTS.body,
                  outlineColor: V2_COLORS.bronzeOnInk,
                }}
              />
            </div>

            <V2Button type="submit" variant="inverse" size="lg" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: V2_COLORS.ink, borderTopColor: 'transparent' }} aria-hidden="true" />
                  {t2('rsvp.submitting')}
                </>
              ) : (
                <>
                  {t2('rsvp.submit')}
                  <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.8} />
                </>
              )}
            </V2Button>

            {isDemoMode && (
              <p className="m-0 text-center text-[11px]" style={{ color: V2_COLORS.mutedOnInk }}>
                {t2('rsvp.demoNote')}
              </p>
            )}
          </form>
        </V2SectionLayout>
    </RSVPShell>
  );
};

export default function RSVPV2() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center" style={{ backgroundColor: V2_COLORS.ink }}>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: V2_COLORS.bronzeOnInk, borderTopColor: 'transparent' }} />
        </div>
      }
    >
      <RSVPContentV2 />
    </Suspense>
  );
}
