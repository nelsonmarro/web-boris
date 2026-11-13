'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import {
  addSection,
  blockAtLine,
  findBlock,
  imageAttrs,
  insertBlock,
  INTRO,
  isOnlyPending,
  markSectionPending,
  moveBlock,
  moveSection,
  newBlock,
  parseBody,
  removeBlock,
  removeSection,
  serializeBody,
  updateBlock,
  updateSectionTitle,
  type Attr,
  type Block,
  type BlockKind,
  type BodyDoc,
} from '../../lib/body-blocks';
import { useUndo } from '../UndoProvider';
import { BlockFields, KIND_LABELS } from './BlockFields';
import { BodyEditor } from './BodyEditor';
import { MediaPicker } from './MediaPicker';
import { ArticleLinkPicker } from './ArticleLinkPicker';
import type { ArticleOption } from './RelatedEditor';
import { DANGER_BUTTON, FIELD, HINT, LABEL, SMALL_BUTTON } from './field-styles';

/** Evento con el que el editor de la ficha pide ir a una línea del texto (un error de publicar). */
export const GO_TO_TEXT = 'panel:ir-al-texto';

interface Props {
  value: string;
  onChange: (next: string) => void;
  articles: ArticleOption[];
  invalid?: boolean;
}

const ADDABLE: BlockKind[] = ['text', 'subheading', 'image', 'gallery', 'quote', 'alert', 'proximamente'];
const domId = (id: string) => `bloque-${id}`;
const CONTROLS = 'input, textarea, select';

function focusBlock(id: string) {
  const element = document.getElementById(domId(id));
  if (!element) return;
  element.scrollIntoView({ block: 'center' });
  element.querySelector<HTMLElement>(CONTROLS)?.focus({ preventScroll: true });
}

function AddBlock({ onAdd }: { onAdd: (kind: BlockKind) => void }) {
  const [open, setOpen] = useState(false);
  return open ? (
    <div role="group" aria-label="Añadir un bloque" className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-white/20 p-3">
      <span className="text-sm font-semibold text-white/80">Añadir:</span>
      {ADDABLE.map((kind) => (
        <button
          key={kind}
          type="button"
          className={SMALL_BUTTON}
          onClick={() => {
            setOpen(false);
            onAdd(kind);
          }}
        >
          {KIND_LABELS[kind]}
        </button>
      ))}
      <button type="button" className="text-sm font-semibold text-white/70 underline underline-offset-4 hover:text-primary" onClick={() => setOpen(false)}>
        Cancelar
      </button>
    </div>
  ) : (
    <button type="button" className={SMALL_BUTTON} onClick={() => setOpen(true)}>
      <Plus aria-hidden="true" className="size-4" />
      Añadir texto, imagen, cita…
    </button>
  );
}

/**
 * El texto de la ficha por apartados (spec 2026-11-13-editor-por-apartados): cada `##` es una tarjeta con sus bloques
 * (texto, imágenes, citas, avisos…) sin etiquetas a la vista. «Texto completo» sigue mostrando el MDX en bruto.
 */
