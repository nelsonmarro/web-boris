'use client';

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { DANGER_BUTTON, SMALL_BUTTON } from '../editor/field-styles';

/** Mueve el elemento `index` una posición (`delta` = −1 o 1). */
export function moved<T>(items: T[], index: number, delta: number): T[] {
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(index + delta, 0, item);
  return next;
}

/** Subir, bajar y quitar una fila. `label` nombra la fila para los lectores de pantalla. */
export function RowControls({ index, count, label, onMove, onRemove }: { index: number; count: number; label: string; onMove?: (delta: number) => void; onRemove: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {onMove ? (
        <>
          <button type="button" className={SMALL_BUTTON} disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowUp aria-hidden="true" className="size-4" />
            <span className="sr-only">Subir {label}</span>
          </button>
          <button type="button" className={SMALL_BUTTON} disabled={index === count - 1} onClick={() => onMove(1)}>
            <ArrowDown aria-hidden="true" className="size-4" />
            <span className="sr-only">Bajar {label}</span>
          </button>
        </>
      ) : null}
      <button type="button" className={DANGER_BUTTON} onClick={onRemove}>
        <Trash2 aria-hidden="true" className="size-4" />
        Quitar<span className="sr-only"> {label}</span>
      </button>
    </div>
  );
}
