export type VideoOrientation = 'landscape' | 'short';

export interface FeaturedVideo {
  id: string;
  title: string;
  category: string;
  orientation: VideoOrientation;
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
    category: 'COLOSOS',
    orientation: 'landscape',
  },
  {
    id: 'XurjKHinBIY',
    title: 'Extinción masiva',
    category: 'SHORT · CGI',
    orientation: 'short',
  },
  {
    id: 'BP6fwpSuR7I',
    title: 'El Blitz',
    category: 'SHORT · SEGUNDA GUERRA MUNDIAL',
    orientation: 'short',
  },
];
