'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/utils/cn';
import { PendingLabel } from '@/components/content/PendingLabel';
import { CategoryPlaceholder, coverOf } from '@/components/content/CategoryPlaceholder';
import { castVote, type CastVoteError } from '../actions/cast-vote';
import type { PollDef } from '../lib/poll-schedule';
import type { PollState } from '../types';

export interface PollFighter {
  slug: string;
  title: string;
  image?: string;
  imagePosition?: string;
  category?: string;
  /** `proximamente`: la ficha sigue sellada; si Boris ya la desclasificó viene sin estado. */
  status?: string;
}

const QUERY_KEY = ['comunidad', 'encuesta'] as const;

const ERROR_COPY: Record<CastVoteError, string> = {
  cerrada: 'La encuesta de esta semana cambió: ya puedes ver la nueva.',
  opcion: 'Esa opción no pertenece a esta votación.',
  limite: 'Se alcanzó el límite de votos desde esta red.',
  'no-disponible': 'Votación no disponible ahora.',
  invalido: 'No se pudo registrar el voto.',
};

async function fetchPollState(): Promise<PollState> {
  const res = await fetch('/api/comunidad/encuesta', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PollState;
}

/** `pending`: la ficha aún no está desclasificada; el retrato va apagado (en gris), como las tarjetas «Próximamente». */
function Portrait({ fighter, pending = false }: { fighter: PollFighter; pending?: boolean }) {
  const cover = coverOf(fighter.image);
  return (
    <div
      className={cn(
        'relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[#00122E]',
        pending && 'grayscale opacity-70',
      )}
    >
      {cover ? (
        <Image
          src={cover}
          alt=""
          fill
          sizes="(min-width: 768px) 300px, 40vw"
          className="object-cover"
          style={{ objectPosition: fighter.imagePosition ?? '50% 50%' }}
        />
      ) : (
        <CategoryPlaceholder category={fighter.category} className="[&_span]:hidden" />
      )}
    </div>
  );
}

export function PollTile({
  initialPoll,
  fighters,
}: {
  initialPoll: PollDef;
  fighters: Record<string, PollFighter>;
}) {
  const queryClient = useQueryClient();
  const { data: state, isError, fetchStatus } = useQuery({ queryKey: QUERY_KEY, queryFn: fetchPollState, staleTime: 30_000, retry: 1 });
  const [message, setMessage] = React.useState<string | null>(null);
  // Encuesta para la que se alcanzó el límite: si la semana cambia, la nueva no hereda los resultados.
  const [limitFor, setLimitFor] = React.useState<string | null>(null);

  const vote = useMutation({
    mutationFn: castVote,
    onSuccess: (result) => {
      if (result.state) queryClient.setQueryData(QUERY_KEY, result.state);
      if (result.ok) {
        setMessage(null);
        return;
      }
      setMessage(ERROR_COPY[result.error]);
      // Sin más votos desde esta red: se enseña el recuento en lugar de unos botones que ya no sirven.
      if (result.error === 'limite') setLimitFor(result.state?.poll?.id ?? null);
      if (result.error === 'cerrada') void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => setMessage(ERROR_COPY['no-disponible']),
  });

  const poll = state?.poll ?? initialPoll;
  const open = state?.status === 'open' ? state : null;
  const unavailable = isError || state?.status === 'unavailable';
  const sides = [poll.a, poll.b].map((slug) => fighters[slug] ?? { slug, title: slug });
  // El tipo de votación decide la composición (retratos sin «VS», sin enlace a la Arena); el estado real de cada
  // ficha decide la marca «Próximamente» y el gris: una ficha ya desclasificada se muestra como cualquier otra.
  const declassify = poll.tipo === 'desclasificar';
  const isPending = (f: PollFighter) => f.status === 'proximamente';
  // Antes de la primera respuesta los botones están desactivados: se dice por qué.
  // Sin conexión la consulta queda en pausa: no es una carga, es que no hay votación disponible.
  const paused = !state && fetchStatus === 'paused';
  const loading = !state && !isError && !paused;
  const showResults = !!open && (!!open.myOption || limitFor === open.poll.id);
  const status =
    message ?? (unavailable || paused ? ERROR_COPY['no-disponible'] : loading ? 'Cargando la votación…' : '');
  const headingId = React.useId();

  return (
    <section id="encuesta" aria-labelledby={headingId} className="crystal-surface flex scroll-mt-24 flex-col rounded-2xl p-6 md:p-8">
      <h2 id={headingId} className="section-title text-white">
        {poll.question}
      </h2>

      {declassify ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Portrait fighter={sides[0]} pending={isPending(sides[0])} />
          <Portrait fighter={sides[1]} pending={isPending(sides[1])} />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Portrait fighter={sides[0]} />
          <span className="font-display text-2xl font-black italic text-primary" aria-hidden>
            VS
          </span>
          <Portrait fighter={sides[1]} />
        </div>
      )}

      <div aria-live="polite" aria-busy={loading}>
        {showResults && open ? (
          <div className="mt-5">
            <ul className="space-y-3" aria-label="Resultados de la encuesta">
              {sides.map((f) => {
                const pct = open.percents[f.slug] ?? 0;
                const mine = open.myOption === f.slug;
                return (
                  <li key={f.slug}>
                    <div className="flex items-baseline justify-between gap-2 text-sm font-bold text-white">
                      <span>
                        {f.title}
                        {mine && <span className="ml-2 text-[11px] uppercase tracking-wider text-primary">Tu voto</span>}
                        {isPending(f) && <PendingLabel className="block" />}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn('h-full rounded-full transition-[width] duration-700', mine ? 'bg-primary' : 'bg-[#0064A0]')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-white/60">
              {open.total} {open.total === 1 ? 'voto' : 'votos'}
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {sides.map((f) => (
              <button
                key={f.slug}
                type="button"
                disabled={!open || vote.isPending}
                onClick={() => vote.mutate({ pollId: poll.id, option: f.slug })}
                className="min-h-12 rounded-xl border border-white/15 bg-[#00122E] px-3 py-2 text-[13px] font-bold uppercase tracking-wider text-white transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
              >
                {f.title}
                {isPending(f) && <PendingLabel className="mt-0.5 block" />}
              </button>
            ))}
          </div>
        )}

        <p className="mt-3 min-h-5 text-sm text-white/70">{status}</p>
      </div>

      {declassify ? (
        <div className="mt-auto flex flex-col gap-1 pt-3 text-[13px] text-white/60">
          <p>Tu voto es una señal para Boris, no una promesa de publicación.</p>
          <p>Tu voto es anónimo.</p>
        </div>
      ) : (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <Link
            href={`/wiki/arena?a=${poll.a}&b=${poll.b}` as Route}
            className="inline-flex min-h-11 items-center rounded-xl text-[11px] font-bold uppercase tracking-wider text-primary hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            Ver el duelo en la Arena
          </Link>
          <span className="text-[13px] text-white/60">Tu voto es anónimo.</span>
        </div>
      )}
    </section>
  );
}
