// Catálogo de eventos de analítica (specs 11 y 31). Nombres en snake_case y propiedades
// sin datos personales: nunca correo, nombre, teléfono, ID de boda ni ID de invitado.
//
// Parámetros que `client.ts` agrega a todos los eventos: `src`, y en invitaciones y demos
// `template_id` e `is_demo`. GA4 agrega `page_location` (saneado), `page_title` y los datos de sesión.
// Los booleanos viajan como 'true' / 'false' (GA4 no los maneja).

type NoProps = Record<string, never>;

export interface AnalyticsEventMap {
  // Prospecto. `generate_lead` (antes `cta_click`) es el evento recomendado de GA4: clic a WhatsApp de Invyta.
  generate_lead: { location: string; page: string; package?: 'basico' | 'personalizado' };
  demo_click: { demo_id: string; location: string };
  demo_opened: { demo_id: string };
  section_viewed: { section: string; page: string };
  site_link_click: { from: 'demo' | 'invitacion'; page: string };
  // Admin (solo con sesión iniciada; la persona se identifica por uid)
  // Eventos recomendados de GA4 (antes `signup_completed` y `login_completed`)
  sign_up: { method: 'password' };
  login: { method: 'password' };
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
  // Invitaciones reales y demos (spec 31). Sin ID de boda ni de invitado.
  invitation_opened: { page_type: 'invitation' | 'save_the_date' | 'album'; has_guest: boolean };
  rsvp_submitted: { attending: 'yes' | 'no'; guest_count: number };
  invitation_interaction: { action: InvitationAction };
}

export const INVITATION_ACTIONS = [
  'map',
  'calendar',
  'gift_registry',
  'gift_copy',
  'music_play',
  'contact_couple',
  'album_open',
] as const;

export type InvitationAction = (typeof INVITATION_ACTIONS)[number];

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsEvent = {
  [K in AnalyticsEventName]: { name: K; props: AnalyticsEventMap[K] };
}[AnalyticsEventName];
