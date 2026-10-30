import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { getContentRepository } from '@/core/content';
import { ARENA_ROUTE, ESCALA_ROUTE, TAMANOS_ROUTE } from '@/core/search/wiki-routes';
import { creatureSizeEntries, withReferences } from '@/features/monsters/lib/size-references';
import { SizeGame } from '@/features/monsters/components/size/SizeGame';

/**
 * El pool sale de los MDX (`stats.length`, contrastado con la `Longitud` del infobox) y de las referencias reales; la
 * partida, la racha y el reto (`?reto=N`, leído en el navegador) viven en el cliente: la página sigue siendo estática.
 */
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: '¿Quién mide más? | Wiki BorisaoBlois',
  description:
    '¿Cuál es más largo? Elige entre dos colosos del archivo de BorisaoBlois o referencias reales y encadena la racha más larga.',
  path: TAMANOS_ROUTE,
  // La imagen para compartir es `opengraph-image.tsx` de esta ruta: no se pisa.
  fileImage: true,
});

const TEXT_LINK =
  'inline-flex min-h-11 items-center gap-1.5 rounded-sm text-[12px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

export default async function TamanosPage() {
  const entries = withReferences(creatureSizeEntries(await getContentRepository().getArticles()));

  return (
    <div className="wiki-container flex-1 py-10 lg:py-14">
      <div className="space-y-10">
        <header className="space-y-4">
          <h1 className="page-title">¿Quién mide más?</h1>
          <p className="max-w-3xl text-lg text-white/70">
            ¿Cuál es más largo? Colosos del archivo frente a referencias del mundo real. Las referencias reales van
            marcadas como tales: no forman parte del lore.
          </p>
        </header>

        <SizeGame entries={entries} />

        <nav aria-label="Más sobre tamaños" className="flex flex-wrap gap-x-6 border-t border-white/10 pt-6">
          <Link href={ESCALA_ROUTE as Route} className={TEXT_LINK}>
            Escala de tamaños <span aria-hidden="true">›</span>
          </Link>
          <Link href={ARENA_ROUTE as Route} className={TEXT_LINK}>
            Versus Arena <span aria-hidden="true">›</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
