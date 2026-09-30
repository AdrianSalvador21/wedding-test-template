'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send } from 'lucide-react';
import { useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { guestService } from '../../services/guestService';
import { isDemoId } from '../../lib/analytics/demos';
import { FirebaseRSVP, FirebaseGuest } from '../../src/types/wedding';
import { V4Button, V4Container, V4Reveal, V4Section, V4SectionHeading, v4Colors } from './ui';

const inputClass =
  'w-full px-4 py-3 border bg-white focus:outline-none transition-colors text-[15px] font-georgia';
const selectClass = `${inputClass} appearance-none`;

function RSVPContentV4() {
  const { t } = useTranslations('rsvp');
  const weddingData = useAppSelector(selectCurrentWedding);
  const searchParams = useSearchParams();

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

  // Demos oficiales sin guestId en la URL: modo demo local (no depende de un invitado real en
  // Firebase), así se puede probar el formulario sin `?guest=`. Mismo criterio que RSVPV3.
  const isDemoMode = !guestId && isDemoId(weddingId);

  const receptionVenue = weddingData?.event.receptionVenue;
  const venueName = typeof receptionVenue?.name === 'object' && receptionVenue.name
    ? (receptionVenue.name[currentLocale as 'es' | 'en'] || receptionVenue.name.es || '')
    : ((receptionVenue?.name as unknown as string) || t('eventInfo.venue'));
  const weddingDate = weddingData?.event.date ? new Date(weddingData.event.date) : new Date('2025-11-21T16:00:00');

  const formatDate = (date: Date) =>
    date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (isDemoMode) {
      setIsLoading(false);
      return;
    }

    if (!guestId) {
      setError('Not available');
      setIsLoading(false);
      return;
    }

    const loadExistingRSVP = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const guest = await guestService.getGuestByGuestId(guestId as string, weddingId);
        if (guest) setGuestInfo(guest);

        if (guest && guest.rsvpConfirmation) {
          setExistingRSVP({
            id: guest.id,
            weddingId: guest.weddingId,
            guestId: guest.guestId || (guestId as string),
            guestName: guest.name,
            guestEmail: guest.rsvpConfirmation.guestEmail || '',
            attending: guest.rsvpConfirmation.attending,
            guestCount: guest.guestCount,
            message: guest.rsvpConfirmation.message,
            dietaryRestrictions: guest.rsvpConfirmation.dietaryRestrictions,
            plusOne: guest.rsvpConfirmation.plusOne,
            submittedAt: guest.rsvpConfirmation.submittedAt,
            updatedAt: guest.updatedAt,
          });
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
    attendance: z.enum(['yes', 'no'], { required_error: t('form.selectOption') }),
    guestCount: (weddingData?.selectedGuestTickets && weddingData?.showGuestsInput !== false) ? z.enum(['1', '2']) : z.string().optional(),
    dietaryRestrictions: z.string().optional(),
    dietaryRestriction: weddingData?.hasDiet ? z.enum(['vegetarian', 'glutenFree', 'other'], { required_error: t('form.selectOption') }) : z.string().optional(),
    message: z.string().optional(),
  });

  type RSVPFormData = z.infer<typeof rsvpSchema>;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    mode: 'onChange',
  });

  const attendance = watch('attendance');

  useEffect(() => {
    if (existingRSVP) {
      setValue('name', existingRSVP.guestName);
      setValue('email', existingRSVP.guestEmail || '');
      setValue('attendance', existingRSVP.attending ? 'yes' : 'no');
      setValue('message', existingRSVP.message || '');
      setValue('dietaryRestrictions', existingRSVP.dietaryRestrictions || '');
      setValue('dietaryRestriction', existingRSVP.dietaryRestriction || '');
    }
  }, [existingRSVP, setValue]);

  const onSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true);
    setError(null);

    if (isDemoMode) {
      // Modo demo: no escribe a Firebase, solo refleja el envío en el estado local.
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
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsSubmitted(true);
      setIsSubmitting(false);
      return;
    }

    if (!guestId) {
      setError('ID de invitado no disponible');
      setIsSubmitting(false);
      return;
    }

    try {
      let guestCount = 1;
      let targetGuest = guestInfo;

      if (!targetGuest) {
        try {
          targetGuest = await guestService.getGuestByGuestId(guestId, weddingId);
          if (!targetGuest && data.name) {
            const allGuests = await guestService.getWeddingGuests(weddingId);
            targetGuest = allGuests.find((g) => g.name.toLowerCase().trim() === data.name!.toLowerCase().trim()) || null;
          }
        } catch {
          console.warn('No se pudo obtener información del invitado, usando guestCount por defecto');
        }
      }

      if (weddingData?.selectedGuestTickets && weddingData?.showGuestsInput !== false && data.guestCount) {
        guestCount = parseInt(data.guestCount, 10);
      }

      const rsvpConfirmation = {
        attending: data.attendance === 'yes',
        guestCount: (weddingData?.selectedGuestTickets && weddingData?.showGuestsInput !== false && data.guestCount) ? parseInt(data.guestCount, 10) : undefined,
        guestEmail: data.email || undefined,
        message: data.message?.trim() || undefined,
        dietaryRestrictions: data.dietaryRestrictions?.trim() || undefined,
        dietaryRestriction: data.dietaryRestriction?.trim() || undefined,
        submittedAt: new Date().toISOString(),
      };

      Object.keys(rsvpConfirmation).forEach((key) => {
        if (rsvpConfirmation[key as keyof typeof rsvpConfirmation] === undefined) {
          delete rsvpConfirmation[key as keyof typeof rsvpConfirmation];
        }
      });

      const rsvpStatus = data.attendance === 'yes' ? 'confirmed' : 'declined';
      if (targetGuest) guestCount = targetGuest.guestCount;

      if (targetGuest) {
        await guestService.updateGuest(targetGuest.id, { rsvpStatus, rsvpConfirmation });
      } else {
        console.warn('No se encontró el invitado para actualizar la confirmación');
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
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error guardando RSVP:', err);
      setError('Error al guardar la confirmación. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <V4Section id="rsvp">
        <V4Container className="py-16 md:py-24 text-center">
          <div className="w-8 h-8 border-2 rounded-full mx-auto animate-spin" style={{ borderColor: v4Colors.accent, borderTopColor: 'transparent' }} />
        </V4Container>
      </V4Section>
    );
  }

  if (error) {
    return (
      <V4Section id="rsvp">
        <V4Container className="py-16 md:py-24 text-center">
          <p className="text-[15px] mb-6" style={{ color: v4Colors.body }}>{error}</p>
          <V4Button onClick={() => window.location.reload()}>Reintentar</V4Button>
        </V4Container>
      </V4Section>
    );
  }

  if (isSubmitted) {
    return (
      <V4Section id="rsvp">
        <V4Container className="py-16 md:py-24 text-center">
          <V4Reveal>
            <V4SectionHeading numeral="XI" eyebrow={t('subtitle')} />
          </V4Reveal>
          <V4Reveal delay={0.1} className="mt-8 max-w-sm mx-auto">
            <h3 className="text-2xl italic" style={{ color: v4Colors.ink }}>
              {existingRSVP?.attending ? t('confirmation.received') : t('confirmation.registered')}
            </h3>
            <p className="mt-3 text-[15px]" style={{ color: v4Colors.body }}>
              {existingRSVP?.attending
                ? t('confirmation.seeYouThere').replace('{date}', formatDate(weddingDate)).replace('{venue}', venueName)
                : t('confirmation.sorryToMiss')}
            </p>
          </V4Reveal>
        </V4Container>
      </V4Section>
    );
  }

  return (
    <V4Section id="rsvp">
      <V4Container className="py-16 md:py-24 text-center">
        <V4Reveal>
          <V4SectionHeading numeral="XI" eyebrow={t('subtitle')} title={t('title')} />
          <p className="mt-4 text-[15px] max-w-sm mx-auto" style={{ color: v4Colors.body }}>{t('description')}</p>
        </V4Reveal>

        <V4Reveal delay={0.1} className="mt-10 max-w-sm mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
            <div>
              <p id="rsvp-attendance-label" className="text-[10px] font-sans tracking-[0.2em] uppercase mb-2 text-center" style={{ color: v4Colors.muted }}>
                {t('form.attendance')} *
              </p>
              <div role="group" aria-labelledby="rsvp-attendance-label" className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setValue('attendance', 'yes', { shouldValidate: true })}
                  className="flex-1 px-4 py-3 text-[11px] font-sans tracking-[0.15em] uppercase border transition-colors"
                  style={
                    attendance === 'yes'
                      ? { background: v4Colors.ink, color: v4Colors.paper, borderColor: v4Colors.ink }
                      : { background: '#fff', color: v4Colors.ink, borderColor: 'rgba(43,42,34,.3)' }
                  }
                >
                  {t('form.attendanceOptions.yes')}
                </button>
                <button
                  type="button"
                  onClick={() => setValue('attendance', 'no', { shouldValidate: true })}
                  className="flex-1 px-4 py-3 text-[11px] font-sans tracking-[0.15em] uppercase border transition-colors"
                  style={
                    attendance === 'no'
                      ? { background: v4Colors.ink, color: v4Colors.paper, borderColor: v4Colors.ink }
                      : { background: '#fff', color: v4Colors.ink, borderColor: 'rgba(43,42,34,.3)' }
                  }
                >
                  {t('form.attendanceOptions.no')}
                </button>
              </div>
              <input type="hidden" {...register('attendance')} />
              {errors.attendance && <p className="text-red-700 text-xs mt-2 text-center">{t('form.selectOption')}</p>}
            </div>

            {weddingData?.selectedGuestTickets && weddingData?.showGuestsInput !== false && (
              <div>
                <label htmlFor="rsvp-guestCount" className="block text-[10px] font-sans tracking-[0.2em] uppercase mb-2" style={{ color: v4Colors.muted }}>
                  {t('form.guestCount')} *
                </label>
                <select
                  id="rsvp-guestCount"
                  {...register('guestCount')}
                  disabled={attendance === 'no'}
                  defaultValue="1"
                  className={`${selectClass} disabled:opacity-50`}
                  style={{ borderColor: 'rgba(43,42,34,.3)' }}
                >
                  <option value="1">{t('form.guestCountOptions.1')}</option>
                  <option value="2">{t('form.guestCountOptions.2')}</option>
                </select>
                <p className="text-xs mt-2" style={{ color: v4Colors.muted }}>{t('form.guestCountDisclaimer')}</p>
              </div>
            )}

            {weddingData?.hasDiet && (
              <div>
                <label htmlFor="rsvp-dietaryRestriction" className="block text-[10px] font-sans tracking-[0.2em] uppercase mb-2" style={{ color: v4Colors.muted }}>
                  {t('form.dietaryRestriction')} *
                </label>
                <select
                  id="rsvp-dietaryRestriction"
                  {...register('dietaryRestriction')}
                  disabled={attendance === 'no'}
                  className={`${selectClass} disabled:opacity-50`}
                  style={{ borderColor: 'rgba(43,42,34,.3)' }}
                >
                  <option value=""></option>
                  <option value="vegetarian">{t('form.dietaryOptions.vegetarian')}</option>
                  <option value="glutenFree">{t('form.dietaryOptions.glutenFree')}</option>
                  <option value="other">{t('form.dietaryOptions.other')}</option>
                </select>
                {errors.dietaryRestriction && <p className="text-red-700 text-xs mt-2">{t('form.selectOption')}</p>}
              </div>
            )}

            <div>
              <label htmlFor="rsvp-message" className="block text-[10px] font-sans tracking-[0.2em] uppercase mb-2" style={{ color: v4Colors.muted }}>
                {t('form.messageForCouple')}
              </label>
              <textarea
                id="rsvp-message"
                {...register('message')}
                rows={3}
                className={`${inputClass} resize-none`}
                style={{ borderColor: 'rgba(43,42,34,.3)' }}
              />
            </div>

            <V4Button type="submit" disabled={isSubmitting} variant="solid" className="w-full">
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: v4Colors.paper, borderTopColor: 'transparent' }} />
                  {t('form.submitting')}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {t('form.submit')}
                </>
              )}
            </V4Button>

            {isDemoMode && (
              <p className="text-center text-[11px]" style={{ color: v4Colors.muted }}>
                Modo de prueba — esta confirmación no se guarda.
              </p>
            )}
          </form>
        </V4Reveal>
      </V4Container>
    </V4Section>
  );
}

export default function RSVPV4() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: v4Colors.accent, borderTopColor: 'transparent' }} />
        </div>
      }
    >
      <RSVPContentV4 />
    </Suspense>
  );
}
