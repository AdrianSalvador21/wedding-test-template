'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, ChevronDown } from 'lucide-react';
import { useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { guestService } from '../../services/guestService';
import { FirebaseRSVP, FirebaseGuest } from '../../src/types/wedding';
import { V3BgMotif, V3Card, V3Container, V3CornerFlourish, V3EyebrowTitle, V3PillButton, V3Reveal, V3Section, v3Colors } from './ui';

const inputClass =
  'w-full px-4 py-3 pr-10 rounded-[4px] border bg-white focus:ring-2 focus:border-transparent transition-colors appearance-none text-[#34302A] font-jost text-sm';

function RSVPContentV3() {
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

  // Sin guestId en la URL: modo demo local (no depende de un invitado real en Firebase),
  // así la boda de prueba se puede probar sin necesitar `?guest=`. Con guestId: mismo
  // flujo real que RSVP.tsx/RSVPV2.tsx (Firebase vía guestService).
  const isDemoMode = !guestId;

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
      <V3Section id="rsvp">
        <V3Container className="py-16 md:py-24">
          <div className="max-w-lg mx-auto">
            <V3Card className="p-10 text-center">
              <div className="animate-spin w-8 h-8 border-2 rounded-full mx-auto mb-4" style={{ borderColor: v3Colors.accent, borderTopColor: 'transparent' }} />
              <p className="font-jost text-sm text-[#6B6255]">Cargando información del invitado...</p>
            </V3Card>
          </div>
        </V3Container>
      </V3Section>
    );
  }

  if (error) {
    return (
      <V3Section id="rsvp">
        <V3Container className="py-16 md:py-24">
          <div className="max-w-lg mx-auto">
            <V3Card className="p-10 text-center">
              <p className="font-jost text-sm text-[#6B6255] mb-6">{error}</p>
              <V3PillButton onClick={() => window.location.reload()}>Reintentar</V3PillButton>
            </V3Card>
          </div>
        </V3Container>
      </V3Section>
    );
  }

  if (isSubmitted) {
    return (
      <V3Section id="rsvp">
        <V3CornerFlourish corner="top-left" width={130} height={86} opacity={0.5} />
        <V3CornerFlourish corner="bottom-right" width={130} height={86} opacity={0.42} />
        <V3Container className="py-16 md:py-24">
          <V3Reveal>
            <V3EyebrowTitle eyebrow={t('subtitle')} title={t('title')} />
          </V3Reveal>
          <V3Reveal delay={0.1} className="mt-12 max-w-lg mx-auto">
            <V3Card className="p-10 text-center">
              <h3 className="font-cormorant italic text-2xl text-[#34302A] mb-3">
                {existingRSVP?.attending ? t('confirmation.received') : t('confirmation.registered')}
              </h3>
              <p className="font-jost text-sm text-[#6B6255]">
                {existingRSVP?.attending
                  ? t('confirmation.seeYouThere').replace('{date}', formatDate(weddingDate)).replace('{venue}', venueName)
                  : t('confirmation.sorryToMiss')}
              </p>
            </V3Card>
          </V3Reveal>
        </V3Container>
      </V3Section>
    );
  }

  return (
    <V3Section id="rsvp">
      <V3BgMotif patternId="v3-lp-rsvp" tileSize={300} rotate={-11} />
      <V3CornerFlourish corner="top-left" width={130} height={86} opacity={0.5} />
      <V3CornerFlourish corner="bottom-right" width={130} height={86} opacity={0.42} />
      <V3Container className="py-16 md:py-24">
        <V3Reveal>
          <V3EyebrowTitle eyebrow={t('subtitle')} title={t('title')} />
          <p className="mt-4 font-jost text-sm text-[#6B6255] max-w-md mx-auto text-center">{t('description')}</p>
        </V3Reveal>

        <V3Reveal delay={0.1} className="mt-12 max-w-lg mx-auto">
          <V3Card className="p-6 md:p-9">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block font-jost text-[11px] tracking-[0.2em] uppercase text-[#8C8172] mb-2">
                  {t('form.attendance')} *
                </label>
                <div className="relative">
                  <select {...register('attendance')} className={inputClass} style={{ borderColor: `${v3Colors.accent}3D` }}>
                    <option value=""></option>
                    <option value="yes">{t('form.attendanceOptions.yes')}</option>
                    <option value="no">{t('form.attendanceOptions.no')}</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8172] pointer-events-none" />
                </div>
                {errors.attendance && <p className="text-red-600 text-xs mt-2 font-jost">{t('form.selectOption')}</p>}
              </div>

              {weddingData?.selectedGuestTickets && weddingData?.showGuestsInput !== false && (
                <div>
                  <label className="block font-jost text-[11px] tracking-[0.2em] uppercase text-[#8C8172] mb-2">
                    {t('form.guestCount')} *
                  </label>
                  <div className="relative">
                    <select
                      {...register('guestCount')}
                      disabled={watch('attendance') === 'no'}
                      defaultValue="1"
                      className={`${inputClass} disabled:bg-[#F3EDE2] disabled:text-[#8C8172]`}
                      style={{ borderColor: `${v3Colors.accent}3D` }}
                    >
                      <option value="1">{t('form.guestCountOptions.1')}</option>
                      <option value="2">{t('form.guestCountOptions.2')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8172] pointer-events-none" />
                  </div>
                  <p className="text-xs text-[#8C8172] mt-2 font-jost">{t('form.guestCountDisclaimer')}</p>
                </div>
              )}

              {weddingData?.hasDiet && (
                <div>
                  <label className="block font-jost text-[11px] tracking-[0.2em] uppercase text-[#8C8172] mb-2">
                    {t('form.dietaryRestriction')} *
                  </label>
                  <div className="relative">
                    <select
                      {...register('dietaryRestriction')}
                      disabled={watch('attendance') === 'no'}
                      className={`${inputClass} disabled:bg-[#F3EDE2] disabled:text-[#8C8172]`}
                      style={{ borderColor: `${v3Colors.accent}3D` }}
                    >
                      <option value=""></option>
                      <option value="vegetarian">{t('form.dietaryOptions.vegetarian')}</option>
                      <option value="glutenFree">{t('form.dietaryOptions.glutenFree')}</option>
                      <option value="other">{t('form.dietaryOptions.other')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8172] pointer-events-none" />
                  </div>
                  {errors.dietaryRestriction && <p className="text-red-600 text-xs mt-2 font-jost">{t('form.selectOption')}</p>}
                </div>
              )}

              <div>
                <label className="block font-jost text-[11px] tracking-[0.2em] uppercase text-[#8C8172] mb-2">
                  {t('form.messageForCouple')}
                </label>
                <textarea
                  {...register('message')}
                  rows={3}
                  className="w-full px-4 py-3 rounded-[4px] border bg-white focus:ring-2 focus:border-transparent transition-colors resize-none text-[#34302A] font-jost text-sm"
                  style={{ borderColor: `${v3Colors.accent}3D` }}
                />
              </div>

              <V3PillButton type="submit" disabled={isSubmitting} className="w-full justify-center">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: v3Colors.accent, borderTopColor: 'transparent' }} />
                    {t('form.submitting')}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t('form.submit')}
                  </>
                )}
              </V3PillButton>

              {isDemoMode && (
                <p className="text-center font-jost text-[11px] text-[#8C8172] pt-1">
                  Modo de prueba — esta confirmación no se guarda.
                </p>
              )}
            </form>
          </V3Card>
        </V3Reveal>
      </V3Container>
    </V3Section>
  );
}

export default function RSVPV3() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#B5643A] border-t-transparent rounded-full" />
        </div>
      }
    >
      <RSVPContentV3 />
    </Suspense>
  );
}
