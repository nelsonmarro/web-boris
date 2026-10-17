import { WikiBanner } from '@/features/monsters/components/wiki/WikiBanner';
import { CategoryTiles, type CategoryTile } from '@/features/monsters/components/wiki/CategoryTiles';
import { FeaturedCreature } from '@/features/monsters/components/wiki/FeaturedCreature';
import { WikiExplorerSection } from '@/features/monsters/components/wiki/WikiExplorerSection';
import { getAllArticles } from '@/utils/mdx';
import { pickFeatured } from '@/features/monsters/lib/featured';

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

export default async function WikiIndex() {
  const articles = await getAllArticles();

  const tiles: CategoryTile[] = TILE_DEFS.map(({ category, ...tile }) => {
    const matches = articles.filter((a) => a.frontmatter.category === category);
    const withImage = matches.find((a) => a.frontmatter.image);
    return { ...tile, count: matches.length, image: withImage?.frontmatter.image };
  });

  const featured = pickFeatured(articles);

  return (
    <div className="wiki-container flex-1 space-y-16 py-10 lg:py-14">
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
