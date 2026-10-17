import type { Metadata } from 'next';
import VersusArena from '@/features/monsters/components/VersusArena';
import { getAllArticles } from '@/utils/mdx';
import { toSummary } from '@/core/types/wiki';
import { hasStats } from '@/features/monsters/lib/stats';
import type { Fighter } from '@/features/monsters/lib/arena';

export const metadata: Metadata = {
  title: 'Versus Arena | Wiki BorisaoBlois',
  description: 'Enfrenta a los colosos de BorisaoBlois y compara su escala real.',
};

export default async function WikiArenaPage() {
  const articles = await getAllArticles();
  const fighters = articles
    .filter((a) => hasStats(a.frontmatter))
    .map(toSummary)
    .filter((s): s is Fighter => !!s.frontmatter.stats)
    .sort((a, b) => (b.frontmatter.stats.length ?? 0) - (a.frontmatter.stats.length ?? 0));

  return <VersusArena fighters={fighters} />;
}
