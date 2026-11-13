/**
 * Lo que se está editando, sin guardar, para la vista previa en vivo (spec 2026-11-13-editor-por-apartados). Vive en la
 * memoria del servidor (`globalThis`, que comparten las páginas y las acciones), por persona y ficha: no toca el
 * borrador ni la base. Puro: el almacén se pasa como parámetro para poder probarlo.
 */
export interface StashEntry<T> {
  data: T;
  at: number;
}

export const STASH_TTL_MS = 30 * 60 * 1000;
export const STASH_MAX = 50;

export const stashKey = (userId: string, slug: string) => `${userId}:${slug}`;

/** Guarda `data`, quita lo caducado y, si pasa del tope, lo más antiguo. */
export function putStash<T>(store: Map<string, StashEntry<T>>, key: string, data: T, now: number): void {
  for (const [other, entry] of store) if (now - entry.at > STASH_TTL_MS) store.delete(other);
  store.delete(key);
  store.set(key, { data, at: now });
  while (store.size > STASH_MAX) store.delete(store.keys().next().value!);
}

export function getStash<T>(store: Map<string, StashEntry<T>>, key: string, now: number): T | null {
  const entry = store.get(key);
  if (!entry || now - entry.at > STASH_TTL_MS) return null;
  return entry.data;
}
