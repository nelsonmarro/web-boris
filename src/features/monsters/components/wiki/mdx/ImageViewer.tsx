'use client';

import * as React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/utils/cn';

export interface ViewerImage {
  src: string;
  alt: string;
  caption?: string;
}

interface ImageViewerProps {
  open: boolean;
  /** Cambia en cada apertura: la pista se monta de nuevo y se coloca en `initialIndex`. */
  session: number;
  images: ViewerImage[];
  initialIndex: number;
  /** Cierra el visor (el proveedor decide si hay que retroceder en el historial). */
  onRequestClose: () => void;
  /** Elemento de la ficha al que vuelve el foco al cerrar. */
  returnFocusRef: React.RefObject<HTMLElement | null>;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const navButton =
  'absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#061a2e] text-white transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary aria-disabled:cursor-default aria-disabled:opacity-30 aria-disabled:hover:text-white motion-reduce:transition-none md:inline-flex';

/**
 * Visor de imágenes de la ficha (spec Ola B §11): pantalla completa, una diapositiva por imagen con
 * scroll nativo (deslizar en táctil), ← → y Esc. Base UI `Dialog` aporta el modal, la trampa de foco,
 * Esc y el bloqueo del scroll de la página.
 */
export function ImageViewer({ open, session, images, initialIndex, onRequestClose, returnFocusRef }: ImageViewerProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onRequestClose();
      }}
    >
      {images.length > 0 && (
        <ViewerBody
          key={session}
          images={images}
          initialIndex={initialIndex}
          returnFocusRef={returnFocusRef}
        />
      )}
    </Dialog>
  );
}

function ViewerBody({
  images,
  initialIndex,
  returnFocusRef,
}: Pick<ImageViewerProps, 'images' | 'initialIndex' | 'returnFocusRef'>) {
  const count = images.length;
  const [index, setIndex] = React.useState(initialIndex);
  // Índice mostrado, legible desde los manejadores sin esperar a un render.
  const indexRef = React.useRef(initialIndex);
  // Diapositiva a la que va un desplazamiento suave en curso (para encadenar pulsaciones de flecha).
  const targetRef = React.useRef<number | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  // El foco estaba en el «Abrir original» de la diapositiva que se deja: debe seguir a la nueva.
  const followFocusRef = React.useRef(false);

  // Al montar la pista, se coloca sin suavizado en la imagen pulsada; si cambia su ancho (girar el móvil),
  // se recoloca en la diapositiva actual.
  const setTrack = React.useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    let lastWidth = -1;
    const align = () => {
      if (node.clientWidth === lastWidth) return;
      lastWidth = node.clientWidth;
      node.scrollTo({ left: indexRef.current * node.clientWidth, behavior: 'instant' });
    };
    align();
    const observer = new ResizeObserver(align);
    observer.observe(node);
    trackRef.current = node;
    return () => {
      observer.disconnect();
      trackRef.current = null;
    };
  }, []);

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    if (track.clientWidth === 0) return;
    const next = Math.min(count - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth)));
    if (targetRef.current === next) targetRef.current = null;
    if (next === indexRef.current) return;
    // Los enlaces de las diapositivas no activas pasan a `tabIndex={-1}`, pero conservan el foco si ya lo tenían:
    // se anota la intención para moverlo al de la nueva diapositiva en cuanto se pinte (ver el efecto de abajo).
    const active = document.activeElement;
    followFocusRef.current =
      active instanceof HTMLElement && active.hasAttribute('data-viewer-original') && track.contains(active);
    indexRef.current = next;
    setIndex(next);
  };

  React.useEffect(() => {
    if (!followFocusRef.current) return;
    followFocusRef.current = false;
    // `preventScroll`: el foco no debe mover la pista, que ya está colocada por el scroll nativo.
    trackRef.current?.querySelector<HTMLElement>(`[data-viewer-original="${index}"]`)?.focus({ preventScroll: true });
  }, [index]);

  const step = (delta: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.min(count - 1, Math.max(0, (targetRef.current ?? indexRef.current) + delta));
    targetRef.current = target;
    track.scrollTo({
      left: target * track.clientWidth,
      behavior: prefersReducedMotion() ? 'instant' : 'smooth',
    });
  };

  // `Dialog` detiene la propagación de las flechas en el popup: el manejador va en el propio popup.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    }
  };

  return (
    <DialogContent
      showCloseButton={false}
      finalFocus={() => {
        const origin = returnFocusRef.current;
        return origin && origin.isConnected ? origin : true;
      }}
      onKeyDown={onKeyDown}
      className={cn(
        // Pantalla completa sobre el fondo abisal, sin la tarjeta centrada por defecto del Dialog.
        'inset-0 flex h-full w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-[#00122E]/95 p-0 text-white ring-0 outline-hidden',
        'motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none',
      )}
    >
      <DialogTitle className="sr-only" aria-live="polite">
        Imagen {index + 1} de {count}
      </DialogTitle>

      <DialogClose
        aria-label="Cerrar"
        className="absolute top-3 right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#061a2e] text-white transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
      >
        <X aria-hidden="true" className="h-5 w-5" />
      </DialogClose>

      <button
        type="button"
        aria-label="Anterior"
        aria-disabled={index === 0}
        onClick={() => step(-1)}
        className={cn(navButton, 'left-4')}
      >
        <ChevronLeft aria-hidden="true" className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        aria-disabled={index === count - 1}
        onClick={() => step(1)}
        className={cn(navButton, 'right-4')}
      >
        <ChevronRight aria-hidden="true" className="h-5 w-5" />
      </button>

      <div
        ref={setTrack}
        role="group"
        aria-roledescription="carrusel"
        aria-label="Imágenes de la ficha"
        onScroll={onScroll}
        // Un gesto del usuario interrumpe el desplazamiento suave de las flechas.
        onPointerDown={() => {
          targetRef.current = null;
        }}
        onWheel={() => {
          targetRef.current = null;
        }}
        className="scrollbar-none flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {images.map((image, i) => (
          <div
            key={`${image.src}-${i}`}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${count}`}
            className="flex w-full shrink-0 snap-center snap-always flex-col items-center overflow-y-auto p-4"
          >
            <figure className="my-auto flex w-full max-w-6xl flex-col items-center">
              <div className="relative h-[70svh] w-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="100vw"
                  loading={Math.abs(i - index) <= 1 ? 'eager' : 'lazy'}
                  className="object-contain"
                />
              </div>
              {image.caption && (
                <figcaption className="mt-3 max-w-prose text-center text-[13px] leading-snug text-white/70">
                  {image.caption}
                </figcaption>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-[12px] text-white/70">
                  {i + 1} / {count}
                </span>
                <a
                  href={image.src}
                  data-viewer-original={i}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={i === index ? 0 : -1}
                  className="inline-flex min-h-11 items-center rounded-md px-2 text-[11px] font-bold uppercase tracking-wider text-white/70 underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
                >
                  Abrir original
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </div>
            </figure>
          </div>
        ))}
      </div>
    </DialogContent>
  );
}
