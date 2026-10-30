import * as React from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/utils/cn';
import { isUpset, type BattleRound } from '@/features/monsters/lib/arena-battle';

interface RoundsBoardProps {
  rounds: readonly BattleRound[];
  /** Asaltos ya revelados (0-5). */
  revealed: number;
  nameA: string;
  nameB: string;
}

/**
 * Marcador A–B y los cinco asaltos. Todas las filas existen desde el primer momento (pendientes, «—»): al revelarlas
 * solo cambian opacidad y anchuras, sin mover nada de la página.
 */
export function RoundsBoard({ rounds, revealed, nameA, nameB }: RoundsBoardProps) {
  const shown = rounds.slice(0, revealed);
  const winsA = shown.filter((r) => r.winner === 'A').length;
  const winsB = shown.filter((r) => r.winner === 'B').length;

  return (
    <div className="space-y-3">
      <p className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <span className="min-w-0 break-words text-[12px] font-black uppercase tracking-wider text-primary">
          <span className="sr-only">Marcador: </span>
          {nameA}
        </span>
        <span className="font-mono text-3xl font-black tabular-nums text-white">
          {winsA}
          <span className="mx-1.5 text-white/40" aria-hidden="true">–</span>
          <span className="sr-only"> a </span>
          {winsB}
        </span>
        <span className="min-w-0 break-words text-right text-[12px] font-black uppercase tracking-wider text-cyan-300">{nameB}</span>
      </p>

      <ol className="space-y-2">
        {rounds.map((round, i) => {
          const isShown = i < revealed;
          // Valores reales del eje (0-100); el factor sorpresa solo decide quién gana el asalto.
          const [va, vb] = round.base;
          const total = va + vb;
          const pctA = isShown ? (total === 0 ? 50 : (va / total) * 100) : 0;
          const pctB = isShown ? 100 - pctA : 0;
          const winnerName = round.winner === 'A' ? nameA : round.winner === 'B' ? nameB : null;
          return (
            <li
              key={round.axis}
              className={cn(
                'rounded-xl border px-3 py-2.5 transition-[background-color,border-color] duration-300 motion-reduce:transition-none',
                !isShown && 'border-dashed border-white/10',
                isShown && 'bg-white/[0.03]',
                isShown && round.winner === 'A' && 'border-primary/40',
                isShown && round.winner === 'B' && 'border-cyan-400/40',
                isShown && !round.winner && 'border-white/20',
              )}
            >
              {/* En móvil, eje y resultado van siempre en dos líneas: la fila no cambia de alto al revelarse. */}
              <span className="flex flex-col gap-0.5 text-[11px] font-bold uppercase tracking-wider sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <span className="text-white/70">
                  {i + 1}. {round.axis}
                </span>
                <span
                  className={cn(
                    'min-w-0 truncate sm:text-right',
                    !isShown && 'text-white/60',
                    isShown && round.winner === 'A' && 'text-primary',
                    isShown && round.winner === 'B' && 'text-cyan-300',
                    isShown && !round.winner && 'text-white/80',
                  )}
                >
                  {!isShown ? 'Pendiente' : winnerName ? `Gana ${winnerName}` : 'Empate'}
                  {isShown && isUpset(round) && (
                    <>
                      <Zap className="ml-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
                      <span className="sr-only"> por sorpresa</span>
                    </>
                  )}
                </span>
              </span>
              <span className="mt-1.5 grid grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-center gap-2 font-mono text-sm font-bold tabular-nums">
                <span className="text-primary">{isShown ? Math.round(va) : '—'}</span>
                <span className="flex h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                  <span className="h-full bg-primary transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${pctA}%` }} />
                  <span className="ml-auto h-full bg-cyan-300 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${pctB}%` }} />
                </span>
                <span className="text-right text-cyan-300">{isShown ? Math.round(vb) : '—'}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
