/**
 * Aviso al salir de un editor con cambios sin guardar (`useLeaveGuard`). `beforeunload` solo salta al cerrar o recargar
 * la pestaña: los enlaces del panel navegan dentro de la app y los formularios con acción de servidor (retirar,
 * recuperar una versión, cerrar sesión) vuelven a montar el editor, así que también hay que vigilar esos. Puro.
 */

/** Marca de los formularios que, al enviarse, recargan el editor o salen de él y tirarían lo que no se ha guardado. */
export const DISCARDS_EDITS = 'data-discards-edits';
/** Para esparcir en un `<form>`: `<form {...discardsEdits} action={…}>`. */
export const discardsEdits = { [DISCARDS_EDITS]: '' } as const;

export interface LinkTarget {
  href: string;
  /** El `target` del enlace (`''` si no tiene). */
  target: string;
  download: boolean;
}

/** ¿Este enlace saca de la página `current`? Los que abren otra pestaña, descargan o solo cambian el `#` no. */
export function leavesPage(link: LinkTarget, current: string): boolean {
  if (link.download || (link.target !== '' && link.target !== '_self')) return false;
  let url: URL;
  let here: URL;
  try {
    here = new URL(current);
    url = new URL(link.href, here);
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  return !(url.origin === here.origin && url.pathname === here.pathname && url.search === here.search);
}
