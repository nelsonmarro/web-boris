'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface ArticleCardProps {
  slug: string;
  frontmatter: {
    title: string;
    universe: string;
    category?: string;
    description?: string;
  };
}

export function WikiArticleCard({ slug, frontmatter }: ArticleCardProps) {
  return (
    <Link 
      href={`/wiki/${slug}`}
      className="group glass-liquid rounded-[2.5rem] border-white/5 p-8 flex flex-col gap-6 transition-all hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
    >
      <div className="glass-reflection opacity-20" />
      
      <div className="space-y-1">
        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">
          {frontmatter.universe}
        </span>
        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover:text-primary transition-colors">
          {frontmatter.title}
        </h3>
      </div>

      <p className="text-white/50 text-sm font-medium line-clamp-3 leading-relaxed">
        {frontmatter.description || "Sin descripción disponible."}
      </p>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-colors flex items-center gap-2">
          Ver Detalles <ChevronRight className="h-3 w-3" />
        </span>
        {frontmatter.category && (
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase">
            {frontmatter.category}
          </span>
        )}
      </div>
    </Link>
  );
}
