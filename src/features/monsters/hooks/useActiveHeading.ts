'use client';

import * as React from 'react';

/**
 * Id del heading activo según el scroll: el último cuyo borde superior ya pasó
 * la línea `offset` (bajo el header sticky). Estable aunque ningún título esté en pantalla.
 */
export function useActiveHeading(ids: string[], offset = 96) {
  const [activeId, setActiveId] = React.useState<string | null>(ids[0] ?? null);
  const key = ids.join('|');

  React.useEffect(() => {
    if (ids.length === 0) return;
    let frame = 0;

    const compute = () => {
      frame = 0;
      let current: string | null = ids[0] ?? null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset) current = id;
        else break;
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, offset]);

  return activeId;
}
