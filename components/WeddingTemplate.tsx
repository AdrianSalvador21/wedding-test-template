'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useWedding } from '../src/store/hooks';
import { useTranslations } from '../lib/translations';
import { ThemeProvider } from '../lib/theme-context';
import { createWeddingTheme } from '../lib/theme-utils';
import { guestService } from '../services/guestService';
import { FirebaseGuest } from '../src/types/wedding';
import { useWeddingMusic } from '../hooks/useWeddingMusic';
import { SITE } from '../lib/site';
import { isDemoId } from '../lib/analytics/demos';
import { useInvitationOpened } from '../lib/analytics/useInvitationOpened';
import InvitationNotActivated from './InvitationNotActivated';
import SaveTheDate from './SaveTheDate';
import InvitationLoading from './InvitationLoading';
import SaveTheDatePreviewBar from './SaveTheDatePreviewBar';
import { useCanPreviewFull } from '../hooks/useCanPreviewFull';
import InvitationOverlay from './InvitationOverlay';
import MusicPlayer from './MusicPlayer';
import { MusicControlProvider } from './MusicControlContext';
import Template01 from './templates/Template01';
import Template02 from './templates/Template02';
import Template03 from './templates/Template03';
import Template04 from './templates/Template04';
import AlbumFab from './album/AlbumFab';
import EventDayPass from './eventDay/EventDayPass';
import EventDayReopenButton from './eventDay/EventDayReopenButton';
import { EventDayContext, type EventDayReopen } from './eventDay/EventDayContext';
import { useEventDayPass } from '../hooks/useEventDayPass';
import { eventDayConfig, isEventDayActive } from '../lib/eventDay';

interface WeddingTemplateProps {
  guestId?: string | null;
  weddingId?: string;
  previewFull?: boolean; // Spec 27 — ?preview=full
  previewSaveTheDate?: boolean; // Spec 27 — ?preview=save-the-date o /aparta-la-fecha: muestra el save the date aunque esté apagado
  demoGuestName?: string | null; // Spec 27 — nombre de muestra (?invitado=) en las demos de save the date
  previewEventDay?: boolean; // Spec 32 — ?preview=event-day: el pase del día del evento con cualquier fecha (solo admin o dueño)
}

