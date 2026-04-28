'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ImageOff } from 'lucide-react';
import { WikiFrontmatter } from '@/core/types/wiki';

interface ArticleCardProps {
  slug: string;
  frontmatter: WikiFrontmatter;
}

export function WikiArticleCard({ slug, frontmatter }: ArticleCardProps) {
  return (
    <Link 
      href={`/wiki/${slug}`}
      className="group glass-liquid bg-[#061a2e] rounded-[2.5rem] border-white/10 overflow-hidden flex flex-col transition-all hover:scale-[1.02] hover:border-primary/40 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-refractive"
    >
      {/* Image Header */}
      <div className="relative w-full aspect-video bg-black/40 overflow-hidden">
        <div className="glass-reflection opacity-20" />
        {frontmatter.image ? (
          <Image
            src={frontmatter.image}
            alt={frontmatter.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-2 opacity-20">
            <ImageOff className="h-10 w-10 text-white" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Sin Imagen</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061a2e] via-transparent to-transparent" />
      </div>

      <div className="p-8 flex flex-col gap-4 flex-1">
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
            {frontmatter.universe}
          </span>
          <h3 className="text-2xl font-bold text-white italic uppercase tracking-tight group-hover:text-primary transition-colors">
            {frontmatter.title}
          </h3>
        </div>

        <p className="text-white/90 text-sm font-medium line-clamp-3 leading-relaxed">
          {frontmatter.description || "Sin descripción disponible."}
        </p>

        <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 group-hover:text-white transition-colors flex items-center gap-2">
            Ver Detalles <ChevronRight className="h-3 w-3" />
          </span>
          {frontmatter.category && (
            <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-bold text-primary uppercase">
              {frontmatter.category}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
