'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import type { ListKey } from '@/core/content/lists';
import { publishList, type ListActionResult } from '../../actions/lists';
import { FIELD } from '../editor/field-styles';

interface Props {
  listKey: ListKey;
  path: string;
  token: string;
  /** Lo que hay en la web (o la versión que se está recuperando), para saber si hay cambios. */
  initial: unknown[];
  value: unknown[];
  children: React.ReactNode;
}

/** Marco de los editores de listas: barra fija con «Publicar», nota del cambio, avisos y aviso al salir sin publicar. */
export function ListShell({ listKey, path, token, initial, value, children }: Props) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [result, setResult] = useState<ListActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(value) !== JSON.stringify(initial);

  useEffect(() => {
    if (!dirty) return;
    const onLeave = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [dirty]);

  const publish = () =>
    startTransition(async () => {
      // Fuera el aviso anterior: mientras se publica no debe verse un error que ya no vale.
      setResult(null);
      const res = await publishList(listKey, JSON.stringify(value), token, note);
      setResult(res);
      if (res.ok) router.replace(`${path}?publicada=1` as Route, { scroll: false });
    });

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 -mx-4 space-y-3 border-b border-white/10 bg-[#00122E] px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="min-w-0 basis-full text-sm text-white/80 @lg:basis-auto @lg:flex-1" aria-live="polite">
            {pending ? 'Publicando…' : dirty ? 'Hay cambios sin publicar.' : 'Sin cambios: es lo que ve la web.'}
          </p>
          <Button type="button" size="sm" disabled={pending || !dirty} onClick={publish}>
            Publicar
          </Button>
        </div>
        <div role="alert" aria-live="assertive">
          {result && !result.ok ? (
            <div className="max-h-[40vh] space-y-2 overflow-y-auto rounded-xl border border-red-400/40 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <p className="min-w-0 flex-1 font-semibold text-white">{result.message}</p>
                <button type="button" className="text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-primary" onClick={() => setResult(null)}>
                  Cerrar<span className="sr-only"> el aviso</span>
                </button>
              </div>
              {result.errors?.length ? (
                <ul className="list-disc space-y-1 pl-5 text-white/90">
                  {result.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <label className="flex max-w-xl flex-col gap-1 text-sm text-white/80 @lg:flex-row @lg:items-center @lg:gap-2">
        <span className="shrink-0">Nota del cambio (opcional):</span>
        <input className={`${FIELD} py-1.5`} value={note} maxLength={200} placeholder="p. ej. Añado la votación de diciembre" onChange={(event) => setNote(event.target.value)} />
      </label>
      {children}
    </div>
  );
}
