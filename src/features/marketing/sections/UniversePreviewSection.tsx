'use client';

import * as React from 'react';
import { FlipCard } from '../components/FlipCard';

const UNIVERSES = [
  {
    id: 'colosos',
    title: 'Colosos',
    image: '/assets/Universo Colosos/thebloop1resolucion.png',
    icon: '🦖',
    count: '42 Entidades',
    description: 'Bestias colosales que remecen el curso del ecosistema y la presencia humana.',
    color: 'bg-primary/10 text-primary',
  },
  {
    id: 'capitan-de-galeon',
    title: 'Capitán de Galeón',
    image: '/assets/Universo Capitán de Galeón/Borisao 2 F (1).png',
    icon: '⚓',
    count: '15 Personajes',
    description: 'Batallas entre grandes navíos, capitanes excéntricos y piratas de otro mundo.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    id: 'ellos-llegaron',
    title: 'Ellos Llegaron',
    image: '/assets/Universo Ellos llegaron/ellosllegaron1.1.png',
    icon: '👽',
    count: '28 Eventos',
    description: 'La Tierra de los años 40 sacudida por un enemigo implacable venido de la nada.',
    color: 'bg-accent/10 text-accent',
  },
];

export function UniversePreviewSection() {
  return (
    <section id="universos" className="py-24 bg-transparent relative">
      <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] mix-blend-screen z-0 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen z-0 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white uppercase italic tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Explora los Universos
          </h2>
          <p className="text-lg text-white/70 font-medium leading-relaxed drop-shadow-md">
            Cada universo contiene sus propias reglas, criaturas y misterios por descubrir. 
            Elige tu destino y sumérgete en la historia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-start justify-items-center">
          {UNIVERSES.map((universe) => (
            <FlipCard key={universe.id} universe={universe} />
          ))}
        </div>
      </div>
    </section>
  );
}
