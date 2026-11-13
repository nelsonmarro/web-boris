/** Rutas de las imágenes subidas desde el panel: `/media/<32 hex>.webp`. Puro y sin imports (lo usan cliente y servidor). */
export const MEDIA_PREFIX = '/media/';
export const MEDIA_FILE = /^[a-f0-9]{32}\.webp$/;
export const isMediaPath = (value: string): boolean => value.startsWith(MEDIA_PREFIX) && MEDIA_FILE.test(value.slice(MEDIA_PREFIX.length));
