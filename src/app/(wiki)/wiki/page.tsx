import { WikiBanner } from '@/features/monsters/components/wiki/WikiBanner';
import { CategoryTiles, type CategoryTile } from '@/features/monsters/components/wiki/CategoryTiles';
import { FeaturedCreature } from '@/features/monsters/components/wiki/FeaturedCreature';
import { WikiExplorerSection } from '@/features/monsters/components/wiki/WikiExplorerSection';
import { getAllArticles } from '@/utils/mdx';
import { toSummary } from '@/core/types/wiki';
import { hasStats } from '@/features/monsters/lib/stats';

/** La criatura destacada rota por semana ISO sin necesidad de rebuild. */
export const revalidate = 86400;

const TILE_DEFS: Array<Omit<CategoryTile, 'count' | 'image'> & { category: string }> = [
  { title: 'Colosos', slug: 'colosos', category: 'Coloso', description: 'Más de 200 m y 20 mil toneladas. La cúspide de la fauna abisal.' },
  { title: 'Titanes', slug: 'titanes', category: 'Titán', description: 'Gran escala, inmenso poder, por debajo del umbral colosal.' },
  { title: 'Medianos', slug: 'medianos', category: 'Mediano', description: 'Fauna anómala mayor al promedio natural.' },
  { title: 'Especies', slug: 'especies', category: 'Especie', description: 'Taxonomía de los géneros descubiertos.' },
  { title: 'Humanos', slug: 'humanos-colosos', category: 'Humano', description: 'Científicos, operativos y testigos.' },
  { title: 'Organizaciones', slug: 'organizaciones', category: 'Organización', description: 'DELIRIUM, IPCARO y las Naciones Rebeldes.' },
];

function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default async function WikiIndex() {
  const articles = await getAllArticles();

  const tiles: CategoryTile[] = TILE_DEFS.map(({ category, ...tile }) => {
    const matches = articles.filter((a) => a.frontmatter.category === category);
    const withImage = matches.find((a) => a.frontmatter.image);
    return { ...tile, count: matches.length, image: withImage?.frontmatter.image };
  });

  const candidates = articles.filter((a) => hasStats(a.frontmatter));
  const featured =
    candidates.length > 0 ? toSummary(candidates[isoWeek(new Date()) % candidates.length]) : null;

  return (
    <div className="flex-1 container mx-auto px-4 lg:px-8 py-10 md:py-16 space-y-20">
      <WikiBanner
        label="Base de Datos DELIRIUM"
        title="Archivo Central"
        gradientTitle="Universos"
        description="Bienvenido al repositorio oficial de lore. Aquí encontrarás información clasificada sobre las entidades colosales, eventos históricos y las organizaciones que luchan por el equilibrio de nuestro mundo."
      />

      {featured && <FeaturedCreature article={featured} />}

      <CategoryTiles tiles={tiles} />

      <WikiExplorerSection />
    </div>
  );
}
