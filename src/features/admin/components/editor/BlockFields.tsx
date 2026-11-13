'use client';

import { useEffect, useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react';
import { ImageIcon, Plus, X } from 'lucide-react';
import { getAttr, imageAttrs, setAttr, type Attr, type Block } from '../../lib/body-blocks';
import { FIELD, HINT, LABEL, SMALL_BUTTON } from './field-styles';

function fit(element: HTMLTextAreaElement) {
  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight + 2}px`;
}

/** Caja de texto que crece con lo escrito: sin scroll propio dentro de la página (auditoría #26). */
export function AutoTextarea({ textareaRef, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { textareaRef?: React.RefObject<HTMLTextAreaElement | null> }) {
  const own = useRef<HTMLTextAreaElement>(null);
  const ref = textareaRef ?? own;
  useLayoutEffect(() => {
    if (ref.current) fit(ref.current);
  }, [props.value, ref]);
  // El texto se reparte en otras líneas si cambia el ancho (girar el móvil, abrir la vista previa al lado) o cuando
  // llega la fuente de la web, que ocupa distinto que la de reserva.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let width = element.clientWidth;
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
      if (element.clientWidth === width) return;
      width = element.clientWidth;
      fit(element);
    });
    observer?.observe(element);
    let alive = true;
    document.fonts?.ready.then(() => alive && fit(element));
    return () => {
      alive = false;
      observer?.disconnect();
    };
  }, [ref]);
  return <textarea ref={ref} rows={2} className={`${FIELD} resize-none overflow-hidden ${className}`} {...props} />;
}

export const KIND_LABELS: Record<Block['kind'], string> = {
  text: 'Texto',
  subheading: 'Subapartado',
  image: 'Imagen',
  gallery: 'Galería',
  quote: 'Cita',
  alert: 'Aviso',
  proximamente: 'Próximamente',
  raw: 'Bloque especial',
};

const ALIGN_OPTIONS = [
  ['right', 'A la derecha del texto'],
  ['left', 'A la izquierda del texto'],
  ['center', 'Centrada'],
  ['none', 'A todo el ancho'],
] as const;

const ALERT_OPTIONS = [
  ['info', 'Información'],
  ['warning', 'Advertencia'],
  ['danger', 'Peligro'],
  ['classified', 'Clasificado'],
] as const;

function Thumb({ src, small }: { src: string; small?: boolean }) {
  const size = small ? 'w-28' : 'w-full @2xl:w-48';
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- miniatura del panel
    <img src={src} alt="" className={`aspect-video ${size} shrink-0 rounded-lg border border-white/15 object-cover`} />
  ) : (
    <div className={`flex aspect-video ${size} shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/30 text-sm text-white/60`}>
      <ImageIcon aria-hidden="true" className="size-5" />
      Imagen pendiente
    </div>
  );
}

function Input({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; hint?: string }) {
  return (
    <label className="block space-y-1">
      <span className={LABEL}>{label}</span>
      <input className={FIELD} value={value} maxLength={300} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      {hint ? <span className={`block ${HINT}`}>{hint}</span> : null}
    </label>
  );
}

interface Props {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
  /** Abre el selector de imágenes para este bloque (`index`: imagen de la galería que se cambia; sin él, se añade). */
  onPickImage: (index?: number) => void;
  /** «Enlace a ficha» en un bloque de texto: abre el buscador de fichas para esta caja. */
  onLink: (textarea: HTMLTextAreaElement) => void;
}

function TextFields({ block, onChange, onLink }: Props & { block: Extract<Block, { kind: 'text' }> }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  /** Rodea lo seleccionado con `mark` (o un texto de ejemplo) y deja seleccionado el texto marcado. */
  const format = (mark: string, sample: string) => {
    const textarea = ref.current;
    if (!textarea) return;
    const { value, selectionStart: start, selectionEnd: end } = textarea;
    const selected = value.slice(start, end) || sample;
    onChange({ text: value.slice(0, start) + mark + selected + mark + value.slice(end) });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + mark.length, start + mark.length + selected.length);
    });
  };
  return (
    <div className="space-y-2">
      <div role="toolbar" aria-label="Formato del texto" className="flex flex-wrap gap-2">
        <button type="button" className={`${SMALL_BUTTON} font-bold`} onClick={() => format('**', 'texto en negrita')}>
          Negrita
        </button>
        <button type="button" className={`${SMALL_BUTTON} italic`} onClick={() => format('_', 'texto en cursiva')}>
          Cursiva
        </button>
        <button type="button" className={SMALL_BUTTON} onClick={() => ref.current && onLink(ref.current)}>
          Enlace a ficha
        </button>
      </div>
      <AutoTextarea
        textareaRef={ref}
        aria-label="Texto"
        className="min-h-24 text-[16px] leading-relaxed"
        value={block.text}
        spellCheck
        lang="es"
        placeholder="Escribe aquí. Deja una línea en blanco entre párrafos."
        onChange={(event) => onChange({ text: event.target.value })}
      />
    </div>
  );
}

function ImageFields({ attrs, onAttrs, onPick, onRemove, small }: { attrs: Attr[]; onAttrs: (attrs: Attr[]) => void; onPick: () => void; onRemove?: () => void; small?: boolean }) {
  const src = getAttr(attrs, 'src');
  return (
    <div className="flex flex-col gap-3 @2xl:flex-row">
      <div className="space-y-2">
        <Thumb src={src} small={small} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={SMALL_BUTTON} onClick={onPick}>
            {src ? 'Cambiar' : 'Elegir imagen'}
          </button>
          {src && !small ? (
            <button type="button" className={SMALL_BUTTON} onClick={() => onAttrs(imageAttrs(attrs, { src: '' }))}>
              Dejar pendiente
            </button>
          ) : null}
          {onRemove ? (
            <button type="button" className={SMALL_BUTTON} onClick={onRemove}>
              <X aria-hidden="true" className="size-4" />
              <span className="sr-only">Quitar esta imagen de la galería</span>
            </button>
          ) : null}
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <Input
          label="Descripción"
          value={getAttr(attrs, 'alt')}
          placeholder="Qué se ve en la imagen"
          hint={small ? undefined : 'La leen quienes no pueden verla y los buscadores.'}
          onChange={(value) => onAttrs(imageAttrs(attrs, { alt: value }))}
        />
        <Input label="Pie de foto" value={getAttr(attrs, 'caption')} onChange={(value) => onAttrs(imageAttrs(attrs, { caption: value }))} />
        {!small ? (
          <label className="block space-y-1">
            <span className={LABEL}>Posición</span>
            <select className={FIELD} value={getAttr(attrs, 'align') || 'none'} onChange={(event) => onAttrs(imageAttrs(attrs, { align: event.target.value === 'none' ? '' : event.target.value }))}>
              {ALIGN_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </div>
  );
}

/** Los campos de un bloque, según su tipo, sin etiquetas de código a la vista (salvo el bloque especial). */
export function BlockFields(props: Props) {
  const { block, onChange, onPickImage } = props;
  switch (block.kind) {
    case 'text':
      return <TextFields {...props} block={block} />;
    case 'subheading':
      return <Input label="Título del subapartado" value={block.title} onChange={(title) => onChange({ title })} />;
    case 'image':
      return <ImageFields attrs={block.attrs} onAttrs={(attrs) => onChange({ attrs })} onPick={() => onPickImage()} />;
    case 'gallery':
      return (
        <div className="space-y-3">
          {block.images.length === 0 ? <p className={HINT}>La galería aún no tiene imágenes.</p> : null}
          <ul className="space-y-3">
            {block.images.map((image, index) => (
              <li key={index} className="rounded-lg border border-white/10 p-3">
                <ImageFields
                  small
                  attrs={image}
                  onPick={() => onPickImage(index)}
                  onAttrs={(attrs) => onChange({ images: block.images.map((item, i) => (i === index ? attrs : item)) })}
                  onRemove={() => onChange({ images: block.images.filter((_, i) => i !== index) })}
                />
              </li>
            ))}
          </ul>
          <button type="button" className={SMALL_BUTTON} onClick={() => onPickImage()}>
            <Plus aria-hidden="true" className="size-4" />
            Añadir imagen a la galería
          </button>
        </div>
      );
    case 'quote':
      return (
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className={LABEL}>Cita</span>
            <AutoTextarea className="text-[16px] italic leading-relaxed" value={block.text} onChange={(event) => onChange({ text: event.target.value })} />
          </label>
          <div className="grid gap-3 @2xl:grid-cols-2">
            <Input label="Quién lo dice" value={getAttr(block.attrs, 'author')} onChange={(value) => onChange({ attrs: setAttr(block.attrs, 'author', value) })} />
            <Input label="Fuente (opcional)" value={getAttr(block.attrs, 'source')} placeholder="p. ej. el vídeo donde lo dice" onChange={(value) => onChange({ attrs: setAttr(block.attrs, 'source', value) })} />
          </div>
        </div>
      );
    case 'alert':
      return (
        <div className="space-y-3">
          <div className="grid gap-3 @2xl:grid-cols-[14rem_minmax(0,1fr)]">
            <label className="block space-y-1">
              <span className={LABEL}>Tipo</span>
              <select className={FIELD} value={getAttr(block.attrs, 'variant') || 'info'} onChange={(event) => onChange({ attrs: setAttr(block.attrs, 'variant', event.target.value) })}>
                {ALERT_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Input label="Título del aviso" value={getAttr(block.attrs, 'title')} onChange={(value) => onChange({ attrs: setAttr(block.attrs, 'title', value) })} />
          </div>
          <label className="block space-y-1">
            <span className={LABEL}>Texto del aviso</span>
            <AutoTextarea className="text-[16px] leading-relaxed" value={block.text} onChange={(event) => onChange({ text: event.target.value })} />
          </label>
        </div>
      );
    case 'proximamente':
      return <p className="text-white/80">La web muestra «Próximamente» en este lugar: todavía no hay información que contar.</p>;
    case 'raw':
      return (
        <div className="space-y-1">
          <AutoTextarea aria-label="Bloque especial" className="font-mono text-[14px] leading-relaxed" value={block.text} spellCheck={false} onChange={(event) => onChange({ text: event.target.value })} />
          <p className={HINT}>Un bloque especial de la wiki (escrito como código). Cámbialo con cuidado o pídele ayuda a Nelson.</p>
        </div>
      );
  }
}
