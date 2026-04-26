import { ChevronRight, Share2, Printer, History } from "lucide-react";
import Link from "next/link";

interface WikiArticleHeaderProps {
  title: string;
  universe: string;
  category?: string;
}

export function WikiArticleHeader({ title, universe, category }: WikiArticleHeaderProps) {
  return (
    <header className="p-8 md:p-12 border-b border-white/5 bg-[#00060d]/40 backdrop-blur-3xl relative z-20">
      <div className="flex flex-col gap-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          <Link href="/wiki" className="hover:text-primary transition-colors">Lore</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="hover:text-primary transition-colors cursor-pointer">{universe}</span>
          {category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="hover:text-primary transition-colors cursor-pointer">{category}</span>
            </>
          )}
        </nav>

        {/* Title and Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="h-1 w-20 bg-primary rounded-full shadow-[0_0_15px_rgba(255,115,0,0.5)]" />
            <h1 className="text-4xl md:text-7xl font-bold text-white italic tracking-tight uppercase leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
             <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all hover:scale-105" title="Compartir">
                <Share2 className="w-4 h-4" />
             </button>
             <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all hover:scale-105" title="Historial">
                <History className="w-4 h-4" />
             </button>
             <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all hover:scale-105" title="Imprimir">
                <Printer className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      {/* Decorative scanning line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </header>
  );
}