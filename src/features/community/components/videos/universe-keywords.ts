import { UNIVERSES } from '@/features/marketing/config/universes';
import type { UniverseKeywords } from '../../lib/videos-by-universe';

/**
 * Palabras clave del título que asignan universo a un vídeo sin fichas vinculadas en `/videos` (los vinculados van al
 * universo de sus fichas). El nombre de cada universo, más los nombres que en los títulos del canal solo aparecen en
 * Colosos. Un título sin ninguna va a «Otros vídeos» (recopilaciones, espacios liminales…).
 */
const EXTRA: Record<string, readonly string[]> = {
  Colosos: ['The Bloop', 'Gran Majá'],
};

export const VIDEO_UNIVERSE_KEYWORDS: readonly UniverseKeywords[] = UNIVERSES.flatMap((u) =>
  u.universeKey ? [{ universe: u.universeKey, keywords: [u.title, u.universeKey, ...(EXTRA[u.universeKey] ?? [])] }] : [],
);
