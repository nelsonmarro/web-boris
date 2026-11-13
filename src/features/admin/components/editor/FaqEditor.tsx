'use client';

import { Plus, Trash2 } from 'lucide-react';
import { FAQ_MAX } from '@/core/types/wiki';
import type { FaqForm } from './form-model';
import { DANGER_BUTTON, FIELD, HINT, SMALL_BUTTON } from './field-styles';

interface Props {
  value: FaqForm[];
  onChange: (next: FaqForm[]) => void;
}

/** Preguntas frecuentes de la ficha (solo respuestas de Boris). */
export function FaqEditor({ value, onChange }: Props) {
  const update = (index: number, item: FaqForm) => onChange(value.map((current, i) => (i === index ? item : current)));
  return (
    <div className="space-y-4">
      <p className={HINT}>Salen al final de la ficha. Como mucho {FAQ_MAX}.</p>
      {value.map((item, index) => (
        <fieldset key={index} className="space-y-3 rounded-xl border border-white/15 p-4">
          <legend className="text-sm font-bold text-white/80">Pregunta {index + 1}</legend>
          <label className="block space-y-1">
            <span className="block text-sm font-bold text-white">Pregunta</span>
            <input className={FIELD} value={item.pregunta} maxLength={300} onChange={(event) => update(index, { ...item, pregunta: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="block text-sm font-bold text-white">Respuesta</span>
            <textarea className={`${FIELD} min-h-24`} value={item.respuesta} maxLength={3000} onChange={(event) => update(index, { ...item, respuesta: event.target.value })} />
          </label>
          <button type="button" className={DANGER_BUTTON} onClick={() => onChange(value.filter((_, i) => i !== index))}>
            <Trash2 aria-hidden="true" className="size-4" />
            Quitar la pregunta {index + 1}
          </button>
        </fieldset>
      ))}
      {value.length < FAQ_MAX ? (
        <button type="button" className={SMALL_BUTTON} onClick={() => onChange([...value, { pregunta: '', respuesta: '' }])}>
          <Plus aria-hidden="true" className="size-4" />
          Añadir pregunta
        </button>
      ) : null}
    </div>
  );
}
