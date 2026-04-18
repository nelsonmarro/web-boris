import { getAllArticles } from '@/utils/mdx';
import WikiList from '@/features/monsters/components/WikiList';
import { BookOpen, Shield, Skull, Zap } from 'lucide-react';
import Link from 'next/link';

export default async function WikiIndex() {
  const articles = await getAllArticles();

  const featured = [
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
    <div className="flex-1 container mx-auto px-4 lg:px-8 py-10 md:py-16 space-y-16">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-background border border-border p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <BookOpen className="h-3 w-3" />
            Base de Datos DELIRIUM
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight leading-tight">
            Archivo Central de <span className="text-primary">Universos</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Bienvenido al repositorio oficial de lore. Aquí encontrarás
            información clasificada sobre las entidades colosales, eventos
            históricos y las organizaciones que luchan por el equilibrio de
            nuestro mundo.
          </p>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          Accesos Destacados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((item) => (
            <Link
              key={item.slug}
              href={`/wiki/${item.slug}`}
              className="group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card p-6 h-48 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(255,115,0,0.15)]"
            >
              <div className="absolute top-6 right-6">
                <item.icon
                  className={`h-8 w-8 ${item.color} opacity-40 group-hover:opacity-100 transition-all group-hover:scale-110`}
                />
              </div>
              <div className="relative z-10">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">
                  {item.universe}
                </span>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>

      {/* Main List Section */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="h-8 w-1 bg-primary rounded-full" />
              Explorar Biblioteca
            </h2>
            <p className="text-muted-foreground mt-1">
              Busca y filtra por universos o categorías específicas.
            </p>
          </div>
        </div>
        <WikiList initialArticles={articles} />
      </section>
    </div>
  );
}
