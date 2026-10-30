/**
 * Lógica pura del combate por asaltos de la Versus Arena (spec «Arena más divertida» §1, §2, §5 y §6): los cinco
 * asaltos con su factor sorpresa, el canon que manda, el torneo rápido, las predicciones guardadas y los textos para
 * compartir. Sin React ni navegador: el azar entra por parámetro (`Rng`) para probarlo con una semilla.
 */
import { radarValues, scoreFighter } from './arena.ts';
import type { WikiStats } from './stats.ts';
import {
  ANY_RIVAL,
  CANON_BATTLES,
  CANON_FACTS,
  type CanonBattle,
  type CanonFact,
} from '../config/canon-battles.ts';

/** Generador uniforme en [0, 1). Por defecto `Math.random`. */
export type Rng = () => number;

export type Side = 'A' | 'B';

/** Variación máxima de cada asalto (±8 %): un combate igualado puede cambiar; uno muy desigual, no. */
export const JITTER = 0.08;

/** Duración de cada asalto en la animación (ms). Con `prefers-reduced-motion`, todo a la vez. */
export const ROUND_MS = 600;

export interface BattleFighter {
  slug: string;
  stats: WikiStats;
}

export interface BattleRound {
  /** Eje del asalto: Poder, Defensa, Hostilidad, Inteligencia o Escala (el orden del radar). */
  axis: string;
  /** Valor del eje (0-100) de A y de B. */
  base: readonly [number, number];
  /** Valor tras el factor sorpresa (igual que `base` en un combate del canon). */
  rolled: readonly [number, number];
  /** `null`: asalto empatado. */
  winner: Side | null;
}

export type DecidedBy = 'asaltos' | 'indice' | 'sorteo' | 'canon';

export interface BattleResult {
  rounds: BattleRound[];
  wins: { A: number; B: number };
  winner: Side;
  /** Cómo se decidió: por asaltos, por índice de combate (empate a asaltos), a sorteo (empate total) o por el canon. */
  decidedBy: DecidedBy;
  /** Índice de combate (`scoreFighter`) de A y de B: el desempate. */
  scores: readonly [number, number];
  /** El enfrentamiento del canon de la pareja, si lo hubo. */
  canon: CanonBattle | null;
}

/** Valor con el factor sorpresa: `value · (1 ± amount)`, uniforme. */
export function jitter(value: number, rng: Rng, amount: number = JITTER): number {
  return value * (1 + (rng() * 2 - 1) * amount);
}

const samePair = (x1: string, x2: string, y1: string, y2: string) => (x1 === y1 && x2 === y2) || (x1 === y2 && x2 === y1);

/** Enfrentamiento del canon entre `slugA` y `slugB` (en cualquier orden), o `null`. */
export function findCanonBattle(
  slugA: string,
  slugB: string,
  battles: readonly CanonBattle[] = CANON_BATTLES,
): CanonBattle | null {
  return battles.find((c) => samePair(c.a, c.b, slugA, slugB)) ?? null;
}

/** Dato del archivo de la pareja: primero el de la pareja exacta, después uno con comodín de cualquiera de los dos. */
export function findCanonFact(slugA: string, slugB: string, facts: readonly CanonFact[] = CANON_FACTS): CanonFact | null {
  return (
    facts.find((f) => f.b !== ANY_RIVAL && samePair(f.a, f.b, slugA, slugB)) ??
    facts.find((f) => f.b === ANY_RIVAL && (f.a === slugA || f.a === slugB)) ??
    null
  );
}

export interface SimulateOptions {
  rng?: Rng;
  battles?: readonly CanonBattle[];
}

/**
 * Combate en cinco asaltos, uno por eje. Cada asalto compara el valor del eje con el factor sorpresa; gana quien gane
 * más asaltos (empate → mayor índice de combate; empate total → sorteo). Si la pareja se enfrentó en el canon, no hay
 * azar y gana siempre el del canon.
 */
