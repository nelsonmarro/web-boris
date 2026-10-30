import { ImageResponse } from 'next/og';
import { loadOgFonts, OG_FONT_TEXT, OG_FONT_TITLE } from '@/features/monsters/og/fonts';
import { OG_HEIGHT, OG_WIDTH } from '@/features/monsters/og/og-layout';

// Imagen para compartir del juego (el enlace del reto, `?reto=N`, la usa también): estática, generada en el build. Una
// imagen por racha exigiría una ruta dinámica: fuera de alcance. Mismo aspecto que las de las fichas (`FichaOgImage`).
export const alt = '¿Quién mide más? El juego de longitudes de la wiki de BorisaoBlois';
export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = 'image/png';

const ORANGE = '#FF7300';
const SKY = 'rgba(125,211,252,0.8)';
const BG_FROM = '#00122E';
const BG_TO = '#00203F';

/** Barras decorativas, sin nombres ni medidas (nada que destripe el juego): naranja = archivo, cian = referencia real. */
const BARS: { width: number; real: boolean }[] = [
  { width: 420, real: true },
  { width: 342, real: false },
  { width: 254, real: false },
  { width: 224, real: true },
  { width: 194, real: false },
  { width: 136, real: true },
];

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: BG_FROM,
          backgroundImage: `linear-gradient(135deg, ${BG_FROM} 0%, ${BG_TO} 100%)`,
          color: 'white',
          fontFamily: OG_FONT_TEXT,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: OG_WIDTH,
            height: OG_HEIGHT,
            display: 'flex',
            backgroundImage: 'radial-gradient(ellipse at 85% 0%, rgba(0,100,160,0.55) 0%, rgba(0,32,63,0) 60%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 640,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '56px 64px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', width: 40, height: 6, borderRadius: 3, backgroundColor: ORANGE }} />
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, letterSpacing: 5 }}>
              <span style={{ color: ORANGE }}>BORISAOBLOIS</span>
              <span style={{ color: 'rgba(255,255,255,0.75)', marginLeft: 12 }}>· UNIVERSOS</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.72)',
              }}
            >
              Juego de la wiki
            </div>
            <div
              style={{
                display: 'flex',
                width: 520,
                fontFamily: OG_FONT_TITLE,
                fontWeight: 700,
                fontSize: 72,
                lineHeight: 1.06,
                letterSpacing: -1,
              }}
            >
              ¿Quién mide más?
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: 52, fontWeight: 700, color: ORANGE }}>¿Me superas?</div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 64,
            bottom: 0,
            width: 440,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 26,
          }}
        >
          {BARS.map((bar, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                width: bar.width,
                height: 34,
                borderRadius: 17,
                ...(bar.real
                  ? { border: `3px dashed ${SKY}`, backgroundColor: 'rgba(125,211,252,0.12)' }
                  : { backgroundImage: `linear-gradient(90deg, rgba(255,115,0,0.55) 0%, ${ORANGE} 100%)` }),
              }}
            />
          ))}
        </div>
      </div>
    ),
    { width: OG_WIDTH, height: OG_HEIGHT, fonts },
  );
}
