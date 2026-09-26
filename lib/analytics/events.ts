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
  ai_used: { feature: 'dresscode' | 'suggest' | 'place_description' };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsEvent = {
  [K in AnalyticsEventName]: { name: K; props: AnalyticsEventMap[K] };
}[AnalyticsEventName];
