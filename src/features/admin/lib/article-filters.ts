/**
 * Etiquetas y filtros del listado de fichas del panel, en el idioma de Boris. Puro.
 */
export type ArticleStatus = 'archivo' | 'publicada' | 'borrador' | 'nueva' | 'borrada';

export interface FilterableArticle {
  universe: string;
  sealed: boolean;
  status: ArticleStatus;
  hasDraft: boolean;
}

export type BadgeTone = 'neutral' | 'edited' | 'draft' | 'new' | 'removed' | 'sealed';
export interface Badge {
  text: string;
  tone: BadgeTone;
}

/** Lo que se ve de cada ficha: «Sin cambios», «Editada», «Borrador pendiente», «Nueva», «Retirada» y «Sellada». */
export function articleBadges(article: FilterableArticle): Badge[] {
  const badges: Badge[] = [];
  if (article.status === 'borrada') badges.push({ text: 'Retirada', tone: 'removed' });
  else if (article.status === 'nueva') badges.push({ text: 'Nueva, sin publicar', tone: 'new' });
  else {
    if (article.status === 'publicada') badges.push({ text: 'Editada', tone: 'edited' });
    if (article.hasDraft) badges.push({ text: 'Borrador pendiente', tone: 'draft' });
    if (!badges.length) badges.push({ text: 'Sin cambios', tone: 'neutral' });
  }
  if (article.sealed) badges.push({ text: 'Sellada', tone: 'sealed' });
  return badges;
}

export const STATE_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'borrador', label: 'Borrador pendiente' },
  { value: 'nueva', label: 'Nuevas' },
  { value: 'editada', label: 'Editadas' },
  { value: 'sellada', label: 'Selladas' },
  { value: 'retirada', label: 'Retiradas' },
] as const;
export type StateFilter = (typeof STATE_FILTERS)[number]['value'];

export const isStateFilter = (value: unknown): value is StateFilter => STATE_FILTERS.some((filter) => filter.value === value);

const MATCHES: Record<StateFilter, (article: FilterableArticle) => boolean> = {
  '': () => true,
  borrador: (a) => a.hasDraft && a.status !== 'borrada',
  nueva: (a) => a.status === 'nueva',
  editada: (a) => a.status === 'publicada',
  sellada: (a) => a.sealed && a.status !== 'borrada',
  retirada: (a) => a.status === 'borrada',
};

export function filterArticles<T extends FilterableArticle>(articles: readonly T[], filters: { state?: StateFilter; universe?: string }): T[] {
  const matches = MATCHES[filters.state ?? ''];
  return articles.filter((article) => matches(article) && (!filters.universe || article.universe === filters.universe));
}

/** Cuántas fichas hay en cada filtro de estado (para los chips). */
export function countByState(articles: readonly FilterableArticle[]): Record<StateFilter, number> {
  return Object.fromEntries(STATE_FILTERS.map(({ value }) => [value, articles.filter(MATCHES[value]).length])) as Record<StateFilter, number>;
}
