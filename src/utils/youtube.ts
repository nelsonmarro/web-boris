/** Página del vídeo en YouTube a partir de su id de 11 caracteres. */
export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** Miniatura 320×180 (`mqdefault`), la de las tarjetas de vídeo. */
export const youtubeThumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
