'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Swords, Scale, Crosshair, Shuffle, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArticleStatCard } from '@/features/monsters/components/article/components/ArticleStatCard';
import { computeMatchup, radarValues, type Fighter } from '@/features/monsters/lib/arena';
import { FighterCard } from './FighterCard';
import { RadarChart } from './RadarChart';

interface ArenaSimulatorProps {
  fighters: Fighter[];
}

const triggerClass =
  'h-12 w-full rounded-xl border-white/15 bg-[#061a2e] px-4 text-sm font-semibold text-white focus-visible:ring-4 focus-visible:ring-primary/20';
const contentClass = 'bg-[#061a2e] border-white/10 text-white min-w-[240px]';

export function ArenaSimulator({ fighters }: ArenaSimulatorProps) {
  // La URL es la fuente de verdad (?a=<slug>&b=<slug>): un enfrentamiento se comparte copiando el enlace.
  // Valores ausentes o inválidos caen en los dos primeros combatientes.
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slugs = React.useMemo(() => new Set(fighters.map((f) => f.slug)), [fighters]);
  const paramA = searchParams.get('a');
  const paramB = searchParams.get('b');
  const slugA = paramA && slugs.has(paramA) ? paramA : (fighters[0]?.slug ?? '');
  const slugB = paramB && slugs.has(paramB) ? paramB : (fighters[1]?.slug ?? fighters[0]?.slug ?? '');

  /** Escribe el par en la URL con la History API nativa (Next 16 la sincroniza con useSearchParams) y conserva hash y otros params. */
  const writePair = React.useCallback(
    (nextA: string, nextB: string) => {
      const next = new URLSearchParams(window.location.search);
      next.set('a', nextA);
      next.set('b', nextB);
      window.history.replaceState(null, '', `${pathname}?${next.toString()}${window.location.hash}`);
    },
    [pathname],
  );

  const fighterItems = React.useMemo(
    () => Object.fromEntries(fighters.map((f) => [f.slug, f.frontmatter.title])),
    [fighters],
  );

  const a = fighters.find((f) => f.slug === slugA) ?? fighters[0];
  const b = fighters.find((f) => f.slug === slugB) ?? fighters[1] ?? fighters[0];

  if (!a || !b) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#061a2e] p-12 text-center text-white/60">
        Aún no hay combatientes con registro biométrico.
      </div>
    );
  }

  const matchup = computeMatchup(a.frontmatter.stats, b.frontmatter.stats);
  const pctA = Math.round(matchup.probA * 100);
  const aWins = matchup.probA >= 0.5;
  const favorite = aWins ? a : b;
  const lengthA = a.frontmatter.stats.length ?? 0;
  const lengthB = b.frontmatter.stats.length ?? 0;
  const scaleRatio = lengthA && lengthB ? Math.max(lengthA, lengthB) / Math.min(lengthA, lengthB) : 1;

  const shuffle = () => {
    if (fighters.length < 2) return;
    const pool = fighters.map((f) => f.slug);
    const first = pool[Math.floor(Math.random() * pool.length)];
    const rest = pool.filter((s) => s !== first);
    writePair(first, rest[Math.floor(Math.random() * rest.length)]);
  };

  const shareMatchup = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('a', a.slug);
    url.searchParams.set('b', b.slug);
    const shareUrl = url.toString();
    const title = `${a.frontmatter.title} vs ${b.frontmatter.title} | Versus Arena`;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        // Cualquier otro fallo del share nativo cae al portapapeles.
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Enlace del enfrentamiento copiado');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  return (
    <div className="space-y-8">
      {/* Pickers */}
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <label className="space-y-2">
          <span className="eyebrow text-primary">Combatiente A</span>
          <Select value={slugA} onValueChange={(v) => v && writePair(v, slugB)} items={fighterItems}>
            <SelectTrigger className={triggerClass}><SelectValue placeholder="Elegir" /></SelectTrigger>
            <SelectContent className={contentClass}>
              {fighters.map((f) => (
                <SelectItem key={f.slug} value={f.slug}>{f.frontmatter.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <div className="order-last flex flex-col gap-2 sm:flex-row md:order-none md:flex-col lg:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={shuffle}
            className="glass-liquid h-12 flex-1 rounded-xl border-white/10 px-5 text-[11px] font-bold uppercase tracking-wider text-white"
          >
            <Shuffle className="mr-2 h-4 w-4 text-primary" /> Aleatorio
          </Button>
          <Button
            type="button"
            onClick={shareMatchup}
            className="h-12 flex-1 rounded-xl bg-primary px-5 text-[11px] font-bold uppercase tracking-wider text-[#00122E] hover:bg-primary/90"
          >
            <Share2 className="mr-2 h-4 w-4" /> Compartir enfrentamiento
          </Button>
        </div>
        <label className="space-y-2">
          <span className="eyebrow text-cyan-300">Combatiente B</span>
          <Select value={slugB} onValueChange={(v) => v && writePair(slugA, v)} items={fighterItems}>
            <SelectTrigger className={triggerClass}><SelectValue placeholder="Elegir" /></SelectTrigger>
            <SelectContent className={contentClass}>
              {fighters.map((f) => (
                <SelectItem key={f.slug} value={f.slug}>{f.frontmatter.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      {/* Probability bar */}
      <div className="glass-liquid rounded-2xl border-white/10 p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono text-xs font-bold uppercase tracking-widest">
          <span className="min-w-0 break-words text-primary">{a.frontmatter.title} · {pctA}%</span>
          <span className="flex items-center gap-2 text-white/60"><Swords className="h-4 w-4" /> Probabilidad</span>
          <span className="min-w-0 break-words text-cyan-300">{100 - pctA}% · {b.frontmatter.title}</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-cyan-400/30">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_20px_rgba(255,115,0,0.6)]"
            initial={false}
            animate={{ width: `${pctA}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        <p className="mt-4 text-sm text-white/70">
          {slugA === slugB ? (
            <>Un coloso contra sí mismo: empate técnico. Elige dos combatientes distintos.</>
          ) : (
            <>
              <span className="font-bold text-white">{favorite.frontmatter.title}</span> parte como favorito. Factor decisivo:{' '}
              <span className="font-bold text-primary">{matchup.decisiveAxis.label}</span> (
              {matchup.decisiveAxis.delta > 0 ? '+' : ''}{Math.round(matchup.decisiveAxis.delta)} a favor de{' '}
              {matchup.decisiveAxis.delta >= 0 ? a.frontmatter.title : b.frontmatter.title}).
            </>
          )}
        </p>
      </div>

      {/* Cards + radar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(260px,320px)_1fr] lg:items-start">
        <FighterCard fighter={a} side="A" score={matchup.scoreA} winner={aWins && slugA !== slugB} />
        <div className="order-first flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#061a2e] p-5 lg:order-none">
          <span className="eyebrow text-white/60">Perfil comparado</span>
          <RadarChart
            labels={radarValues(a.frontmatter.stats).map((v) => v.label)}
            series={[
              { name: a.frontmatter.title, color: '#FF7300', values: radarValues(a.frontmatter.stats).map((v) => v.value) },
              { name: b.frontmatter.title, color: '#67e8f9', values: radarValues(b.frontmatter.stats).map((v) => v.value) },
            ]}
          />
          <div className="flex gap-4 text-[11px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-primary"><span className="h-2 w-2 rounded-full bg-primary" />A</span>
            <span className="flex items-center gap-1.5 text-cyan-300"><span className="h-2 w-2 rounded-full bg-cyan-300" />B</span>
          </div>
        </div>
        <FighterCard fighter={b} side="B" score={matchup.scoreB} winner={!aWins && slugA !== slugB} />
      </div>

      {/* Summary tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ArticleStatCard icon={<Swords className="h-5 w-5 text-primary" />} label="Ventaja global" value={`${Math.abs(pctA - 50) * 2}%`} />
        <ArticleStatCard icon={<Scale className="h-5 w-5 text-cyan-300" />} label="Diferencia de escala" value={`×${scaleRatio.toFixed(2)}`} />
        <ArticleStatCard icon={<Crosshair className="h-5 w-5 text-red-400" />} label="Factor decisivo" value={matchup.decisiveAxis.label} />
      </div>
    </div>
  );
}
