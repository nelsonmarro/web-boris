'use client';

import { useRef, useState } from 'react';
import { MediaPicker } from './MediaPicker';
import { FIELD, HINT, SMALL_BUTTON } from './field-styles';

interface Props {
  value: string;
  onChange: (next: string) => void;
}

interface Snippet {
  label: string;
  /** Texto que se inserta; `$` marca dónde va lo seleccionado (o el texto de ejemplo). */
  template: string;
  placeholder: string;
  block?: boolean;
}

const SNIPPETS: Snippet[] = [
  { label: 'Apartado', template: '## $', placeholder: 'Título del apartado', block: true },
  { label: 'Subapartado', template: '### $', placeholder: 'Título', block: true },
  { label: 'Negrita', template: '**$**', placeholder: 'texto' },
  { label: 'Cursiva', template: '_$_', placeholder: 'texto' },
  { label: 'Enlace a ficha', template: '[$](/wiki/direccion-de-la-ficha)', placeholder: 'texto del enlace' },
  { label: 'Imagen pendiente', template: '<WikiImage alt="$" caption="Pie de foto" />', placeholder: 'Qué mostrará la imagen', block: true },
  { label: 'Cita', template: '<WikiQuote author="Quién lo dice">\n$\n</WikiQuote>', placeholder: 'Texto de la cita', block: true },
  { label: 'Aviso', template: '<AbyssalAlert variant="warning" title="Título del aviso">\n$\n</AbyssalAlert>', placeholder: 'Texto del aviso', block: true },
  { label: 'Próximamente', template: '<Proximamente />$', placeholder: '', block: true },
];

/** Texto de la ficha (Markdown con los bloques de la wiki) y botones para insertar cada bloque donde está el cursor. */
export function BodyEditor({ value, onChange }: Props) {
  const area = useRef<HTMLTextAreaElement>(null);
  const [picking, setPicking] = useState(false);
  // Dónde estaba el cursor al abrir el selector (el diálogo se lleva el foco).
  const cursor = useRef<[number, number]>([0, 0]);

  const insert = (snippet: Snippet, at?: [number, number]) => {
    const textarea = area.current;
    if (!textarea) return;
    const [start, end] = at ?? [textarea.selectionStart, textarea.selectionEnd];
    const selected = value.slice(start, end) || snippet.placeholder;
    let text = snippet.template.replace('$', selected);
    // Un bloque va en su propio párrafo: línea en blanco antes y después.
    if (snippet.block) {
      const before = value.slice(0, start);
      const after = value.slice(end);
      text = `${before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : ''}${text}${after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n'}`;
    }
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    // Deja seleccionado lo insertado en lugar del ejemplo, para escribir encima.
    const selectFrom = start + text.indexOf(selected);
    requestAnimationFrame(() => {
      textarea.focus();
      if (selected) textarea.setSelectionRange(selectFrom, selectFrom + selected.length);
      else textarea.setSelectionRange(start + text.length, start + text.length);
    });
  };

  return (
    <div className="space-y-3">
      <div role="toolbar" aria-label="Insertar en el texto" className="flex flex-wrap gap-2">
        <button
          type="button"
          className={SMALL_BUTTON}
          onClick={() => {
            const textarea = area.current;
            // Se inserta tras la selección, sin reemplazarla: el texto alternativo sale de la imagen.
            cursor.current = textarea ? [textarea.selectionEnd, textarea.selectionEnd] : [value.length, value.length];
            setPicking(true);
          }}
        >
          Imagen
        </button>
        {SNIPPETS.map((snippet) => (
          <button key={snippet.label} type="button" className={SMALL_BUTTON} onClick={() => insert(snippet)}>
            {snippet.label}
          </button>
        ))}
      </div>
      <MediaPicker
        open={picking}
        onClose={() => setPicking(false)}
        onSelect={(image) => {
          setPicking(false);
          // Comillas fuera del texto alternativo: el atributo es literal y no puede romperse.
          const alt = image.alt.replace(/["<>{}]/g, '').trim() || 'Imagen';
          insert({ label: 'Imagen', template: `<WikiImage src="${image.path}" alt="$" caption="Pie de foto" align="right" />`, placeholder: alt, block: true }, cursor.current);
        }}
      />
      <label className="block space-y-1">
        <span className="block text-sm font-bold text-white">Texto de la ficha</span>
        <textarea
          ref={area}
          className={`${FIELD} min-h-[32rem] font-mono text-[15px] leading-relaxed`}
          value={value}
          spellCheck
          lang="es"
          aria-describedby="ayuda-texto"
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <p id="ayuda-texto" className={HINT}>
        Cada apartado empieza con «## » en su propia línea. Deja una línea en blanco entre párrafos. Un apartado sin información
        lleva el bloque «Próximamente». Las llaves {'{ }'} y las etiquetas que no son de la wiki no se permiten.
      </p>
    </div>
  );
}
