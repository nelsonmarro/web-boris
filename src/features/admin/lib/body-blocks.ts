/**
 * El texto de una ficha (MDX) como apartados y bloques, para editarlo sin ver etiquetas (spec
 * `docs/superpowers/specs/2026-11-13-editor-por-apartados-design.md`). Puro: imports de paquetes y relativos con `.ts`.
 *
 * Ida y vuelta exacta: cada bloque guarda su texto original (`raw`) y el espacio que lo precedía (`gap`). Un bloque
 * sin tocar se escribe tal cual; uno editado (`raw: null`) se genera desde sus campos. Si un bloque ya no tiene
 * delante al mismo vecino que en el original (se movió, se añadió o se quitó algo), se separa con una línea en blanco.
 */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';

export interface Attr {
  name: string;
  /** `null`: atributo sin valor (`<X destacado />`). */
  value: string | null;
}

interface Base {
  id: string;
  /** Texto original del bloque; `null` si se ha editado o es nuevo. */
  raw: string | null;
  /** Espacio que lo precedía en el original (`null` si es nuevo). */
  gap: string | null;
  /** Id del elemento que lo precedía en el original. */
  prev: string | null;
}

export type Block =
  | (Base & { kind: 'text'; text: string })
  | (Base & { kind: 'subheading'; title: string })
  | (Base & { kind: 'image'; attrs: Attr[] })
  | (Base & { kind: 'gallery'; attrs: Attr[]; images: Attr[][] })
  | (Base & { kind: 'quote'; attrs: Attr[]; text: string })
  | (Base & { kind: 'alert'; attrs: Attr[]; text: string })
  | (Base & { kind: 'proximamente' })
  | (Base & { kind: 'raw'; text: string });

export type BlockKind = Block['kind'];

export interface Section extends Base {
  title: string;
  blocks: Block[];
}

export interface BodyDoc {
  /** Lo que hay antes del primer bloque (normalmente un salto de línea). */
  leading: string;
  /** Bloques antes del primer apartado `##`. */
  intro: Block[];
  sections: Section[];
  trailing: string;
}

/** Contenedor de bloques: la introducción o un apartado. */
export const INTRO = 'intro';

let counter = 0;
const newId = (prefix = 'b') => `${prefix}${(counter += 1)}`;

// ── Análisis ─────────────────────────────────────────────────────────────────────────────────────────────────────

interface MdNode {
  type: string;
  name?: string | null;
  depth?: number;
  attributes?: { type: string; name?: string; value?: unknown }[];
  children?: MdNode[];
  position?: { start: { offset?: number }; end: { offset?: number } };
}

const PROSE = new Set(['paragraph', 'list', 'blockquote', 'thematicBreak', 'code', 'html', 'table', 'definition']);
const start = (node: MdNode) => node.position?.start.offset ?? 0;
const end = (node: MdNode) => node.position?.end.offset ?? 0;

/** Atributos literales del elemento, o `null` si alguno es código (`{…}`, `{...props}`). */
function literalAttrs(node: MdNode): Attr[] | null {
  const attrs: Attr[] = [];
  for (const attribute of node.attributes ?? []) {
    if (attribute.type !== 'mdxJsxAttribute' || !attribute.name) return null;
    if (attribute.value !== null && attribute.value !== undefined && typeof attribute.value !== 'string') return null;
    attrs.push({ name: attribute.name, value: (attribute.value as string | null | undefined) ?? null });
  }
  return attrs;
}

const isJsx = (node: MdNode, name: string) => node.type === 'mdxJsxFlowElement' && node.name === name;

