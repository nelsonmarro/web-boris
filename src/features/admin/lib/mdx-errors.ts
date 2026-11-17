/** Errores de sintaxis del MDX (de micromark/mdx-js, en inglés) contados en llano para quien edita. Puro. */

const RULES: [RegExp, (match: RegExpExecArray) => string][] = [
  [/Expected a closing tag for `<([^>`]+)>`/, (m) => `falta cerrar la etiqueta <${m[1]}>: termínala con </${m[1]}> (o con /> si no lleva texto dentro)`],
  [/Unexpected closing tag `<\/([^>`]+)>`, expected corresponding closing tag for `<([^>`]+)>`/, (m) => `la etiqueta <${m[2]}> se cierra con </${m[1]}>: deben llamarse igual`],
  [/Unexpected closing slash `\/` in tag, expected an open tag first/, () => 'hay una etiqueta de cierre </…> sin su etiqueta de apertura'],
  [/Unexpected end of file (before|in|after)/, () => 'el texto acaba con una etiqueta < > sin terminar'],
  [/Unexpected (character|lazy line)/, () => 'hay un signo < o > donde no corresponde: si es texto, quítalo o escríbelo de otra forma'],
];

export function mdxErrorInSpanish(reason: string): string {
  for (const [pattern, describe] of RULES) {
    const match = pattern.exec(reason);
    if (match) return describe(match);
  }
  return 'hay una etiqueta < > mal escrita';
}
