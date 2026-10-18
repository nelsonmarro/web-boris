'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Swords } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CategoryPlaceholder, isBrandPlaceholder } from '@/features/monsters/components/wiki/CategoryPlaceholder';
import { castVote, type CastVoteError } from '../actions/cast-vote';
import type { PollDef } from '../lib/poll-schedule';
import type { PollState } from '../types';
import { CrystalTile } from './CrystalTile';

export interface PollFighter {
  slug: string;
  title: string;
  image?: string;
  imagePosition?: string;
  category?: string;
}

const QUERY_KEY = ['comunidad', 'encuesta'] as const;

const ERROR_COPY: Record<CastVoteError, string> = {
  cerrada: 'La encuesta de esta semana cambió: ya puedes ver la nueva.',
  opcion: 'Esa opción no pertenece a este duelo.',
  limite: 'Se alcanzó el límite de votos desde esta red.',
  'no-disponible': 'Votación no disponible ahora.',
  invalido: 'No se pudo registrar el voto.',
};

async function fetchPollState(): Promise<PollState> {
  const res = await fetch('/api/comunidad/encuesta', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PollState;
}

function Portrait({ fighter }: { fighter: PollFighter }) {
  const cover = fighter.image && !isBrandPlaceholder(fighter.image) ? fighter.image : undefined;
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[#00122E]">
      {cover ? (
        <Image
          src={cover}
          alt=""
          fill
          sizes="(min-width: 1024px) 160px, 40vw"
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
  className,
}: {
  initialPoll: PollDef;
  fighters: Record<string, PollFighter>;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const { data: state, isError } = useQuery({ queryKey: QUERY_KEY, queryFn: fetchPollState, staleTime: 30_000, retry: 1 });
  const [message, setMessage] = React.useState<string | null>(null);

  const vote = useMutation({
    mutationFn: castVote,
    onSuccess: (result) => {
      if (result.state) queryClient.setQueryData(QUERY_KEY, result.state);
      if (result.ok) {
        setMessage(null);
        return;
      }
      setMessage(ERROR_COPY[result.error]);
      if (result.error === 'cerrada') void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => setMessage(ERROR_COPY['no-disponible']),
  });

  const poll = state?.poll ?? initialPoll;
  const open = state?.status === 'open' ? state : null;
  const unavailable = isError || state?.status === 'unavailable';
  const sides = [poll.a, poll.b].map((slug) => fighters[slug] ?? { slug, title: slug });
  const showResults = !!open?.myOption;
  const status = message ?? (unavailable ? ERROR_COPY['no-disponible'] : '');

  return (
    <CrystalTile eyebrow="Encuesta semanal" title={poll.question} icon={Swords} className={className}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Portrait fighter={sides[0]} />
        <span className="font-display text-2xl font-black italic text-primary" aria-hidden>
          VS
        </span>
        <Portrait fighter={sides[1]} />
      </div>

      <div aria-live="polite">
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
              aria-pressed={open?.myOption === f.slug}
              onClick={() => vote.mutate({ pollId: poll.id, option: f.slug })}
              className="min-h-12 rounded-xl border border-white/15 bg-[#00122E] px-3 text-[13px] font-bold uppercase tracking-wider text-white transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {f.title}
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 min-h-5 text-sm text-white/70">{status}</p>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
        <Link
          href={`/wiki/arena?a=${poll.a}&b=${poll.b}` as Route}
          className="inline-flex min-h-11 items-center rounded-xl text-[11px] font-bold uppercase tracking-wider text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Ver el duelo en la Arena
        </Link>
        <span className="text-[13px] text-white/60">Tu voto es anónimo</span>
      </div>
    </CrystalTile>
  );
}
