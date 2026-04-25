import { getAllArticles } from '@/utils/mdx';
import { Shield, Skull, Zap } from 'lucide-react';
import { WikiBanner } from '@/features/monsters/components/wiki/WikiBanner';
import { FeaturedAccessGrid } from '@/features/monsters/components/wiki/FeaturedAccess';
import { WikiExplorerSection } from '@/features/monsters/components/wiki/WikiExplorerSection';

export default async function WikiIndex() {
  const articles = await getAllArticles();

  const featuredItems = [
    {
      title: 'El Gran Majá',
      slug: 'el-gran-maja',
      icon: Skull,
      color: 'text-red-500',
      universe: 'Colosos',
    },
    {
      title: 'The Bloop',
      slug: 'the-bloop',
      icon: Zap,
      color: 'text-blue-400',
      universe: 'Colosos',
    },
    {
      title: 'DELIRIUM',
      slug: 'delirium',
      icon: Shield,
      color: 'text-purple-500',
      universe: 'Organización',
    },
  ];

  return (
    <div className="flex-1 container mx-auto px-4 lg:px-8 py-10 md:py-16 space-y-20">
      {/* Welcome Banner */}
      <WikiBanner 
        label="Base de Datos DELIRIUM"
        title="Archivo Central"
        gradientTitle="Universos"
        description="Bienvenido al repositorio oficial de lore. Aquí encontrarás información clasificada sobre las entidades colosales, eventos históricos y las organizaciones que luchan por el equilibrio de nuestro mundo."
      />

      {/* Featured Access Section */}
      <FeaturedAccessGrid items={featuredItems} />

      {/* Full Explorer Section */}
      <WikiExplorerSection articles={articles} />
    </div>
  );
}
