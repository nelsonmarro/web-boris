'use client';

import { useId, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { FIELD, HINT, SMALL_BUTTON } from './field-styles';

export interface ArticleOption {
  slug: string;
  title: string;
}

interface Props {
  slug: string;
  value: string[];
  options: ArticleOption[];
  onChange: (next: string[]) => void;
}

/** Fichas relacionadas, en el orden en que deben salir. Se eligen por su nombre. */
export function RelatedEditor({ slug, value, options, onChange, hint = 'Si no eliges ninguna, la web las calcula sola (por menciones, menú y categoría).', addLabel = 'Añadir ficha relacionada' }: Props & { hint?: string; addLabel?: string }) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const titleOf = (target: string) => options.find((option) => option.slug === target)?.title ?? target;
  const available = options.filter((option) => option.slug !== slug && !value.includes(option.slug));

  const add = () => {
    const wanted = query.trim().toLowerCase();
    const match = available.find((option) => option.title.toLowerCase() === wanted || option.slug === wanted);
    if (!match) return;
    onChange([...value, match.slug]);
    setQuery('');
  };
  const move = (index: number, delta: number) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {hint ? <p className={HINT}>{hint}</p> : null}
      {value.length > 0 ? (
        <ol className="space-y-2">
          {value.map((target, index) => (
            <li key={target} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/15 bg-[#061a2e] px-3 py-2">
              <span className="min-w-0 flex-1 text-white">
                {index + 1}. {titleOf(target)}
              </span>
              <button type="button" className={SMALL_BUTTON} disabled={index === 0} onClick={() => move(index, -1)}>
                <ArrowUp aria-hidden="true" className="size-4" />
                <span className="sr-only">Subir {titleOf(target)}</span>
              </button>
              <button type="button" className={SMALL_BUTTON} disabled={index === value.length - 1} onClick={() => move(index, 1)}>
                <ArrowDown aria-hidden="true" className="size-4" />
                <span className="sr-only">Bajar {titleOf(target)}</span>
              </button>
              <button type="button" className={SMALL_BUTTON} onClick={() => onChange(value.filter((item) => item !== target))}>
                <X aria-hidden="true" className="size-4" />
                <span className="sr-only">Quitar {titleOf(target)}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1 space-y-1">
          <span className="block text-sm font-bold text-white">{addLabel}</span>
          <input
            className={FIELD}
            list={listId}
            value={query}
            placeholder="Escribe el nombre y elígelo de la lista"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                add();
              }
            }}
          />
        </label>
        <datalist id={listId}>
          {available.map((option) => (
            <option key={option.slug} value={option.title} />
          ))}
        </datalist>
        <button type="button" className={SMALL_BUTTON} onClick={add}>
          <Plus aria-hidden="true" className="size-4" />
          Añadir
        </button>
      </div>
    </div>
  );
}
