'use client';

import * as React from 'react';
import { Share2, History, Printer, Check } from "lucide-react";
import { toast } from 'sonner';

interface WikiArticleActionsProps {
  title: string;
}

export function WikiArticleActions({ title }: WikiArticleActionsProps) {
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
  );
}
