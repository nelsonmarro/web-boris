/** Direcciones de las listas en el panel (`/admin/contenido/<ruta>`). Puro. */
import type { ListKey } from '../../../core/content/lists.ts';

export const LIST_ROUTES: Record<string, ListKey> = {
  novedades: 'news',
  votaciones: 'polls',
  videos: 'videos',
  'orden-historia': 'storyOrder',
  'empieza-aqui': 'startHere',
};

export const LIST_DESCRIPTIONS: Record<ListKey, string> = {
  news: 'Las noticias de la página de Comunidad.',
  polls: 'Duelos y expedientes a desclasificar de cada semana.',
  videos: 'Qué fichas salen en cada vídeo («Aparece en»).',
  storyOrder: 'En qué orden ver los vídeos de cada universo.',
  startHere: 'Las fichas que ve primero quien llega nuevo.',
};
