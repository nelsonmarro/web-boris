'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Check, Share2, X } from 'lucide-react';
import { formatSize, type SizeEntry } from '@/features/monsters/lib/size-references';
import {
  SHARE_MILESTONES,
  TAMANOS_STORAGE_KEY,
  biggerOf,
  differenceText,
  isCorrect,
  measuresText,
  nextPair,
  pairKey,
  parseBest,
  parseReto,
  retoOutcome,
  serializeBest,
  shareMessage,
  validPairs,
  type Pair,
} from '@/features/monsters/lib/size-game';
import { cn } from '@/utils/cn';
import { SizeThumb } from './SizeThumb';

/* ---------- Mejor racha: `localStorage` (clave `wb-tamanos`), a prueba de fallos ---------- */

const listeners = new Set<() => void>();
/** Sin almacenamiento (modo privado, datos bloqueados) la mejor racha vive en memoria hasta cerrar la pestaña. */
let memoryBest = 0;

function readBest(): number {
  let stored = 0;
  try {
    stored = parseBest(localStorage.getItem(TAMANOS_STORAGE_KEY));
  } catch {
    /* sin acceso: solo memoria */
  }
  return Math.max(stored, memoryBest);
}

function writeBest(best: number) {
  memoryBest = Math.max(memoryBest, best);
  try {
    localStorage.setItem(TAMANOS_STORAGE_KEY, serializeBest(best));
  } catch {
    /* sin espacio o sin permiso: se ignora */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === TAMANOS_STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** `null` en el servidor y durante la hidratación (estado neutro, «—»); el valor guardado justo después. */
function useBestStreak(): number | null {
  return React.useSyncExternalStore<number | null>(subscribe, readBest, () => null);
}

const noopSubscribe = () => () => {};
const useHydrated = () => React.useSyncExternalStore(noopSubscribe, () => true, () => false);

/**
 * `?reto=N` de un enlace compartido. Se lee en el navegador (la página sigue siendo estática: nada de `searchParams` en
 * el servidor); `null` en el servidor, en la hidratación y si el parámetro no es válido.
 */
function readReto(): number | null {
  try {
    return parseReto(new URLSearchParams(window.location.search).get('reto'));
  } catch {
    return null;
  }
}
const useReto = () => React.useSyncExternalStore<number | null>(noopSubscribe, readReto, () => null);

/* ---------- Juego ---------- */

type Phase = 'intro' | 'playing' | 'revealed' | 'over' | 'complete';

interface GameState {
  phase: Phase;
  pair: Pair | null;
  chosen: string | null;
  streak: number;
  /** Aciertos (`true`) y el fallo (`false`) en orden: la fila de cuadrados al compartir. */
  answers: boolean[];
  /** Parejas que ya han salido en la partida (`pairKey`): no se repite ninguna. */
  used: string[];
  /** Mejor racha antes de esta partida: decide «¡Nueva mejor racha!». */
  previousBest: number;
}

const INITIAL: GameState = { phase: 'intro', pair: null, chosen: null, streak: 0, answers: [], used: [], previousBest: 0 };

type ShareStatus = { kind: 'idle' } | { kind: 'copied' } | { kind: 'manual'; text: string };

const PRIMARY =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[12px] font-bold uppercase tracking-wider text-[#00122E] transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#061a2e] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none';
const SECONDARY =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary/10 px-5 text-[12px] font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-[#00122E] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';
const TEXT_LINK =
  'inline-flex min-h-11 items-center gap-1.5 rounded-sm text-[12px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

const kindLabel = (entry: SizeEntry) => (entry.kind === 'real' ? 'Referencia real' : (entry.category ?? 'Expediente'));

export function SizeGame({ entries }: { entries: SizeEntry[] }) {
  const best = useBestStreak();
  const hydrated = useHydrated();
  const reto = useReto();
  const total = React.useMemo(() => validPairs(entries).length, [entries]);
  const [state, setState] = React.useState<GameState>(INITIAL);
  const [shareStatus, setShareStatus] = React.useState<ShareStatus>({ kind: 'idle' });

  const firstChoiceRef = React.useRef<HTMLButtonElement>(null);
  const nextRef = React.useRef<HTMLButtonElement>(null);
  const endRef = React.useRef<HTMLHeadingElement>(null);

  // El botón pulsado desaparece al revelar: el foco va a la siguiente acción (teclado y lector de pantalla).
  const focusTarget = React.useRef<'choice' | 'next' | 'end' | null>(null);
  React.useEffect(() => {
    const target = focusTarget.current;
    focusTarget.current = null;
    if (target === 'choice') firstChoiceRef.current?.focus();
    else if (target === 'next') nextRef.current?.focus();
    else if (target === 'end') endRef.current?.focus();
  }, [state.phase, state.pair]);

  const start = () => {
    const pair = nextPair(entries);
    focusTarget.current = 'choice';
    setShareStatus({ kind: 'idle' });
    setState({
      phase: 'playing',
      pair,
      chosen: null,
      streak: 0,
      answers: [],
      used: pair ? [pairKey(pair[0], pair[1])] : [],
      previousBest: readBest(),
    });
  };

  const choose = (id: string) => {
    if (state.phase !== 'playing' || !state.pair) return;
    setShareStatus({ kind: 'idle' });
    if (isCorrect(state.pair, id)) {
      const streak = state.streak + 1;
      // Ya han salido todas las parejas posibles: partida perfecta.
      const complete = state.used.length >= total;
      if (complete && streak > state.previousBest) writeBest(streak);
      focusTarget.current = complete ? 'end' : 'next';
      setState({ ...state, phase: complete ? 'complete' : 'revealed', chosen: id, streak, answers: [...state.answers, true] });
    } else {
      if (state.streak > state.previousBest) writeBest(state.streak);
      focusTarget.current = 'end';
      setState({ ...state, phase: 'over', chosen: id, answers: [...state.answers, false] });
    }
  };

  const next = () => {
    const pair = nextPair(entries, new Set(state.used));
    if (!pair) return; // no pasa: `choose` ya cierra la partida cuando no quedan parejas
    focusTarget.current = 'choice';
    setShareStatus({ kind: 'idle' });
    setState({ ...state, phase: 'playing', pair, chosen: null, used: [...state.used, pairKey(pair[0], pair[1])] });
  };

  const share = async () => {
    const msg = shareMessage(state.streak, state.answers, window.location.origin);
    const data = { title: '¿Quién mide más? | Wiki BorisaoBlois', text: msg.text, url: msg.url };
    if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        // Otro fallo: se intenta copiar.
      }
    }
    try {
      await navigator.clipboard.writeText(msg.full);
      setShareStatus({ kind: 'copied' });
    } catch {
      // Sin portapapeles: el texto queda a la vista para copiarlo a mano.
      setShareStatus({ kind: 'manual', text: msg.full });
    }
  };

  if (total === 0) {
    return <p className="text-white/70">Aún no hay suficientes medidas registradas para jugar.</p>;
  }

  const { phase, pair, chosen, streak } = state;
  const revealing = phase === 'revealed' || phase === 'over' || phase === 'complete';
  const ended = phase === 'over' || phase === 'complete';
  const newRecord = ended && streak > state.previousBest;
  const outcome = ended && reto !== null ? retoOutcome(streak, reto, phase === 'complete') : null;
  const milestone = phase === 'revealed' && SHARE_MILESTONES.includes(streak);

  const shareFeedback = (
    <div aria-live="polite" className="text-sm text-white/80">
      {shareStatus.kind === 'copied' && <p className="flex min-h-6 items-center gap-1.5"><Check className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Copiado</p>}
      {shareStatus.kind === 'manual' && (
        <label className="block space-y-2">
          <span className="block">No se pudo copiar. Selecciona el texto y cópialo:</span>
          <textarea
            readOnly
            value={shareStatus.text}
            rows={4}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full resize-none rounded-lg border border-white/15 bg-[#00122E] p-3 font-mono text-[13px] text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      {reto !== null && phase === 'intro' && (
        <p className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 font-semibold text-white">
          Te han retado: supera una racha de {reto}.
        </p>
      )}

      {/* Marcador: siempre visible. La mejor racha es «—» hasta leer el navegador (nunca en el servidor). */}
      <dl className="flex flex-wrap gap-x-8 gap-y-2">
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-wider text-white/60">Racha</dt>
          <dd className="text-2xl font-black tabular-nums text-white">{streak}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-wider text-white/60">Mejor racha</dt>
          <dd className="text-2xl font-black tabular-nums text-white">{best === null ? '—' : best}</dd>
        </div>
        {reto !== null && (
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-white/60">Reto</dt>
            <dd className="text-2xl font-black tabular-nums text-primary">{reto}</dd>
          </div>
        )}
      </dl>

      {phase === 'intro' && (
        <div className="crystal-surface space-y-4 rounded-2xl p-5 md:p-6">
          <p className="max-w-2xl text-white/80">
            Te mostramos dos: criaturas del archivo o referencias del mundo real. Elige la que mide más: la longitud de
            cada criatura frente a la longitud, la eslora o la altura de cada referencia. Cada acierto suma a tu racha; el
            primer fallo la termina.
          </p>
          <p className="text-sm text-white/60">Solo salen parejas con respuesta segura según los datos, y ninguna se repite.</p>
          <button type="button" onClick={start} disabled={!hydrated} className={PRIMARY}>
            Empezar
          </button>
        </div>
      )}

      {pair && phase !== 'intro' && (
        <fieldset className="min-w-0">
          <legend className="mb-4">
            <span className="block font-display text-2xl font-black uppercase italic tracking-tight text-white md:text-3xl">
              {revealing ? 'Resultado' : '¿Cuál mide más?'}
            </span>
            {!revealing && (
              <span className="mt-1 block text-sm text-white/60">(longitud; eslora o altura en las referencias reales)</span>
            )}
          </legend>
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {pair.map((entry, i) => (
              <ChoiceCard
                key={entry.id}
                entry={entry}
                buttonRef={i === 0 ? firstChoiceRef : undefined}
                revealing={revealing}
                isBigger={biggerOf(pair).id === entry.id}
                isChosen={chosen === entry.id}
                onChoose={() => choose(entry.id)}
              />
            ))}
          </div>
        </fieldset>
      )}

      {/* Resultado de cada elección: región viva siempre montada para que se anuncie. Las medidas se leen aquí y se ven en las tarjetas. */}
      <div aria-live="polite" className="min-h-6">
        {revealing && pair && (
          <p className={cn('font-semibold', phase === 'over' ? 'text-red-300' : 'text-emerald-300')}>
            {phase === 'over' ? 'Fallo. ' : '¡Correcto! '}
            <span className="sr-only">{measuresText(pair)}. </span>
            <span className="font-normal text-white/85">{differenceText(pair)}</span>
          </p>
        )}
      </div>

      {phase === 'revealed' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button ref={nextRef} type="button" onClick={next} className={PRIMARY}>
              Siguiente <span aria-hidden="true">›</span>
            </button>
            {/* En las rachas redondas, compartir sin cortar la partida. */}
            {milestone && (
              <button type="button" onClick={share} className={SECONDARY}>
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Compartir racha
              </button>
            )}
          </div>
          {milestone && shareFeedback}
        </div>
      )}

      {ended && (
        <div className="crystal-surface space-y-4 rounded-2xl p-5 md:p-6">
          <h2 ref={endRef} tabIndex={-1} className="font-display text-3xl font-black uppercase italic tracking-tight text-white outline-none md:text-4xl">
            {phase === 'complete' ? '¡Has acertado todas!' : `Racha: ${streak}`}
          </h2>
          {phase === 'complete' && (
            <p className="text-white/80">
              Racha de {streak}: todas las parejas posibles con los datos del archivo.
            </p>
          )}
          <p className="text-white/80">
            {newRecord ? <strong className="text-primary">¡Nueva mejor racha!</strong> : <>Mejor racha: {Math.max(best ?? 0, streak)}</>}
          </p>
          {outcome && (
            <p className="font-semibold text-white">
              {outcome.kind === 'beaten'
                ? `Has superado el reto de ${reto}.`
                : outcome.kind === 'maxed'
                  ? `Has acertado todas las parejas posibles: el reto de ${reto} no se podía superar.`
                  : `Te quedaste a ${outcome.missing} del reto.`}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={start} className={PRIMARY}>
              Jugar otra vez
            </button>
            {/* Sin aciertos no hay racha que compartir. */}
            {streak > 0 && (
              <button type="button" onClick={share} className={SECONDARY}>
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Compartir
              </button>
            )}
          </div>
          {shareFeedback}
        </div>
      )}

      {pair && revealing && (
        <ul className="flex flex-wrap gap-x-6">
          {pair
            .filter((e) => e.href)
            .map((e) => (
              <li key={e.id}>
                <Link href={e.href as Route} className={TEXT_LINK}>
                  Expediente de {e.name} <span aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

interface ChoiceCardProps {
  entry: SizeEntry;
  buttonRef?: React.Ref<HTMLButtonElement>;
  revealing: boolean;
  isBigger: boolean;
  isChosen: boolean;
  onChoose: () => void;
}

/**
 * Una opción. Mientras se juega es un botón (nombre: la entrada y su tipo, «Bogbo, Coloso»); al revelar pasa a ser
 * una tarjeta con su medida y la marca de la que mide más. La etiqueta «Referencia real» va siempre visible.
 */
function ChoiceCard({ entry, buttonRef, revealing, isBigger, isChosen, onChoose }: ChoiceCardProps) {
  const body = (
    <>
      <SizeThumb
        entry={entry}
        sizes="(min-width: 1024px) 384px, 50vw"
        className="aspect-[4/3] w-full md:aspect-[16/10]"
        iconClassName="max-h-16 max-w-16"
      />
      <span className="flex flex-1 flex-col gap-1 p-3 text-left md:p-5">
        <span className="break-words font-display text-base font-black uppercase italic leading-tight tracking-tight text-white hyphens-auto sm:text-lg md:text-2xl">
          {entry.name}
        </span>
        <span className="sr-only">, </span>
        <span
          className={cn(
            'text-[11px] font-bold uppercase tracking-wider',
            entry.kind === 'real' ? 'text-sky-200/90' : 'text-white/60',
          )}
        >
          {kindLabel(entry)}
        </span>
        {revealing && (
          <span className="mt-1 text-sm font-bold text-white motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
            {formatSize(entry)}
          </span>
        )}
      </span>
    </>
  );

  const frame = cn(
    'crystal-surface flex h-full min-w-0 flex-col overflow-hidden rounded-2xl',
    entry.kind === 'real' && 'border-dashed border-sky-300/30',
  );

  if (!revealing) {
    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={onChoose}
        className={cn(
          frame,
          'cursor-pointer text-left transition-[border-color,transform] duration-200 hover:border-primary/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none',
        )}
      >
        {body}
      </button>
    );
  }

  return (
    <div className={cn(frame, isBigger && 'border-emerald-400/60', isChosen && !isBigger && 'border-red-400/60')}>
      {body}
      <span className="flex flex-wrap items-center gap-x-1.5 px-3 pb-3 text-[12px] font-bold uppercase tracking-wider md:px-5 md:pb-5">
        {isBigger ? (
          <span className="flex items-center gap-1.5 text-emerald-300">
            <Check className="h-4 w-4" aria-hidden="true" /> Mide más
          </span>
        ) : isChosen ? (
          <span className="flex items-center gap-1.5 text-red-300">
            <X className="h-4 w-4" aria-hidden="true" /> Tu elección
          </span>
        ) : null}
        {isBigger && isChosen && <span className="text-white/60">· Tu elección</span>}
      </span>
    </div>
  );
}
