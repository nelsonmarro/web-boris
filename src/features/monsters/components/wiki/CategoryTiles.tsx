import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeader } from '@/features/monsters/components/wiki/SectionHeader';

export interface CategoryTile {
  title: string;
  slug: string;
  description: string;
  count: number;
  image?: string;
}

function TileCard({ tile }: { tile: CategoryTile }) {
  return (
    <Link
      href={`/wiki/${tile.slug}`}
      className="group relative flex h-28 flex-col justify-end overflow-hidden rounded-2xl glass-liquid bg-[#061a2e] border-white/10 border-refractive p-4 transition-all duration-500 hover:scale-[1.02] hover:border-primary/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:h-56 sm:p-6"
    >
      {tile.image && (
        <Image
          src={tile.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 50vw"
          className="object-cover opacity-40 transition-all duration-700 group-hover:scale-110 group-hover:opacity-60"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#061a2e] via-[#061a2e]/70 to-transparent" />
      <div className="glass-reflection opacity-10" />

      <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-white/70 backdrop-blur-md sm:right-5 sm:top-5">
        {tile.count > 0 ? `${tile.count} registro${tile.count === 1 ? '' : 's'}` : 'Sin registros'}
      </div>

      <div className="relative z-10 space-y-1">
        <h3 className="break-words hyphens-auto text-lg font-black uppercase italic leading-none text-white transition-colors group-hover:text-primary sm:text-2xl md:text-3xl">
          {tile.title}
        </h3>
        <p className="hidden text-sm leading-snug text-white/60 sm:block">{tile.description}</p>
      </div>
      <ArrowUpRight className="absolute bottom-4 right-4 h-5 w-5 sm:bottom-6 sm:right-6 text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <section className="space-y-8">
      <SectionHeader
        eyebrow="Archivo"
        title={<>Explorar por <span className="text-primary">categoría</span></>}
        description="Cada categoría agrupa los registros por escala y naturaleza."
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {tiles.map((tile) => (
          <TileCard key={tile.slug} tile={tile} />
        ))}
      </div>
    </section>
  );
}
