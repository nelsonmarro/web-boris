/**
 * Paso entre los datos de una ficha (`ArticleData`) y el estado del formulario del editor, donde todo son textos y
 * listas editables. Puro: imports relativos con `.ts`.
 */
import type { ArticleData } from '../../../../core/content/overlay.ts';

export interface InfoRow { key: string; value: string }
export interface InfoSectionForm { title: string; rows: InfoRow[] }
export interface FaqForm { pregunta: string; respuesta: string }

export interface ArticleForm {
  title: string;
  universe: string;
  category: string;
  sealed: boolean;
  description: string;
  image: string;
  imageCaption: string;
  imagePosition: string;
  /** Uno por línea. */
  aliases: string;
  related: string[];
  infobox: InfoSectionForm[];
  faq: FaqForm[];
  stats: {
    length: string;
    weight: string;
    intelligence: string;
    hostility: string;
    power: string;
    defense: string;
    biteType: string;
    /** Una por línea. */
    specialAbilities: string;
  };
  content: string;
}

const text = (value: unknown) => (value === undefined || value === null ? '' : String(value));

export function toForm(data: ArticleData): ArticleForm {
  const { frontmatter: f } = data;
  return {
    title: f.title,
    universe: f.universe,
    category: f.category ?? '',
    sealed: f.status === 'proximamente',
    description: f.description ?? '',
    image: f.image ?? '',
    imageCaption: f.imageCaption ?? '',
    imagePosition: f.imagePosition ?? '',
    aliases: (f.aliases ?? []).join('\n'),
    related: [...(f.related ?? [])],
    infobox: Object.entries(f.infobox ?? {}).map(([title, fields]) => ({
      title,
      rows: Object.entries(fields).map(([key, value]) => ({ key, value })),
    })),
    faq: (f.faq ?? []).map((item) => ({ ...item })),
    stats: {
      length: text(f.stats?.length),
      weight: text(f.stats?.weight),
      intelligence: text(f.stats?.intelligence),
      hostility: text(f.stats?.hostility),
      power: text(f.stats?.power),
      defense: text(f.stats?.defense),
      biteType: text(f.stats?.biteType),
      specialAbilities: (f.stats?.specialAbilities ?? []).join('\n'),
    },
    content: data.content,
  };
}

const clean = (value: string) => value.trim() || undefined;
const lines = (value: string) => value.split('\n').map((line) => line.trim()).filter(Boolean);
/** Número del campo, o el texto tal cual si no lo es (para que el esquema lo rechace con su mensaje). */
const numberOrText = (value: string): number | string | undefined => {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) return undefined;
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : trimmed;
};

/** Datos de la ficha a partir del formulario: sin campos vacíos, sin filas sin etiqueta. */
export function fromForm(form: ArticleForm): ArticleData {
  const infobox: Record<string, Record<string, string>> = {};
  for (const section of form.infobox) {
    const title = section.title.trim();
    const rows = section.rows.filter((row) => row.key.trim() && row.value.trim());
    if (!title || rows.length === 0) continue;
    infobox[title] = Object.fromEntries(rows.map((row) => [row.key.trim(), row.value.trim()]));
  }
  const faq = form.faq
    .map((item) => ({ pregunta: item.pregunta.trim(), respuesta: item.respuesta.trim() }))
    .filter((item) => item.pregunta || item.respuesta);
  const s = form.stats;
  const stats = {
    length: numberOrText(s.length),
    weight: clean(s.weight),
    intelligence: numberOrText(s.intelligence),
    hostility: numberOrText(s.hostility),
    power: numberOrText(s.power),
    defense: numberOrText(s.defense),
    biteType: clean(s.biteType),
    specialAbilities: lines(s.specialAbilities).length ? lines(s.specialAbilities) : undefined,
  };
  const hasStats = Object.values(stats).some((value) => value !== undefined);
  const aliases = lines(form.aliases);
  const related = form.related.map((slug) => slug.trim()).filter(Boolean);
  const frontmatter = {
    title: form.title.trim(),
    universe: form.universe.trim(),
    category: clean(form.category),
    status: form.sealed ? ('proximamente' as const) : undefined,
    description: clean(form.description),
    image: clean(form.image),
    imageCaption: clean(form.imageCaption),
    imagePosition: clean(form.imagePosition),
    aliases: aliases.length ? aliases : undefined,
    related: related.length ? related : undefined,
    infobox: Object.keys(infobox).length ? infobox : undefined,
    faq: faq.length ? faq : undefined,
    stats: hasStats ? stats : undefined,
  };
  // Fuera las claves `undefined`: el JSON guardado queda igual que un frontmatter escrito a mano.
  return {
    frontmatter: JSON.parse(JSON.stringify(frontmatter)) as ArticleData['frontmatter'],
    content: form.content.replace(/\r\n/g, '\n'),
  };
}
