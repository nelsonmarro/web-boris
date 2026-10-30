/** Una sección vigilada por el scroll-spy de la portada: su ancla (`#universos`) y su caja en el viewport. */
export interface SpySection {
  hash: string;
  top: number;
  bottom: number;
}

/**
 * Ancla activa de la portada: la de la sección que cruza la línea de lectura (`line` px bajo el borde superior del
 * viewport). Si la línea cae en una sección sin enlace en la navbar (Vídeos, Personajes…) o entre dos, no hay ancla
 * activa (`''`, y la navbar marca «Inicio»): el menú marca lo que de verdad está en pantalla, no la última sección
 * que se pasó.
 * Puro (sin DOM): lo prueba `tests/navbar/scroll-spy.test.ts`.
 */
export function activeSpyHash(sections: readonly SpySection[], line: number): string {
  for (const s of sections) {
    if (s.top <= line && s.bottom > line) return s.hash;
  }
  return '';
}
