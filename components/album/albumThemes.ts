import type { CSSProperties } from 'react';

// Spec 29 — tokens visuales del álbum por template. Salen del código de producción de cada
// template (no se inventan colores ni adornos) y los usan la página /fotos, el botón de la
// invitación y el QR imprimible. Si un spec rediseña un template, debe revisar este archivo.
//   01 Clásico  → components/sections/Hero.tsx, components/sections/ui.tsx (T1_COLORS)
//   02 Moderno  → components/sections-v2/ui.tsx (V2_COLORS / V2_FONTS), canvas del spec 25
//   03 Botánica → components/sections-v3/HeroV3.tsx, components/sections-v3/ui.tsx (v3Colors)
//   04 Jardín   → components/sections-v4/HeroV4.tsx, components/sections-v4/ui.tsx (v4Colors)
// Los numerales de sección de la invitación ("XII", "05") no se usan en el álbum.

export type AlbumTemplateId = 'template-01' | 'template-02' | 'template-03' | 'template-04';
export type AlbumHeaderKind = 'classic' | 'modern' | 'botanical' | 'garden';

export interface AlbumTheme {
  id: AlbumTemplateId;
  header: AlbumHeaderKind;
  bg: string;
  ink: string;
  body: string;
  muted: string;
  fontFamily: string;
  heading: CSSProperties;
  button: CSSProperties;
  fab: CSSProperties;
  track: CSSProperties;
  fill: string;
  grid: { cols: number; gap: number; radius: string; aspect: string; wideEvery?: number };
  chipRadius: string;
  card: CSSProperties;
  cardTitle: CSSProperties;
  cardMuted: string;
  dashed: string;
  // QR imprimible (se dibuja en canvas): fondo, tinta, acento y fuentes.
  qr: {
    bg: string;
    ink: string;
    accent: string;
    namesFont: string;
    namesSize: number;
    namesUpper: boolean;
    joiner: string;
    lineFont: string;
    labelFont: string;
    band?: string; // franja superior oscura (Jardín)
    align: 'center' | 'left';
    frame: 'double' | 'none' | 'arch';
  };
}