/** El bloque que corresponde a un nodo de primer nivel (salvo `##`, que abre apartado, y la prosa, que se funde). */
function blockFor(node: MdNode, source: string, base: Base): Block {
  const raw = source.slice(start(node), end(node));
  const rawBlock: Block = { ...base, kind: 'raw', text: raw };
  if (node.type === 'heading' && node.depth === 3) {
    return { ...base, kind: 'subheading', title: raw.replace(/^###\s*/, '').replace(/\s*#*\s*$/, '') };
  }
  if (node.type !== 'mdxJsxFlowElement') return rawBlock;
  const attrs = literalAttrs(node);
  if (!attrs) return rawBlock;
  const children = node.children ?? [];
  const inner = children.length ? source.slice(start(children[0]), end(children[children.length - 1])) : '';
  switch (node.name) {
    case 'WikiImage':
      return children.length ? rawBlock : { ...base, kind: 'image', attrs };
    case 'Proximamente':
      return children.length || attrs.length ? rawBlock : { ...base, kind: 'proximamente' };
    case 'WikiQuote':
      return { ...base, kind: 'quote', attrs, text: inner };
    case 'AbyssalAlert':
      return { ...base, kind: 'alert', attrs, text: inner };
    case 'WikiGallery': {
      const images: Attr[][] = [];
      for (const child of children) {
        const childAttrs = isJsx(child, 'WikiImage') && !child.children?.length ? literalAttrs(child) : null;
        if (!childAttrs) return rawBlock;
        images.push(childAttrs);
      }
      return { ...base, kind: 'gallery', attrs, images };
    }
    default:
      return rawBlock;
  }
}

/** Divide el texto en apartados y bloques. `null` si no se puede analizar (MDX roto): se edita como texto completo. */
export function parseBody(source: string): BodyDoc | null {
  let tree: MdNode;
  try {
    tree = unified().use(remarkParse).use(remarkMdx).parse(source) as unknown as MdNode;
  } catch {
    return null;
  }
  const nodes = tree.children ?? [];
  if (nodes.length === 0) return { leading: '', intro: [], sections: [], trailing: source || '\n' };

  const doc: BodyDoc = { leading: source.slice(0, start(nodes[0])), intro: [], sections: [], trailing: source.slice(end(nodes[nodes.length - 1])) };
  let target = doc.intro;
  let prevId: string | null = null;
  let prevEnd = start(nodes[0]);
  // Inicio en el original del bloque de prosa abierto (para fundir párrafos y listas seguidos).
  let proseStart = -1;

  for (const node of nodes) {
    const gap = source.slice(prevEnd, start(node));
    const last = target[target.length - 1];
    if (PROSE.has(node.type) && proseStart >= 0 && last?.kind === 'text' && last.raw !== null) {
      last.raw = source.slice(proseStart, end(node));
      last.text = last.raw;
    } else if (node.type === 'heading' && node.depth === 2) {
      const raw = source.slice(start(node), end(node));
      const section: Section = { id: newId('s'), raw, gap, prev: prevId, title: raw.replace(/^##\s*/, '').replace(/\s*#*\s*$/, ''), blocks: [] };
      doc.sections.push(section);
      target = section.blocks;
      prevId = section.id;
      proseStart = -1;
    } else {
      const base: Base = { id: newId(), raw: source.slice(start(node), end(node)), gap, prev: prevId };
      const block: Block = PROSE.has(node.type) ? { ...base, kind: 'text', text: base.raw! } : blockFor(node, source, base);
      target.push(block);
      prevId = block.id;
      proseStart = block.kind === 'text' ? start(node) : -1;
    }
    prevEnd = end(node);
  }
  return doc;
}

// ── Escritura ────────────────────────────────────────────────────────────────────────────────────────────────────

/** Un atributo como texto MDX literal (nunca código): comillas dobles, simples si hace falta, sin saltos de línea. */
export function formatAttr({ name, value }: Attr): string {
  if (value === null) return name;
  const clean = value.replace(/\s*\n\s*/g, ' ');
  if (!clean.includes('"')) return `${name}="${clean}"`;
  if (!clean.includes("'")) return `${name}='${clean}'`;
  return `${name}="${clean.replace(/"/g, '”')}"`;
}

const attrsText = (attrs: Attr[]) => attrs.map((attr) => ` ${formatAttr(attr)}`).join('');

function withChildren(name: string, attrs: Attr[], text: string): string {
  const body = text.trim();
  return body ? `<${name}${attrsText(attrs)}>\n${body}\n</${name}>` : `<${name}${attrsText(attrs)} />`;
}

/** El MDX de un bloque. Cadena vacía: el bloque no aporta nada (texto o subapartado vacíos) y no se escribe. */
export function renderBlock(block: Block): string {
  if (block.raw !== null) return block.raw;
  switch (block.kind) {
    case 'text':
    case 'raw':
      return block.text.trim() ? block.text.replace(/^\n+|\s+$/g, '') : '';
    case 'subheading':
      return block.title.trim() ? `### ${block.title.trim()}` : '';
    case 'image':
      return `<WikiImage${attrsText(block.attrs)} />`;
    case 'gallery':
      return `<WikiGallery${attrsText(block.attrs)}>\n${block.images.map((image) => `  <WikiImage${attrsText(image)} />`).join('\n')}\n</WikiGallery>`;
    case 'quote':
      return withChildren('WikiQuote', block.attrs, block.text);
    case 'alert':
      return withChildren('AbyssalAlert', block.attrs, block.text);
    case 'proximamente':
      return '<Proximamente />';
  }
}

const renderHeading = (section: Section) => (section.raw !== null ? section.raw : `## ${section.title.replace(/\s+/g, ' ').trim()}`);

export interface Range {
  /** Id del bloque o del apartado (su título). */
  id: string;
  start: number;
  end: number;
}

/** El MDX del documento y dónde queda cada bloque (para llevar a un bloque desde la línea de un error). */
export function serializeWithRanges(doc: BodyDoc): { text: string; ranges: Range[] } {
  const items: { id: string; gap: string | null; prev: string | null; text: string }[] = [];
  for (const block of doc.intro) items.push({ ...block, text: renderBlock(block) });
  for (const section of doc.sections) {
    items.push({ ...section, text: renderHeading(section) });
    for (const block of section.blocks) items.push({ ...block, text: renderBlock(block) });
  }
  let text = doc.leading;
  const ranges: Range[] = [];
  let previous: string | null = null;
  for (const item of items) {
    if (!item.text) continue;
    if (previous !== null) text += item.gap !== null && item.prev === previous ? item.gap : '\n\n';
    ranges.push({ id: item.id, start: text.length, end: text.length + item.text.length });
    text += item.text;
    previous = item.id;
  }
  return { text: text + doc.trailing, ranges };
}

export const serializeBody = (doc: BodyDoc): string => serializeWithRanges(doc).text;

/** El bloque (o apartado) que contiene la línea `line` (1 = la primera) del MDX. */
export function blockAtLine(doc: BodyDoc, line: number): string | null {
  const { text, ranges } = serializeWithRanges(doc);
  let offset = 0;
  for (let current = 1; current < line; current += 1) {
    const next = text.indexOf('\n', offset);
    if (next < 0) break;
    offset = next + 1;
  }
  const found = ranges.find((range) => offset < range.end) ?? ranges[ranges.length - 1];
  return found?.id ?? null;
}

// ── Cambios (todos devuelven un documento nuevo) ─────────────────────────────────────────────────────────────────

const fresh = { raw: null, gap: null, prev: null } as const;

/** Un bloque nuevo, vacío, del tipo pedido. */
export function newBlock(kind: BlockKind): Block {
  const base = { id: newId(), ...fresh };
  switch (kind) {
    case 'text':
      return { ...base, kind, text: '' };
    case 'subheading':
      return { ...base, kind, title: '' };
    case 'image':
      return { ...base, kind, attrs: [{ name: 'align', value: 'right' }] };
    case 'gallery':
      return { ...base, kind, attrs: [], images: [] };
    case 'quote':
      return { ...base, kind, attrs: [], text: '' };
    case 'alert':
      return { ...base, kind, attrs: [{ name: 'variant', value: 'info' }], text: '' };
    case 'proximamente':
      return { ...base, kind };
    case 'raw':
      return { ...base, kind, text: '' };
  }
}

export const getAttr = (attrs: readonly Attr[], name: string): string => attrs.find((attr) => attr.name === name)?.value ?? '';

/** Pone (o quita, si queda vacío) un atributo, conservando el orden de los demás. */
export function setAttr(attrs: readonly Attr[], name: string, value: string): Attr[] {
  if (!value.trim()) return attrs.filter((attr) => attr.name !== name);
  return attrs.some((attr) => attr.name === name) ? attrs.map((attr) => (attr.name === name ? { name, value } : attr)) : [...attrs, { name, value }];
}

/** Orden de los atributos de una imagen nueva: `src`, `alt`, `caption`, `align`. */
export function imageAttrs(attrs: readonly Attr[], patch: Partial<Record<'src' | 'alt' | 'caption' | 'align', string>>): Attr[] {
  let next = [...attrs];
  for (const name of ['src', 'alt', 'caption', 'align'] as const) {
    if (patch[name] === undefined) continue;
    const had = next.some((attr) => attr.name === name);
    next = setAttr(next, name, patch[name]!);
    // Un `src` nuevo va el primero, como en el resto de fichas.
    if (!had && name === 'src' && patch.src) next = [next[next.length - 1], ...next.slice(0, -1)];
  }
  return next;
}

type Container = { id: string; blocks: Block[] };
const containers = (doc: BodyDoc): Container[] => [{ id: INTRO, blocks: doc.intro }, ...doc.sections.map((section) => ({ id: section.id, blocks: section.blocks }))];

function withContainers(doc: BodyDoc, list: Container[]): BodyDoc {
  const byId = new Map(list.map((container) => [container.id, container.blocks]));
  return { ...doc, intro: byId.get(INTRO) ?? doc.intro, sections: doc.sections.map((section) => ({ ...section, blocks: byId.get(section.id) ?? section.blocks })) };
}

export function findBlock(doc: BodyDoc, id: string): { container: string; index: number; block: Block } | null {
  for (const container of containers(doc)) {
    const index = container.blocks.findIndex((block) => block.id === id);
    if (index >= 0) return { container: container.id, index, block: container.blocks[index] };
  }
  return null;
}

/** Cambia campos de un bloque (deja de usarse su texto original). */
export function updateBlock(doc: BodyDoc, id: string, patch: Partial<Block>): BodyDoc {
  return withContainers(
    doc,
    containers(doc).map((container) => ({ ...container, blocks: container.blocks.map((block) => (block.id === id ? ({ ...block, ...patch, raw: null } as Block) : block)) })),
  );
}

export function removeBlock(doc: BodyDoc, id: string): BodyDoc {
  return withContainers(doc, containers(doc).map((container) => ({ ...container, blocks: container.blocks.filter((block) => block.id !== id) })));
}

/** Añade un bloque al final de un contenedor (`INTRO` o el id de un apartado), o en la posición `index`. */
export function insertBlock(doc: BodyDoc, container: string, block: Block, index?: number): BodyDoc {
  return withContainers(
    doc,
    containers(doc).map((item) => {
      if (item.id !== container) return item;
      const blocks = [...item.blocks];
      blocks.splice(index ?? blocks.length, 0, block);
      return { ...item, blocks };
    }),
  );
}

/** Sube o baja un bloque. Desde el primero (o el último) pasa al final (o al principio) del contenedor vecino. */
export function moveBlock(doc: BodyDoc, id: string, delta: -1 | 1): BodyDoc {
  const list = containers(doc);
  const at = findBlock(doc, id);
  if (!at) return doc;
  const c = list.findIndex((container) => container.id === at.container);
  const blocks = list[c].blocks;
  const target = at.index + delta;
  if (target >= 0 && target < blocks.length) {
    const next = [...blocks];
    next.splice(at.index, 1);
    next.splice(target, 0, at.block);
    list[c] = { ...list[c], blocks: next };
    return withContainers(doc, list);
  }
  const neighbour = c + delta;
  if (neighbour < 0 || neighbour >= list.length) return doc;
  list[c] = { ...list[c], blocks: blocks.filter((block) => block.id !== id) };
  const other = list[neighbour].blocks;
  list[neighbour] = { ...list[neighbour], blocks: delta < 0 ? [...other, at.block] : [at.block, ...other] };
  return withContainers(doc, list);
}

export function updateSectionTitle(doc: BodyDoc, id: string, title: string): BodyDoc {
  return { ...doc, sections: doc.sections.map((section) => (section.id === id ? { ...section, title, raw: null } : section)) };
}

export function moveSection(doc: BodyDoc, id: string, delta: -1 | 1): BodyDoc {
  const index = doc.sections.findIndex((section) => section.id === id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= doc.sections.length) return doc;
  const sections = [...doc.sections];
  sections.splice(index, 1);
  sections.splice(target, 0, doc.sections[index]);
  return { ...doc, sections };
}

export function removeSection(doc: BodyDoc, id: string): BodyDoc {
  return { ...doc, sections: doc.sections.filter((section) => section.id !== id) };
}

const isReferences = (title: string) => title.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase() === 'referencias';

/** Añade un apartado (con un bloque de texto vacío) antes de «Referencias», o al final. Devuelve también su id. */
export function addSection(doc: BodyDoc, title: string): { doc: BodyDoc; id: string } {
  const section: Section = { id: newId('s'), ...fresh, title, blocks: [newBlock('text')] };
  const references = doc.sections.findIndex((item) => isReferences(item.title));
  const sections = [...doc.sections];
  sections.splice(references >= 0 ? references : sections.length, 0, section);
  return { doc: { ...doc, sections }, id: section.id };
}

/** Sustituye el contenido de un apartado por el bloque «Próximamente». */
export function markSectionPending(doc: BodyDoc, id: string): BodyDoc {
  return { ...doc, sections: doc.sections.map((section) => (section.id === id ? { ...section, blocks: [newBlock('proximamente')] } : section)) };
}

export const isOnlyPending = (section: Section) => section.blocks.length === 1 && section.blocks[0].kind === 'proximamente';
