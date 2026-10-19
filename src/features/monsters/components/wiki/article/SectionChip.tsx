'use client';

import * as React from 'react';
import { ListTree } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useActiveHeading } from '@/features/monsters/hooks/useActiveHeading';
import { cn } from '@/utils/cn';
import type { WikiHeading } from '@/utils/headings';

/** Con menos apartados el índice no ayuda a orientarse. */
const MIN_SECTIONS = 3;

interface SectionChipProps {
  headings: WikiHeading[];
}

/** Hay algo que medir: el elemento existe y no está oculto (`display: none` de un ancestro o propio). */
const isRendered = (el: HTMLElement) => el.getClientRects().length > 0;

/**
 * Chip flotante (solo sin rail lateral) con el apartado actual y su posición n/N. Al tocarlo abre una hoja inferior
 * con el índice de los `h2`; elegir uno cierra la hoja y salta a esa sección.
 *
 * Visible si, y solo si:
 * - la fila de desplegables `[data-article-disclosures]` está pintada (con rail, su contenedor está oculto);
 * - esa fila ya salió de la ventana por arriba;
 * - el bloque de cierre `[data-related]` (Aparece en, vecinos y pie, un único contenedor en la página de la ficha) aún
 *   no entró en la ventana. Si no existe, hasta que el cuerpo termina de verse.
 */
export function SectionChip({ headings }: SectionChipProps) {
  const sections = React.useMemo(() => headings.filter((h) => h.level === 2), [headings]);
  const enabled = sections.length >= MIN_SECTIONS;
  const activeId = useActiveHeading(enabled ? sections.map((h) => h.id) : []);

  const [visible, setVisible] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  // Apartado elegido en la hoja: el salto espera a que termine de cerrarse (ver `handleCloseAutoFocus`).
  const pendingId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!enabled) return;
    let frame = 0;

    const compute = () => {
      frame = 0;
      const anchor = document.querySelector<HTMLElement>('[data-article-disclosures]');
      let next = false;
      if (anchor && isRendered(anchor) && anchor.getBoundingClientRect().bottom < 0) {
        const related = document.querySelector<HTMLElement>('[data-related]');
        if (related) {
          next = related.getBoundingClientRect().top >= window.innerHeight;
        } else {
          // Sin bloque de cierre: se oculta cuando el final del cuerpo ya está a la vista.
          const body = document.querySelector<HTMLElement>('[data-article-body]');
          next = !body || body.getBoundingClientRect().bottom > window.innerHeight;
        }
      }
      setVisible((prev) => (prev === next ? prev : next));
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // El layout cambia sin scroll ni resize de la ventana (sidebar que se pliega, imágenes que cargan): el
    // contenedor del artículo puede cruzar @5xl y la fila de desplegables pasa a estar o no pintada.
    const observer = new ResizeObserver(schedule);
    const anchor = document.querySelector<HTMLElement>('[data-article-disclosures]');
    const body = document.querySelector<HTMLElement>('[data-article-body]');
    if (anchor) observer.observe(anchor);
    if (body) observer.observe(body);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  const activeIndex = Math.max(
    0,
    sections.findIndex((h) => h.id === activeId),
  );
  const current = sections[activeIndex];

  const handleOpenChange = (next: boolean) => {
    if (next) pendingId.current = null;
    setOpen(next);
  };

  /**
   * Salto al apartado elegido. Radix dispara `onCloseAutoFocus` al desmontar el contenido, es decir, cuando la
   * animación de salida ya terminó y, en Safari, vaul ya devolvió el scroll a donde estaba (`window.scrollTo` en un
   * rAF): un salto inmediato al elegir quedaría pisado. Sin apartado elegido (la hoja se cerró con Esc, arrastrando
   * o tocando fuera) no se hace nada y Radix devuelve el foco al chip.
   */
  const handleCloseAutoFocus = (event: Event) => {
    const id = pendingId.current;
    pendingId.current = null;
    if (!id) return;
    const heading = document.getElementById(id);
    if (!heading) return;
    // El foco va al encabezado (no al chip): el siguiente Tab continúa por el contenido de ese apartado.
    event.preventDefault();
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    heading.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    // `history.state` se conserva tal cual: el router de Next 16 guarda ahí su árbol.
    window.history.replaceState(window.history.state, '', `#${id}`);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      {/* Con la hoja abierta el disparador se queda aunque el scroll lo oculte: Radix le devuelve el foco al cerrar. */}
      {(visible || open) && (
        <DrawerTrigger asChild>
          <button
            type="button"
            aria-label={`Apartado actual: ${current.text} (${activeIndex + 1} de ${sections.length}). Abrir índice`}
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-40 inline-flex h-11 max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-[#061a2e] px-4 shadow-[0_20px_50px_rgba(0,0,0,0.55)] animate-in fade-in-0 slide-in-from-bottom-2 duration-200 hover:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:animate-none"
          >
            <ListTree aria-hidden="true" className="h-4 w-4 shrink-0 text-white/80" />
            <span className="truncate text-sm font-semibold text-white">{current.text}</span>
            <span className="shrink-0 text-sm font-semibold text-white/60">
              · {activeIndex + 1}/{sections.length}
            </span>
          </button>
        </DrawerTrigger>
      )}

      <DrawerContent className="border-white/15 bg-[#061a2e] text-white" onCloseAutoFocus={handleCloseAutoFocus}>
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base font-bold text-white">Contenido</DrawerTitle>
          <DrawerDescription className="sr-only">Elige un apartado para ir a él.</DrawerDescription>
        </DrawerHeader>
        <nav
          aria-label="Apartados del artículo"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        >
          <ul className="divide-y divide-white/5">
            {sections.map((h, index) => {
              const active = index === activeIndex;
              return (
                <li key={h.id}>
                  {/* DrawerClose cierra por la vía interna de vaul (restaura el body y desmonta con la animación). */}
                  <DrawerClose asChild>
                    <button
                      type="button"
                      aria-current={active ? 'location' : undefined}
                      onClick={() => {
                        pendingId.current = h.id;
                      }}
                      className={cn(
                        'relative flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm leading-tight transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary motion-reduce:transition-none',
                        active ? 'font-bold text-primary' : 'font-semibold text-white/80 hover:text-white',
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                        />
                      )}
                      <span className="min-w-[1.5rem] shrink-0 font-mono text-xs font-bold">{h.numbering}</span>
                      <span>{h.text}</span>
                    </button>
                  </DrawerClose>
                </li>
              );
            })}
          </ul>
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
