import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { ContentCard } from '@/components/content';
import { getContentRepository } from '@/core/content';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { coverOf } from '@/features/monsters/components/wiki/CategoryPlaceholder';
import { pickFeatured } from '@/features/monsters/lib/featured';
import { UNIVERSES } from '../config/universes';

/**
 * Primera pantalla de la landing (spec #55 §3.1): la criatura de la semana de fondo, el buscador y los
 * cuatro universos.
 *
 * Contraste (≥ 4.5:1 detrás de todo el texto, sea cual sea la imagen, incluso una de fondo blanco como el
 * boceto de El Gran Majá). Las paradas del degradado están en px desde arriba porque el texto está anclado
 * arriba (el alto del hero cambia con el viewport; la posición del h1 casi no):
 *  - 0–90 px (navbar) y primera línea blanca del h1: alfa 0.70 → sobre blanco puro, blanco ≥ 4.5:1 (necesita ≥ 0.58).
 *  - 170–380 px (línea naranja del h1 y la frase blanca/80): alfa 0.88 → sobre blanco puro, #FF7300 da 4.99:1
 *    (necesita ≥ 0.85) y la frase ≥ 0.66.
 *  - de 380 px a 78 %: hasta #00122E sólido (bajo la fila de universos, que ya lleva su propia superficie).
 * En escritorio el velo es horizontal y el corte depende del breakpoint, porque el `container` mide 1024 px de
 * ancho hasta 1279 px y el h1 (60 px, 797 px de ancho) ocupa más del viewport cuanto menos ancho es este:
 *  - lg (1024–1279 px): el h1 llega al 80 % del ancho a 1024 px (78 % a 1100 px) → 0.92 hasta el 82 %.
 *  - xl (≥ 1280 px): el h1 llega como máximo al 64 % → 0.92 hasta el 60 % y alfa ≥ 0.84 en su último carácter.
 * La capa se desvanece en su borde inferior para fundirse con el fondo fijo del layout en vez de cortarse en seco.
 */
export async function HeroBleed() {
  const articles = await getContentRepository().getArticles();
  const creature = pickFeatured(articles);
  const fm = creature?.frontmatter;
  const cover = coverOf(fm?.image);

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_88%,transparent)]"
      >
        {cover && (
          <Image
            src={cover}
            alt=""
            fill
            sizes="100vw"
            fetchPriority="high"
            loading="eager"
            className="object-cover"
            style={{ objectPosition: fm?.imagePosition ?? '50% 50%' }}
          />
        )}
        {/* Móvil: el texto ocupa todo el ancho → velo vertical (≥ 0.85 bajo el texto naranja). */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,18,46,0.7)_0,rgba(0,18,46,0.7)_90px,rgba(0,18,46,0.88)_170px,rgba(0,18,46,0.88)_380px,#00122E_78%)] lg:hidden" />
        {/* lg (1024–1279 px): el h1 llega al 80 % del ancho → 0.92 hasta el 82 %; la criatura queda en el borde derecho. */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(0,18,46,0.94)_0%,rgba(0,18,46,0.92)_82%,rgba(0,18,46,0.45)_100%)] lg:block xl:hidden" />
        {/* xl (≥ 1280 px): el texto vive en el 60 % izquierdo → velo horizontal; la criatura se ve en el tercio derecho. */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(0,18,46,0.94)_0%,rgba(0,18,46,0.92)_60%,rgba(0,18,46,0.45)_85%,rgba(0,18,46,0.25)_100%)] xl:block" />
        <div className="absolute inset-x-0 bottom-0 hidden h-1/2 bg-[linear-gradient(to_top,#00122E_0%,rgba(0,18,46,0.8)_45%,transparent_100%)] lg:block" />
      </div>

      <div className="container mx-auto px-6 pb-10 pt-32 md:pt-40 short-screen:pt-28">
        <h1 className="page-title">
          Explora la inmensidad <span className="block italic text-primary">de mis universos</span>
        </h1>
        <p className="mt-4 text-lg text-white/80">Todo el lore oficial de BorisaoBlois en un solo archivo.</p>
        <div className="mt-6 max-w-xl">
          <SearchTrigger variant="hero" />
        </div>
        {creature && fm && (
          <Link
            href={`/wiki/${creature.slug}` as Route}
            className="mt-4 inline-flex min-h-11 items-center rounded-full border border-white/15 bg-[#061a2e]/90 px-4 text-sm text-white transition-colors hover:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
          >
            <span>
              Criatura de la semana: <strong className="font-bold">{fm.title}</strong>{' '}
              <span aria-hidden="true">›</span>
            </span>
          </Link>
        )}

        <div id="universos" className="mt-10 grid scroll-mt-24 grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {UNIVERSES.map((u) => (
            <ContentCard
              key={u.id}
              href={u.universeKey ? `/wiki?universe=${encodeURIComponent(u.universeKey)}#catalogo` : undefined}
              title={u.title}
              meta={u.era}
              image={u.image}
              imagePosition={u.imagePosition}
              pending={u.comingSoon}
              headingLevel={2}
              sizes="(min-width: 768px) 25vw, 50vw"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
