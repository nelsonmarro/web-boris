import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

/** Clave de `localStorage` del registro (spec Ola C §1). */
export const REGISTRO_STORAGE_KEY = 'wb-registro';

interface RegistroState {
  /** slug → fecha ISO de la primera apertura. Las fichas selladas también se marcan; solo no suman. */
  seen: Record<string, string>;
  markSeen: (slug: string) => void;
}

const hasOwn = (seen: Record<string, string>, slug: string) => Object.prototype.hasOwnProperty.call(seen, slug);

/**
 * `localStorage` a prueba de fallos: modo privado, datos de sitio bloqueados, cuota llena, JSON dañado o
 * ejecución en el servidor (donde no existe). Ningún error sale de aquí: sin persistencia el sitio
 * funciona igual y el registro vive en memoria hasta cerrar la pestaña.
 */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      // Un JSON dañado haría que Zustand abortara la hidratación sin marcarla como terminada.
      if (raw !== null) JSON.parse(raw);
      return raw;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* sin espacio o sin permiso: se ignora */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* se ignora */
    }
  },
};

/** Solo pares slug → fecha (texto); descarta lo que no tenga esa forma. */
function cleanSeen(value: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
  for (const [slug, date] of Object.entries(value)) {
    if (typeof date === 'string') out[slug] = date;
  }
  return out;
}

/**
 * Registro de expedientes vistos (spec Ola C §5). Vive solo en el navegador (`localStorage`): las páginas
 * son ISR y nunca leen este estado en el servidor. Los componentes que lo pintan esperan a
 * `useRegistroHydrated()` y hasta entonces muestran el estado neutro (nada abierto).
 */
export const useRegistro = create<RegistroState>()(
  persist(
    (set, get) => ({
      seen: {},
      markSeen: (slug) => {
        // Ya visto: ni re-render ni escritura. Conserva la fecha de la primera apertura.
        if (hasOwn(get().seen, slug)) return;
        set((s) => ({ seen: { ...s.seen, [slug]: new Date().toISOString() } }));
      },
    }),
    {
      name: REGISTRO_STORAGE_KEY,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ seen: s.seen }),
      // Une lo guardado con lo que ya hay en memoria (nunca se pierde un expediente) y limpia datos ajenos.
      merge: (persisted, current) => {
        const stored = cleanSeen((persisted as Partial<RegistroState> | undefined)?.seen);
        const seen = { ...current.seen };
        for (const [slug, date] of Object.entries(stored)) {
          if (!hasOwn(seen, slug) || date < seen[slug]) seen[slug] = date;
        }
        return { ...current, seen };
      },
    },
  ),
);

// Varias pestañas: si otra escribe el registro, esta se pone al día (la unión de `merge` evita pisarlo).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === null || e.key === REGISTRO_STORAGE_KEY) void useRegistro.persist.rehydrate();
  });
}

const subscribeHydration = (onChange: () => void) => useRegistro.persist.onFinishHydration(onChange);
const isHydrated = () => useRegistro.persist.hasHydrated();
const notHydrated = () => false;

/**
 * `false` en el servidor y durante la hidratación de React (así el HTML coincide), `true` justo después.
 * `useSyncExternalStore` evita el patrón `useEffect` + `setState`.
 */
export function useRegistroHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, isHydrated, notHydrated);
}

const NO_SEEN: Record<string, string> = {};

/** Los vistos del fan; un objeto vacío (estable) hasta hidratar. */
export function useSeen(): Record<string, string> {
  const hydrated = useRegistroHydrated();
  const seen = useRegistro((s) => s.seen);
  return hydrated ? seen : NO_SEEN;
}

/** Si esta ficha ya se abrió; `false` hasta hidratar. */
export function useIsSeen(slug: string): boolean {
  const hydrated = useRegistroHydrated();
  const isSeen = useRegistro((s) => hasOwn(s.seen, slug));
  return hydrated && isSeen;
}
