import { ImageResponse } from 'next/og';
import { loadOgFonts, OG_FONT_TEXT, OG_FONT_TITLE } from '@/features/monsters/og/fonts';
import { OG_HEIGHT, OG_WIDTH } from '@/features/monsters/og/og-layout';

// Imagen para compartir de la Arena (spec «Arena más divertida» §6): estática, generada en el build. Los enlaces de un
// combate (`?a=&b=`) la usan también; una imagen por pareja exigiría una ruta dinámica: fuera de alcance. Mismo aspecto
// que las de las fichas y el juego de tamaños.
export const alt = 'Versus Arena: combates por asaltos entre los colosos de BorisaoBlois';
export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = 'image/png';

const ORANGE = '#FF7300';
const CYAN = '#67e8f9';
const BG_FROM = '#00122E';
const BG_TO = '#00203F';

/** Cinco asaltos decorativos (sin nombres ni resultados): naranja = A, cian = B. */
const ROUNDS: { a: number; b: number }[] = [
  { a: 0.62, b: 0.38 },
  { a: 0.44, b: 0.56 },
  { a: 0.7, b: 0.3 },
  { a: 0.48, b: 0.52 },
  { a: 0.58, b: 0.42 },
];
const BAR_WIDTH = 420;

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
              Combate por asaltos · Torneo rápido
            </div>
            <div
              style={{
                display: 'flex',
                width: 540,
                fontFamily: OG_FONT_TITLE,
                fontWeight: 700,
                fontSize: 76,
                lineHeight: 1.06,
                letterSpacing: -1,
              }}
            >
              Versus Arena
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: 52, fontWeight: 700, color: ORANGE }}>¿Quién gana?</div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 64,
            bottom: 0,
            width: BAR_WIDTH,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 26,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', fontFamily: OG_FONT_TITLE, fontWeight: 700, fontSize: 64 }}>
            <span style={{ color: ORANGE }}>A</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', margin: '0 28px' }}>VS</span>
            <span style={{ color: CYAN }}>B</span>
          </div>
          {ROUNDS.map((round, i) => (
            <div key={i} style={{ display: 'flex', width: BAR_WIDTH, height: 30, borderRadius: 15, overflow: 'hidden' }}>
              <div style={{ display: 'flex', width: BAR_WIDTH * round.a, height: 30, backgroundColor: ORANGE }} />
              <div style={{ display: 'flex', width: BAR_WIDTH * round.b, height: 30, backgroundColor: CYAN }} />
            </div>
          ))}
        </div>
      </div>
    ),
    { width: OG_WIDTH, height: OG_HEIGHT, fonts },
  );
}
