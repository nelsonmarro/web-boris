'use client';

import * as React from 'react';

/** Alto de la cabecera sticky de la wiki (`h-16`): el cuerpo empieza a contar al llegar a su borde inferior. */
const HEADER_HEIGHT = 64;

/**
 * Barra de progreso de lectura de 2 px, fija bajo la cabecera de la wiki.
 *
 * Avanza de 0 a 1 mientras se recorre el cuerpo del artículo (`[data-article-body]`): 0 cuando su borde superior
 * llega a la cabecera y 1 cuando su borde inferior llega al pie de la ventana, es decir, hasta el final de la
 * última sección. Escribe `transform` directamente en el DOM (sin estado de React) para no renderizar por frame.
 * Es decorativa (`aria-hidden`). No anima nada, así que no necesita `motion-reduce:`.
 */
export function ArticleProgress() {
  const barRef = React.useRef<HTMLDivElement>(null);
  const fillRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const body = document.querySelector<HTMLElement>('[data-article-body]');
    const bar = barRef.current;
    const fill = fillRef.current;
    if (!body || !bar || !fill) return;

    // La barra se alinea con la columna de lectura: con la sidebar fija abierta no debe cruzarla.
    const article = body.closest('article');
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = body.getBoundingClientRect();
      // Recorrido total: lo que el cuerpo mide por encima de lo que cabe entre la cabecera y el pie de la ventana.
      const span = rect.height - (window.innerHeight - HEADER_HEIGHT);
      const progress = span > 0 ? Math.min(1, Math.max(0, (HEADER_HEIGHT - rect.top) / span)) : 0;
      fill.style.transform = `scaleX(${progress})`;

      const box = (article ?? body).getBoundingClientRect();
      bar.style.left = `${box.left}px`;
      bar.style.right = `${document.documentElement.clientWidth - box.right}px`;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // El cuerpo cambia de alto al cargar imágenes y la columna cambia de ancho al plegar la sidebar.
    const observer = new ResizeObserver(schedule);
    observer.observe(body);
    if (article) observer.observe(article);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={barRef} aria-hidden="true" className="pointer-events-none fixed left-0 right-0 top-16 z-40 h-0.5">
      <div
        ref={fillRef}
        className="h-full w-full origin-left bg-primary will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