export function simulateBattle(a: BattleFighter, b: BattleFighter, options: SimulateOptions = {}): BattleResult {
  const { rng = Math.random, battles = CANON_BATTLES } = options;
  const canon = findCanonBattle(a.slug, b.slug, battles);
  const valuesA = radarValues(a.stats);
  const valuesB = radarValues(b.stats);
  const wins = { A: 0, B: 0 };

  const rounds: BattleRound[] = valuesA.map((axis, i) => {
    const base = [axis.value, valuesB[i].value] as const;
    const rolled = canon ? base : ([jitter(base[0], rng), jitter(base[1], rng)] as const);
    const winner: Side | null = rolled[0] > rolled[1] ? 'A' : rolled[1] > rolled[0] ? 'B' : null;
    if (winner) wins[winner] += 1;
    return { axis: axis.label, base, rolled, winner };
  });

  const scores = [scoreFighter(a.stats), scoreFighter(b.stats)] as const;
  let winner: Side;
  let decidedBy: DecidedBy;
  if (canon) {
    winner = canon.winner === a.slug ? 'A' : 'B';
    decidedBy = 'canon';
  } else if (wins.A !== wins.B) {
    winner = wins.A > wins.B ? 'A' : 'B';
    decidedBy = 'asaltos';
  } else if (scores[0] !== scores[1]) {
    winner = scores[0] > scores[1] ? 'A' : 'B';
    decidedBy = 'indice';
  } else {
    winner = rng() < 0.5 ? 'A' : 'B';
    decidedBy = 'sorteo';
  }
  return { rounds, wins, winner, decidedBy, scores, canon };
}

export const otherSide = (side: Side): Side => (side === 'A' ? 'B' : 'A');

/** Marcador del ganador primero: «3-2». */
export function scoreLine(result: BattleResult): string {
  return `${result.wins[result.winner]}-${result.wins[otherSide(result.winner)]}`;
}

/** Valor mostrado de un eje (entero). */
const shown = (value: number) => Math.round(value);

/** El ganador del asalto tenía menos en ese eje: lo decidió el factor sorpresa. */
export function isUpset(round: BattleRound): boolean {
  if (!round.winner) return false;
  const [a, b] = round.base;
  return round.winner === 'A' ? a < b : b < a;
}

/** Frase de un asalto para el lector de pantalla. Muestra los valores reales del eje (0-100), no los del azar. */
export function roundSummary(round: BattleRound, index: number, nameA: string, nameB: string): string {
  const head = `Asalto ${index + 1} · ${round.axis}`;
  const values = `${shown(round.base[0])} a ${shown(round.base[1])}`;
  if (!round.winner) return `${head}: empate (${values}).`;
  return `${head}: gana ${round.winner === 'A' ? nameA : nameB}${isUpset(round) ? ' por sorpresa' : ''} (${values}).`;
}

/** Veredicto final, en una frase. */
export function verdictText(result: BattleResult, nameA: string, nameB: string): string {
  const name = result.winner === 'A' ? nameA : nameB;
  const loserWins = result.wins[otherSide(result.winner)];
  switch (result.decidedBy) {
    case 'canon':
      return result.wins[result.winner] >= loserWins
        ? `¡Gana ${name} por ${scoreLine(result)}! Así ocurrió en el canon.`
        : `¡Gana ${name}! Los asaltos no le favorecían, pero así ocurrió en el canon.`;
    case 'asaltos':
      return `¡Gana ${name} por ${scoreLine(result)}!`;
    case 'indice':
      return `¡Gana ${name}! Empate a ${result.wins.A} asaltos: decide el índice de combate (${shown(result.scores[0])} a ${shown(result.scores[1])}).`;
    case 'sorteo':
      return `¡Gana ${name}! Empate total: lo decide el azar.`;
  }
}

/* ---------- Compartir (§6) ---------- */

export interface BattleShareInput {
  nameA: string;
  nameB: string;
  result: BattleResult;
  url: string;
}

/** «A vs B — ganó X por 3-2 en la Versus Arena. ¿Estás de acuerdo? <url>». */
export function battleShareText({ nameA, nameB, result, url }: BattleShareInput): string {
  const name = result.winner === 'A' ? nameA : nameB;
  const loserWins = result.wins[otherSide(result.winner)];
  const how =
    result.decidedBy === 'canon' && result.wins[result.winner] < loserWins
      ? `ganó ${name}, como en el canon,`
      : `ganó ${name} por ${scoreLine(result)}`;
  return `${nameA} vs ${nameB} — ${how} en la Versus Arena. ¿Estás de acuerdo? ${url}`;
}

/** «Campeón del torneo: X — Versus Arena. ¿Estás de acuerdo? <url>». */
export function tournamentShareText(championName: string, url: string): string {
  return `Campeón del torneo: ${championName} — Versus Arena. ¿Estás de acuerdo? ${url}`;
}

