/**
 * A qué campo del editor de fichas se refiere un error de publicación (los mensajes de `article-check`), para
 * llevar a él y marcarlo. Puro.
 */
export type ArticleField =
  | 'title'
  | 'universe'
  | 'category'
  | 'description'
  | 'image'
  | 'imageCaption'
  | 'imagePosition'
  | 'infobox'
  | 'content'
  | 'aliases'
  | 'related'
  | 'faq'
  | 'stats';

export interface ErrorTarget {
  field: ArticleField;
  /** Línea del texto de la ficha, si el error la dice. */
  line?: number;
}

const BY_PREFIX: [RegExp, ArticleField][] = [
  [/^Título\b/, 'title'],
  [/^Universo\b/, 'universe'],
  [/^Categoría\b/, 'category'],
  [/^Descripción\b|^Falta la descripción/, 'description'],
  [/^Pie de la portada\b|^La portada necesita un pie/, 'imageCaption'],
  [/^Encuadre\b/, 'imagePosition'],
  [/^Portada\b/, 'image'],
  [/^Ficha lateral\b|^La ficha lateral\b/, 'infobox'],
  [/^Texto de la ficha\b|^El texto necesita\b/, 'content'],
  [/^Apodos\b|^El apodo\b/, 'aliases'],
  [/^Fichas relacionadas\b|^La ficha relacionada\b|^Una ficha no puede ser relacionada\b/, 'related'],
  [/^Preguntas frecuentes\b/, 'faq'],
  [/^Datos de la Arena\b/, 'stats'],
];

export function errorTarget(message: string, coverImage = ''): ErrorTarget | null {
  const image = /^La imagen «(.+?)»/.exec(message);
  if (image) return { field: coverImage && image[1] === coverImage ? 'image' : 'content' };
  const found = BY_PREFIX.find(([pattern]) => pattern.test(message));
  if (!found) return null;
  const line = found[1] === 'content' ? /\(línea (\d+)\)/.exec(message)?.[1] : undefined;
  return line ? { field: found[1], line: Number(line) } : { field: found[1] };
}
