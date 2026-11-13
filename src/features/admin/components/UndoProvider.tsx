'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface Offer {
  id: number;
  message: string;
  undo: () => void;
}

type OfferUndo = (message: string, undo: () => void) => void;

const UndoContext = createContext<OfferUndo>(() => {});

/** Tras quitar algo: `offerUndo('Sección quitada.', () => restaurar())` muestra «Deshacer» unos segundos. */
export const useUndo = () => useContext(UndoContext);

const VISIBLE_MS = 10_000;

/**
 * Aviso «Quitado · Deshacer» del panel. Desaparece a los 10 s, al cambiar de página y en cuanto se escribe en
 * cualquier campo: deshacer devuelve la lista tal como estaba, así que no debe pisar lo que se haya escrito después.
 */
export function UndoProvider({ children }: { children: React.ReactNode }) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const counter = useRef(0);
  const pathname = usePathname();
  const offerUndo = useCallback<OfferUndo>((message, undo) => {
    counter.current += 1;
    setOffer({ id: counter.current, message, undo });
  }, []);

  useEffect(() => {
    if (!offer) return;
    const timer = window.setTimeout(() => setOffer(null), VISIBLE_MS);
    const onInput = () => setOffer(null);
    document.addEventListener('input', onInput, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('input', onInput, true);
    };
  }, [offer]);

  // Al cambiar de página, el aviso de la anterior ya no vale.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOffer(null);
  }

  return (
    <UndoContext value={offerUndo}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        {offer ? (
          <div key={offer.id} className="pointer-events-auto flex max-w-xl items-center gap-4 rounded-xl border border-white/20 bg-[#061a2e] px-4 py-3 text-white shadow-lg shadow-black/40">
            <span className="min-w-0 flex-1">{offer.message}</span>
            <button
              type="button"
              className="min-h-10 rounded-lg px-3 font-semibold text-primary underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => {
                offer.undo();
                setOffer(null);
              }}
            >
              Deshacer
            </button>
          </div>
        ) : null}
      </div>
    </UndoContext>
  );
}
