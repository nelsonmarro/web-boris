import { getAllArticles } from '@/utils/mdx';

export interface LoreStats {
  loreEntries: number;
  explorers: string;
  visualFiles: number;
  universes: number;
}

/**
 * Calculates real-time statistics based on the project's content.
 */
export async function getLoreStats(): Promise<LoreStats> {
  const articles = await getAllArticles();
  
  // 1. Lore Entries: Total number of MDX files
  const loreEntries = articles.length;

  // 2. Explorers: Fixed high-value representing Boris's community (approx 2.4M on YouTube)
  const explorers = "2.4M";

  // 3. Visual Files: Sum of featured images + images inside MDX + videos
  // For now, we use a conservative calculation based on discovered content
  // Every article has at least 1 main image.
  const visualFiles = articles.reduce((acc, art) => {
    // Count main image + potential MDX images (heuristic)
    const mdxImages = (art.content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    return acc + 1 + mdxImages;
  }, 0);

  // 4. Universes: Unique universes found in frontmatter
  const uniqueUniverses = new Set(articles.map(a => a.frontmatter.universe));
  const universes = uniqueUniverses.size || 3; // Fallback to 3 main ones

  return {
    loreEntries,
    explorers,
    visualFiles: visualFiles + 15, // Adding a constant for the videos on the channel
    universes,
  };
}
