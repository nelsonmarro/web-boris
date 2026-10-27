'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useQuery } from '@tanstack/react-query';
import { Section } from '@/components/content/Section';
import { PendingLabel } from '@/components/content/PendingLabel';
import { REGISTRO_ROUTE } from '@/core/search/wiki-routes';
import { FighterPortrait, type PollFighter } from './FighterPortrait';
import type { LastWeekResult, PalmaresEntry, PedidoEntry, PollHistory } from '../lib/poll-history';

type Fighters = Record<string, PollFighter>;

async function fetchHistory(): Promise<PollHistory> {
  const res = await fetch('/api/comunidad/historial', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PollHistory;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const TITLE_LINK =
  'inline-flex min-h-11 items-center break-words rounded-sm font-bold text-white transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

/** Retrato de 48 px de las listas; el icono del placeholder, a escala. */
const SMALL_PORTRAIT = 'w-12 shrink-0 rounded-xl [&_svg]:h-5 [&_svg]:w-5';

/**
 * Historial de la encuesta (spec 2026-10-27 §4): semana pasada, palmarés y expedientes más pedidos. Va bajo el
 * pliegue: mientras carga o si falla no pinta nada. Cada sección se omite si no tiene datos, y un slug que ya no
 * está en `fighters` (ficha renombrada o borrada) se omite.
 */
export function PollHistoryTiles({ fighters }: { fighters: Fighters }) {
  const { data } = useQuery({
    queryKey: ['comunidad', 'historial'],
    queryFn: fetchHistory,
    retry: 1,
    staleTime: 60_000,
  });
  if (!data) return null;
  return (
    <>
      {data.lastWeek && <LastWeek result={data.lastWeek} fighters={fighters} />}
      <Palmares entries={data.palmares} fighters={fighters} />
      <MasPedidos entries={data.masPedidos} fighters={fighters} />
    </>
  );
}

function LastWeek({ result, fighters }: { result: LastWeekResult; fighters: Fighters }) {
  const a = fighters[result.a];
  const b = fighters[result.b];
  if (!a || !b) return null;
  const declassify = result.tipo === 'desclasificar';
  const winner = result.winner ? fighters[result.winner] : undefined;
  const verdict = !winner
    ? 'Empate'
    : declassify
      ? `La comunidad pidió desclasificar ${winner.title} (${result.percents[winner.slug] ?? 0} %)`
      : `Ganó ${winner.title}`;

  return (
    <Section id="semana-pasada" title="Resultado de la semana pasada" contained={false}>
      <div className="crystal-surface rounded-2xl p-5 md:p-6">
        <ul className="grid grid-cols-2 gap-4">
          {[a, b].map((f) => (
            <li key={f.slug} className="flex min-w-0 flex-col gap-2">
              <FighterPortrait
                fighter={f}
                pending={declassify && f.status === 'proximamente'}
                sizes="96px"
                className="w-20 sm:w-24"
              />
              <span className="break-words font-bold text-white">{f.title}</span>
              <span className="font-display text-2xl font-black tabular-nums text-white">
                {result.percents[f.slug] ?? 0}%
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-lg font-bold text-white">{verdict}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/60">
          {plural(result.total, 'voto', 'votos')}
        </p>
      </div>
    </Section>
  );
}

function Palmares({ entries, fighters }: { entries: PalmaresEntry[]; fighters: Fighters }) {
  const rows = entries.filter((e) => fighters[e.slug]);
  if (rows.length === 0) return null;
  return (
    <Section id="palmares" title="Palmarés" contained={false}>
      <ol className="divide-y divide-white/10">
        {rows.map((e, i) => {
          const f = fighters[e.slug];
          return (
            <li key={e.slug} className="flex items-center gap-4 py-3">
              {/* El `ol` ya anuncia la posición a los lectores de pantalla. */}
              <span
                aria-hidden="true"
                className="w-6 shrink-0 text-right font-display text-xl font-black italic tabular-nums text-primary"
              >
                {i + 1}
              </span>
              <FighterPortrait fighter={f} sizes="48px" className={SMALL_PORTRAIT} />
              <div className="min-w-0 flex-1">
                <Link href={`/wiki/${f.slug}` as Route} className={TITLE_LINK}>
                  {f.title}
                </Link>
                <p className="text-[12px] text-white/55">
                  {plural(e.wins, 'victoria', 'victorias')} · {plural(e.duels, 'duelo', 'duelos')}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

function MasPedidos({ entries, fighters }: { entries: PedidoEntry[]; fighters: Fighters }) {
  const rows = entries.filter((e) => fighters[e.slug]);
  if (rows.length === 0) return null;
  return (
    <Section
      id="mas-pedidos"
      title="Expedientes más pedidos"
      action={{ href: REGISTRO_ROUTE, label: 'Ver el registro' }}
      contained={false}
    >
      <ol className="divide-y divide-white/10">
        {rows.map((e) => {
          const f = fighters[e.slug];
          const sealed = f.status === 'proximamente';
          return (
            <li key={e.slug} className="flex items-center gap-4 py-3">
              <FighterPortrait fighter={f} pending={sealed} sizes="48px" className={SMALL_PORTRAIT} />
              <div className="min-w-0 flex-1">
                <Link href={`/wiki/${f.slug}` as Route} className={TITLE_LINK}>
                  {f.title}
                </Link>
                <p className="text-[12px] text-white/55">{plural(e.votes, 'voto', 'votos')}</p>
              </div>
              {sealed && <PendingLabel className="shrink-0" />}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
