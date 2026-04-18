import { Swords, Zap, Skull } from "lucide-react";
import Image from "next/image";

export default function VersusPage() {
  return (
    <div className="flex-1 container mx-auto px-4 lg:px-8 py-12 md:py-20">
      <header className="mb-12 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest mb-6">
          <Swords className="h-3 w-3" />
          Enfrentamientos de Colosos
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
          Campo de <span className="text-primary">Batalla</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Explora los enfrentamientos más legendarios de la historia de los colosos. Datos, estadísticas y reconstrucciones de las batallas que sacudieron el océano.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
           <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(255,115,0,0.6)] border-4 border-background">
              <span className="text-2xl font-black text-primary-foreground italic">VS</span>
           </div>
        </div>

        {/* The Bloop Side */}
        <div className="relative group overflow-hidden rounded-3xl border-2 border-blue-500/30 bg-blue-500/5 p-8 text-center transition-all hover:bg-blue-500/10 hover:border-blue-500/50">
           <div className="absolute top-0 right-0 p-4">
              <Zap className="h-10 w-10 text-blue-400 opacity-20" />
           </div>
           <div className="relative h-64 w-full mb-6">
              <Image 
                src="/assets/Universo Colosos/thebloop1.png" 
                alt="The Bloop" 
                fill 
                className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" 
              />
           </div>
           <h3 className="text-3xl font-black text-blue-400 mb-2 italic uppercase">The Bloop</h3>
           <p className="text-muted-foreground text-sm">Súper cetáceo dentado. El primer ejemplar de su especie captado en audio.</p>
        </div>

        {/* El Gran Majá Side */}
        <div className="relative group overflow-hidden rounded-3xl border-2 border-red-500/30 bg-red-500/5 p-8 text-center transition-all hover:bg-red-500/10 hover:border-red-500/50">
           <div className="absolute top-0 left-0 p-4">
              <Skull className="h-10 w-10 text-red-500 opacity-20" />
           </div>
           <div className="relative h-64 w-full mb-6">
              <Image 
                src="/assets/Universo Colosos/elgranmaja.png" 
                alt="El Gran Majá" 
                fill 
                className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" 
              />
           </div>
           <h3 className="text-3xl font-black text-red-500 mb-2 italic uppercase">El Gran Majá</h3>
           <p className="text-muted-foreground text-sm">Pez colosal de comportamiento hostil. El animal más largo jamás hallado.</p>
        </div>
      </div>

      <div className="mt-20 p-8 rounded-2xl bg-card border border-border text-center">
         <h2 className="text-2xl font-bold mb-4 italic">CRÓNICA DE LA BATALLA</h2>
         <p className="text-muted-foreground max-w-2xl mx-auto italic">
           &quot;Aunque los humanos anhelaban la victoria del súper cetáceo, El Gran Majá le otorgó la derrota y huyó. DELIRIUM organizó una investigación para hallar su cadáver y no tuvieron resultado...&quot;
         </p>
      </div>
    </div>
  );
}
