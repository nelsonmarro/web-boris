'use client';

import * as React from 'react';

/**
 * Devuelve el id del heading activo según el scroll (IntersectionObserver).
 * `rootMargin` deja una banda superior bajo el header sticky (h-16).
 */
export function useActiveHeading(ids: string[], rootMargin = '-80px 0px -70% 0px') {
  const [activeId, setActiveId] = React.useState<string | null>(ids[0] ?? null);
  const key = ids.join('|');

  React.useEffect(() => {
    if (ids.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const visible = new Set<string>();
    const pick = () => {
      const first = ids.find((id) => visible.has(id));
      if (first) setActiveId(first);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        pick();
      },
      { rootMargin, threshold: 0 },
    );

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, rootMargin]);

  return activeId;
}
