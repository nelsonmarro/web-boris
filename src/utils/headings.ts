import { createSlugger } from '@/utils/slugify';

export interface WikiHeading {
  id: string;
  text: string;
  level: 2 | 3;
  numbering: string;
}

const stripInline = (s: string) =>
  s
    .replace(/[*_`~]+/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .trim();

/** Extrae h2/h3 del MDX crudo con numeración 1. / 1.1. Ignora bloques de código. */
export function extractHeadings(content: string): WikiHeading[] {
  const slug = createSlugger();
  const headings: WikiHeading[] = [];
  let inFence = false;
  let h2 = 0;
  let h3 = 0;

  for (const raw of content.split('\n')) {
    const line = raw.trimEnd();
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = stripInline(match[2]);
    if (level === 2) {
      h2 += 1;
      h3 = 0;
    } else {
      h3 += 1;
    }
    headings.push({
      id: slug(text),
      text,
      level,
      numbering: level === 2 ? `${h2}.` : `${h2}.${h3}.`,
    });
  }

  return headings;
}
