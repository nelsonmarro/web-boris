/**
 * Comprobaciones de una ficha editada en el panel, con mensajes para quien edita (no para quien programa). Puro:
 * imports relativos con `.ts`. Son las mismas reglas que `check:content` aplica a los archivos.
 */
import { compile } from '@mdx-js/mdx';
import { ArticleDataSchema, isValidSlug, type ArticleData } from '../../../core/content/overlay.ts';
import { h2Titles } from '../../../core/content/h2-titles.ts';
import { checkArticleStandard, crossCheckEntities } from '../../../core/content/validate.ts';
import { isIndexCategory } from '../../../core/search/catalog.ts';
import { remarkSafeMdx, type MdxIssue } from '../../../utils/remark-safe-mdx.ts';

export interface ArticleCheck {
  /** Impiden publicar. */
  errors: string[];
}

const FIELD_LABELS: Record<string, string> = {
  title: 'Título',
  universe: 'Universo',
  category: 'Categoría',
  description: 'Descripción',
  image: 'Portada',
  imageCaption: 'Pie de la portada',
  imagePosition: 'Encuadre de la portada',
  aliases: 'Apodos',
  related: 'Fichas relacionadas',
  infobox: 'Ficha lateral',
  faq: 'Preguntas frecuentes',
  stats: 'Datos de la Arena',
  content: 'Texto de la ficha',
};

/** Un problema del esquema, con el nombre del campo en español. */
function schemaMessage(path: PropertyKey[], message: string): string {
  const field = path.find((part) => typeof part === 'string' && part !== 'frontmatter');
  const label = typeof field === 'string' ? (FIELD_LABELS[field] ?? field) : 'Ficha';
  return `${label}: ${message}`;
}

/** Interpreta lo que manda el editor. Devuelve los datos o los errores de forma (que también impiden guardar). */
export function parseArticleData(input: unknown): { data: ArticleData } | { errors: string[] } {
  const parsed = ArticleDataSchema.safeParse(input);
  if (parsed.success) return { data: parsed.data };
  return { errors: parsed.error.issues.map((issue) => schemaMessage(issue.path, issue.message)) };
}

/** Lo que el filtro de seguridad quitaría y los errores de sintaxis del MDX (que romperían la página). */
export async function checkMdxBody(content: string, components: ReadonlySet<string>): Promise<string[]> {
  const issues: MdxIssue[] = [];
  try {
    await compile(content, { remarkPlugins: [[remarkSafeMdx, { components, onIssue: (issue: MdxIssue) => issues.push(issue) }]] });
  } catch (error) {
    const place = (error as { line?: number }).line;
    const reason = (error as { reason?: string }).reason ?? (error instanceof Error ? error.message : String(error));
    return [`Texto de la ficha${place ? ` (línea ${place})` : ''}: ${reason}. Revisa que cada etiqueta < > esté bien cerrada.`];
  }
  return issues.map((issue) => `Texto de la ficha: ${issue.message}`);
}

/** Estándar de ficha (mismas reglas que `checkArticleStandard`), explicado. */
export function standardProblems(data: ArticleData): string[] {
  const { frontmatter } = data;
  if (isIndexCategory(frontmatter.category) || frontmatter.status === 'proximamente') return [];
  const problems: string[] = [];
  if (!frontmatter.description?.trim()) problems.push('Falta la descripción corta.');
  if (frontmatter.image && !frontmatter.imageCaption?.trim()) problems.push('La portada necesita un pie de foto.');
  if (Object.keys(frontmatter.infobox ?? {}).length < 1) problems.push('La ficha lateral necesita al menos una sección con datos.');
  const sections = h2Titles(data.content).filter((title) => title.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase() !== 'referencias');
  if (sections.length < 2) {
    problems.push(`El texto necesita al menos 2 apartados «##» (tiene ${sections.length}, sin contar Referencias). Un apartado sin información lleva <Proximamente />.`);
  }
  return problems;
}

export interface OtherArticle {
  slug: string;
  title: string;
  aliases?: string[];
  related?: string[];
}

/** Apodos y relacionados frente al resto de fichas (mismas reglas que `crossCheckEntities`), explicados. */
export function entityProblems(slug: string, data: ArticleData, others: readonly OtherArticle[]): string[] {
  const rest = others.filter((other) => other.slug !== slug);
  const self = { slug, title: data.frontmatter.title, aliases: data.frontmatter.aliases, related: data.frontmatter.related };
  // Solo los problemas que aparecen al añadir esta ficha: los que ya tenían las demás no se le achacan.
  const before = new Set(crossCheckEntities(rest));
  return crossCheckEntities([...rest, self])
    .filter((message) => !before.has(message))
    .map((message) =>
      message
        .replace(/^apodo "(.+)" repetido en .+ y .+$/, 'El apodo «$1» ya lo usa otra ficha.')
        .replace(/^apodo "(.+)" de .+ es el título de (.+)$/, 'El apodo «$1» es el título de la ficha «$2».')
        .replace(/^apodo "(.+)" de .+ queda vacío al normalizar$/, 'El apodo «$1» no tiene letras ni números.')
        .replace(/^related de .+ repite "(.+)"$/, 'La ficha relacionada «$1» está repetida.')
        .replace(/^related de .+ se apunta a sí misma$/, 'Una ficha no puede ser relacionada de sí misma.')
        .replace(/^related de .+ apunta a "(.+)", que no existe$/, 'La ficha relacionada «$1» no existe.'),
    );
}

/** Todas las comprobaciones antes de publicar. `assetExists` dice si una ruta `/assets/…` existe en `public/`. */
export async function checkArticle(
  slug: string,
  data: ArticleData,
  options: { others: readonly OtherArticle[]; components: ReadonlySet<string>; assetExists: (path: string) => boolean },
): Promise<ArticleCheck> {
  const errors: string[] = [];
  if (!isValidSlug(slug)) errors.push('La dirección de la ficha no es válida.');
  errors.push(...(await checkMdxBody(data.content, options.components)));
  errors.push(...standardProblems(data));
  errors.push(...entityProblems(slug, data, options.others));
  const images = [data.frontmatter.image, ...data.content.matchAll(/\/assets\/[^"'`<>\s)]+/g).map((match) => match[0])];
  for (const image of images) {
    if (!image) continue;
    if (!image.startsWith('/assets/')) errors.push(`La imagen «${image}» debe estar en la biblioteca de la web (empezar por /assets/).`);
    else if (!options.assetExists(image)) errors.push(`La imagen «${image}» no existe.`);
  }
  return { errors: [...new Set(errors)] };
}

/** ¿Coinciden estas reglas con las de `check:content`? (lo usa el test para que no se separen). */
export const standardAgreesWithCheckContent = (slug: string, data: ArticleData): boolean =>
  (standardProblems(data).length === 0) ===
  (checkArticleStandard([
    {
      slug,
      category: data.frontmatter.category,
      status: data.frontmatter.status,
      description: data.frontmatter.description,
      image: data.frontmatter.image,
      imageCaption: data.frontmatter.imageCaption,
      infoboxSections: Object.keys(data.frontmatter.infobox ?? {}).length,
      h2Titles: h2Titles(data.content),
    },
  ]).length === 0);
