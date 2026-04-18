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

export default function FlipCard({ universe }: { universe: FlipCardProps }) {
  return (
    <Link href={`/wiki?universe=${universe.title}`} className="group block [perspective:1500px] h-full">
      <div className="relative h-[450px] w-full transition-all duration-700 transform-3d transform-gpu group-hover:rotate-y-180" style={{ willChange: 'transform' }}>
        
        {/* FRONT FACE: Portada con Imagen y Título */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-3xl overflow-hidden border border-border shadow-lg transform-gpu"
          style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
        >
          <Image 
            src={universe.image} 
            alt={universe.title} 
            fill 
            className="object-cover"
          />
          {/* Gradiente para asegurar el contraste del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            <h3 className="text-3xl font-extrabold text-white drop-shadow-md mb-2">
              {universe.title}
            </h3>
          </div>
        </div>

        {/* BACK FACE: Detalles y Link (Rotado 180 grados por defecto) */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-card border border-border rounded-3xl p-8 flex flex-col overflow-hidden shadow-xl transform-gpu"
          style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)' }}
        >
          {/* Fondo Decorativo de Icono */}
          <div className="absolute -right-4 -top-4 text-8xl opacity-5 pointer-events-none">
            {universe.icon}
          </div>

          <div className={`w-16 h-16 rounded-2xl ${universe.color} flex items-center justify-center text-3xl shadow-inner mb-6`}>
            {universe.icon}
          </div>

          <div className="space-y-2 mb-6 relative z-10">
            <h3 className="text-2xl font-extrabold text-primary transition-colors">
              {universe.title}
            </h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {universe.count}
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed relative z-10">
            {universe.description}
          </p>

          <div className="pt-4 mt-auto flex items-center text-primary font-bold gap-2 relative z-10">
            Explorar Lore <ArrowRight className="h-5 w-5" />
          </div>
        </div>

      </div>
    </Link>
  );
}
