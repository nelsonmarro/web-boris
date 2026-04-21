'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ArticleToolbar() {
  const router = useRouter();

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
       <div className="flex items-center gap-2 p-2 glass-liquid rounded-2xl border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 rounded-xl text-white/70 hover:text-primary hover:bg-white/5 transition-all"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 rounded-xl text-white/70 hover:text-primary hover:bg-white/5 transition-all"
          >
            <Bookmark className="w-5 h-5" />
          </Button>
          <div className="w-px h-8 bg-white/10 mx-1" />
          <Button 
            onClick={() => router.back()}
            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] italic transition-transform active:scale-95"
          >
            CERRAR ARCHIVO
          </Button>
       </div>
    </div>
  );
}
