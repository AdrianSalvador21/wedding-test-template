'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, ChevronDown } from 'lucide-react';
import { useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from '../../lib/translations';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';
import { guestService } from '../../services/guestService';
import { FirebaseRSVP, FirebaseGuest } from '../../src/types/wedding';
import { V2Card, V2Container, V2Section, V2Title, V2PillButton } from './ui';

const RSVPContentV2 = () => {
  const { t } = useTranslations('rsvp');
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);
  const { getBackgroundStyle } = useThemePatterns();
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

  const receptionVenue = weddingData?.event.receptionVenue;
  const venueName = typeof receptionVenue?.name === 'object' && receptionVenue.name
    ? (receptionVenue.name[currentLocale as 'es' | 'en'] || receptionVenue.name.es || '')
    : (receptionVenue?.name as unknown as string || t('eventInfo.venue'));
  const weddingDate = weddingData?.event.date ? new Date(weddingData.event.date) : new Date('2025-11-21T16:00:00');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const loadExistingRSVP = async () => {
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
  }, [guestId, weddingId]);

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
    mode: 'onChange'
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

  if (isLoading) {
    return (
      <V2Section id="rsvp" className="relative overflow-hidden" style={getBackgroundStyle(3, '160px')}>
        <V2Container className="py-12">
          <div className="max-w-3xl mx-auto">
            <V2Card className="p-10 text-center">
              <div className="animate-spin w-8 h-8 border-[#b79a7a] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-[#6f6254]">Cargando información del invitado...</p>
            </V2Card>
          </div>
        </V2Container>
      </V2Section>
    );
  }

  if (error) {
    return (
      <V2Section id="rsvp" className="relative overflow-hidden" style={getBackgroundStyle(3, '160px')}>
        <V2Container className="py-12">
          <div className="max-w-3xl mx-auto">
            <V2Card className="p-10 text-center">
              <p className="text-[#6f6254] mb-6">{error}</p>
              <V2PillButton onClick={() => window.location.reload()}>
                Reintentar
              </V2PillButton>
            </V2Card>
          </div>
        </V2Container>
      </V2Section>
    );
  }

  if (isSubmitted) {
    return (
      <V2Section id="rsvp" className="relative overflow-hidden" style={getBackgroundStyle(3, '160px')}>
        <V2Container className="py-12">
          <V2Title title={t('title')} subtitle={t('description')} />

          <div className="mt-10 max-w-3xl mx-auto">
            <V2Card className="p-10">
              <h3 className="font-serif text-2xl text-[#3b342b] mb-3">
                {existingRSVP?.attending ? t('confirmation.received') : t('confirmation.registered')}
              </h3>
              <p className="text-sm md:text-base text-[#6f6254] leading-relaxed">
                {existingRSVP?.attending
                  ? t('confirmation.seeYouThere').replace('{date}', formatDate(weddingDate)).replace('{venue}', venueName)
                  : t('confirmation.sorryToMiss')}
              </p>
            </V2Card>
          </div>
        </V2Container>
      </V2Section>
    );
  }

  if (!isLoaded) {
    return (
      <V2Section id="rsvp">
        <V2Container className="py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#efe6dc] rounded w-64 mx-auto" />
            <div className="h-40 bg-[#f3ece4] rounded-[28px] max-w-3xl mx-auto" />
          </div>
        </V2Container>
      </V2Section>
    );
  }

  return (
    <V2Section id="rsvp" className="relative overflow-hidden" style={getBackgroundStyle(3, '160px')}>
      <V2Container className="py-12">
        <V2Title title={t('title')} subtitle={t('description')} />

        <div className="mt-10 max-w-3xl mx-auto">
          <V2Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-[11px] tracking-[0.28em] uppercase text-[#8a7c6b] mb-2">
                  {t('form.attendance')} *
                </label>
                <div className="relative">
                  <select
                    {...register('attendance')}
                    className="w-full px-4 py-3 pr-10 rounded-[18px] border border-[#e7dccf] bg-white/80 focus:ring-2 focus:ring-[#d7c2a5] focus:border-transparent transition-colors appearance-none text-[#3b342b]"
                  >
                    <option value=""></option>
                    <option value="yes">{t('form.attendanceOptions.yes')}</option>
                    <option value="no">{t('form.attendanceOptions.no')}</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a7c6b] pointer-events-none" />
                </div>
                {errors.attendance && (
                  <p className="text-red-600 text-sm mt-2">{t('form.selectOption')}</p>
                )}
              </div>

              {weddingData?.selectedGuestTickets && weddingData?.showGuestsInput !== false && (
                <div>
                  <label className="block text-[11px] tracking-[0.28em] uppercase text-[#8a7c6b] mb-2">
                    {t('form.guestCount')} *
                  </label>
                  <div className="relative">
                    <select
                      {...register('guestCount')}
                      disabled={watch('attendance') === 'no'}
                      className="w-full px-4 py-3 pr-10 rounded-[18px] border border-[#e7dccf] bg-white/80 focus:ring-2 focus:ring-[#d7c2a5] focus:border-transparent transition-colors appearance-none disabled:bg-[#fbf7f1] disabled:text-[#8a7c6b]"
                      defaultValue="1"
                    >
                      <option value="1">{t('form.guestCountOptions.1')}</option>
                      <option value="2">{t('form.guestCountOptions.2')}</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a7c6b] pointer-events-none" />
                  </div>
                  {errors.guestCount && (
                    <p className="text-red-600 text-sm mt-2">{t('form.selectOption')}</p>
                  )}
                  <p className="text-xs text-[#6f6254] mt-2">
                    {t('form.guestCountDisclaimer')}
                  </p>
                </div>
              )}

              {weddingData?.hasDiet && (
                <div>
                  <label className="block text-[11px] tracking-[0.28em] uppercase text-[#8a7c6b] mb-2">
                    {t('form.dietaryRestriction')} *
                  </label>
                  <div className="relative">
                    <select
                      {...register('dietaryRestriction')}
                      disabled={watch('attendance') === 'no'}
                      className="w-full px-4 py-3 pr-10 rounded-[18px] border border-[#e7dccf] bg-white/80 focus:ring-2 focus:ring-[#d7c2a5] focus:border-transparent transition-colors appearance-none disabled:bg-[#fbf7f1] disabled:text-[#8a7c6b]"
                    >
                      <option value=""></option>
                      <option value="vegetarian">{t('form.dietaryOptions.vegetarian')}</option>
                      <option value="glutenFree">{t('form.dietaryOptions.glutenFree')}</option>
                      <option value="other">{t('form.dietaryOptions.other')}</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a7c6b] pointer-events-none" />
                  </div>
                  {errors.dietaryRestriction && (
                    <p className="text-red-600 text-sm mt-2">{t('form.selectOption')}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] tracking-[0.28em] uppercase text-[#8a7c6b] mb-2">
                  {t('form.messageForCouple')}
                </label>
                <textarea
                  {...register('message')}
                  rows={isMobile ? 3 : 4}
                  className="w-full px-4 py-3 rounded-[18px] border border-[#e7dccf] bg-white/80 focus:ring-2 focus:ring-[#d7c2a5] focus:border-transparent transition-colors resize-none text-[#3b342b]"
                  placeholder=""
                />
              </div>

              <V2PillButton type="submit" disabled={isSubmitting} className="w-full py-4">
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('form.submitting')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-3">
                    <Send className="w-5 h-5" />
                    <span>{t('form.submit')}</span>
                  </span>
                )}
              </V2PillButton>
            </form>
          </V2Card>
        </div>
      </V2Container>
    </V2Section>
  );
};

export default function RSVPV2() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-stone-300 border-t-stone-900 rounded-full"></div>
      </div>
    }>
      <RSVPContentV2 />
    </Suspense>
  );
}
