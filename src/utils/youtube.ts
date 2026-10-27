/** Página del vídeo en YouTube a partir de su id de 11 caracteres. */
export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/**
 * Miniatura de las tarjetas de vídeo: `sddefault` (640×480, existe para casi todos los vídeos). Es 4:3 con bandas
 * negras arriba y abajo; en una caja 16:9 con `object-cover` las bandas quedan fuera y queda un 640×360 nítido,
 * el doble que `mqdefault` (320×180), que se veía borrosa en pantallas densas.
 */
export const youtubeThumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/sddefault.jpg`;
