/** Títulos de los apartados `##` (nunca `###`) de un cuerpo MDX, sin mirar dentro de bloques de código ``` / ~~~. Puro. */
export function h2Titles(body: string): string[] {
  const titles: string[] = [];
  let fence: string | null = null;
  for (const line of body.split(/\r?\n/)) {
    const marker = line.match(/^\s*(```+|~~~+)/)?.[1];
    if (marker) {
      if (fence === null) fence = marker[0];
      else if (marker[0] === fence) fence = null;
      continue;
    }
    const heading = fence === null ? line.match(/^##[ \t]+(.+?)[ \t]*#*[ \t]*$/) : null;
    if (heading) titles.push(heading[1].trim());
  }
  return titles;
}
