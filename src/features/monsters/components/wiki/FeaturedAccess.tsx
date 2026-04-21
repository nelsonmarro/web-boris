import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface FeaturedAccessCardProps {
  title: string;
  slug: string;
  icon: LucideIcon;
  color: string;
  universe: string;
}

export function FeaturedAccessCard({ title, slug, icon: Icon, color, universe }: FeaturedAccessCardProps) {
  return (
    <Link
      href={`/wiki/${slug}`}
      className="group relative flex flex-col justify-end overflow-hidden rounded-[2.5rem] glass-liquid border-white/5 p-8 h-64 transition-all duration-500 hover:scale-[1.03] hover:border-primary/30"
    >
      <div className="glass-reflection opacity-20" />
      
      <div className="absolute top-8 right-8">
        <Icon
          className={`h-12 w-12 ${color} opacity-40 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110 drop-shadow-[0_0_20px_currentColor]`}
        />
      </div>

      <div className="relative z-10 space-y-1">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
          {universe}
        </span>
        <h3 className="text-3xl font-black text-white italic uppercase leading-none">
          {title}
        </h3>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Link>
  );
}

export function FeaturedAccessGrid({ items }: { items: FeaturedAccessCardProps[] }) {
  return (
    <section className="space-y-10">
      <div className="flex items-center gap-4">
        <div className="h-10 w-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(255,115,0,0.8)]" />
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
          Accesos Destacados
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item) => (
          <FeaturedAccessCard key={item.slug} {...item} />
        ))}
      </div>
    </section>
  );
}
