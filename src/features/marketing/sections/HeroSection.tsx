'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrandCapsule } from '../components/hero/BrandCapsule';
import { SearchBar } from '../components/hero/SearchBar';
import { HeroVisual } from '../components/hero/HeroVisual';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-28 pb-20 overflow-hidden bg-transparent">
      {/* Background Glows - NORMALIZED SCALE */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] left-[5%] w-[700px] h-[700px] bg-primary/5 rounded-full blur-[150px] mix-blend-screen opacity-30" />
        <div className="absolute bottom-[10%] right-[5%] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[180px] mix-blend-screen opacity-20" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="text-left space-y-8">
          <BrandCapsule>Iniciativa Archivo Abisal</BrandCapsule>

          <div className="space-y-0">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              SUMÉRGETE
            </h1>
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 leading-none tracking-tighter italic drop-shadow-[0_8px_20px_rgba(255,115,0,0.4)]">
              EN EL LORE
            </h1>
          </div>

          <p className="text-base md:text-lg text-white/70 max-w-lg font-medium leading-relaxed drop-shadow-md">
            Descubre los secretos de las criaturas más colosales del océano y
            las historias que desafían la realidad. &quot;Explora la inmensidad
            de mis universos&quot;.
          </p>

          <SearchBar />

          <div className="flex flex-wrap gap-4 pt-4 items-center">
            <Link href="/wiki">
              <Button
                size="lg"
                className="h-14 px-10 text-[10px] font-black tracking-[0.3em] shadow-[0_15px_30px_rgba(255,115,0,0.4)] bg-primary hover:scale-[1.05] transition-all rounded-full border-t border-white/20 uppercase italic"
              >
                ACCEDER A LA WIKI
              </Button>
            </Link>
            <Link href="#universos">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-[10px] font-black tracking-[0.3em] glass-liquid border-white/20 text-white rounded-full hover:bg-white/10 transition-all hover:border-white/40 shadow-[0_15px_25px_rgba(0,0,0,0.3)] uppercase italic"
              >
                VER UNIVERSOS
              </Button>
            </Link>
          </div>
        </div>

        <HeroVisual
          imageSrc="/assets/Universo Colosos/bloop (1).png"
          alt="Bloop Ojo Solo"
          badgeEmoji="🐋"
          badgeLabel="Último Avistamiento"
          badgeTitle="The Bloop"
        />
      </div>
    </section>
  );
}
