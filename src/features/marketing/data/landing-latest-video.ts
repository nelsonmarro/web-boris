import { cache } from 'react';
import { getLatestVideo } from '@/features/community/data/latest-video';

/**
 * El último vídeo, una sola vez por petición: lo piden el hero («Ver el último vídeo») y la sección «Vídeos», cada uno
 * en su `<Suspense>`, y así comparten la misma lectura del RSS (y sus reintentos) en lugar de lanzar dos.
 */
export const getLandingLatestVideo = cache(getLatestVideo);