/** URL de un enfrentamiento (`?a=&b=`, el contrato de la Arena). */
export function battleUrl(origin: string, slugA: string, slugB: string): string {
  return `${origin}/wiki/arena?a=${encodeURIComponent(slugA)}&b=${encodeURIComponent(slugB)}`;
}

/* ---------- Torneo rápido (§5) ---------- */

export const TOURNAMENT_SIZE = 4;

/** `n` slugs distintos al azar (Fisher-Yates parcial). Con menos de `n` disponibles, todos barajados. */
export function drawEntrants(slugs: readonly string[], rng: Rng = Math.random, n: number = TOURNAMENT_SIZE): string[] {
  const pool = [...new Set(slugs)];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export interface TournamentMatch {
  /** «Semifinal 1», «Semifinal 2» o «Final». */
  label: string;
  a: string;
  b: string;
  result: BattleResult;
  /** Slug del ganador. */
  winner: string;
}

export interface TournamentResult {
  /** Semifinal 1, semifinal 2 y final, en el orden en que se juegan. */
  matches: [TournamentMatch, TournamentMatch, TournamentMatch];
  champion: string;
}

const playMatch = (label: string, a: BattleFighter, b: BattleFighter, options: SimulateOptions): TournamentMatch => {
  const result = simulateBattle(a, b, options);
  return { label, a: a.slug, b: b.slug, result, winner: result.winner === 'A' ? a.slug : b.slug };
};

/** Cuadro de cuatro: 1.º vs 2.º y 3.º vs 4.º en semifinales; la final entre sus ganadores (el de la 1.ª semifinal es A). */
export function runTournament(entrants: readonly BattleFighter[], options: SimulateOptions = {}): TournamentResult {
  if (entrants.length !== TOURNAMENT_SIZE || new Set(entrants.map((e) => e.slug)).size !== TOURNAMENT_SIZE) {
    throw new Error(`El torneo necesita ${TOURNAMENT_SIZE} combatientes distintos`);
  }
  const [p1, p2, p3, p4] = entrants;
  const semi1 = playMatch('Semifinal 1', p1, p2, options);
  const semi2 = playMatch('Semifinal 2', p3, p4, options);
  const bySlug = (slug: string) => entrants.find((e) => e.slug === slug) as BattleFighter;
  const final = playMatch('Final', bySlug(semi1.winner), bySlug(semi2.winner), options);
  return { matches: [semi1, semi2, final], champion: final.winner };
}

/* ---------- Predicciones (§2) ---------- */

/** Clave de `localStorage` de las predicciones. */
export const ARENA_STORAGE_KEY = 'wb-arena';

export interface PredictionStats {
  hits: number;
  total: number;
}

export const EMPTY_PREDICTIONS: PredictionStats = { hits: 0, total: 0 };

/** Tope de seguridad: un valor guardado mayor se considera corrupto. */
const MAX_PREDICTIONS = 1_000_000;

const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= MAX_PREDICTIONS;

/** Lee `{ hits, total }` guardado; cualquier cosa rara (JSON roto, negativos, aciertos > intentos) cuenta como vacío. */
export function parsePredictions(raw: string | null | undefined): PredictionStats {
  if (!raw) return EMPTY_PREDICTIONS;
  try {
    const data = JSON.parse(raw) as { hits?: unknown; total?: unknown } | null;
    if (!data || !isCount(data.hits) || !isCount(data.total) || data.hits > data.total) return EMPTY_PREDICTIONS;
    return { hits: data.hits, total: data.total };
  } catch {
    return EMPTY_PREDICTIONS;
  }
}

export const serializePredictions = (stats: PredictionStats): string =>
  JSON.stringify({ hits: stats.hits, total: stats.total });

export function recordPrediction(stats: PredictionStats, correct: boolean): PredictionStats {
  return { hits: stats.hits + (correct ? 1 : 0), total: stats.total + 1 };
}

/** «Tus predicciones: 7/10». */
export const predictionsText = (stats: PredictionStats) => `Tus predicciones: ${stats.hits}/${stats.total}`;

/* ---------- Generador con semilla ---------- */

/** Mulberry32: generador determinista en [0, 1) para los tests (y para reproducir un combate). */
export function seededRng(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
