/** Datos que el servidor pasa a los editores de listas. */
export interface ArticleChoice {
  slug: string;
  title: string;
  /** Tiene datos de la Arena (puede ir a un duelo). */
  fighter: boolean;
  sealed: boolean;
  universe: string;
  category?: string;
}

export interface VideoChoice {
  id: string;
  titulo: string;
}

export interface ListEditorProps<T> {
  path: string;
  token: string;
  initial: T[];
  articles: ArticleChoice[];
  videos: VideoChoice[];
  universes: string[];
  /** Semana ISO actual (`YYYY-Www`). */
  currentWeek: string;
}
