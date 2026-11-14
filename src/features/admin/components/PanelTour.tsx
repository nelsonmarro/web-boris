'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Compass } from 'lucide-react';
import 'driver.js/dist/driver.css';
import './panel-tour.css';
import { presentSteps, TOUR_LABELS, TOURS, tourSeenKey, tourSelector, type TourId } from '../lib/panel-tours';
import { SMALL_BUTTON } from './editor/field-styles';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** `localStorage` puede fallar (ventana privada, datos bloqueados): entonces no se sabe si ya se vio. */
function readSeen(key: string): boolean | null {
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return null;
  }
}

function markSeen(key: string) {
  try {
    window.localStorage.setItem(key, new Date().toISOString());
  } catch {
    // Sin almacenamiento no se recuerda; tampoco se lanzará solo (ver `readSeen`).
  }
}

/**
 * Botón «Ver el recorrido» y recorrido guiado con driver.js (`lib/panel-tours.ts`). La primera vez que se abre la
 * página se lanza solo; luego, desde el botón. driver.js se carga al empezar, no con la página, y solo existe en el panel.
 * Al terminar, el foco vuelve al botón.
 */
export function PanelTour({ tourId }: { tourId: TourId }) {
  const tour = TOURS[tourId];
  const button = useRef<HTMLButtonElement>(null);
  const running = useRef(false);

  const start = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    try {
      const { driver } = await import('driver.js');
      const steps = presentSteps(tour.steps, (target) => document.querySelector(tourSelector(target)) !== null);
      const still = reducedMotion();
      driver({
        ...TOUR_LABELS,
        steps: steps.map((step) => ({
          element: step.target ? tourSelector(step.target) : undefined,
          popover: { title: step.title, description: step.description, side: step.side },
        })),
        showProgress: true,
        animate: !still,
        smoothScroll: !still,
        allowClose: true,
        // Lo resaltado se ve pero no se pulsa: nada de publicar o retirar sin querer a mitad del recorrido.
        disableActiveInteraction: true,
        stagePadding: 6,
        stageRadius: 16,
        popoverClass: 'wb-tour',
        onDestroyed: () => {
          running.current = false;
          markSeen(tourSeenKey(tour));
          button.current?.focus();
        },
      }).drive();
    } catch (error) {
      // Si no llega el código del recorrido (sin conexión, despliegue a medias), el editor sigue igual.
      running.current = false;
      console.error('[panel] no se pudo abrir el recorrido:', error);
    }
  }, [tour]);

  // La primera vez, solo. Un momento después de montar, para que el editor ya esté pintado y en su sitio.
  useEffect(() => {
    if (readSeen(tourSeenKey(tour)) !== false) return;
    const timer = window.setTimeout(() => void start(), 600);
    return () => window.clearTimeout(timer);
  }, [tour, start]);

  return (
    <button ref={button} type="button" className={SMALL_BUTTON} onClick={() => void start()}>
      <Compass aria-hidden="true" className="size-4" />
      Ver el recorrido
    </button>
  );
}
