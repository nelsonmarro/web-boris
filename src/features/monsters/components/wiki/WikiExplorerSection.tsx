import { WikiList } from "@/features/monsters/components/WikiList";

interface Article {
  slug: string;
  frontmatter: {
    title: string;
    universe: string;
    category?: string;
    description?: string;
  };
}

export function WikiExplorerSection({ articles }: { articles: Article[] }) {
  return (
    <section className="space-y-12 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(255,115,0,0.8)] animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold text-white uppercase italic tracking-tight drop-shadow-[0_4px_10px_rgba(255,255,255,0.1)]">
              Explorar <span className="text-primary">Biblioteca</span>
            </h2>
          </div>
          <p className="text-white/50 font-medium ml-5 max-w-2xl leading-relaxed">
            Filtra por universos o categorías para hallar información clasificada. Accede a los registros biométricos y cronologías oficiales.
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-3 px-6 py-3 rounded-2xl glass-liquid border-white/10 shadow-xl border-refractive">
          <div className="flex flex-col text-right">
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/20 leading-none">Registros</span>
            <span className="text-xl font-bold text-white italic leading-tight">{articles.length}</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute -inset-4 bg-primary/5 blur-[80px] rounded-full pointer-events-none opacity-30" />
        <WikiList articles={articles} />
      </div>
    </section>
  );
}