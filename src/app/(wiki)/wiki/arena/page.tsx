import { Swords, Zap, Skull } from "lucide-react";
import { VersusArena } from "@/features/monsters/components/VersusArena";
import { getAllArticles } from "@/utils/mdx";

export default async function ArenaPage() {
  const articles = await getAllArticles();

  return (
    <div className="flex-1 container mx-auto px-4 lg:px-8 py-12 md:py-20 overflow-hidden">
      <header className="mb-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <Swords className="h-4 w-4" />
          Simulador de Enfrentamientos
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 tracking-tight drop-shadow-lg">
          Campo de <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-orange-600">Batalla</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Compara estadísticas, analiza habilidades y simula enfrentamientos teóricos entre las entidades registradas por DELIRIUM.
        </p>
      </header>

      <VersusArena articles={articles} />
    </div>
  );
}
