import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { CrystalTile, Mosaic } from '@/components/crystal';
import { getContentRepository } from '@/core/content';
import { pickFeatured } from '@/features/monsters/lib/featured';
import { getWeeklyPoll } from '@/features/community/data/weekly-poll';
import { getLatestVideo } from '@/features/community/data/latest-video';
import { CreatureOfWeekTile } from '@/features/community/components/CreatureOfWeekTile';
import { PollTeaserTile } from '@/features/community/components/PollTeaserTile';
import { LatestVideoTeaserTile } from '@/features/community/components/LatestVideoTeaserTile';
import { ArenaTile } from '@/features/monsters/components/arena/ArenaTile';
import { getFeaturedMatchup } from '@/features/monsters/data/featured-matchup';
import { cn } from '@/utils/cn';
import { getLoreStats } from '../actions/get-lore-stats';
import { SearchBar } from '../components/hero/SearchBar';
import { UniverseTile } from '../components/UniverseTile';
import { UNIVERSES } from '../config/universes';

/**
 * Primera pantalla de la landing: "inicio de consola" (#11).
 * lg: [hero 2 filas | criatura | encuesta] / [hero | vídeo | Arena] / [universos ×4].
 * md: hero a lo ancho; criatura | encuesta; Arena | vídeo; universos 2×2. Móvil: una columna en orden del DOM.
 */
export async function HomeMosaic() {
  const repo = getContentRepository();
  const [articles, weekly, video, featuredMatchup, lore] = await Promise.all([
    repo.getArticles(),
    getWeeklyPoll(),
    getLatestVideo(),
    getFeaturedMatchup(),
    getLoreStats(),
  ]);

  const names = Object.fromEntries(weekly.fighters.map((a) => [a.slug, a.frontmatter.title]));
  const countByUniverse = new Map<string, number>();
  for (const a of articles) {
    countByUniverse.set(a.frontmatter.universe, (countByUniverse.get(a.frontmatter.universe) ?? 0) + 1);
  }
  const hasPoll = weekly.poll !== null;

  return (
    <section className="container mx-auto px-6 pb-12 pt-28 md:pt-32">
      <Mosaic fitViewport className="md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-[1fr_1fr_auto]">
        <CrystalTile
          variant="hero"
          headingLevel={1}
          titleSize="page"
          eyebrow="Universos de BorisaoBlois"
          icon={Sparkles}
          title={
            <>
              Explora la inmensidad <span className="block italic text-primary">de mis universos</span>
            </>
          }
          className="md:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-span-2 lg:row-start-1"
        >
          <p className="max-w-lg text-base leading-relaxed text-white/70">
            Y sus historias: colosos abisales, capitanes del siglo XVIII y una Segunda Guerra Mundial interrumpida
            por un enemigo salido de la nada. Todo el lore oficial de BorisaoBlois en un solo archivo.
          </p>
          <div className="mt-6">
            <SearchBar />
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-6">
            <Link
              href="/wiki"
              className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-[11px] font-bold uppercase tracking-wider text-[#00122E] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:hover:scale-100"
            >
              Acceder a la wiki
            </Link>
            <p className="font-mono text-[12px] text-white/60">
              {lore.loreEntries} expedientes · {lore.creaturesWithStats} fichas biométricas · {lore.universes} universos
            </p>
          </div>
        </CrystalTile>

        <CreatureOfWeekTile
          variant="media"
          creature={pickFeatured(articles)}
          className="min-h-[260px] lg:col-start-2 lg:row-start-1 lg:min-h-0"
        />

        <PollTeaserTile poll={weekly.poll} names={names} className="lg:col-start-3 lg:row-start-1" />

        {featuredMatchup && (
          <ArenaTile
            a={featuredMatchup.a}
            b={featuredMatchup.b}
            probA={featuredMatchup.matchup.probA}
            className={cn('lg:col-start-3', hasPoll ? 'lg:row-start-2' : 'lg:row-span-2 lg:row-start-1')}
          />
        )}

        <LatestVideoTeaserTile video={video} className="min-h-[220px] lg:col-start-2 lg:row-start-2 lg:min-h-0" />

        <div className="grid grid-cols-2 gap-4 md:col-span-2 lg:col-span-3 lg:row-start-3 lg:grid-cols-4 lg:gap-5">
          {UNIVERSES.map((universe, i) => (
            <UniverseTile
              key={universe.id}
              universe={universe}
              count={universe.universeKey ? (countByUniverse.get(universe.universeKey) ?? 0) : 0}
              priority={i === 0}
              className="min-h-[150px]"
            />
          ))}
        </div>
      </Mosaic>
    </section>
  );
}
