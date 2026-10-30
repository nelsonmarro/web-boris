'use client';

/**
 * Piezas de navegador de la Arena: las predicciones guardadas (`localStorage`, clave `wb-arena`, a prueba de fallos),
 * `prefers-reduced-motion` y compartir un texto (share nativo → portapapeles).
 */
import * as React from 'react';
import { toast } from 'sonner';
import {
  ARENA_STORAGE_KEY,
  parsePredictions,
  recordPrediction,
  serializePredictions,
  type PredictionStats,
} from '@/features/monsters/lib/arena-battle';

/* ---------- Predicciones ---------- */

const listeners = new Set<() => void>();
/** Sin almacenamiento (modo privado, datos bloqueados) las predicciones viven en memoria hasta cerrar la pestaña. */
let memory: string | null = null;

function readRaw(): string | null {
  try {
    return localStorage.getItem(ARENA_STORAGE_KEY) ?? memory;
  } catch {
    return memory;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === ARENA_STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Anota una predicción (acierto o fallo) y avisa a quien muestre el marcador. */
export function savePrediction(correct: boolean) {
  const next = serializePredictions(recordPrediction(parsePredictions(readRaw()), correct));
  memory = next;
  try {
    localStorage.setItem(ARENA_STORAGE_KEY, next);
  } catch {
    /* sin espacio o sin permiso: queda en memoria */
  }
  listeners.forEach((l) => l());
}

/** `null` en el servidor y durante la hidratación (la línea queda reservada); el valor guardado justo después. */
export function usePredictionStats(): PredictionStats | null {
  const raw = React.useSyncExternalStore<string | null | undefined>(subscribe, readRaw, () => undefined);
  return React.useMemo(() => (raw === undefined ? null : parsePredictions(raw)), [raw]);
}

/* ---------- Movimiento reducido ---------- */

/** Se consulta al empezar un combate: con `prefers-reduced-motion`, todos los asaltos a la vez. */
export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/* ---------- Compartir ---------- */

/** Share nativo con el texto (que ya incluye la URL); si no hay o falla, al portapapeles con aviso. */
export async function shareText(text: string, copiedMessage: string) {
  const data = { text };
  if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(data))) {
    try {
      await navigator.share(data);
      return;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      // Cualquier otro fallo del share nativo cae al portapapeles.
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success(copiedMessage);
  } catch {
    toast.error('No se pudo copiar el resultado');
  }
}
