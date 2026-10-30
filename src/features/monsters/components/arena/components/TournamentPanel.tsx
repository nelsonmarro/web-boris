'use client';

import * as React from 'react';
import Link from 'next/link';
import { Share2, Shuffle, Trophy, Swords } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Fighter } from '@/features/monsters/lib/arena';
import {
  ROUND_MS,
  TOURNAMENT_SIZE,
  drawEntrants,
  roundSummary,
  runTournament,
  scoreLine,
  tournamentShareText,
  verdictText,
  type TournamentMatch,
  type TournamentResult,
} from '@/features/monsters/lib/arena-battle';
import { prefersReducedMotion, shareText } from '../arena-client';
import { CanonBadge } from './CanonNote';
import { RoundsBoard } from './RoundsBoard';
import { ARENA_PRIMARY, ARENA_SECONDARY } from './BattlePanel';

const triggerClass =
  'h-12 data-[size=default]:h-12 w-full rounded-xl border-white/15 bg-[#00122E] px-4 text-sm font-semibold text-white focus-visible:ring-4 focus-visible:ring-primary/20';
const contentClass = 'bg-[#061a2e] border-white/10 text-white min-w-[240px]';

const MATCH_LABELS = ['Semifinal 1', 'Semifinal 2', 'Final'] as const;

interface TournamentPanelProps {
  fighters: Fighter[];
}

/**
 * Torneo rápido (spec «Arena más divertida» §5): cuatro combatientes (elegidos o sorteados), semifinales y final con el
 * mismo combate por asaltos, cuadro visual y campeón para compartir. El torneo entero se decide al empezar
 * (`runTournament`); después solo se revela, combate a combate.
 */
