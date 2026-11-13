'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { CuratedPoll } from '@/core/content/schemas';
import { addWeeks } from '@/core/content/iso-week';
import { ListShell } from './ListShell';
import { RowControls } from './row-controls';
import type { ListEditorProps } from './types';
import { useUndo } from '../UndoProvider';
import { WeekStartLocal } from '../LocalTime';
import { FIELD, HINT, LABEL, SMALL_BUTTON } from '../editor/field-styles';

interface Row {
  semana: string;
  tipo: 'duelo' | 'desclasificar';
  a: string;
  b: string;
  pregunta: string;
  /** Semana actual o pasada que ya estaba: no se puede tocar (sus votos van por su id). */
  locked: boolean;
}

const toValue = (rows: Row[]): CuratedPoll[] =>
  rows
    .map(({ semana, tipo, a, b, pregunta }) => ({ semana, tipo, a, b, ...(pregunta.trim() ? { pregunta: pregunta.trim() } : {}) }))
    .sort((x, y) => x.semana.localeCompare(y.semana));

const nextWeek = (week: string) => addWeeks(week, 1);

export function PollsEditor({ path, token, initial, articles, currentWeek }: ListEditorProps<CuratedPoll>) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((poll) => ({ semana: poll.semana, tipo: poll.tipo, a: poll.a, b: poll.b, pregunta: poll.pregunta ?? '', locked: poll.semana <= currentWeek })),
  );
  const offerUndo = useUndo();
  const update = (index: number, patch: Partial<Row>) => setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const latest = rows.reduce((max, row) => (row.semana > max ? row.semana : max), currentWeek);
  const titleOf = (slug: string) => articles.find((a) => a.slug === slug)?.title ?? slug;
  const sorted = rows.map((row, index) => ({ row, index })).sort((x, y) => y.row.semana.localeCompare(x.row.semana));

  return (
    <ListShell listKey="polls" path={path} token={token} initial={initial} value={toValue(rows)}>
      <p className={HINT}>
        Esta semana es la {currentWeek}. Las semanas sin votación elegida aquí rotan solas con duelos. Las votaciones que ya empezaron o
        terminaron no se pueden cambiar: sus votos dependen de ellas.
      </p>
      <button
        type="button"
        className={SMALL_BUTTON}
        onClick={() => setRows((current) => [...current, { semana: nextWeek(latest), tipo: 'duelo', a: '', b: '', pregunta: '', locked: false }])}
      >
        <Plus aria-hidden="true" className="size-4" />
        Nueva votación
      </button>
      <ol className="space-y-4">
        {sorted.map(({ row, index }) => {
          const options = articles.filter((article) => (row.tipo === 'duelo' ? article.fighter : article.sealed));
          return (
            <li key={`${row.semana}-${index}`} className="space-y-3 rounded-2xl border border-white/10 bg-[#061a2e]/60 p-5">
              {row.locked ? (
                <p className="text-white">
                  <strong>{row.semana}</strong> · {row.tipo === 'desclasificar' ? `Desclasificar: ${titleOf(row.a)} o ${titleOf(row.b)}` : `Duelo: ${titleOf(row.a)} contra ${titleOf(row.b)}`}
                  {row.pregunta ? ` — «${row.pregunta}»` : ''}
                  <span className={`block ${HINT}`}>{row.semana === currentWeek ? 'En curso esta semana' : 'Terminada'}: no se puede cambiar.</span>
                </p>
              ) : (
                <>
                  <div className="grid gap-3 @2xl:grid-cols-2">
                    <label className="block space-y-1">
                      <span className={LABEL}>Semana</span>
                      <input type="week" className={FIELD} value={row.semana} min={nextWeek(currentWeek)} onChange={(event) => update(index, { semana: event.target.value })} />
                      <span className={`block ${HINT}`}>Formato: {nextWeek(currentWeek)}. Empieza el lunes a las 00:00 UTC<WeekStartLocal />.</span>
                    </label>
                    <label className="block space-y-1">
                      <span className={LABEL}>Tipo</span>
                      <select className={FIELD} value={row.tipo} onChange={(event) => update(index, { tipo: event.target.value as Row['tipo'], a: '', b: '' })}>
                        <option value="duelo">Duelo (criaturas con datos de la Arena)</option>
                        <option value="desclasificar">Desclasificar (expedientes sellados)</option>
                      </select>
                    </label>
                    {(['a', 'b'] as const).map((side) => (
                      <label key={side} className="block space-y-1">
                        <span className={LABEL}>{side === 'a' ? 'Primera opción' : 'Segunda opción'}</span>
                        <select className={FIELD} value={row[side]} onChange={(event) => update(index, { [side]: event.target.value })}>
                          <option value="">Elige una ficha</option>
                          {options.map((article) => (
                            <option key={article.slug} value={article.slug}>
                              {article.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                  <label className="block space-y-1">
                    <span className={LABEL}>Pregunta (opcional)</span>
                    <input className={FIELD} value={row.pregunta} maxLength={80} placeholder="¿Quién ganaría?" onChange={(event) => update(index, { pregunta: event.target.value })} />
                  </label>
                  <RowControls index={index} count={rows.length} label={`la votación de ${row.semana}`} onRemove={() => {
                      const before = rows;
                      setRows((current) => current.filter((_, i) => i !== index));
                      offerUndo(`Votación de ${row.semana} quitada.`, () => setRows(before));
                    }} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </ListShell>
  );
}
