import { getAllArticles } from '@/utils/mdx';
import { WikiList } from '@/features/monsters/components/WikiList';
import { Shield, Skull, Zap } from 'lucide-react';
import { WikiBanner } from '@/features/monsters/components/wiki/WikiBanner';
import { FeaturedAccessGrid } from '@/features/monsters/components/wiki/FeaturedAccess';

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
      <section className="space-y-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
               <div className="h-10 w-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(255,115,0,0.8)]" />
               <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                 Explorar Biblioteca
               </h2>
            </div>
            <p className="text-white/50 font-medium ml-5">
              Filtra por universos o categorías para hallar información específica.
            </p>
          </div>
        </div>
        
        <WikiList articles={articles} />
      </section>
    </div>
  );
}
