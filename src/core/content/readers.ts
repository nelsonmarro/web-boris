/**
 * Lectura de novedades, duelos curados y relaciones vídeo ↔ ficha desde el disco. Puro (lo usan check:content,
 * el repositorio de archivos y los tests): solo imports relativos con extensión .ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
  CuratedPollsSchema,
  NewsEntrySchema,
  VideoLinksSchema,
  type CuratedPoll,
  type NewsEntry,
  type VideoLink,
} from './schemas.ts';

export interface ReadResult<T> {
  items: T[];
  errors: string[];
}

/** `<yyyy-mm-dd>-<slug>.md`: la fecha del nombre debe ser la del frontmatter. */
const NEWS_FILE = /^(\d{4}-\d{2}-\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

export function readNews(dir: string): ReadResult<NewsEntry> {
  if (!fs.existsSync(dir)) return { items: [], errors: [] };
  const items: NewsEntry[] = [];
  const errors: string[] = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    let data: unknown;
    try {
      ({ data } = matter(fs.readFileSync(path.join(dir, file), 'utf8')));
    } catch (error) {
      // Un frontmatter mal formado no tumba la página: se registra y se salta, como un esquema inválido.
      errors.push(`${file}: YAML inválido — ${(error as Error).message.split('\n')[0]}`);
      continue;
    }
    const parsed = NewsEntrySchema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`${file}: ${issue.path.join('.') || '(raíz)'} — ${issue.message}`);
      }
      continue;
    }
    const prefix = NEWS_FILE.exec(file)?.[1];
    if (!prefix) {
      errors.push(`${file}: el nombre debe ser <yyyy-mm-dd>-<slug>.md`);
    } else if (prefix !== parsed.data.fecha) {
      // js-yaml convierte una fecha imposible (2026-02-30) en otra real (2026-03-02) sin avisar.
      errors.push(`${file}: la fecha ${parsed.data.fecha} no coincide con la del nombre (${prefix})`);
    } else {
      items.push({ ...parsed.data, id: file.replace(/\.md$/, '') });
    }
  }
  items.sort((x, y) => y.fecha.localeCompare(x.fecha) || x.id.localeCompare(y.id));
  return { items, errors };
}

export function readCuratedPolls(file: string): ReadResult<CuratedPoll> {
  if (!fs.existsSync(file)) return { items: [], errors: [] };
  const name = path.basename(file);
  let json: unknown;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return { items: [], errors: [`${name}: JSON inválido — ${(error as Error).message}`] };
  }
  const parsed = CuratedPollsSchema.safeParse(json);
  if (!parsed.success) {
    return {
      items: [],
      errors: parsed.error.issues.map((i) => `${name}: ${i.path.join('.') || '(raíz)'} — ${i.message}`),
    };
  }
  return { items: parsed.data, errors: [] };
}

export function readVideoLinks(file: string): ReadResult<VideoLink> {
  if (!fs.existsSync(file)) return { items: [], errors: [] };
  const name = path.basename(file);
  let json: unknown;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return { items: [], errors: [`${name}: JSON inválido — ${(error as Error).message}`] };
  }
  const parsed = VideoLinksSchema.safeParse(json);
  if (!parsed.success) {
    return {
      items: [],
      errors: parsed.error.issues.map((i) => `${name}: ${i.path.join('.') || '(raíz)'} — ${i.message}`),
    };
  }
  return { items: parsed.data, errors: [] };
}
