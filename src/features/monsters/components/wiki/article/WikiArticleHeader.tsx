'use client';

import * as React from 'react';
import { Share2, History, Printer, ChevronRight, Check, Copy } from "lucide-react";
import Link from "next/link";
import { toast } from 'sonner';

interface WikiArticleHeaderProps {
  title: string;
  universe: string;
  category?: string;
}

export function WikiArticleHeader({ title, universe, category }: WikiArticleHeaderProps) {
  const [isCopying, setIsCopying] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `${title} | Wiki BorisaoBlois`,
      text: `Explora el lore de ${title} en la Wiki oficial de BorisaoBlois.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error al compartir:', err);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopying(true);
        toast.success('Enlace copiado al portapapeles');
        setTimeout(() => setIsCopying(false), 2000);
      } catch (err) {
        toast.error('No se pudo copiar el enlace');
      }
    }
  };

  const handleHistory = () => {
    toast.info('El historial de revisiones estará disponible próximamente en la versión Beta.');
  };

  return (
    <header className="pt-10 pb-6 px-8 md:px-12 lg:px-16 border-b border-white/10 relative z-20 print:hidden">
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
             <button 
              onClick={handleShare}
              className="px-4 py-2 flex items-center gap-2 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold text-xs uppercase tracking-wider" 
              title="Compartir"
             >
                {isCopying ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {isCopying ? 'Copiado' : 'Compartir'}
             </button>
             <button 
              onClick={handleHistory}
              className="p-2 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all" 
              title="Historial"
             >
                <History className="w-5 h-5" />
             </button>
             <button 
              onClick={handlePrint}
              className="p-2 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all" 
              title="Imprimir"
             >
                <Printer className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    </header>
  );
}
