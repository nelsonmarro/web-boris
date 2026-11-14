'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Plus } from 'lucide-react';
import { addArticleToMenu, type ListActionResult } from '../../actions/lists';
import { FIELD, HINT, LABEL, SMALL_BUTTON } from './field-styles';

interface Props {
  slug: string;
  /** Sitios del menú donde puede ir (clave del camino y nombre «Universo › Grupo»). */
  destinations: { key: string; label: string }[];
  /** El sitio sugerido según su categoría y universo. */
  suggested: string | null;
  /** Marca de concurrencia del menú. */
  token: string;
}

/** Aviso en una ficha que se ve en la web pero no sale en el menú lateral, con «¿Dónde va?» ya sugerido. */
export function AddToMenu({ slug, destinations, suggested, token }: Props) {
  const router = useRouter();
  const [target, setTarget] = useState(suggested ?? '');
  const [result, setResult] = useState<ListActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const add = () =>
    startTransition(async () => {
      setResult(null);
      const res = await addArticleToMenu(slug, target, token);
      setResult(res);
      // Recarga los datos de la página (el aviso desaparece) sin tocar lo que haya sin guardar en el editor.
      if (res.ok) router.replace(`/admin/fichas/${slug}?menu=1` as Route, { scroll: false });
    });

  return (
    <section aria-labelledby="sin-menu" className="space-y-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 @2xl:p-5">
      <h2 id="sin-menu" className="text-lg font-bold text-white">
        Esta ficha no sale en el menú lateral
      </h2>
      <p className={HINT}>Se ve en la web y en la búsqueda, pero no en el menú de la wiki ni en «Anterior / Siguiente».</p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 basis-64 space-y-1">
          <span className={LABEL}>¿Dónde va?</span>
          <select className={FIELD} value={target} onChange={(event) => setTarget(event.target.value)}>
            <option value="">Elige dónde</option>
            {destinations.map((destination) => (
              <option key={destination.key} value={destination.key}>
                {destination.label}
                {destination.key === suggested ? ' (sugerido)' : ''}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={SMALL_BUTTON} disabled={!target || pending} onClick={add}>
          <Plus aria-hidden="true" className="size-4" />
          {pending ? 'Añadiendo…' : 'Añadir al menú'}
        </button>
      </div>
      <div role="alert" aria-live="assertive">
        {result && !result.ok ? (
          <div className="space-y-1 text-white">
            <p className="font-semibold">{result.message}</p>
            {result.errors?.length ? (
              <ul className="list-disc pl-5">
                {result.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