export default function WeddingTemplate({ guestId, weddingId, previewFull = false, previewSaveTheDate = false, demoGuestName = null, previewEventDay = false }: WeddingTemplateProps) {
  const { currentWedding, loading, error, initialized } = useWedding();
  const { t } = useTranslations('template');
  const [showOverlay, setShowOverlay] = useState(false);
  const [guestInfo, setGuestInfo] = useState<FirebaseGuest | null>(null);
  const [guestLoading, setGuestLoading] = useState(!!guestId);
  const [showDemoOverlay, setShowDemoOverlay] = useState(false);
  
  // Hook de música dinámico - debe estar antes de cualquier return condicional
  // Usar weddingId de props o currentWedding como fallback
  const { music: dynamicMusic } = useWeddingMusic(weddingId || currentWedding?.id);
  
  // DEBUG: Solo logs importantes en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 WeddingTemplate - dynamicMusic:', dynamicMusic);
  }

  // Spec 27 — con el save the date activo, la invitación completa solo se ve con ?preview=full y
  // sesión de admin o dueño. Sin el parámetro, el hook no toca Auth ni la red.
  const saveTheDateOn = !!currentWedding?.saveTheDate?.enabled;
  const { allowed: canPreviewFull, checking: checkingPreview } = useCanPreviewFull(
    currentWedding?.id,
    previewFull && saveTheDateOn
  );

  // Spec 32 — vista previa del pase (?preview=event-day): misma regla de sesión que ?preview=full.
  const { allowed: canPreviewEventDay, checking: checkingEventDayPreview } = useCanPreviewFull(
    currentWedding?.id,
    previewEventDay && !!guestId
  );

  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as string;

  // Buscar información del invitado en Firebase y validar idioma
  useEffect(() => {
    const fetchGuestInfo = async () => {
      if (!guestId || !currentWedding?.id) {
        setGuestLoading(false);
        return;
      }

      try {
        setGuestLoading(true);
        const guest = await guestService.getGuestByGuestId(guestId, currentWedding.id);
        
        if (guest) {
          setGuestInfo(guest);
          setShowOverlay(true); // Solo mostrar overlay si encontramos info del invitado

          // Validar idioma del invitado
          if (guest.language && guest.language !== currentLocale) {
            // Redireccionar al idioma correcto del invitado. Spec 32 — se conserva ?preview= (o el
            // nombre anterior ?vista=) para que las vistas previas funcionen con invitados en inglés.
            const query = new URLSearchParams(window.location.search);
            const previewParam = query.has('preview') ? 'preview' : query.has('vista') ? 'vista' : null;
            const previewValue = previewParam ? query.get(previewParam) : null;
            const correctUrl = `/${guest.language}/wedding/${currentWedding.id}?guest=${guestId}${previewParam && previewValue ? `&${previewParam}=${encodeURIComponent(previewValue)}` : ''}`;
            router.replace(correctUrl);
            return;
          }
        } else {
          setGuestInfo(null);
          setShowOverlay(false); // No mostrar overlay si no hay info del invitado
        }
      } catch (error) {
        console.error('Error buscando invitado:', error);
        setGuestInfo(null);
        setShowOverlay(false); // No mostrar overlay en caso de error
      } finally {
        setGuestLoading(false);
      }
    };

    fetchGuestInfo();
  }, [guestId, currentWedding?.id, currentLocale, router]);

  // Mostrar overlay de demo cuando no hay guest específico y estamos usando mock data
  useEffect(() => {
    if (!guestId && currentWedding && !guestLoading) {
      // Solo mostrar demo si estamos usando datos mock (no datos reales de Firebase)
      const isMockData = currentWedding.id === 'friends-test' ||
                        currentWedding.id === 'maria-carlos-2025' ||
                        currentWedding.id === 'ana-luis-2024' ||
                        currentWedding.id === 'luxury-wedding' ||
                        currentWedding.id === 'premium-wedding' ||
                        currentWedding.id === 'corporate-event' ||
                        currentWedding.id === 'valentina-mateo-2026' ||
                        currentWedding.id === 'template-01-demo' ||
                        currentWedding.id === 'template-02-demo' ||
                        currentWedding.id === 'template-04-demo';
      
      if (isMockData) {
        // Mostrar overlay de demo después de 1 segundo
        const timer = setTimeout(() => {
          setShowDemoOverlay(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [guestId, currentWedding, guestLoading]);

  // Spec 31 — `invitation_opened` cuando ya se pinta la invitación o el save the date (no en la
  // carga, ni con error, ni en una boda gratis sin activar). Refleja las mismas condiciones de abajo.
  const isReady = initialized && !loading && !guestLoading && !checkingPreview && !checkingEventDayPreview && !error && !!currentWedding;
  const isFreeWedding = (currentWedding?.tier ?? 'template') === 'free';
  // Spec 32 — la vista previa del pase (?preview=event-day con sesión de dueño o admin) también pasa por
  // encima del save the date, para revisarlo sin apagarlo.
  const previewingEventDay = previewEventDay && !!guestId && canPreviewEventDay;
  const showsSaveTheDate = !previewingEventDay && (previewSaveTheDate || (saveTheDateOn && !canPreviewFull));

  // Spec 32 — modo "Día del evento". La boda solo llega en el cliente (el servidor pinta la carga),
  // así que la ventana se puede calcular en el render sin desfasar la hidratación. Calcularlo aquí y
  // no en un efecto evita que la invitación se pinte un instante antes del pase.
  const eventDayNow = useMemo(() => !!currentWedding && isEventDayActive(currentWedding), [currentWedding]);
  const eventDay = currentWedding ? eventDayConfig(currentWedding) : null;
  // El pase solo existe con ?guest= válido, en una boda con diseño, sin save the date en pantalla y
  // para invitaciones no declinadas. Su estado abierto/cerrado vive en memoria: al recargar se abre.
  const passEligible =
    !!guestInfo &&
    !!guestId &&
    !isFreeWedding &&
    !showsSaveTheDate &&
    guestInfo.rsvpStatus !== 'declined' &&
    (eventDayNow || previewingEventDay);
  const [passClosed, setPassClosed] = useState(false);
  const showPass = passEligible && !passClosed;
  const passData = useEventDayPass(guestInfo, passEligible, !!eventDay?.showFloorPlan);
  const reopenValue = useMemo<EventDayReopen | null>(
    () => (passEligible && passClosed ? { reopen: () => setPassClosed(false), tableName: passData.people[0]?.table?.name ?? null } : null),
    [passEligible, passClosed, passData.people]
  );
  useInvitationOpened(
    isReady && !isFreeWedding && currentWedding
      ? {
          weddingId: currentWedding.id,
          templateId: currentWedding.template?.id || 'template-01',
          pageType: showsSaveTheDate ? 'save_the_date' : 'invitation',
          hasGuest: !!guestId,
        }
      : null
  );

  // Estado de carga
  // Spec 32 — con el pase en pantalla, la carga sigue hasta tener sus mesas: así se pinta completo.
  if (!initialized || loading || guestLoading || checkingPreview || checkingEventDayPreview || (showPass && passData.loading)) {
    return <InvitationLoading message={guestLoading ? 'Cargando información del invitado...' : t('loading')} />;
  }

  // Estado de error
  if (error || !currentWedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('notFound')}</h2>
          <p className="text-gray-600 mb-6">
            {error || t('notFoundMessage')}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  // Spec 16 — una boda 'free' nunca tiene plantilla que renderizar: sin este corte, caía en
  // Template01 vacío (currentWedding.template?.id || 'template-01') sin ningún aviso.
  if ((currentWedding.tier ?? 'template') === 'free') {
    const bride = currentWedding.couple?.bride?.name;
    const groom = currentWedding.couple?.groom?.name;
    const coupleNames = bride && groom ? `${bride} y ${groom}` : undefined;
    return <InvitationNotActivated coupleNames={coupleNames} weddingId={currentWedding.id} />;
  }

  // Spec 27 — modo "Aparta la fecha": el mismo link (con o sin ?guest=) muestra solo el save the
  // date, sin overlay de bienvenida, overlay de demo ni música.
  if (showsSaveTheDate) {
    return <SaveTheDate wedding={currentWedding} guestName={guestInfo?.name || demoGuestName || null} />;
  }

  // Crear tema basado en los datos del servicio
  const weddingTheme = createWeddingTheme(currentWedding);
  
  // Debug: mostrar tema creado
  console.log('🎨 Tema creado para boda:', currentWedding.id, 'tema:', weddingTheme.id, weddingTheme.name);

  const templateId = currentWedding.template?.id || 'template-01';

  // Renderizar la invitación completa
  return (
    <ThemeProvider weddingTheme={weddingTheme}>
      <MusicControlProvider>
      <EventDayContext.Provider value={reopenValue}>
      {saveTheDateOn && canPreviewFull && <SaveTheDatePreviewBar weddingId={currentWedding.id} />}
      <main className="min-h-screen">
        {(() => {
          // Spec 32 — durante la ventana del día del evento no hay overlay de bienvenida: lo
          // reemplaza el pase. Mientras el pase está abierto cuenta como overlay, así el Hero espera
          // y hace su animación de entrada al pulsar "Ver invitación", como al cerrar la bienvenida.
          const overlayVisible = (showOverlay && !passEligible) || showDemoOverlay || showPass;

          if (templateId === 'template-04') {
            return <Template04 overlayVisible={overlayVisible} />;
          }
          if (templateId === 'template-03') {
            return <Template03 overlayVisible={overlayVisible} />;
          }
          if (templateId === 'template-02') {
            return <Template02 overlayVisible={overlayVisible} />;
          }
          return <Template01 overlayVisible={overlayVisible} />;
        })()}
        
        {/* Overlay de invitación personalizada */}
        {showOverlay && !passEligible && guestId && currentWedding && (
          <InvitationOverlay
            guestId={guestId}
            weddingId={currentWedding.id}
            guestInfo={guestInfo}
            onClose={() => setShowOverlay(false)}
            templateId={templateId}
          />
        )}

        {/* Overlay de demostración */}
        {showDemoOverlay && currentWedding && (
          <InvitationOverlay
            guestId="demo-guest"
            weddingId={currentWedding.id}
            guestInfo={null}
            onClose={() => setShowDemoOverlay(false)}
            isDemoMode={true}
            templateId={templateId}
          />
        )}

        {/* Spec 29 — acceso al álbum de fotos (templates 01, 03 y 04; el 02 lo lleva en su barra fija).
            Solo aparece con el álbum activado y desde el día de la boda. */}
        <AlbumFab wedding={currentWedding} guestId={guestId} />

        {/* Spec 32 — pase del día del evento encima de la invitación, y "Mi mesa" para reabrirlo. */}
        <AnimatePresence>
        {showPass && guestInfo && guestId && eventDay && (
          <EventDayPass
            key="event-day-pass"
            wedding={currentWedding}
            guest={guestInfo}
            guestUrlId={guestId}
            data={passData}
            config={eventDay}
            onClose={() => setPassClosed(true)}
          />
        )}
        </AnimatePresence>
        <EventDayReopenButton wedding={currentWedding} />

        {/* Reproductor de música de fondo (template-02 dibuja su propio botón, spec 25). Mientras el
            pase está abierto no se monta, para que un toque en el pase no arranque la música. */}
        {dynamicMusic && !showPass && (
          <MusicPlayer music={dynamicMusic} showFloatingButton={templateId !== 'template-02'} />
        )}
      </main>
      </EventDayContext.Provider>
      </MusicControlProvider>

      {/* Footer Invyta */}
      <footer className="footer-theme-bg from-primary via-secondary to-accent text-white py-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <a
              href={`${SITE.url}/?src=${isDemoId(currentWedding?.id ?? weddingId) ? 'demo' : 'invitacion'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <div className="text-xl font-serif font-bold text-white">
                invyta
              </div>
            </a>
            {/* Spec 31 — la invitación se mide: el aviso de privacidad queda al alcance del invitado. */}
            <a
              href={`${SITE.url}/aviso-de-privacidad`}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-serif text-xs text-white/80 hover:opacity-80 transition-opacity"
            >
              {currentLocale === 'en' ? 'Privacy' : 'Privacidad'}
            </a>
          </div>
        </div>
      </footer>
    </ThemeProvider>
  );
}
