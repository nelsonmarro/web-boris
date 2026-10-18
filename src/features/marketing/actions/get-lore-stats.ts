import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { getAllArticles } from '@/utils/mdx';
import { hasStats } from '@/features/monsters/lib/stats';
import { UNIVERSES } from '../config/universes';

export interface LoreStats {
  /** Artículos MDX publicados. */
  loreEntries: number;
  /** Criaturas con ficha de stats (aparecen en Arena y hub). */
  creaturesWithStats: number;
  /** Imágenes físicas en public/assets. */
  visualFiles: number;
  /** Universos narrativos de Boris (incluye los anunciados). */
  universes: number;
}

const IMAGE_EXT = new Set(['.webp', '.png', '.jpg', '.jpeg', '.avif', '.gif']);

async function countImages(dir: string): Promise<number> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries.filter((e) => e.isFile() && IMAGE_EXT.has(path.extname(e.name).toLowerCase())).length;
}

/** Métricas calculadas a partir del contenido real del proyecto. */
export async function getLoreStats(): Promise<LoreStats> {
  const [articles, visualFiles] = await Promise.all([
    getAllArticles(),
    countImages(path.join(process.cwd(), 'public', 'assets')).catch((e) => {
      console.warn('[getLoreStats] no se pudieron contar imágenes:', e);
      return 0;
    }),
  ]);

  return {
    loreEntries: articles.length,
    creaturesWithStats: articles.filter((a) => hasStats(a.frontmatter)).length,
    visualFiles,
    universes: UNIVERSES.length,
  };
}
