// Catálogo de eventos de analítica (spec 11). Nombres en snake_case y propiedades
// sin datos personales: nunca correo, nombre, teléfono ni ID de boda.
//
// Propiedades globales (super properties) en todos los eventos: `src`.
// PostHog agrega por sí mismo $current_url, $pathname, $referrer, $referring_domain y utm_*.

type NoProps = Record<string, never>;

export interface AnalyticsEventMap {
  // Prospecto
  cta_click: { location: string; page: string; package?: 'basico' | 'personalizado' };
  demo_click: { demo_id: string; location: string };
  demo_opened: { demo_id: string };
  section_viewed: { section: string; page: string };
  site_link_click: { from: 'demo' | 'invitacion'; page: string };
  // Admin (solo con sesión iniciada; la persona se identifica por uid)
  signup_completed: NoProps;
  login_completed: NoProps;
  email_verified: NoProps;
  password_reset_requested: NoProps;
  editor_saved: NoProps;
  guest_added: NoProps;
  guest_link_copied: NoProps;
  ai_used: { feature: 'dresscode' | 'suggest' | 'place_description' | 'save_the_date_message' };
  // Gestión de mesas (spec 12)
  table_created: NoProps;
  table_deleted: NoProps;
  guest_assigned_to_table: NoProps;
  fixture_created: NoProps;
  fixture_deleted: NoProps;
  plano_view_opened: NoProps;
  // Cuenta gratuita: invitados y mesas sin plantilla (spec 16)
  free_wedding_created: NoProps;
  free_wedding_limit_reached: NoProps;
  free_wedding_upgrade_cta_click: NoProps;
  // Importar invitados y enviar por WhatsApp (spec 28)
  guests_imported: { rows: number };
  guest_whatsapp_opened: { kind: 'invitation' | 'saveTheDate' | 'album'; edited: boolean };
  // Álbum de fotos de los invitados (spec 29)
  album_photo_uploaded: { mode: 'open' | 'disposable'; source: 'guest' | 'device' };
  album_zip_downloaded: { photos: number };
  album_qr_downloaded: { variant: 'design' | 'plain' };
  album_activation_cta_click: { standalone: boolean };
  album_style_changed: { style: string };
  album_uploads_toggled: { closed: boolean };
  album_link_copied: NoProps;
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsEvent = {
  [K in AnalyticsEventName]: { name: K; props: AnalyticsEventMap[K] };
}[AnalyticsEventName];
