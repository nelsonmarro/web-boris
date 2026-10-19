import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { ContentCard } from '@/components/content';
import { getContentRepository } from '@/core/content';
import { isBrandPlaceholder } from '@/features/monsters/components/wiki/CategoryPlaceholder';
import { pickFeatured } from '@/features/monsters/lib/featured';
import { SearchBar } from '../components/hero/SearchBar';
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
 * La capa se desvanece en su borde inferior para fundirse con el fondo fijo del layout en vez de cortarse en seco.
 */
export async function HeroBleed() {
  const articles = await getContentRepository().getArticles();
  const creature = pickFeatured(articles);
  const fm = creature?.frontmatter;
  const cover = fm?.image && !isBrandPlaceholder(fm.image) ? fm.image : undefined;

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
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,18,46,0.7)_0,rgba(0,18,46,0.7)_90px,rgba(0,18,46,0.88)_170px,rgba(0,18,46,0.88)_380px,#00122E_78%)]" />
      </div>

      <div className="container mx-auto px-6 pb-10 pt-32 md:pt-40 short-screen:pt-28">
        <h1 className="page-title">
          Explora la inmensidad <span className="block italic text-primary">de mis universos</span>
        </h1>
        <p className="mt-4 text-lg text-white/80">Todo el lore oficial de BorisaoBlois en un solo archivo.</p>
        <div className="mt-6 max-w-xl">
          <SearchBar />
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
