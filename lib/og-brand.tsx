import { ImageResponse } from 'next/og';
import { L } from './brand';
import { SITE } from './site';

// Íconos e imagen para compartir generados en código (spec 10, paso 4).
// El wordmark "invyta" es una reconstrucción en Fraunces SemiBold, no el logo
// oficial vectorizado del kit de marca.

export const OG_SIZE = { width: 1200, height: 630 };

async function loadFonts() {
  // Las rutas que usan esto corren en runtime edge (ver export const runtime):
  // en Node, @vercel/og falla en Windows al resolver sus propios archivos.
  const data = await fetch(new URL('../app/_fonts/Fraunces-SemiBold.woff', import.meta.url)).then((res) =>
    res.arrayBuffer(),
  );
  return [{ name: 'Fraunces', data, weight: 600 as const, style: 'normal' as const }];
}

// Monograma "i" sobre terracota. `rounded` para el favicon; los íconos de
// pantalla de inicio van a sangre (el sistema les aplica su propia máscara).
export async function brandIcon(size: number, rounded = false) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: L.terracota,
          borderRadius: rounded ? Math.round(size * 0.22) : 0,
          color: L.ivory,
          fontFamily: 'Fraunces',
          fontSize: Math.round(size * 0.82),
          lineHeight: 1,
          paddingBottom: Math.round(size * 0.04),
        }}
      >
        i
      </div>
    ),
    { width: size, height: size, fonts: await loadFonts() },
  );
}

export async function brandOg() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: L.ivory, fontFamily: 'Fraunces' }}>
        <div style={{ width: 20, height: '100%', display: 'flex', background: L.terracota }} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
            padding: '72px 80px',
          }}
        >
          <div style={{ display: 'flex', fontSize: 64, color: L.charcoal, letterSpacing: -1 }}>invyta</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 26,
                color: L.terracotaDark,
                letterSpacing: 6,
                textTransform: 'uppercase',
              }}
            >
              Invitaciones digitales para boda
            </div>
            <div style={{ display: 'flex', fontSize: 76, lineHeight: 1.1, color: L.charcoal, maxWidth: 940 }}>
              Tu boda, en una invitación que se siente tuya.
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: L.muted }}>{SITE.url.replace('https://', '')}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await loadFonts() },
  );
}
