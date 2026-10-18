'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Ruler } from 'lucide-react';
import { WikiFrontmatter } from '@/core/types/wiki';
import { cn } from '@/utils/cn';
import { getThreatLevel, THREAT_TONE_CLASSES } from '@/features/monsters/lib/stats';
import { ProximamenteChip } from './mdx/Proximamente';
import { CategoryPlaceholder, isBrandPlaceholder } from './CategoryPlaceholder';

interface ArticleCardProps {
  slug: string;
  frontmatter: WikiFrontmatter;
  /** Variante reducida para grids de relacionados. */
  compact?: boolean;
}

export function WikiArticleCard({ slug, frontmatter, compact = false }: ArticleCardProps) {
  const threat = getThreatLevel(frontmatter.stats?.hostility);
  const length = frontmatter.stats?.length;
  // El logo del canal no es una portada: esos artículos reciben el placeholder de su categoría.
  const coverImage =
    frontmatter.image && !isBrandPlaceholder(frontmatter.image) ? frontmatter.image : undefined;

  return (
    <Link
      href={`/wiki/${slug}`}
      className={cn(
        'group glass-liquid bg-[#061a2e] border-white/10 overflow-hidden flex flex-col transition-all hover:scale-[1.02] hover:border-primary/40 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-refractive',
        'rounded-2xl',
      )}
    >
      {/* Image Header */}
      <div className="relative w-full aspect-video bg-black/40 overflow-hidden">
        <div className="glass-reflection opacity-20" />
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            sizes={compact ? '(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ objectPosition: frontmatter.imagePosition ?? '50% 50%' }}
          />
        ) : (
          <CategoryPlaceholder category={frontmatter.category} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061a2e] via-transparent to-transparent" />

        {/* Threat / size signals (only when stats exist) */}
        {frontmatter.status === 'proximamente' ? (
          <div className="absolute left-3 top-3">
            <ProximamenteChip className="backdrop-blur-md" />
          </div>
        ) : (threat || length !== undefined) && (
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            {threat && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.15em] backdrop-blur-md',
                  THREAT_TONE_CLASSES[threat.tone].badge,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', THREAT_TONE_CLASSES[threat.tone].dot)} />
                {threat.label}
              </span>
            )}
            {length !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-0.5 font-mono text-[11px] font-bold text-white/80 backdrop-blur-md">
                <Ruler className="h-3 w-3 text-primary" />
                {length.toLocaleString('es-ES')} m
              </span>
            )}
          </div>
        )}
      </div>

      <div className={cn('flex flex-col flex-1', compact ? 'p-5 gap-3' : 'p-6 gap-4')}>
        <div className="space-y-1">
          <span className="eyebrow text-primary">
            {frontmatter.universe}
          </span>
          <h3
            className={cn(
              'font-bold text-white italic uppercase tracking-tight group-hover:text-primary transition-colors',
              compact ? 'text-xl leading-tight' : 'text-2xl md:text-3xl',
            )}
          >
            {frontmatter.title}
          </h3>
        </div>

        <p
          className={cn(
            'text-white/75 text-sm leading-relaxed',
            compact ? 'line-clamp-2' : 'line-clamp-3',
          )}
        >
          {frontmatter.description || 'Sin descripción disponible.'}
        </p>

        <div className={cn('mt-auto flex items-center justify-between border-t border-white/10', compact ? 'pt-4' : 'pt-5')}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/70 group-hover:text-white transition-colors flex items-center gap-2">
            Ver Detalles <ChevronRight className="h-3 w-3" />
          </span>
          {frontmatter.category && (
            <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[11px] font-bold text-primary uppercase">
              {frontmatter.category}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