export function SectionsEditor({ value, onChange, articles, invalid }: Props) {
  const offerUndo = useUndo();
  const [doc, setDoc] = useState<BodyDoc | null>(() => parseBody(value));
  const [mode, setMode] = useState<'blocks' | 'raw'>(() => (doc ? 'blocks' : 'raw'));
  const [notice, setNotice] = useState(doc ? '' : 'El texto tiene un error y solo se puede editar como texto completo.');
  const [highlight, setHighlight] = useState('');
  // Selector de imágenes y de fichas: a qué bloque van.
  const [imageTarget, setImageTarget] = useState<{ id: string; index?: number } | null>(null);
  const linkTarget = useRef<{ id: string; textarea: HTMLTextAreaElement } | null>(null);
  const [linking, setLinking] = useState(false);
  const latest = useRef({ doc, mode });
  useEffect(() => {
    latest.current = { doc, mode };
  });

  const commit = (next: BodyDoc) => {
    setDoc(next);
    onChange(serializeBody(next));
  };
  const patchBlock = (id: string, patch: Partial<Block>) => doc && commit(updateBlock(doc, id, patch));

  const switchMode = (next: 'blocks' | 'raw') => {
    if (next === mode) return;
    if (next === 'blocks') {
      const parsed = parseBody(value);
      if (!parsed) {
        setNotice('No se puede mostrar por apartados: el texto tiene un error. Corrígelo aquí (revisa que cada etiqueta < > esté bien cerrada).');
        return;
      }
      setDoc(parsed);
    }
    setNotice('');
    setMode(next);
  };

  // Un error de publicar lleva a su bloque (o a su línea en el texto completo).
  useEffect(() => {
    const onGoTo = (event: Event) => {
      const line = (event as CustomEvent<{ line?: number }>).detail?.line;
      const { doc: current, mode: currentMode } = latest.current;
      if (currentMode === 'raw' || !current) {
        const area = document.getElementById('campo-content') as HTMLTextAreaElement | null;
        if (!area) return;
        area.scrollIntoView({ block: 'center' });
        area.focus({ preventScroll: true });
        if (line) {
          const lines = area.value.split('\n');
          const at = Math.min(line, lines.length);
          const startAt = lines.slice(0, at - 1).reduce((total, text) => total + text.length + 1, 0);
          area.setSelectionRange(startAt, startAt + lines[at - 1].length);
        }
        return;
      }
      const id = line ? blockAtLine(current, line) : null;
      if (id) {
        focusBlock(id);
        setHighlight(id);
        window.setTimeout(() => setHighlight((value) => (value === id ? '' : value)), 2500);
      } else document.getElementById('campo-content')?.scrollIntoView({ block: 'start' });
    };
    window.addEventListener(GO_TO_TEXT, onGoTo);
    return () => window.removeEventListener(GO_TO_TEXT, onGoTo);
  }, []);

  const renderBlock = (block: Block, index: number, count: number, isFirstContainer: boolean, isLastContainer: boolean) => (
    <li
      key={block.id}
      id={domId(block.id)}
      className={`space-y-3 rounded-xl border bg-[#061a2e] p-3 transition-shadow @2xl:p-4 motion-reduce:transition-none ${highlight === block.id ? 'border-primary ring-2 ring-primary' : 'border-white/10'}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1 text-xs font-bold uppercase tracking-wider text-white/60">{KIND_LABELS[block.kind]}</span>
        <button type="button" className={SMALL_BUTTON} disabled={index === 0 && isFirstContainer} onClick={() => doc && commit(moveBlock(doc, block.id, -1))}>
          <ArrowUp aria-hidden="true" className="size-4" />
          <span className="sr-only">Subir este bloque ({KIND_LABELS[block.kind]})</span>
        </button>
        <button type="button" className={SMALL_BUTTON} disabled={index === count - 1 && isLastContainer} onClick={() => doc && commit(moveBlock(doc, block.id, 1))}>
          <ArrowDown aria-hidden="true" className="size-4" />
          <span className="sr-only">Bajar este bloque ({KIND_LABELS[block.kind]})</span>
        </button>
        <button
          type="button"
          className={DANGER_BUTTON}
          onClick={() => {
            if (!doc) return;
            const before = doc;
            commit(removeBlock(doc, block.id));
            offerUndo(`${KIND_LABELS[block.kind]} quitado.`, () => commit(before));
          }}
        >
          <Trash2 aria-hidden="true" className="size-4" />
          <span className="sr-only">Quitar este bloque ({KIND_LABELS[block.kind]})</span>
        </button>
      </div>
      <BlockFields
        block={block}
        onChange={(patch) => patchBlock(block.id, patch)}
        onPickImage={(imageIndex) => setImageTarget({ id: block.id, index: imageIndex })}
        onLink={(textarea) => {
          linkTarget.current = { id: block.id, textarea };
          setLinking(true);
        }}
      />
    </li>
  );

  const add = (container: string, kind: BlockKind) => {
    if (!doc) return;
    const block = newBlock(kind);
    commit(insertBlock(doc, container, block));
    requestAnimationFrame(() => focusBlock(block.id));
    if (kind === 'image') setImageTarget({ id: block.id });
  };

  const sections = doc?.sections ?? [];
  const totalContainers = sections.length + 1;

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Cómo editar el texto" className="flex flex-wrap gap-2">
        {(
          [
            ['blocks', 'Por apartados'],
            ['raw', 'Texto completo (avanzado)'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} className={`${SMALL_BUTTON} ${mode === id ? 'border-primary text-primary' : ''}`} onClick={() => switchMode(id)}>
            {label}
          </button>
        ))}
      </div>
      {notice ? (
        <p role="alert" className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-white">
          {notice}
        </p>
      ) : null}

      {mode === 'raw' || !doc ? (
        <BodyEditor id="campo-content" invalid={invalid} articles={articles} value={value} onChange={onChange} />
      ) : (
        <div id="campo-content" className={`space-y-4 rounded-xl ${invalid ? 'outline-2 outline-offset-4 outline-red-400' : ''}`}>
          <nav aria-label="Apartados del texto" className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-white/80">Ir a:</span>
            {sections.map((section, index) => (
              <button key={section.id} type="button" className="rounded-md px-2 py-1 text-white/85 underline-offset-4 hover:text-primary hover:underline" onClick={() => focusBlock(section.id)}>
                {index + 1}. {section.title || 'Sin título'}
              </button>
            ))}
          </nav>
          <p className={HINT}>
            Escribe con normalidad. **Así** sale en negrita y _así_ en cursiva (o usa los botones). Deja una línea en blanco entre párrafos.
          </p>

          {doc.intro.length > 0 ? (
            <section aria-label="Introducción" className="space-y-3 rounded-2xl border border-white/15 p-3 @2xl:p-4">
              <h3 className="font-bold text-white">Introducción</h3>
              <p className={HINT}>Lo que va antes del primer apartado.</p>
              <ol className="space-y-3">{doc.intro.map((block, index) => renderBlock(block, index, doc.intro.length, true, totalContainers === 1))}</ol>
              <AddBlock onAdd={(kind) => add(INTRO, kind)} />
            </section>
          ) : null}

          {sections.map((section, sectionIndex) => (
            <section key={section.id} id={domId(section.id)} aria-label={`Apartado ${section.title}`} className={`space-y-3 rounded-2xl border p-3 @2xl:p-4 ${highlight === section.id ? 'border-primary ring-2 ring-primary' : 'border-white/15'}`}>
              <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-0 flex-1 basis-60 space-y-1">
                  <span className={LABEL}>Apartado {sectionIndex + 1}</span>
                  <input className={`${FIELD} font-bold`} value={section.title} maxLength={120} onChange={(event) => commit(updateSectionTitle(doc, section.id, event.target.value))} />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={SMALL_BUTTON} disabled={sectionIndex === 0} onClick={() => commit(moveSection(doc, section.id, -1))}>
                    <ArrowUp aria-hidden="true" className="size-4" />
                    <span className="sr-only">Subir el apartado {section.title}</span>
                  </button>
                  <button type="button" className={SMALL_BUTTON} disabled={sectionIndex === sections.length - 1} onClick={() => commit(moveSection(doc, section.id, 1))}>
                    <ArrowDown aria-hidden="true" className="size-4" />
                    <span className="sr-only">Bajar el apartado {section.title}</span>
                  </button>
                  {!isOnlyPending(section) ? (
                    <button
                      type="button"
                      className={SMALL_BUTTON}
                      onClick={() => {
                        const before = doc;
                        commit(markSectionPending(doc, section.id));
                        offerUndo(`«${section.title}» marcado como Próximamente.`, () => commit(before));
                      }}
                    >
                      Marcar como Próximamente
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={DANGER_BUTTON}
                    onClick={() => {
                      const before = doc;
                      commit(removeSection(doc, section.id));
                      offerUndo(`Apartado «${section.title}» quitado, con su contenido.`, () => commit(before));
                    }}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    Quitar<span className="sr-only"> el apartado {section.title}</span>
                  </button>
                </div>
              </div>
              {section.blocks.length ? (
                <ol className="space-y-3">{section.blocks.map((block, index) => renderBlock(block, index, section.blocks.length, false, sectionIndex === sections.length - 1))}</ol>
              ) : (
                <p className={HINT}>Apartado vacío: añade texto o márcalo como Próximamente.</p>
              )}
              <AddBlock onAdd={(kind) => add(section.id, kind)} />
            </section>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={SMALL_BUTTON}
              onClick={() => {
                const { doc: next, id } = addSection(doc, 'Nuevo apartado');
                commit(next);
                requestAnimationFrame(() => {
                  focusBlock(id);
                  (document.getElementById(domId(id))?.querySelector('input') as HTMLInputElement | null)?.select();
                });
              }}
            >
              <Plus aria-hidden="true" className="size-4" />
              Nuevo apartado
            </button>
            {doc.intro.length === 0 ? (
              <button type="button" className="text-sm font-semibold text-white/70 underline underline-offset-4 hover:text-primary" onClick={() => add(INTRO, 'text')}>
                Añadir una introducción antes del primer apartado
              </button>
            ) : null}
          </div>
        </div>
      )}

      <MediaPicker
        open={imageTarget !== null}
        onClose={() => setImageTarget(null)}
        onSelect={(image) => {
          const target = imageTarget;
          setImageTarget(null);
          if (!doc || !target) return;
          const found = findBlock(doc, target.id);
          if (!found) return;
          const block = found.block;
          if (block.kind === 'image') patchBlock(block.id, { attrs: imageAttrs(block.attrs, { src: image.path, alt: image.alt }) });
          if (block.kind === 'gallery') {
            const picked: Attr[] = [
              { name: 'src', value: image.path },
              { name: 'alt', value: image.alt },
            ];
            const images =
              target.index === undefined
                ? [...block.images, picked]
                : block.images.map((item, i) => (i === target.index ? imageAttrs(item, { src: image.path, alt: image.alt }) : item));
            patchBlock(block.id, { images });
          }
        }}
      />
      <ArticleLinkPicker
        open={linking}
        articles={articles}
        onClose={() => setLinking(false)}
        onSelect={(article) => {
          setLinking(false);
          const target = linkTarget.current;
          if (!target) return;
          const { textarea } = target;
          const raw = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
          const label = raw.replace(/[[\]\n]/g, ' ').trim() || article.title;
          const start = raw.trim() ? textarea.selectionStart + (raw.length - raw.trimStart().length) : textarea.selectionEnd;
          const end = raw.trim() ? textarea.selectionEnd - (raw.length - raw.trimEnd().length) : textarea.selectionEnd;
          const link = `[${label}](/wiki/${article.slug})`;
          patchBlock(target.id, { text: textarea.value.slice(0, start) + link + textarea.value.slice(end) });
          requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start + link.length, start + link.length);
          });
        }}
      />
    </div>
  );
}
