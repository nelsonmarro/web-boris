import Link from 'next/link';
import type { Route } from 'next';
import { BLUE_WHALE_M, blueWhales } from '@/features/monsters/lib/scale';
import { barPercent, formatMeters, type SizeEntry } from '@/features/monsters/lib/size-references';
import { cn } from '@/utils/cn';
import { SizeThumb } from './SizeThumb';

const NAME_LINK =
  'rounded-sm font-display text-lg font-black uppercase italic leading-tight tracking-tight text-white underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

/** Ballenas azules con la misma cautela que el dato: con una cota inferior («más de 500 m»), «más de 16». */
function whalesNote(entry: SizeEntry): string | null {
  const whales = blueWhales(entry.meters);
  if (whales === null) return null;
  return entry.precision === 'atLeast' ? `más de ${Math.floor(entry.meters / BLUE_WHALE_M)} ballenas azules` : `≈ ${whales} ballenas azules`;
}

/** «Coloso · longitud · ≈ 23 ballenas azules» / «Referencia real · altura». */
function describe(entry: SizeEntry): string {
  if (entry.kind === 'real') return `Referencia real · ${entry.dimension}`;
  return [entry.category ?? 'Expediente', entry.dimension, whalesNote(entry)].filter(Boolean).join(' · ');
}

/**
 * Escala de tamaños por longitud (spec UX fase 2 §3). Es una lista ordenada con el nombre, qué mide y el valor en texto
 * tal como lo da la fuente («675 m», «≈ 300 m», «más de 500 m»): eso es lo que leen los lectores de pantalla. Las barras
 * son solo el dibujo de esos mismos valores (`aria-hidden`), proporcionales a la entrada más grande; la de una cota
 * inferior sigue en un degradado (puede ser más) y la de un valor aproximado acaba difuminada.
 */
export function SizeScale({ entries, labelledBy }: { entries: SizeEntry[]; labelledBy: string }) {
  const max = Math.max(...entries.map((e) => e.meters), 0);
  return (
    <ol aria-labelledby={labelledBy} className="space-y-2">
      {entries.map((entry) => {
        const real = entry.kind === 'real';
        return (
          <li
            key={entry.id}
            className={cn(
              'grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 rounded-xl border px-3 py-3 sm:grid-cols-[4rem_minmax(0,15rem)_minmax(0,1fr)] sm:px-4',
              real ? 'border-dashed border-sky-300/25 bg-sky-400/[0.04]' : 'border-white/10 bg-[#061a2e]',
            )}
          >
            <SizeThumb
              entry={entry}
              sizes="64px"
              className="row-span-2 aspect-square w-12 rounded-lg border border-white/10 sm:row-span-1 sm:w-16"
            />
            <div className="min-w-0">
              {entry.href ? (
                <Link href={entry.href as Route} className={NAME_LINK}>
                  {entry.name}
                </Link>
              ) : (
                <span className="font-display text-lg font-black uppercase italic leading-tight tracking-tight text-sky-100">
                  {entry.name}
                </span>
              )}
              <p className={cn('text-[12px] font-semibold', real ? 'text-sky-200/80' : 'text-white/60')}>{describe(entry)}</p>
            </div>
            <div className="col-start-2 flex min-w-0 items-center gap-3 sm:col-start-3">
              <div aria-hidden="true" className="flex h-3 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn(
                    'h-full shrink-0 rounded-full',
                    real
                      ? 'bg-[repeating-linear-gradient(135deg,rgb(125_211_252/0.75)_0_6px,rgb(125_211_252/0.4)_6px_12px)]'
                      : 'bg-gradient-to-r from-primary/60 to-primary shadow-[0_0_12px_rgba(255,115,0,0.35)]',
                    entry.precision === 'approx' && '[mask-image:linear-gradient(90deg,black_80%,transparent)]',
                    entry.precision === 'atLeast' && 'rounded-r-none',
                  )}
                  style={{ width: `${barPercent(entry.meters, max)}%` }}
                />
                {entry.precision === 'atLeast' && (
                  <div className="h-full w-[10%] shrink-0 rounded-r-full bg-gradient-to-r from-primary to-transparent" />
                )}
              </div>
              <span className="w-24 shrink-0 text-right text-[15px] font-bold tabular-nums leading-tight text-white sm:w-28 sm:text-base">
                {formatMeters(entry)}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
