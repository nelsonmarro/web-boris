'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Swords, Scale, Crosshair, Shuffle } from 'lucide-react';
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
  'w-full h-14 bg-[#061a2e] border-white/10 rounded-2xl text-white font-bold focus:ring-primary/20';
const contentClass = 'bg-[#061a2e] border-white/10 text-white min-w-[240px]';

export function ArenaSimulator({ fighters }: ArenaSimulatorProps) {
  const [slugA, setSlugA] = React.useState(fighters[0]?.slug ?? '');
  const [slugB, setSlugB] = React.useState(fighters[1]?.slug ?? fighters[0]?.slug ?? '');

  const fighterItems = React.useMemo(
    () => Object.fromEntries(fighters.map((f) => [f.slug, f.frontmatter.title])),
    [fighters],
  );

  const a = fighters.find((f) => f.slug === slugA) ?? fighters[0];
  const b = fighters.find((f) => f.slug === slugB) ?? fighters[1] ?? fighters[0];

  if (!a || !b) {
    return (
      <div className="glass-liquid rounded-[3rem] border-white/10 p-12 text-center text-white/60">
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
    setSlugA(first);
    setSlugB(rest[Math.floor(Math.random() * rest.length)]);
  };

  return (
    <div className="space-y-8">
      {/* Pickers */}
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <label className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Combatiente A</span>
          <Select value={slugA} onValueChange={(v) => v && setSlugA(v)} items={fighterItems}>
            <SelectTrigger className={triggerClass}><SelectValue placeholder="Elegir" /></SelectTrigger>
            <SelectContent className={contentClass}>
              {fighters.map((f) => (
                <SelectItem key={f.slug} value={f.slug}>{f.frontmatter.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <Button
          type="button"
          variant="outline"
          onClick={shuffle}
          className="glass-liquid h-14 rounded-2xl border-white/10 px-6 text-[11px] font-bold uppercase tracking-wider text-white"
        >
          <Shuffle className="mr-2 h-4 w-4 text-primary" /> Aleatorio
        </Button>
        <label className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300">Combatiente B</span>
          <Select value={slugB} onValueChange={(v) => v && setSlugB(v)} items={fighterItems}>
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
      <div className="glass-liquid rounded-3xl border-white/10 p-6">
        <div className="mb-3 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest">
          <span className="text-primary">{a.frontmatter.title} · {pctA}%</span>
          <span className="flex items-center gap-2 text-white/50"><Swords className="h-4 w-4" /> Probabilidad</span>
          <span className="text-cyan-300">{100 - pctA}% · {b.frontmatter.title}</span>
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
        <div className="order-first flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[#061a2e] p-5 lg:order-none">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Perfil comparado</span>
          <RadarChart
            labels={radarValues(a.frontmatter.stats).map((v) => v.label)}
            series={[
              { name: a.frontmatter.title, color: '#FF7300', values: radarValues(a.frontmatter.stats).map((v) => v.value) },
              { name: b.frontmatter.title, color: '#67e8f9', values: radarValues(b.frontmatter.stats).map((v) => v.value) },
            ]}
          />
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
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
