'use client';

import * as React from 'react';
import { ImageViewer, type ViewerImage } from './ImageViewer';

interface ArticleImagesContextValue {
  /**
   * Abre el visor en la imagen pulsada. `origin` es el enlace pulsado: distingue dos imágenes con el
   * mismo `src` y es el elemento al que vuelve el foco. Devuelve `false` si no encuentra la imagen
   * (entonces el enlace sigue su curso).
   */
  open: (src: string, origin?: HTMLElement | null) => boolean;
}

const ArticleImagesContext = React.createContext<ArticleImagesContextValue | null>(null);

/** Marca del estado que el visor empuja al historial: permite saber si la entrada actual es suya. */
const HISTORY_FLAG = 'wbViewer';

const ownsHistoryEntry = () => Boolean((window.history.state as Record<string, unknown> | null)?.[HISTORY_FLAG]);

interface ViewerSession {
  id: number;
  images: ViewerImage[];
  index: number;
}

const NO_SESSION: ViewerSession = { id: 0, images: [], index: 0 };

/**
 * Envuelve el cuerpo de la ficha. Al pulsar una imagen reúne, en orden del DOM, todas las que llevan
 * `data-viewer-src` dentro de su contenedor y abre `ImageViewer` en la pulsada. También gestiona el
 * historial: abrir empuja una entrada y el botón «atrás» del navegador cierra el visor.
 */
export function ArticleImagesProvider({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const originRef = React.useRef<HTMLElement | null>(null);
  // `history.back()` es asíncrono: hasta que llega `popstate` no se admite otra petición de cierre.
  const backPendingRef = React.useRef(false);
  const [session, setSession] = React.useState<ViewerSession>(NO_SESSION);
  const [isOpen, setIsOpen] = React.useState(false);

  const open = React.useCallback<ArticleImagesContextValue['open']>((src, origin) => {
    const nodes = Array.from(containerRef.current?.querySelectorAll<HTMLElement>('[data-viewer-src]') ?? []);
    const images = nodes.map<ViewerImage>((node) => ({
      src: node.dataset.viewerSrc ?? '',
      alt: node.dataset.viewerAlt ?? '',
      caption: node.dataset.viewerCaption || undefined,
    }));
    let index = origin ? nodes.indexOf(origin) : -1;
    if (index < 0) index = images.findIndex((image) => image.src === src);
    if (index < 0) return false;

    const focused = document.activeElement;
    originRef.current = origin ?? (focused instanceof HTMLElement ? focused : null);
    backPendingRef.current = false;
    setSession((prev) => ({ id: prev.id + 1, images, index }));
    setIsOpen(true);
    window.history.pushState({ [HISTORY_FLAG]: true }, '');
    return true;
  }, []);

  // Cerrar con el botón o con Esc: si la entrada del historial es nuestra, se retrocede (el cierre llega
  // por `popstate`); si no, se cierra directamente.
  const requestClose = React.useCallback(() => {
    if (backPendingRef.current) return;
    if (ownsHistoryEntry()) {
      backPendingRef.current = true;
      window.history.back();
    } else {
      setIsOpen(false);
    }
  }, []);

  // El botón «atrás» (o el gesto) cierra el visor sin salir de la ficha.
  React.useEffect(() => {
    if (!isOpen) return;
    const onPopState = () => {
      backPendingRef.current = false;
      setIsOpen(false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isOpen]);

  const value = React.useMemo(() => ({ open }), [open]);

  return (
    <ArticleImagesContext.Provider value={value}>
      <div ref={containerRef} className="contents">
        {children}
      </div>
      <ImageViewer
        open={isOpen}
        session={session.id}
        images={session.images}
        initialIndex={session.index}
        onRequestClose={requestClose}
        returnFocusRef={originRef}
      />
    </ArticleImagesContext.Provider>
  );
}

interface ViewerLinkProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Enlace de una imagen de la ficha. Sin JavaScript (o fuera de una ficha) es el enlace al archivo en
 * una pestaña nueva; con el proveedor, un clic abre el visor dentro de la página. Los clics con
 * modificador o con el botón central conservan el comportamiento del enlace.
 */
export function ViewerLink({ src, alt, caption, className, children }: ViewerLinkProps) {
  const viewer = React.useContext(ArticleImagesContext);

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!viewer || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (viewer.open(src, event.currentTarget)) event.preventDefault();
  };

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={alt ? `Ampliar imagen: ${alt}` : 'Ampliar imagen'}
      data-viewer-src={src}
      data-viewer-alt={alt}
      data-viewer-caption={caption}
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
