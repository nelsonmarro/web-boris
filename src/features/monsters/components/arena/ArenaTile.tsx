import type { Route } from 'next';
import { ArrowRight, Swords } from 'lucide-react';
import { CrystalTile } from '@/components/crystal';
import type { Fighter } from '@/features/monsters/lib/arena';

interface ArenaTileProps {
  a: Fighter;
  b: Fighter;
  /** Probabilidad de victoria de `a` (0-1). */
  probA: number;
  className?: string;
}

/** Duelo de la Arena con su barra de probabilidad; la tile abre ese mismo duelo. */
export function ArenaTile({ a, b, probA, className }: ArenaTileProps) {
  const pctA = Math.round(probA * 100);
  const pctB = 100 - pctA;
  return (
    <CrystalTile
      href={`/wiki/arena?a=${a.slug}&b=${b.slug}` as Route}
      eyebrow="Versus Arena"
      title="Enfrenta a los colosos"
      titleSize="compact"
      icon={Swords}
      className={className}
    >
      <p className="flex flex-wrap items-baseline gap-x-2 font-display text-base font-black uppercase italic leading-tight text-white">
        <span>{a.frontmatter.title}</span>
        <span className="text-primary">vs</span>
        <span>{b.frontmatter.title}</span>
      </p>
      <div
        role="img"
        aria-label={`Probabilidad de victoria: ${a.frontmatter.title} ${pctA} %, ${b.frontmatter.title} ${pctB} %`}
        className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-white/10"
      >
        <span className="h-full bg-primary" style={{ width: `${pctA}%` }} />
        <span className="h-full bg-cyan-400" style={{ width: `${pctB}%` }} />
      </div>
      <div aria-hidden="true" className="mt-1 flex justify-between font-mono text-[12px] font-bold tabular-nums">
        <span className="text-primary">{pctA}%</span>
        <span className="text-cyan-300">{pctB}%</span>
      </div>
      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-[11px] font-bold uppercase tracking-wider text-primary">
        Abrir la Arena
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </CrystalTile>
  );
}
