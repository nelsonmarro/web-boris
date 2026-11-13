'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { searchArticles } from '../../lib/panel-search';
import type { ArticleOption } from './RelatedEditor';
import { FIELD, HINT, SMALL_BUTTON } from './field-styles';

interface Props {
  open: boolean;
  articles: ArticleOption[];
  onClose: () => void;
  onSelect: (article: ArticleOption) => void;
}

/** Elegir la ficha a la que enlazar, por su nombre (misma búsqueda que la wiki). */
export function ArticleLinkPicker({ open, articles, onClose, onSelect }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  const shown = searchArticles(articles, query).slice(0, 30);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="titulo-enlace"
      onClose={() => {
        setQuery('');
        onClose();
      }}
      className="m-auto w-[min(40rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] rounded-2xl border border-white/15 bg-[#00122E] p-0 text-white backdrop:bg-black/70"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <h2 id="titulo-enlace" className="min-w-0 flex-1 text-xl font-bold">
            Enlazar a una ficha
          </h2>
          <button type="button" className={SMALL_BUTTON} onClick={() => dialog.current?.close()}>
            <X aria-hidden="true" className="size-4" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>
        <div className="space-y-2 border-b border-white/10 p-4">
          <label className="block space-y-1">
            <span className="sr-only">Buscar ficha</span>
            <input
              className={FIELD}
              value={query}
              autoFocus
              placeholder="Nombre o apodo de la ficha"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && shown[0]) {
                  event.preventDefault();
                  onSelect(shown[0]);
                }
              }}
            />
          </label>
          <p role="status" className={HINT}>
            {shown.length ? 'Pulsa la ficha (o Intro para la primera). El texto seleccionado será el del enlace.' : 'Ninguna ficha coincide.'}
          </p>
        </div>
        <ul className="overflow-y-auto p-2" role="list">
          {shown.map((article) => (
            <li key={article.slug}>
              <button
                type="button"
                className="block min-h-11 w-full rounded-lg px-3 py-2 text-left hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={() => onSelect(article)}
              >
                <span className="block font-semibold text-white">{article.title}</span>
                <span className="block text-sm text-white/60">/wiki/{article.slug}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
