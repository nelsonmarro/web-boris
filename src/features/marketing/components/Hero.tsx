'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-background">
      {/* Background Elements - Histudy style blobs but abyssal */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] z-0" />

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="text-left space-y-8">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-primary text-sm font-bold tracking-wider uppercase">
              Explora lo desconocido
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-[1.1]">
            Sumérgete en el <span className="text-primary">Lore Abisal</span> de
            BorisaoBlois
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl">
            Descubre los secretos de las criaturas más colosales del océano y
            las historias que desafían la realidad. &quot;Explora la inmensidad
            de mis universos y sus historias&quot;
          </p>

          {/* Search Bar - Histudy Style */}
          <div className="relative max-w-md group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="¿Qué criatura buscas? (ej. The Bloop)"
              className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-lg"
            />
            <Button className="absolute right-2 top-2 h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg">
              Buscar
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/wiki">
              <Button size="lg" className="h-14 px-8 text-lg font-bold">
                Ver la Wiki
              </Button>
            </Link>
            <Link href="#universos">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg font-bold border-2"
              >
                Los Universos
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative hidden lg:block w-full">
          {/* Hero Image with Floating Elements */}
          <div className="relative z-10 w-full aspect-[4/3] rounded-[2rem] overflow-hidden border-4 border-primary/20 shadow-[0_0_50px_rgba(255,115,0,0.2)] animate-float">
            <Image
              src="/assets/Universo Colosos/bloop (1).png"
              alt="Bloop Ojo Solo"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Floating Card - Histudy style */}
          <div className="absolute -bottom-6 -left-6 bg-card border border-border p-6 rounded-2xl shadow-2xl z-20 flex items-center gap-4 animate-bounce-slow">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🐋</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase">
                Último Avistamiento
              </p>
              <p className="text-lg font-extrabold text-foreground">
                The Bloop Ojo Solo
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