const CLASSIC: AlbumTheme = {
  id: 'template-01',
  header: 'classic',
  bg: '#faf8f5',
  ink: '#5a4a3a',
  body: '#6b5b4f',
  muted: '#6b5b4f',
  fontFamily: "'Lora', serif",
  heading: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#5a4a3a' },
  button: { height: 50, background: '#8B5E34', color: '#FFF7EC', border: '1.5px solid #8B5E34', borderRadius: 0, fontFamily: "'Lora', serif", fontSize: 11.5, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' },
  fab: { height: 52, padding: '0 20px', background: '#8B5E34', color: '#FFF7EC', border: '1.5px solid #8B5E34', borderRadius: 0, fontFamily: "'Lora', serif", fontSize: 11.5, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', boxShadow: '0 8px 22px rgba(0,0,0,0.35)' },
  track: { height: 3, background: '#e8ddd4' },
  fill: '#c9a86a',
  grid: { cols: 3, gap: 6, radius: '0px', aspect: '1 / 1' },
  chipRadius: '0px',
  card: { background: '#fffdf9', border: '1px solid #d9c6a8', color: '#5a4a3a', borderRadius: 0 },
  cardTitle: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.24em', textTransform: 'uppercase' },
  cardMuted: '#6b5b4f',
  dashed: '1px solid #d9c6a8',
  qr: { bg: '#faf8f5', ink: '#5a4a3a', accent: '#c9a86a', namesFont: "'Allura', cursive", namesSize: 150, namesUpper: false, joiner: '&', lineFont: "600 34px 'Cormorant Garamond', serif", labelFont: "400 22px 'Lora', serif", align: 'center', frame: 'double' },
};

const MODERN: AlbumTheme = {
  id: 'template-02',
  header: 'modern',
  bg: '#F2EFEA',
  ink: '#1E1C19',
  body: '#57524B',
  muted: '#57524B',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  heading: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 400, fontSize: 28, lineHeight: 1.02, letterSpacing: '-0.035em', color: '#1E1C19' },
  button: { height: 56, background: '#1E1C19', color: '#F2EFEA', border: '1px solid #1E1C19', borderRadius: 999, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 600 },
  fab: { height: 48, padding: '0 18px', background: '#1E1C19', color: '#F2EFEA', borderRadius: 999, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600 },
  track: { height: 2, background: '#D9D3C9' },
  fill: '#1E1C19',
  grid: { cols: 2, gap: 8, radius: '4px', aspect: '5 / 7' },
  chipRadius: '999px',
  card: { background: '#1E1C19', color: '#F2EFEA', borderRadius: 4 },
  cardTitle: { fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#C9A882' },
  cardMuted: '#A49C91',
  dashed: '1px solid #D9D3C9',
  qr: { bg: '#F2EFEA', ink: '#1E1C19', accent: '#7A5A3C', namesFont: "'Bricolage Grotesque', sans-serif", namesSize: 150, namesUpper: false, joiner: '&', lineFont: "400 52px 'Bricolage Grotesque', sans-serif", labelFont: "600 22px 'Plus Jakarta Sans', sans-serif", align: 'left', frame: 'none' },
};

const BOTANICAL: AlbumTheme = {
  id: 'template-03',
  header: 'botanical',
  bg: '#FAF6EF',
  ink: '#34302A',
  body: '#6B6255',
  muted: '#6B6255',
  fontFamily: "'Jost', sans-serif",
  heading: { fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 500, fontSize: 26, color: '#34302A' },
  button: { height: 50, background: '#B5643A', color: '#FFFFFF', border: 0, borderRadius: 999, fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: '0.04em' },
  fab: { height: 52, padding: '0 24px', background: '#B5643A', color: '#FAF6EF', borderRadius: 999, fontFamily: "'Jost', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', boxShadow: '0 8px 22px rgba(181,100,58,0.35)' },
  track: { height: 6, borderRadius: 999, background: '#F1EADD' },
  fill: '#B5643A',
  grid: { cols: 2, gap: 10, radius: '4px', aspect: '4 / 5' },
  chipRadius: '999px',
  card: { background: '#F1EADD', color: '#34302A', borderRadius: 18 },
  cardTitle: { fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 500, fontSize: 21 },
  cardMuted: '#6B6255',
  dashed: '1px dashed #C8BBA4',
  qr: { bg: '#FAF6EF', ink: '#34302A', accent: '#B5643A', namesFont: "italic 500 120px 'Cormorant Garamond', serif", namesSize: 120, namesUpper: false, joiner: '&', lineFont: "italic 500 50px 'Cormorant Garamond', serif", labelFont: "500 22px 'Jost', sans-serif", align: 'center', frame: 'arch' },
};

const GARDEN: AlbumTheme = {
  id: 'template-04',
  header: 'garden',
  bg: '#F4EFE3',
  ink: '#2E3323',
  body: '#3A3830',
  muted: '#5E6152',
  fontFamily: "Georgia, 'Times New Roman', serif",
  heading: { fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 17, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2E3323' },
  button: { height: 48, background: '#2E3323', color: '#F4EFE3', border: 0, borderRadius: 0, fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' },
  fab: { height: 48, padding: '0 18px', background: '#F4EFE3', color: '#2E3323', borderRadius: 0, fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', boxShadow: '0 8px 22px rgba(20,22,14,0.35)' },
  track: { height: 2, background: '#DDD3BD' },
  fill: '#2E3323',
  grid: { cols: 2, gap: 8, radius: '0px', aspect: '1 / 1', wideEvery: 3 },
  chipRadius: '0px',
  card: { background: '#2E3323', color: '#F4EFE3', borderRadius: 0 },
  cardTitle: { fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#C9A98C' },
  cardMuted: '#E8E1D1',
  dashed: '1px solid #B7AD90',
  qr: { bg: '#F4EFE3', ink: '#2E3323', accent: '#8E5534', namesFont: 'Georgia, serif', namesSize: 84, namesUpper: true, joiner: 'y', lineFont: 'italic 44px Georgia, serif', labelFont: "22px 'Helvetica Neue', Arial, sans-serif", band: '#2E3323', align: 'center', frame: 'none' },
};

export const ALBUM_THEMES: Record<AlbumTemplateId, AlbumTheme> = {
  'template-01': CLASSIC,
  'template-02': MODERN,
  'template-03': BOTANICAL,
  'template-04': GARDEN,
};

// Si el template de la boda no está en la tabla, se usa el del 02 (spec 29).
export function getAlbumTheme(templateId: string | null | undefined): AlbumTheme {
  return (templateId && ALBUM_THEMES[templateId as AlbumTemplateId]) || MODERN;
}
