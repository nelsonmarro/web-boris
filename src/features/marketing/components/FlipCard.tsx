import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FlipCardProps {
  id: string;
  title: string;
  image: string;
  icon: string;
  count: string;
  description: string;
  color: string;
}

export function FlipCard({ universe }: { universe: FlipCardProps }) {
  return (
    <div className="group h-[480px] w-full [perspective:1500px]">
      <div className="relative w-full h-full transition-all duration-700 preserve-3d group-hover:rotate-y-180">
        
        {/* FRONT FACE: Portada con Imagen y Título */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-[2.5rem] overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)] glass-liquid">
          <div className="glass-reflection opacity-40" />
          
          <Image 
            src={universe.image} 
            alt={universe.title} 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          
          {/* Gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          <div className="absolute inset-0 p-10 flex flex-col justify-end z-10">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 drop-shadow-md">
              {universe.count}
            </span>
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-none">
              {universe.title}
            </h3>
          </div>
        </div>

        {/* BACK FACE: Detalles y Link */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 glass-liquid rounded-[2.5rem] p-10 flex flex-col overflow-hidden border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          <div className="glass-reflection opacity-50" />
          
          {/* Fondo Decorativo de Icono */}
          <div className="absolute -right-6 -top-6 text-9xl opacity-10 pointer-events-none drop-shadow-2xl grayscale blur-sm">
            {universe.icon}
          </div>

          <div className={`w-20 h-20 rounded-[1.5rem] ${universe.color.split(' ')[0]} bg-white/10 backdrop-blur-3xl flex items-center justify-center text-4xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] mb-8 border border-white/30 relative z-10`}>
            {universe.icon}
          </div>

          <div className="space-y-3 mb-8 relative z-10">
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter drop-shadow-md">
              {universe.title}
            </h3>
            <div className="h-1 w-12 bg-primary rounded-full" />
          </div>

          <p className="text-lg text-white/80 leading-relaxed relative z-10 font-bold drop-shadow-sm">
            {universe.description}
          </p>

          <div className="mt-auto pt-4 flex items-center justify-between relative z-10">
            <Link 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={`/wiki?universe=${universe.title}` as any}
              className="flex items-center text-white font-black uppercase tracking-widest text-[11px] gap-2 drop-shadow-md hover:text-primary transition-colors group/link"
            >
              Explorar Lore <ArrowRight className="h-4 w-4 text-primary group-hover/link:translate-x-1 transition-transform" />
            </Link>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
              Borisao Archive
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
