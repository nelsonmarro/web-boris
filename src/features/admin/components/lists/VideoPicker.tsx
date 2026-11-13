'use client';

import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { youtubeIdFrom } from '../../lib/youtube-id';
import type { VideoChoice } from './types';
import { FIELD, HINT, SMALL_BUTTON } from '../editor/field-styles';

/** Campo para añadir un vídeo: por su título (lista del canal) o pegando el enlace de YouTube. */
export function VideoPicker({ videos, label, onAdd, exclude = [] }: { videos: VideoChoice[]; label: string; onAdd: (id: string) => void; exclude?: string[] }) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const add = () => {
    const text = query.trim();
    const byTitle = videos.find((video) => video.titulo.toLowerCase() === text.toLowerCase());
    const id = byTitle?.id ?? youtubeIdFrom(text);
    if (!id) return setError('Elige un vídeo de la lista o pega su enlace de YouTube.');
    if (exclude.includes(id)) return setError('Ese vídeo ya está.');
    setError('');
    setQuery('');
    onAdd(id);
  };
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1 space-y-1">
          <span className="block text-sm font-bold text-white">{label}</span>
          <input
            className={FIELD}
            list={listId}
            value={query}
            placeholder="Título del vídeo o enlace de YouTube"
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
          {videos.filter((video) => !exclude.includes(video.id)).map((video) => (
            <option key={video.id} value={video.titulo} />
          ))}
        </datalist>
        <button type="button" className={SMALL_BUTTON} onClick={add}>
          <Plus aria-hidden="true" className="size-4" />
          Añadir
        </button>
      </div>
      {error ? <p className="text-sm font-semibold text-red-300" role="alert">{error}</p> : null}
      <p className={HINT}>Si un vídeo nuevo no sale en la lista, pega su enlace.</p>
    </div>
  );
}
