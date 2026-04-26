import { ChevronRight, Share2, Printer, History } from "lucide-react";
import Link from "next/link";

interface WikiArticleHeaderProps {
  title: string;
  universe: string;
  category?: string;
}

export function WikiArticleHeader({ title, universe, category }: WikiArticleHeaderProps) {
  return (
    <header className="pt-10 pb-6 px-8 md:px-12 lg:px-16 border-b border-white/10 relative z-20">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          <Link href="/wiki" className="hover:text-primary transition-colors">Explore</Link>
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
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none">
            {title}
          </h1>

          <div className="flex items-center gap-2">
             <button className="px-4 py-2 flex items-center gap-2 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold text-xs uppercase tracking-wider" title="Compartir">
                <Share2 className="w-4 h-4" /> Compartir
             </button>
             <button className="p-2 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all" title="Historial">
                <History className="w-5 h-5" />
             </button>
             <button className="p-2 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all" title="Imprimir">
                <Printer className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    </header>
  );
}