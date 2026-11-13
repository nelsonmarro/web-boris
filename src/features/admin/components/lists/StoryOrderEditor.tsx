'use client';

import { useState } from 'react';
import type { StoryOrderEntry } from '@/core/content/schemas';
import { ListShell } from './ListShell';
import { moved, RowControls } from './row-controls';
import { VideoPicker } from './VideoPicker';
import type { ListEditorProps } from './types';
import { useUndo } from '../UndoProvider';
import { FIELD, HINT, LABEL } from '../editor/field-styles';

type Draft = Record<string, { ids: string[]; nota: string }>;

/** Un universo sin vídeos no se guarda (la web mantiene su orden por fecha). */
const toValue = (universes: string[], draft: Draft): StoryOrderEntry[] =>
  universes
    .filter((universo) => draft[universo]?.ids.length)
    .map((universo) => ({ universo, ids: draft[universo].ids, ...(draft[universo].nota.trim() ? { nota: draft[universo].nota.trim() } : {}) }));

export function StoryOrderEditor({ path, token, initial, videos, universes }: ListEditorProps<StoryOrderEntry>) {
  const [draft, setDraft] = useState<Draft>(() =>
    Object.fromEntries(universes.map((universo) => {
      const entry = initial.find((e) => e.universo === universo);
      return [universo, { ids: [...(entry?.ids ?? [])], nota: entry?.nota ?? '' }];
    })),
  );
  const offerUndo = useUndo();
  const titleOf = (id: string) => videos.find((video) => video.id === id)?.titulo ?? id;
  const set = (universo: string, patch: Partial<Draft[string]>) => setDraft((current) => ({ ...current, [universo]: { ...current[universo], ...patch } }));
  const value = toValue(universes, draft);
  // Mismo orden que lo guardado, para no marcar «cambios» solo por el orden de los universos.
  const initialSorted = toValue(universes, Object.fromEntries(initial.map((e) => [e.universo, { ids: e.ids, nota: e.nota ?? '' }])));

  return (
    <ListShell listKey="storyOrder" path={path} token={token} initial={initialSorted} value={value}>
      <p className={HINT}>
        El orden en que recomiendas ver los vídeos de cada universo. Con una lista, la página de vídeos ofrece «Orden de la historia» y «Empieza
        aquí» propone el primero. Un universo sin vídeos mantiene el orden por fecha.
      </p>
      {universes.map((universo) => (
        <section key={universo} aria-labelledby={`orden-${universo}`} className="space-y-3 rounded-2xl border border-white/10 bg-[#061a2e]/60 p-5">
          <h2 id={`orden-${universo}`} className="text-xl font-bold text-white">
            {universo}
          </h2>
          {draft[universo].ids.length ? (
            <ol className="space-y-2">
              {draft[universo].ids.map((id, index, ids) => (
                <li key={id} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/15 bg-[#061a2e] px-3 py-2">
                  <span className="min-w-0 flex-1 text-white">
                    {index + 1}. {titleOf(id)}
                  </span>
                  <RowControls
                    index={index}
                    count={ids.length}
                    label={titleOf(id)}
                    onMove={(delta) => set(universo, { ids: moved(ids, index, delta) })}
                    onRemove={() => {
                      set(universo, { ids: ids.filter((item) => item !== id) });
                      offerUndo(`«${titleOf(id)}» quitado del orden.`, () => set(universo, { ids }));
                    }}
                  />
                </li>
              ))}
            </ol>
          ) : (
            <p className={HINT}>Sin orden propio.</p>
          )}
          <VideoPicker label="Añadir un vídeo al final" videos={videos} exclude={draft[universo].ids} onAdd={(id) => set(universo, { ids: [...draft[universo].ids, id] })} />
          <label className="block space-y-1">
            <span className={LABEL}>Nota (opcional)</span>
            <input className={FIELD} value={draft[universo].nota} maxLength={200} onChange={(event) => set(universo, { nota: event.target.value })} />
          </label>
        </section>
      ))}
    </ListShell>
  );
}
