import { Database } from 'lucide-react';
import type { WikiArticle } from '@/core/types/wiki';
import { CrystalTile, Mosaic } from '@/components/crystal';
import { getContentRepository } from '@/core/content';
import { pickFeatured } from '@/features/monsters/lib/featured';
import { getWeeklyPoll } from '@/features/community/data/weekly-poll';
import { CreatureOfWeekTile } from '@/features/community/components/CreatureOfWeekTile';
import { PollTeaserTile } from '@/features/community/components/PollTeaserTile';
import { ArenaTile } from '@/features/monsters/components/arena/ArenaTile';
import { getFeaturedMatchup } from '@/features/monsters/data/featured-matchup';
import { SearchBar } from '@/features/marketing/components/hero/SearchBar';
import { cn } from '@/utils/cn';
import { isBrandPlaceholder } from './CategoryPlaceholder';
import { CategoryTile, type CategoryTileData } from './CategoryTile';

/** Descripciones solo canon o factuales (regla "solo canon" de CLAUDE.md). */
const CATEGORY_DEFS: Array<Omit<CategoryTileData, 'count' | 'image' | 'imagePosition'>> = [
  { title: 'Colosos', slug: 'colosos', category: 'Coloso', description: 'Más de 200 metros de longitud y más de 20 mil toneladas de peso.' },
  { title: 'Titanes', slug: 'titanes', category: 'Titán', description: "Le'Mug y los garddiodon pertenecen a esta categoría." },
  { title: 'Medianos', slug: 'medianos', category: 'Mediano', comingSoon: true },
  { title: 'Especies', slug: 'especies', category: 'Especie', description: 'Especies identificadas del universo Colosos.' },
  { title: 'Humanos', slug: 'humanos-colosos', category: 'Humano', description: 'Phillip Forte y los demás personajes humanos del universo Colosos.' },
  { title: 'Organi­zaciones', slug: 'organizaciones', category: 'Organización', description: 'DELIRIUM, IPCARO y las Naciones Rebeldes.' },
];

function coverFor(articles: WikiArticle[], category: string): Pick<CategoryTileData, 'image' | 'imagePosition'> {
  const withImage = articles.find(
    (a) => a.frontmatter.category === category && a.frontmatter.image && !isBrandPlaceholder(a.frontmatter.image),
  );
  return withImage ? { image: withImage.frontmatter.image, imagePosition: withImage.frontmatter.imagePosition } : {};
}

/**
 * Primera pantalla de /wiki (#11).
 * lg: [archivo 2 filas | criatura 2 filas | Arena] / [archivo | criatura | encuesta] / [categorías 3×2].
 * Móvil y md: archivo, criatura, categorías, Arena, encuesta (orden del DOM).
 */
export async function WikiHomeMosaic() {
  const repo = getContentRepository();
  const [articles, weekly, featuredMatchup] = await Promise.all([
    repo.getArticles(),
    getWeeklyPoll(),
    getFeaturedMatchup(),
  ]);

  const tiles: CategoryTileData[] = CATEGORY_DEFS.map((def) => ({
    ...def,
    count: articles.filter((a) => a.frontmatter.category === def.category).length,
    ...coverFor(articles, def.category),
  }));
  const names = Object.fromEntries(weekly.fighters.map((a) => [a.slug, a.frontmatter.title]));
  const hasPoll = weekly.poll !== null;

  return (
    <Mosaic fitViewport className="md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-[1fr_1fr_auto]">
      <CrystalTile
        variant="hero"
        headingLevel={1}
        titleSize="page"
        eyebrow="Base de datos DELIRIUM"
        icon={Database}
        title={
          <>
            Archivo Central <span className="block italic text-primary">de Universos</span>
          </>
        }
        className="md:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-span-2 lg:row-start-1"
      >
        <p className="max-w-xl text-base leading-relaxed text-white/75">
          El repositorio oficial de lore: criaturas, organizaciones, vehículos e historia de los universos de BorisaoBlois.
        </p>
        <div className="mt-6">
          <SearchBar placeholder="Buscar en el archivo…" />
        </div>
      </CrystalTile>

      <CreatureOfWeekTile
        variant="media"
        creature={pickFeatured(articles)}
        className="min-h-[260px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:min-h-0"
      />

      <div className="grid grid-cols-2 gap-4 md:col-span-2 lg:col-span-3 lg:row-start-3 lg:grid-cols-3 lg:gap-5">
        {tiles.map((tile) => (
          <CategoryTile key={tile.slug} tile={tile} />
        ))}
      </div>

      {featuredMatchup && (
        <ArenaTile
          a={featuredMatchup.a}
          b={featuredMatchup.b}
          probA={featuredMatchup.matchup.probA}
          className={cn('lg:col-start-3 lg:row-start-1', !hasPoll && 'lg:row-span-2')}
        />
      )}

      <PollTeaserTile poll={weekly.poll} names={names} className="lg:col-start-3 lg:row-start-2" />
    </Mosaic>
  );
}
