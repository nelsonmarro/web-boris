'use client';

import * as React from 'react';
import Image from 'next/image';
import { IMAGE_QUALITY } from '@/utils/image';
import Link from 'next/link';
import { Ruler } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CategoryPlaceholder, coverOf } from '@/components/content/CategoryPlaceholder';
import { StatRow } from '@/features/monsters/components/wiki/StatRow';
import { getThreatLevel, scaleTen, THREAT_TONE_CLASSES } from '@/features/monsters/lib/stats';
import type { Fighter } from '@/features/monsters/lib/arena';

interface FighterCardProps {
  fighter: Fighter;
  side: 'A' | 'B';
  score: number;
  winner: boolean;
}

export function FighterCard({ fighter, side, score, winner }: FighterCardProps) {
  const { slug, frontmatter: fm } = fighter;
  const cover = coverOf(fm.image);
  const stats = fm.stats;
  const threat = getThreatLevel(stats.hostility);
  const accent = side === 'A' ? 'text-primary' : 'text-cyan-300';
  const ring = side === 'A' ? 'border-primary/40' : 'border-cyan-400/40';

  return (
    <article
      className={cn(
        'crystal-surface relative flex flex-col overflow-hidden rounded-2xl transition-all duration-500',
        winner ? ring : 'border-white/10',
        winner && 'shadow-[0_0_50px_rgba(255,115,0,0.15)]',
      )}
    >
      <div className="relative aspect-[16/10] w-full bg-black/40">
        {cover ? (
          <Image quality={IMAGE_QUALITY} src={cover} alt={fm.title} fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" style={{ objectPosition: fm.imagePosition ?? '50% 50%' }} />
        ) : (
          <CategoryPlaceholder category={fm.category} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061a2e] via-[#061a2e]/30 to-transparent" />
        <div className="absolute left-4 top-4">
          <div className={cn('rounded-full border border-white/10 bg-black/50 px-3 py-1 font-mono text-[11px] font-black uppercase tracking-[0.12em] backdrop-blur-md', accent)}>
            Combatiente {side}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <Link href={`/wiki/${slug}`} className="flex min-h-11 items-end font-display text-3xl font-black uppercase italic leading-none text-white transition-colors hover:text-primary">
            {fm.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {winner && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-black uppercase tracking-[0.15em] text-[#00122E] shadow-[0_0_20px_rgba(255,115,0,0.6)]">
                Favorito
              </span>
            )}
            {threat && (
              <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.15em]', THREAT_TONE_CLASSES[threat.tone].badge)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', THREAT_TONE_CLASSES[threat.tone].dot)} />
                {threat.label}
              </span>
            )}
            {stats.length !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-0.5 font-mono text-[11px] font-bold text-white/80">
                <Ruler className="h-3 w-3 text-primary" />
                {stats.length.toLocaleString('es-ES')} m
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">Índice de combate</span>
          <span className={cn('font-mono text-2xl font-black tabular-nums', accent)}>{Math.round(score)}</span>
        </div>
        {stats.power !== undefined && <StatRow label="Poder" value={stats.power} display={`${stats.power}`} tone={side === 'A' ? 'primary' : 'cyan'} />}
        {stats.defense !== undefined && <StatRow label="Defensa" value={stats.defense} display={`${stats.defense}`} tone={side === 'A' ? 'primary' : 'cyan'} />}
        {stats.hostility !== undefined && <StatRow label="Hostilidad" value={scaleTen(stats.hostility)} display={`${stats.hostility}/10`} tone={side === 'A' ? 'primary' : 'cyan'} />}
        {stats.intelligence !== undefined && <StatRow label="Inteligencia" value={scaleTen(stats.intelligence)} display={`${stats.intelligence}/10`} tone={side === 'A' ? 'primary' : 'cyan'} />}
        {stats.specialAbilities && stats.specialAbilities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stats.specialAbilities.map((ability) => (
              <span key={ability} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white/60">
                {ability}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
