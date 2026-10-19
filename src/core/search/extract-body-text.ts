/** Texto del cuerpo de un MDX para el grafo de menciones (spec Ola B §7). Puro. */
export function extractBodyText(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/<\/?[A-Za-z][\w.]*(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?\/?>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '');
}

export function extractWikiLinks(mdx: string): string[] {
  const slugs = new Set<string>();
  for (const m of mdx.matchAll(/\]\(\/wiki\/([a-z0-9-]+)\)/g)) slugs.add(m[1]);
  return [...slugs];
}
