/* eslint-disable @next/next/no-img-element -- Satori (next/og) pinta <img>, no next/image */
import { ImageResponse } from 'next/og';
import type { WikiArticle } from '@/core/types/wiki';
import { isIndexCategory } from '@/core/search/catalog';
import { coverOf } from '@/components/content/CategoryPlaceholder';
import type { ThreatTone } from '@/features/monsters/lib/stats';
import { loadCover } from './cover';
import { loadOgFonts, OG_FONT_TEXT, OG_FONT_TITLE } from './fonts';
import {
  clampText,
  OG_COVER_WIDTH,
  OG_HEIGHT,
  OG_TITLE_WIDTH,
  OG_WIDTH,
  ogFacts,
  titleFontSize,
  type OgFact,
} from './og-layout';

// Paleta de la «ley Abisal».
const ORANGE = '#FF7300';
const BG_FROM = '#00122E';
const BG_TO = '#00203F';
/** El color del degradado de fondo a la altura del borde de la portada: la fusión no deja costura. */
const BG_EDGE = '#001A38';
const TONE: Record<ThreatTone, string> = { green: '#6EE7B7', amber: '#FCD34D', red: '#FCA5A5' };

/** Imagen para compartir (1200×630) de una ficha: portada a la derecha, título, «Categoría · Universo» y datos. */
export async function renderFichaOgImage({ frontmatter }: WikiArticle): Promise<ImageResponse> {
  const isIndex = isIndexCategory(frontmatter.category);
  const sealed = frontmatter.status === 'proximamente';
  const cover = isIndex ? undefined : coverOf(frontmatter.image);
  const [fonts, coverSrc] = await Promise.all([
    loadOgFonts(),
    cover ? loadCover(cover, OG_COVER_WIDTH, OG_HEIGHT, frontmatter.imagePosition) : Promise.resolve(null),
  ]);

  const facts = sealed || isIndex ? [] : ogFacts(frontmatter.stats);
  // «Categoría · Universo X»; la ficha que da nombre a su universo (su Historia) no lo repite. Los índices sí.
  const namesUniverse = !isIndex && frontmatter.universe === frontmatter.title;
  const universe = namesUniverse ? 'Universo' : `Universo ${frontmatter.universe}`;
  const kicker = [frontmatter.category, universe].filter(Boolean).join(' · ');
  // Sin datos, la entradilla (canon de la ficha) ocupa su lugar.
  const description =
    !sealed && facts.length === 0 && frontmatter.description ? clampText(frontmatter.description, isIndex ? 150 : 120) : null;
  const titleWidth = isIndex ? OG_WIDTH - 128 : OG_TITLE_WIDTH;

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
        {!isIndex && <CoverPanel src={coverSrc} category={frontmatter.category} />}
        {isIndex && (
          // Los índices no llevan portada: solo el resplandor cian del placeholder por categoría.
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
        )}

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: isIndex ? OG_WIDTH : 700,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '56px 64px 56px 64px',
          }}
        >
          <Brand />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {kicker && (
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
                {kicker}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                width: titleWidth,
                fontFamily: OG_FONT_TITLE,
                fontWeight: 700,
                fontSize: titleFontSize(frontmatter.title, titleWidth),
                lineHeight: 1.06,
                letterSpacing: -1,
              }}
            >
              {frontmatter.title}
            </div>
            {description && (
              <div
                style={{
                  display: 'flex',
                  width: titleWidth,
                  marginTop: 6,
                  fontSize: 30,
                  fontWeight: 600,
                  lineHeight: 1.25,
                  color: 'rgba(255,255,255,0.82)',
                }}
              >
                {description}
              </div>
            )}
          </div>

          {sealed ? <SealedStamp /> : facts.length > 0 ? <Facts facts={facts} /> : <div style={{ display: 'flex' }} />}
        </div>
      </div>
    ),
    { width: OG_WIDTH, height: OG_HEIGHT, fonts },
  );
}

function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', width: 40, height: 6, borderRadius: 3, backgroundColor: ORANGE }} />
      <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, letterSpacing: 5 }}>
        <span style={{ color: ORANGE }}>BORISAOBLOIS</span>
        <span style={{ color: 'rgba(255,255,255,0.75)', marginLeft: 12 }}>· UNIVERSOS</span>
      </div>
    </div>
  );
}

/** Portada a sangre en el panel derecho, fundida con el fondo por la izquierda; sin portada, el placeholder abisal. */
function CoverPanel({ src, category }: { src: string | null; category?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: OG_COVER_WIDTH,
        height: OG_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Sin claves `undefined`: Satori las procesa como texto y falla.
        ...(src ? {} : { backgroundImage: 'radial-gradient(ellipse at top, #0064A0 0%, #00203F 55%, #00122E 100%)' }),
      }}
    >
      {src ? (
        <img src={src} width={OG_COVER_WIDTH} height={OG_HEIGHT} alt="" style={{ width: OG_COVER_WIDTH, height: OG_HEIGHT }} />
      ) : (
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.22)',
          }}
        >
          {category ?? 'Archivo'}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: OG_COVER_WIDTH,
          height: OG_HEIGHT,
          display: 'flex',
          backgroundImage: `linear-gradient(90deg, ${BG_EDGE} 0%, rgba(0,26,56,0.7) 22%, rgba(0,26,56,0) 55%)`,
        }}
      />
    </div>
  );
}

function Facts({ facts }: { facts: OgFact[] }) {
  return (
    <div style={{ display: 'flex', gap: 44 }}>
      {facts.map((fact) => (
        <div key={fact.label} style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 18, borderLeft: `4px solid ${ORANGE}` }}>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.62)',
            }}
          >
            {fact.label}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.1,
              color: fact.tone ? TONE[fact.tone] : 'white',
            }}
          >
            {fact.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/** El sello de las fichas `proximamente`, en lugar de los datos (como `ExpedienteSellado` en la página). */
function SealedStamp() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18 }}>
      <div
        style={{
          display: 'flex',
          padding: '10px 26px',
          border: `5px solid ${ORANGE}`,
          borderRadius: 10,
          color: ORANGE,
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: 7,
          transform: 'rotate(-3deg)',
        }}
      >
        EXPEDIENTE SELLADO
      </div>
      <div style={{ display: 'flex', fontSize: 28, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
        Boris aún no ha desclasificado este expediente.
      </div>
    </div>
  );
}
