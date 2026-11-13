'use client';

import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import type { NewsEntry } from '@/core/content/schemas';
import { newsId, NEWS_ID } from '@/core/content/lists';
import { ListShell } from './ListShell';
import { RowControls } from './row-controls';
import type { ListEditorProps } from './types';
import { FIELD, HINT, LABEL, SMALL_BUTTON } from '../editor/field-styles';

type Row = Omit<NewsEntry, 'id'> & { id?: string };

const today = () => new Date().toISOString().slice(0, 10);

/** El id se conserva mientras no cambie la fecha; si cambia o es nueva, se genera (sin repetir). */
function toValue(rows: Row[]): NewsEntry[] {
  const used = new Set<string>();
  return rows.map((row) => {
    let id = row.id && NEWS_ID.exec(row.id)?.[1] === row.fecha ? row.id : newsId(row.fecha, row.titulo);
    for (let n = 2; used.has(id); n += 1) id = `${newsId(row.fecha, row.titulo)}-${n}`;
    used.add(id);
    return { id, fecha: row.fecha, titulo: row.titulo.trim(), resumen: row.resumen.trim(), enlace: row.enlace.trim() };
  });
}

export function NewsEditor({ path, token, initial, articles }: ListEditorProps<NewsEntry>) {
  const listId = useId();
  const [rows, setRows] = useState<Row[]>(() => initial.map((entry) => ({ ...entry })));
  const update = (index: number, patch: Partial<Row>) => setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <ListShell listKey="news" path={path} token={token} initial={initial} value={toValue(rows)}>
      <p className={HINT}>Salen en Comunidad, la más reciente destacada. El enlace puede ser una ficha, una página de la web o un vídeo de YouTube.</p>
      <datalist id={listId}>
        {['/wiki', '/comunidad', '/videos', '/empieza-aqui', '/wiki/arena'].map((route) => (
          <option key={route} value={route} />
        ))}
        {articles.map((article) => (
          <option key={article.slug} value={`/wiki/${article.slug}`}>
            {article.title}
          </option>
        ))}
      </datalist>
      <button type="button" className={SMALL_BUTTON} onClick={() => setRows((current) => [{ fecha: today(), titulo: '', resumen: '', enlace: '' }, ...current])}>
        <Plus aria-hidden="true" className="size-4" />
        Nueva novedad
      </button>
      <ol className="space-y-4">
        {rows.map((row, index) => (
          <li key={row.id ?? `nueva-${index}`} className="space-y-3 rounded-2xl border border-white/10 bg-[#061a2e]/60 p-5">
            <div className="grid gap-3 @2xl:grid-cols-[12rem_minmax(0,1fr)]">
              <label className="block space-y-1">
                <span className={LABEL}>Fecha</span>
                <input type="date" className={FIELD} value={row.fecha} onChange={(event) => update(index, { fecha: event.target.value })} />
              </label>
              <label className="block space-y-1">
                <span className={LABEL}>Título</span>
                <input className={FIELD} value={row.titulo} maxLength={90} onChange={(event) => update(index, { titulo: event.target.value })} />
              </label>
            </div>
            <label className="block space-y-1">
              <span className={LABEL}>Resumen</span>
              <textarea className={`${FIELD} min-h-20`} value={row.resumen} maxLength={160} onChange={(event) => update(index, { resumen: event.target.value })} />
              <span className={`block ${HINT}`}>{row.resumen.length} / 160</span>
            </label>
            <label className="block space-y-1">
              <span className={LABEL}>Enlace</span>
              <input className={FIELD} list={listId} value={row.enlace} placeholder="/wiki/the-bloop o https://youtu.be/…" onChange={(event) => update(index, { enlace: event.target.value })} />
            </label>
            <RowControls index={index} count={rows.length} label={`la novedad «${row.titulo || index + 1}»`} onRemove={() => setRows((current) => current.filter((_, i) => i !== index))} />
          </li>
        ))}
      </ol>
    </ListShell>
  );
}
