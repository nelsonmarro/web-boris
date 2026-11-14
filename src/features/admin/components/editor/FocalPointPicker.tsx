'use client';

import { formatPosition, parsePosition, type FocalPoint } from '../../lib/focal-point';
import { FIELD, HINT, LABEL, SMALL_BUTTON } from './field-styles';

interface Props {
  id?: string;
  src: string;
  /** Valor de `imagePosition` («50% 20%»; vacío = centrada). */
  value: string;
  onChange: (value: string) => void;
}

const PREVIEWS = [
  { label: 'Tarjeta', className: 'aspect-video w-36' },
  { label: 'Cabecera en el móvil', className: 'aspect-[16/10] w-36' },
  { label: 'Cabecera en el ordenador', className: 'aspect-[21/9] w-52' },
] as const;

/**
 * Encuadre de la portada (auditoría #20): se pulsa sobre la imagen el punto que debe quedar a la vista al recortarla, o
 * se ajusta con los deslizadores, y se ve cómo queda en la tarjeta y en la cabecera de la ficha.
 */
export function FocalPointPicker({ id, src, value, onChange }: Props) {
  const point = parsePosition(value);
  const position = point ? `${point.x}% ${point.y}%` : value;
  const set = (next: FocalPoint) => onChange(formatPosition(next));

  return (
    <div id={id} className="space-y-3">
      <div>
        <span className={LABEL}>Encuadre</span>
        <span className={`block ${HINT}`}>Pulsa sobre la imagen la parte que debe verse siempre (la cara, el cuerpo…). Las tarjetas y la cabecera recortan la portada.</span>
      </div>
      {point ? (
        <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-start">
          <div className="space-y-3">
            <button
              type="button"
              aria-label="Elegir el punto que debe verse (o usa los deslizadores)"
              className="relative block max-w-full cursor-crosshair overflow-hidden rounded-xl border border-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={(event) => {
                const box = event.currentTarget.getBoundingClientRect();
                // Con el teclado, el clic llega sin coordenadas: no se mueve el punto (para eso están los deslizadores).
                if (event.detail === 0) return;
                set({ x: ((event.clientX - box.left) / box.width) * 100, y: ((event.clientY - box.top) / box.height) * 100 });
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura del panel */}
              <img src={src} alt="" className="block max-h-72 w-auto max-w-full" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary/40 shadow-[0_0_0_2px_rgba(0,0,0,0.6)]"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              />
            </button>
            <div className="grid max-w-md gap-3 @md:grid-cols-2">
              {(['x', 'y'] as const).map((axis) => (
                <label key={axis} className="block space-y-1">
                  <span className="text-sm font-semibold text-white">
                    {axis === 'x' ? 'Horizontal' : 'Vertical'}: {point[axis]}%
                  </span>
                  <input type="range" min={0} max={100} step={1} value={point[axis]} className="w-full accent-[#FF7300]" onChange={(event) => set({ ...point, [axis]: Number(event.target.value) })} />
                </label>
              ))}
            </div>
            <button type="button" className={SMALL_BUTTON} disabled={!value} onClick={() => onChange('')}>
              Centrar
            </button>
          </div>
          <div className="flex flex-wrap gap-3 @3xl:flex-col">
            {PREVIEWS.map((preview) => (
              <figure key={preview.label} className="space-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element -- vista del recorte */}
                <img src={src} alt="" className={`${preview.className} rounded-lg border border-white/15 object-cover`} style={{ objectPosition: position }} />
                <figcaption className="text-xs text-white/70">{preview.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <input className={FIELD} value={value} maxLength={40} aria-label="Encuadre escrito a mano" onChange={(event) => onChange(event.target.value)} />
          <p className={HINT}>Este encuadre está escrito a mano y no se puede mostrar sobre la imagen. Pulsa «Centrar» para elegir uno nuevo.</p>
          <button type="button" className={SMALL_BUTTON} onClick={() => onChange('')}>
            Centrar
          </button>
        </div>
      )}
    </div>
  );
}
