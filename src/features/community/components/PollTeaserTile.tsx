import { ArrowRight, Swords } from 'lucide-react';
import { CrystalTile } from '@/components/crystal';
import type { PollDef } from '../lib/poll-schedule';

interface PollTeaserTileProps {
  poll: PollDef | null;
  /** slug → título del artículo, para mostrar los nombres del duelo. */
  names: Record<string, string>;
  className?: string;
}

/** Duelo de la semana, estático: la votación vive en /comunidad. Sin encuesta no se pinta. */
export function PollTeaserTile({ poll, names, className }: PollTeaserTileProps) {
  if (!poll) return null;
  const a = names[poll.a] ?? poll.a;
  const b = names[poll.b] ?? poll.b;
  return (
    <CrystalTile
      href="/comunidad"
      eyebrow="Encuesta semanal"
      title={poll.question}
      titleSize="compact"
      icon={Swords}
      iconTone="cyan"
      className={className}
    >
      <p className="flex flex-wrap items-baseline gap-x-2 font-display text-lg font-black uppercase italic leading-tight text-white">
        <span>{a}</span>
        <span className="text-primary">vs</span>
        <span>{b}</span>
      </p>
      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-[11px] font-bold uppercase tracking-wider text-primary">
        Votar en Comunidad
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </CrystalTile>
  );
}
