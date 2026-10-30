import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import VersusArena from '@/features/monsters/components/VersusArena';
import { getContentRepository } from '@/core/content';
import { toSummary } from '@/core/types/wiki';
import { hasStats } from '@/features/monsters/lib/stats';
import type { Fighter } from '@/features/monsters/lib/arena';
import { ARENA_ROUTE, TAMANOS_ROUTE } from '@/core/search/wiki-routes';
import { getWeeklyPoll } from '@/features/community/data/weekly-poll';
import type { WeeklyDuel } from '@/features/monsters/components/arena/components/ArenaSimulator';

/**
 * Estática con ISR (1 h, como las fichas: la banda del duelo de la semana cambia el lunes). El par (`?a=&b=`), el
 * combate, las predicciones y el torneo viven en el cliente: nada de `searchParams` en el servidor, que volvería la
 * página dinámica. El título del par lo pone el cliente; la vista previa al compartir es la tarjeta estática de
 * `opengraph-image.tsx`.
 */
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: 'Versus Arena | Wiki BorisaoBlois',
  description:
    'Enfrenta a los colosos de BorisaoBlois en combates por asaltos, apuesta por tu favorito, monta un torneo rápido y compara su escala real.',
  path: ARENA_ROUTE,
  // La imagen para compartir es `opengraph-image.tsx` de esta ruta: no se pisa.
  fileImage: true,
});

async function getFighters(): Promise<Fighter[]> {
  const articles = await getContentRepository().getArticles();
  return articles
    .filter((a) => hasStats(a.frontmatter))
    .map(toSummary)
    .filter((s): s is Fighter => !!s.frontmatter.stats)
    .sort((a, b) => (b.frontmatter.stats.length ?? 0) - (a.frontmatter.stats.length ?? 0));
}

export default async function WikiArenaPage() {
  const [fighters, { poll }] = await Promise.all([getFighters(), getWeeklyPoll()]);
  // Solo una votación de tipo `duelo` es un enfrentamiento de la Arena (`desclasificar` es de expedientes sellados).
  const weeklyDuel: WeeklyDuel | null = poll?.tipo === 'duelo' ? { a: poll.a, b: poll.b, week: poll.week } : null;

  return (
    <>
      <VersusArena fighters={fighters} weeklyDuel={weeklyDuel} />
      {/* Juego de tamaños (spec UX fase 2 §4): un enlace discreto bajo la Arena. */}
      <p className="wiki-container pb-10">
        <Link
          href={TAMANOS_ROUTE as Route}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-[12px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
        >
          ¿Quién mide más? Pon a prueba tu ojo <span aria-hidden="true">›</span>
        </Link>
      </p>
    </>
  );
}