export function TournamentPanel({ fighters }: TournamentPanelProps) {
  const bySlug = React.useMemo(() => new Map(fighters.map((f) => [f.slug, f])), [fighters]);
  const items = React.useMemo(() => Object.fromEntries(fighters.map((f) => [f.slug, f.frontmatter.title])), [fighters]);
  const title = (slug: string) => bySlug.get(slug)?.frontmatter.title ?? slug;

  // Sin azar en el render: el cuadro inicial son los cuatro primeros (los más largos); «Sortear» los cambia.
  const [entrants, setEntrants] = React.useState<string[]>(() => fighters.slice(0, TOURNAMENT_SIZE).map((f) => f.slug));
  const [tournament, setTournament] = React.useState<TournamentResult | null>(null);
  /** Combate en curso (0-2) y asaltos revelados de ese combate (0-5). */
  const [matchIndex, setMatchIndex] = React.useState(0);
  const [revealed, setRevealed] = React.useState(0);

  const current = tournament?.matches[matchIndex] ?? null;
  const roundsTotal = current?.result.rounds.length ?? 0;
  const matchFinished = !!current && revealed >= roundsTotal;
  const done = !!tournament && matchIndex === MATCH_LABELS.length - 1 && matchFinished;

  React.useEffect(() => {
    if (!current || revealed >= roundsTotal) return;
    const id = window.setTimeout(() => setRevealed(revealed + 1), ROUND_MS);
    return () => window.clearTimeout(id);
  }, [current, revealed, roundsTotal]);

  /** Elegir en una casilla a quien ya está en otra los intercambia (nunca dos veces el mismo). */
  const pick = (slot: number, slug: string) => {
    setEntrants((prev) => {
      const next = [...prev];
      const other = next.indexOf(slug);
      if (other !== -1 && other !== slot) next[other] = next[slot];
      next[slot] = slug;
      return next;
    });
  };

  const shuffle = () => setEntrants(drawEntrants(fighters.map((f) => f.slug)));

  const revealStart = () => (prefersReducedMotion() ? Number.MAX_SAFE_INTEGER : 1);

  const start = () => {
    const players = entrants.map((slug) => bySlug.get(slug)).filter((f): f is Fighter => !!f);
    if (players.length !== TOURNAMENT_SIZE) return;
    setTournament(runTournament(players.map((f) => ({ slug: f.slug, stats: f.frontmatter.stats }))));
    setMatchIndex(0);
    setRevealed(revealStart());
  };

  const primary = () => {
    if (!tournament) start();
    else if (done) start();
    else if (!matchFinished) setRevealed(roundsTotal);
    else {
      setMatchIndex(matchIndex + 1);
      setRevealed(revealStart());
    }
  };

  const reset = () => {
    setTournament(null);
    setMatchIndex(0);
    setRevealed(0);
  };

  const share = () => {
    if (!tournament) return;
    void shareText(tournamentShareText(title(tournament.champion), `${window.location.origin}/wiki/arena`), 'Campeón del torneo copiado');
  };

  const primaryLabel = !tournament
    ? '¡Empezar torneo!'
    : done
      ? 'Repetir torneo'
      : !matchFinished
        ? 'Saltar al resultado'
        : `Siguiente: ${MATCH_LABELS[matchIndex + 1]}`;

  const announcement = (() => {
    if (!tournament || !current) return '';
    const nameA = title(current.a);
    const nameB = title(current.b);
    if (done) return `${current.label}: ${verdictText(current.result, nameA, nameB)} Campeón del torneo: ${title(tournament.champion)}.`;
    if (matchFinished) return `${current.label}: ${verdictText(current.result, nameA, nameB)}`;
    if (revealed > 0) return `${current.label}. ${roundSummary(current.result.rounds[revealed - 1], revealed - 1, nameA, nameB)}`;
    return '';
  })();

  return (
    <section aria-labelledby="arena-torneo" className="space-y-6">
      <div className="space-y-1">
        <h2 id="arena-torneo" className="font-display text-2xl font-black uppercase italic text-white">
          Torneo rápido
        </h2>
        <p className="text-sm text-white/70">Cuatro combatientes, semifinales y final con el mismo combate por asaltos.</p>
      </div>

      {!tournament ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {entrants.map((slug, slot) => (
            <label key={slot} className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                {slot < 2 ? `Semifinal 1 · ${slot === 0 ? 'A' : 'B'}` : `Semifinal 2 · ${slot === 2 ? 'A' : 'B'}`}
              </span>
              <Select value={slug} onValueChange={(v) => v && pick(slot, v)} items={items}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Elegir" />
                </SelectTrigger>
                <SelectContent className={contentClass}>
                  {fighters.map((f) => (
                    <SelectItem key={f.slug} value={f.slug}>
                      {f.frontmatter.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
          <Bracket tournament={tournament} matchIndex={matchIndex} matchFinished={matchFinished} title={title} />
          {current && (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">{current.label}</p>
              <RoundsBoard rounds={current.result.rounds} revealed={Math.min(revealed, roundsTotal)} nameA={title(current.a)} nameB={title(current.b)} />
              {/* Línea reservada: el veredicto sustituye al «asalto N de 5» sin mover nada. */}
              <div className="min-h-[4.5rem] space-y-1">
                {current.result.canon && <CanonBadge kind="battle" />}
                {matchFinished ? (
                  <p className="font-display text-lg font-black uppercase italic leading-tight text-white">
                    {verdictText(current.result, title(current.a), title(current.b))}
                  </p>
                ) : (
                  <p className="font-mono text-sm font-bold uppercase tracking-wider text-white/70">
                    Asalto {Math.min(revealed, roundsTotal)} de {roundsTotal}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* La tarjeta del campeón existe desde que empieza el torneo («por decidir»): al acabar solo se rellena. */}
      {tournament && !done && (
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-white/15 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-3">
            <Trophy className="h-8 w-8 shrink-0 text-white/40" aria-hidden="true" />
            <span>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-white/80">Campeón del torneo</span>
              <span className="inline-flex min-h-11 items-center font-display text-2xl font-black uppercase italic text-white/60">Por decidir</span>
            </span>
          </p>
          <span className={cn(ARENA_SECONDARY, 'invisible')} aria-hidden="true">
            <Share2 className="h-4 w-4" /> Compartir campeón
          </span>
        </div>
      )}
      {done && tournament && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/50 bg-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-3">
            <Trophy className="h-8 w-8 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-white/80">Campeón del torneo</span>
              <Link
                href={`/wiki/${tournament.champion}`}
                className="inline-flex min-h-11 items-center font-display text-2xl font-black uppercase italic text-white transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
              >
                {title(tournament.champion)}
              </Link>
            </span>
          </p>
          <button type="button" onClick={share} className={ARENA_SECONDARY}>
            <Share2 className="h-4 w-4" aria-hidden="true" /> Compartir campeón
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={primary} className={cn(ARENA_PRIMARY, 'sm:min-w-56')}>
          {done ? <Trophy className="h-4 w-4" aria-hidden="true" /> : <Swords className="h-4 w-4" aria-hidden="true" />}
          {primaryLabel}
        </button>
        {!tournament ? (
          <button type="button" onClick={shuffle} className={ARENA_SECONDARY}>
            <Shuffle className="h-4 w-4" aria-hidden="true" /> Sortear combatientes
          </button>
        ) : (
          <button type="button" onClick={reset} className={ARENA_SECONDARY}>
            Cambiar combatientes
          </button>
        )}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}

interface BracketProps {
  tournament: TournamentResult;
  matchIndex: number;
  matchFinished: boolean;
  title: (slug: string) => string;
}

/** Cuadro: semifinales a la izquierda, final a la derecha (en móvil, una columna). */
function Bracket({ tournament, matchIndex, matchFinished, title }: BracketProps) {
  const [semi1, semi2, final] = tournament.matches;
  const played = (i: number) => i < matchIndex || (i === matchIndex && matchFinished);
  const finalKnown = played(0) && played(1);

  return (
    <ol aria-label="Cuadro del torneo" className="grid gap-3 sm:grid-cols-2 sm:items-center">
      <li className="space-y-3 sm:row-span-2">
        <ol className="space-y-3">
          <MatchCard match={semi1} index={0} current={matchIndex === 0} played={played(0)} title={title} />
          <MatchCard match={semi2} index={1} current={matchIndex === 1} played={played(1)} title={title} />
        </ol>
      </li>
      <li className="sm:row-span-2">
        <ol>
          {finalKnown ? (
            <MatchCard match={final} index={2} current={matchIndex === 2} played={played(2)} title={title} />
          ) : (
            // Misma estructura que `MatchCard` (etiqueta y dos filas): al conocerse los finalistas no cambia la altura.
            <li className="rounded-xl border border-dashed border-white/15 p-3">
              <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white/70">Final</span>
              <span className="mt-1.5 block space-y-1 text-sm font-bold text-white/60">
                <span className="block">Ganador de la semifinal 1</span>
                <span className="block">Ganador de la semifinal 2</span>
              </span>
            </li>
          )}
        </ol>
      </li>
    </ol>
  );
}

interface MatchCardProps {
  match: TournamentMatch;
  index: number;
  current: boolean;
  played: boolean;
  title: (slug: string) => string;
}

function MatchCard({ match, current, played, title }: MatchCardProps) {
  return (
    <li
      aria-current={current ? 'step' : undefined}
      className={cn('rounded-xl border p-3', current ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-black/20')}
    >
      <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white/70">
        {match.label}
        {played && <span className="font-mono text-white/80">{scoreLine(match.result)}</span>}
      </span>
      <span className="mt-1.5 block space-y-1">
        {[match.a, match.b].map((slug, i) => {
          const won = played && match.winner === slug;
          const wins = match.result.wins[i === 0 ? 'A' : 'B'];
          return (
            <span
              key={slug}
              className={cn(
                'flex items-center justify-between gap-2 text-sm font-bold',
                !played && 'text-white',
                won && 'text-primary',
                played && !won && 'text-white/60 line-through decoration-white/40',
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                {won && <Trophy className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                <span className="min-w-0 break-words">{title(slug)}</span>
                {won && <span className="sr-only">(gana)</span>}
              </span>
              {played && <span className="font-mono tabular-nums">{wins}</span>}
            </span>
          );
        })}
      </span>
    </li>
  );
}
