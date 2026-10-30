'use client';

import * as React from 'react';
import { Check, Share2, Swords, X, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';
import { radarValues, type Fighter } from '@/features/monsters/lib/arena';
import {
  ROUND_MS,
  battleShareText,
  battleUrl,
  predictionsText,
  roundSummary,
  simulateBattle,
  verdictText,
  type BattleResult,
  type Side,
} from '@/features/monsters/lib/arena-battle';
import type { CanonBattle, CanonFact } from '@/features/monsters/config/canon-battles';
import { prefersReducedMotion, savePrediction, shareText, usePredictionStats } from '../arena-client';
import { CanonBadge, CanonNote } from './CanonNote';
import { RoundsBoard } from './RoundsBoard';

export const ARENA_PRIMARY =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-[12px] font-bold uppercase tracking-wider text-[#00122E] transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#061a2e] motion-reduce:transition-none';
export const ARENA_SECONDARY =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-5 py-2 text-[12px] font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-[#00122E] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

type Phase = 'idle' | 'fighting' | 'done';

interface BattlePanelProps {
  a: Fighter;
  b: Fighter;
  canonBattle: CanonBattle | null;
  canonFact: CanonFact | null;
  titleOf: (slug: string) => string | undefined;
}

/**
 * Combate por asaltos (spec «Arena más divertida» §1-§3 y §6): predicción opcional, «¡Combatir!», cinco asaltos de
 * ≈ 0,6 s (todos a la vez con movimiento reducido), veredicto y compartir. El padre lo monta con `key` por pareja: al
 * cambiar de combatientes empieza de cero.
 */
export function BattlePanel({ a, b, canonBattle, canonFact, titleOf }: BattlePanelProps) {
  const nameA = a.frontmatter.title;
  const nameB = b.frontmatter.title;
  const stats = usePredictionStats();
  const [phase, setPhase] = React.useState<Phase>('idle');
  const [result, setResult] = React.useState<BattleResult | null>(null);
  const [revealed, setRevealed] = React.useState(0);
  const [prediction, setPrediction] = React.useState<Side | null>(null);
  /** Predicción del último combate y si acertó (`null`: se combatió sin predecir). */
  const [outcome, setOutcome] = React.useState<{ side: Side; correct: boolean } | null>(null);

  const finish = React.useCallback(
    (r: BattleResult, predicted: Side | null) => {
      setRevealed(r.rounds.length);
      setPhase('done');
      if (predicted) {
        const correct = predicted === r.winner;
        setOutcome({ side: predicted, correct });
        savePrediction(correct);
      } else setOutcome(null);
    },
    [],
  );

  // Un asalto cada ROUND_MS; el veredicto, ROUND_MS después del último.
  React.useEffect(() => {
    if (phase !== 'fighting' || !result) return;
    const id = window.setTimeout(() => {
      if (revealed < result.rounds.length) setRevealed(revealed + 1);
      else finish(result, prediction);
    }, ROUND_MS);
    return () => window.clearTimeout(id);
  }, [phase, revealed, result, prediction, finish]);

  const fight = () => {
    const r = simulateBattle({ slug: a.slug, stats: a.frontmatter.stats }, { slug: b.slug, stats: b.frontmatter.stats });
    setResult(r);
    setOutcome(null);
    if (prefersReducedMotion()) {
      finish(r, prediction);
    } else {
      setRevealed(1);
      setPhase('fighting');
    }
  };

  const primary = () => {
    if (phase === 'fighting' && result) finish(result, prediction);
    else fight();
  };

  const share = () => {
    if (!result) return;
    const text = battleShareText({ nameA, nameB, result, url: battleUrl(window.location.origin, a.slug, b.slug) });
    void shareText(text, 'Resultado del combate copiado');
  };

  const announcement =
    phase === 'fighting' && result && revealed > 0
      ? roundSummary(result.rounds[revealed - 1], revealed - 1, nameA, nameB)
      : phase === 'done' && result
        ? `${verdictText(result, nameA, nameB)}${outcome === null ? '' : outcome.correct ? ' ¡Acertaste!' : ' Fallaste.'}`
        : '';

  // Filas pendientes del cuadro de asaltos antes de combatir (solo en escritorio, para no dejar la columna vacía).
  const placeholderRounds = radarValues(a.frontmatter.stats).map((axis) => ({
    axis: axis.label,
    base: [0, 0] as const,
    rolled: [0, 0] as const,
    winner: null,
  }));

  return (
    <section aria-labelledby="arena-combate" className="rounded-2xl border border-white/10 bg-[#061a2e] p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="arena-combate" className="font-display text-2xl font-black uppercase italic text-white">
          Combate por asaltos
        </h2>
        {/* Línea reservada: el marcador guardado aparece tras hidratar sin mover nada. */}
        <p className="min-h-6 font-mono text-[12px] font-bold uppercase tracking-wider text-white/70">
          {stats ? (stats.total > 0 ? predictionsText(stats) : 'Aún sin predicciones') : '\u00a0'}
        </p>
      </div>

      {/* Móvil: una columna en orden de lectura. Escritorio: controles y veredicto a la izquierda, asaltos a la derecha. */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-[repeat(5,auto)_1fr] lg:items-start lg:gap-x-8">
        {(canonBattle || canonFact) && (
          <div className="lg:col-start-1">
            <CanonNote battle={canonBattle} fact={canonFact} titleOf={titleOf} />
          </div>
        )}

        <fieldset disabled={phase === 'fighting'} className="min-w-0 space-y-2 lg:col-start-1">
          <legend className="text-[12px] font-bold uppercase tracking-wider text-white/80">
            ¿Quién crees que gana? <span className="font-normal normal-case tracking-normal text-white/60">(opcional)</span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(['A', 'B'] as const).map((side) => {
              const name = side === 'A' ? nameA : nameB;
              const active = prediction === side;
              return (
                <button
                  key={side}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPrediction(active ? null : side)}
                  className={cn(
                    'min-h-12 min-w-0 break-words rounded-xl border px-3 py-2 text-[12px] font-bold uppercase tracking-wider transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed motion-reduce:transition-none',
                    side === 'A'
                      ? active
                        ? 'border-primary bg-primary text-[#00122E]'
                        : 'border-primary/40 text-primary hover:bg-primary/10'
                      : active
                        ? 'border-cyan-300 bg-cyan-300 text-[#00122E]'
                        : 'border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10',
                  )}
                >
                  {active && <Check className="mr-1 inline h-4 w-4 align-[-3px]" aria-hidden="true" />}
                  {name}
                </button>
              );
            })}
          </div>
        </fieldset>

        {result ? (
          <div className="lg:col-start-2 lg:row-span-6 lg:row-start-1">
            <RoundsBoard rounds={result.rounds} revealed={phase === 'done' ? result.rounds.length : revealed} nameA={nameA} nameB={nameB} />
          </div>
        ) : (
          <div className="hidden lg:col-start-2 lg:row-span-6 lg:row-start-1 lg:block" aria-hidden="true">
            <RoundsBoard rounds={placeholderRounds} revealed={0} nameA={nameA} nameB={nameB} />
          </div>
        )}

        {/* El recuadro del veredicto existe desde que empieza el combate (al pulsar): al terminar solo se rellena. */}
        {result && phase !== 'idle' && (
          <div
            className={cn(
              'min-h-[7.5rem] space-y-2 rounded-xl border p-4 lg:col-start-1',
              phase === 'fighting'
                ? 'border-dashed border-white/15'
                : result.winner === 'A'
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-cyan-400/50 bg-cyan-400/10',
            )}
          >
            {result.canon && <CanonBadge kind="battle" />}
            {phase === 'fighting' ? (
              <p className="font-mono text-sm font-bold uppercase tracking-wider text-white/70">
                Combate en curso · asalto {revealed} de {result.rounds.length}
              </p>
            ) : (
              <>
                <p className="font-display text-xl font-black uppercase italic leading-tight text-white">{verdictText(result, nameA, nameB)}</p>
                {outcome !== null ? (
                  <p className={cn('flex flex-wrap items-center gap-x-1.5 text-sm font-bold', outcome.correct ? 'text-emerald-300' : 'text-red-300')}>
                    {outcome.correct ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
                    {outcome.correct ? '¡Acertaste!' : 'Fallaste'}
                    <span className="font-normal text-white/70"> · apostaste por {outcome.side === 'A' ? nameA : nameB}</span>
                  </p>
                ) : (
                  <p className="text-sm text-white/70">Elige favorito antes de la revancha y suma a tus predicciones.</p>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row lg:col-start-1 lg:flex-col xl:flex-row">
          <button type="button" onClick={primary} className={cn(ARENA_PRIMARY, 'sm:min-w-56')}>
            <Swords className="h-4 w-4" aria-hidden="true" />
            {phase === 'idle' ? '¡Combatir!' : phase === 'fighting' ? 'Saltar al resultado' : 'Revancha'}
          </button>
          {/* Hueco reservado durante el combate (invisible y fuera del orden de tabulación) para no mover nada al acabar. */}
          {phase !== 'idle' && (
            <button type="button" onClick={share} className={cn(ARENA_SECONDARY, phase === 'fighting' && 'invisible')}>
              <Share2 className="h-4 w-4" aria-hidden="true" /> Compartir resultado
            </button>
          )}
        </div>
        <p className="text-[12px] text-white/60 lg:col-start-1">
          Cada asalto enfrenta un eje con un pequeño factor sorpresa (±8 %): un combate igualado puede cambiar al repetirlo.{' '}
          <Zap className="inline h-3.5 w-3.5 align-[-2px] text-white/70" aria-hidden="true" /> marca un asalto ganado por sorpresa.
        </p>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}
