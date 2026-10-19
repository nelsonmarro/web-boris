import Link from 'next/link';
import type { Route } from 'next';
import { groupLabel, navNeighbors } from '@/core/search/nav-neighbors';
import { WIKI_NAVIGATION } from '@/features/monsters/config/wiki-navigation';

interface ArticleNeighborsProps {
  /** Slug de la ficha que se lee; sus vecinos salen del menú lateral (`WIKI_NAVIGATION`). */
  slug: string;
}

const LINK =
  'group inline-flex min-h-11 items-center rounded-sm text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';
const TITLE =
  'font-semibold text-white underline decoration-primary/50 underline-offset-4 transition-colors group-hover:text-primary group-hover:decoration-primary motion-reduce:transition-none';

/**
 * «Anterior» / «Siguiente» de la ficha (spec Ola C §5): sus vecinos dentro del mismo grupo del menú, con vuelta
 * circular. Dos enlaces de texto de 44 px; en el móvil van apilados con el siguiente primero. En un grupo de dos
 * solo hay «Siguiente» (el otro); una ficha que no está en el menú, o que es la única de su grupo, no pinta nada.
 *
 * El orden del DOM es el de lectura (anterior, siguiente); `flex-col-reverse` solo cambia el orden visual del móvil.
 */
export function ArticleNeighbors({ slug }: ArticleNeighborsProps) {
  const neighbors = navNeighbors(slug, WIKI_NAVIGATION);
  if (!neighbors || (!neighbors.prev && !neighbors.next)) return null;
  const { group, prev, next } = neighbors;

  return (
    <nav aria-label="Fichas vecinas" className="clear-both">
      <div className="wiki-container">
        <div className="flex flex-col-reverse gap-1 pb-2 md:flex-row md:items-center md:justify-between md:gap-6">
          {prev && (
            <Link href={prev.url as Route} rel="prev" className={LINK}>
              <span>
                <span aria-hidden="true" className="mr-1.5 text-white/60">‹</span>
                <span className="sr-only">Anterior: </span>
                <span className={TITLE}>{prev.title}</span>
              </span>
            </Link>
          )}
          {next && (
            // `md:ml-auto`: si «Siguiente» va sola, se queda a la derecha como cuando acompaña a «Anterior».
            <Link href={next.url as Route} rel="next" className={`${LINK} md:ml-auto md:justify-end md:text-right`}>
              <span>
                <span className="text-white/60">Siguiente en {groupLabel(group)}: </span>
                <span className={TITLE}>{next.title}</span>
                <span aria-hidden="true" className="ml-1.5 text-white/60">›</span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
