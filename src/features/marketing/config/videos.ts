export interface FeaturedVideo {
  id: string;
  title: string;
  /** Etiqueta visible de la tarjeta, ya en "sentence case" y con los nombres propios bien escritos. */
  label: string;
}

/**
 * Los tres videos que Boris indicó en "Requerimientos Pagina"; títulos tal como aparecen en YouTube.
 * La batalla es horizontal (16:9); "Extinción masiva" y "El Blitz" son YouTube Shorts (9:16).
 * También es el respaldo del "último vídeo" del hub /comunidad si el feed RSS falla.
 */
export const FEATURED_VIDEOS: readonly FeaturedVideo[] = [
  {
    id: 'hedUAqopPBg',
    title: 'Colosos - The Bloop vs El Gran Majá - La Batalla',
    label: 'Colosos',
  },
  {
    id: 'XurjKHinBIY',
    title: 'Extinción masiva',
    label: 'Short · CGI',
  },
  {
    id: 'BP6fwpSuR7I',
    title: 'El Blitz',
    label: 'Short · Segunda Guerra Mundial',
  },
];
