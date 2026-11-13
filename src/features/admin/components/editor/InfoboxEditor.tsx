'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { InfoSectionForm } from './form-model';
import { DANGER_BUTTON, FIELD, HINT, SMALL_BUTTON } from './field-styles';
import { useUndo } from '../UndoProvider';

interface Props {
  value: InfoSectionForm[];
  onChange: (next: InfoSectionForm[]) => void;
}

/** Ficha lateral: secciones (p. ej. «Información Biológica») con pares dato / valor. */
export function InfoboxEditor({ value, onChange }: Props) {
  const offerUndo = useUndo();
  const update = (index: number, section: InfoSectionForm) => onChange(value.map((item, i) => (i === index ? section : item)));
  return (
    <div className="space-y-4">
      <p className={HINT}>
        «Universo», «Categoría» y, si está sellada, «Estado» se añaden solos en la sección «Expediente». Las filas sin dato o
        sin valor no se guardan.
      </p>
      {value.map((section, sectionIndex) => (
        <fieldset key={sectionIndex} className="space-y-3 rounded-xl border border-white/15 p-4">
          <legend className="sr-only">Sección {sectionIndex + 1}</legend>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-0 flex-1 space-y-1">
              <span className="block text-sm font-bold text-white">Título de la sección</span>
              <input
                className={FIELD}
                value={section.title}
                maxLength={80}
                placeholder="Información Biológica"
                onChange={(event) => update(sectionIndex, { ...section, title: event.target.value })}
              />
            </label>
            <button type="button" className={DANGER_BUTTON} onClick={() => {
                onChange(value.filter((_, i) => i !== sectionIndex));
                offerUndo(`Sección «${section.title || sectionIndex + 1}» quitada.`, () => onChange(value));
              }}
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Quitar sección<span className="sr-only"> {section.title}</span>
            </button>
          </div>
          <ul className="space-y-2">
            {section.rows.map((row, rowIndex) => (
              <li key={rowIndex} className="grid gap-2 @lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] @lg:items-center">
                <input
                  aria-label={`Dato ${rowIndex + 1} de ${section.title || 'la sección'}`}
                  className={FIELD}
                  value={row.key}
                  maxLength={80}
                  placeholder="Dato (p. ej. Longitud)"
                  onChange={(event) =>
                    update(sectionIndex, { ...section, rows: section.rows.map((r, i) => (i === rowIndex ? { ...r, key: event.target.value } : r)) })
                  }
                />
                <input
                  aria-label={`Valor de ${row.key || `el dato ${rowIndex + 1}`}`}
                  className={FIELD}
                  value={row.value}
                  maxLength={300}
                  placeholder="Valor (p. ej. 351 metros)"
                  onChange={(event) =>
                    update(sectionIndex, { ...section, rows: section.rows.map((r, i) => (i === rowIndex ? { ...r, value: event.target.value } : r)) })
                  }
                />
                <button
                  type="button"
                  className={DANGER_BUTTON}
                  onClick={() => update(sectionIndex, { ...section, rows: section.rows.filter((_, i) => i !== rowIndex) })}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  <span className="sr-only">Quitar el dato {row.key}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={SMALL_BUTTON} onClick={() => update(sectionIndex, { ...section, rows: [...section.rows, { key: '', value: '' }] })}>
            <Plus aria-hidden="true" className="size-4" />
            Añadir dato
          </button>
        </fieldset>
      ))}
      <button type="button" className={SMALL_BUTTON} onClick={() => onChange([...value, { title: '', rows: [{ key: '', value: '' }] }])}>
        <Plus aria-hidden="true" className="size-4" />
        Añadir sección
      </button>
    </div>
  );
}
