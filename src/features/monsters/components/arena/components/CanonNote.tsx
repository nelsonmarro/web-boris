import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { BookOpenText, ScrollText } from 'lucide-react';
import { cn } from '@/utils/cn';
import { canonHref, type CanonBattle, type CanonFact } from '@/features/monsters/config/canon-battles';

const LINK =
  'inline-flex min-h-11 items-center gap-1.5 rounded-sm text-[12px] font-bold uppercase tracking-wider transition-colors hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

interface CanonNoteProps {
  battle: CanonBattle | null;
  fact: CanonFact | null;
  /** Título de la ficha de un slug (para el enlace «Leer en la ficha de …»). */
  titleOf: (slug: string) => string | undefined;
}

/**
 * «Ocurrió en el canon» (la pareja se enfrentó en el lore: el resultado está fijado) o «Dato del archivo» (un dato
 * canónico de la pareja que no es un combate). Cita literal y enlace al apartado de la ficha.
 */
export function CanonNote({ battle, fact, titleOf }: CanonNoteProps) {
  const entry = battle ?? fact;
  if (!entry) return null;
  const isBattle = !!battle;
  const title = titleOf(entry.source.slug);

  return (
    <figure
      className={cn(
        'rounded-xl border px-4 py-3',
        isBattle ? 'border-primary/40 bg-primary/10' : 'border-cyan-400/30 bg-cyan-400/5',
      )}
    >
      <figcaption>
        <CanonBadge kind={isBattle ? 'battle' : 'fact'} />
      </figcaption>
      <blockquote className="mt-2 text-[15px] leading-relaxed text-white/85">«{entry.quote}»</blockquote>
      {isBattle && <p className="mt-1 text-sm text-white/70">El resultado de este combate está fijado: gana quien ganó en el canon.</p>}
      <Link href={canonHref(entry.source) as Route} className={cn(LINK, isBattle ? 'text-primary' : 'text-cyan-200')}>
        Leer en la ficha{title ? ` de ${title}` : ''} <span aria-hidden="true">›</span>
      </Link>
    </figure>
  );
}

/** Insignia compacta: también va en la tarjeta del resultado. */
export function CanonBadge({ kind }: { kind: 'battle' | 'fact' }) {
  const Icon = kind === 'battle' ? BookOpenText : ScrollText;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em]',
        kind === 'battle' ? 'border-primary/60 bg-[#00122E] text-primary' /* fondo sólido: el naranja sobre su propio tinte no llegaba a 4.5:1 */ : 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200',
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {kind === 'battle' ? 'Ocurrió en el canon' : 'Dato del archivo'}
    </span>
  );
}
