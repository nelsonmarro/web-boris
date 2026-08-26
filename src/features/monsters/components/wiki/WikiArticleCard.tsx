'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ImageOff, Ruler } from 'lucide-react';
import { WikiFrontmatter } from '@/core/types/wiki';
import { cn } from '@/utils/cn';
import { getThreatLevel, THREAT_TONE_CLASSES } from '@/features/monsters/lib/stats';

interface ArticleCardProps {
  slug: string;
  frontmatter: WikiFrontmatter;
  /** Variante reducida para grids de relacionados. */
  compact?: boolean;
}

export function WikiArticleCard({ slug, frontmatter, compact = false }: ArticleCardProps) {
  const threat = getThreatLevel(frontmatter.stats?.hostility);
  const length = frontmatter.stats?.length;

  return (
    <Link
      href={`/wiki/${slug}`}
      className={cn(
        'group glass-liquid bg-[#061a2e] border-white/10 overflow-hidden flex flex-col transition-all hover:scale-[1.02] hover:border-primary/40 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-refractive',
        compact ? 'rounded-3xl' : 'rounded-[2.5rem]',
      )}
    >
      {/* Image Header */}
      <div className="relative w-full aspect-video bg-black/40 overflow-hidden">
        <div className="glass-reflection opacity-20" />
        {frontmatter.image ? (
          <Image
            src={frontmatter.image}
            alt={frontmatter.title}
            fill
            sizes={compact ? '(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-2 opacity-20">
            <ImageOff className="h-10 w-10 text-white" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Sin Imagen</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061a2e] via-transparent to-transparent" />

        {/* Threat / size signals (only when stats exist) */}
        {(threat || length !== undefined) && (
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            {threat && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] backdrop-blur-md',
                  THREAT_TONE_CLASSES[threat.tone].badge,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', THREAT_TONE_CLASSES[threat.tone].dot)} />
                {threat.label}
              </span>
            )}
            {length !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-0.5 font-mono text-[9px] font-bold text-white/80 backdrop-blur-md">
                <Ruler className="h-3 w-3 text-primary" />
                {length.toLocaleString('es-ES')} m
              </span>
            )}
          </div>
        )}
      </div>

      <div className={cn('flex flex-col flex-1', compact ? 'p-5 gap-3' : 'p-8 gap-4')}>
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
            {frontmatter.universe}
          </span>
          <h3
            className={cn(
              'font-bold text-white italic uppercase tracking-tight group-hover:text-primary transition-colors',
              compact ? 'text-lg leading-tight' : 'text-2xl',
            )}
          >
            {frontmatter.title}
          </h3>
        </div>

        <p
          className={cn(
            'text-white/90 text-sm font-medium leading-relaxed',
            compact ? 'line-clamp-2' : 'line-clamp-3',
          )}
        >
          {frontmatter.description || 'Sin descripción disponible.'}
        </p>

        <div className={cn('mt-auto flex items-center justify-between border-t border-white/10', compact ? 'pt-4' : 'pt-6')}>
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
