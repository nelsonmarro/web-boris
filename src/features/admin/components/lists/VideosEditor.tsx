'use client';

import { useState } from 'react';
import type { VideoLink } from '@/core/content/schemas';
import { RelatedEditor } from '../editor/RelatedEditor';
import { ListShell } from './ListShell';
import { RowControls } from './row-controls';
import { VideoPicker } from './VideoPicker';
import type { ListEditorProps } from './types';
import { useUndo } from '../UndoProvider';
import { FIELD, HINT, LABEL } from '../editor/field-styles';

const toValue = (rows: VideoLink[]): VideoLink[] =>
  rows.map(({ id, fichas, titulo }) => ({ id, fichas, ...(titulo?.trim() ? { titulo: titulo.trim() } : {}) }));

export function VideosEditor({ path, token, initial, articles, videos }: ListEditorProps<VideoLink>) {
  const [rows, setRows] = useState<VideoLink[]>(() => initial.map((row) => ({ ...row, fichas: [...row.fichas] })));
  const update = (index: number, patch: Partial<VideoLink>) => setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const offerUndo = useUndo();
  const known = new Map(videos.map((video) => [video.id, video.titulo]));
  const options = articles.map(({ slug, title }) => ({ slug, title }));

  return (
    <ListShell listKey="videos" path={path} token={token} initial={initial} value={toValue(rows)}>
      <p className={HINT}>
        Qué fichas salen en cada vídeo («Aparece en» de la ficha). Las que el título del vídeo ya nombra se detectan solas: aquí solo
        hacen falta las demás.
      </p>
      <VideoPicker
        label="Añadir un vídeo"
        videos={videos}
        exclude={rows.map((row) => row.id)}
        onAdd={(id) => setRows((current) => [{ id, fichas: [], titulo: known.has(id) ? undefined : '' }, ...current])}
      />
      <ol className="space-y-4">
        {rows.map((row, index) => (
          <li key={row.id} className="space-y-3 rounded-2xl border border-white/10 bg-[#061a2e]/60 p-5">
            <p className="font-semibold text-white">
              {known.get(row.id) ?? row.titulo ?? row.id}
              <a href={`https://www.youtube.com/watch?v=${row.id}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm font-normal text-white/70 underline underline-offset-4 hover:text-primary">
                Ver en YouTube<span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            </p>
            {!known.has(row.id) ? (
              <label className="block space-y-1">
                <span className={LABEL}>Título del vídeo</span>
                <input className={FIELD} value={row.titulo ?? ''} maxLength={200} onChange={(event) => update(index, { titulo: event.target.value })} />
                <span className={`block ${HINT}`}>Este vídeo no está en la lista del canal: escribe su título tal como sale en YouTube.</span>
              </label>
            ) : null}
            <RelatedEditor slug="" value={row.fichas} options={options} hint="" addLabel="Añadir ficha que sale en el vídeo" onChange={(fichas) => update(index, { fichas })} />
            <RowControls index={index} count={rows.length} label={`el vídeo ${known.get(row.id) ?? row.id}`} onRemove={() => {
                const before = rows;
                setRows((current) => current.filter((_, i) => i !== index));
                offerUndo(`Vídeo «${known.get(row.id) ?? row.titulo ?? row.id}» quitado.`, () => setRows(before));
              }} />
          </li>
        ))}
      </ol>
    </ListShell>
  );
}
