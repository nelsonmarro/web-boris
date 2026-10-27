import { cache } from 'react';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import VersusArena from '@/features/monsters/components/VersusArena';
import { getContentRepository } from '@/core/content';
import { toSummary } from '@/core/types/wiki';
import { hasStats } from '@/features/monsters/lib/stats';
import { resolvePair } from '@/features/monsters/components/arena/resolve-pair';
import { computeMatchup, type Fighter } from '@/features/monsters/lib/arena';

const DEFAULT_METADATA: Metadata = pageMetadata({
  title: 'Versus Arena | Wiki BorisaoBlois',
  description: 'Enfrenta a los colosos de BorisaoBlois y compara su escala real.',
  path: '/wiki/arena',
});

type ArenaSearchParams = { [key: string]: string | string[] | undefined };

interface ArenaPageProps {
  searchParams: Promise<ArenaSearchParams>;
}

// generateMetadata y la página comparten la lectura de los MDX dentro de la misma petición.
const getFighters = cache(async (): Promise<Fighter[]> => {
  const articles = await getContentRepository().getArticles();
  return articles
    .filter((a) => hasStats(a.frontmatter))
    .map(toSummary)
    .filter((s): s is Fighter => !!s.frontmatter.stats)
    .sort((a, b) => (b.frontmatter.stats.length ?? 0) - (a.frontmatter.stats.length ?? 0));
});

/** `?a=` / `?b=` pueden venir repetidos; se usa el primer valor. */
function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ searchParams }: ArenaPageProps): Promise<Metadata> {
  const params = await searchParams;
  const slugA = firstValue(params.a);
  const slugB = firstValue(params.b);
  // Sin parámetros, la página base. Con cualquiera, se resuelve igual que el cliente (B por defecto,
  // slug antiguo, inválidos) para que el título y la vista previa describan lo que se muestra.
  if (!slugA && !slugB) return DEFAULT_METADATA;

  const fighters = await getFighters();
  const pair = resolvePair(fighters.map((f) => f.slug), slugA, slugB);
  const a = fighters.find((f) => f.slug === pair.slugA);
  const b = fighters.find((f) => f.slug === pair.slugB);
  if (!a || !b) return DEFAULT_METADATA;

  const nameA = a.frontmatter.title;
  const nameB = b.frontmatter.title;
  const pctA = Math.round(computeMatchup(a.frontmatter.stats, b.frontmatter.stats).probA * 100);
  const url = `/wiki/arena?a=${a.slug}&b=${b.slug}`;
  const title = `${nameA} vs ${nameB} | Versus Arena`;
  const description = `${nameA} tiene un ${pctA}% de probabilidad de ganarle a ${nameB} (${100 - pctA}% para ${nameB}) según sus registros biométricos. Simula tu propio enfrentamiento en la Versus Arena.`;

  return pageMetadata({ title, description, path: url });
}

export default async function WikiArenaPage() {
  const fighters = await getFighters();
  return <VersusArena fighters={fighters} />;
}
