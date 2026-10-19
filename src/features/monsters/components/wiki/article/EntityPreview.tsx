'use client';

import * as React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/utils/cn';
import { getWikiIndex } from '@/features/monsters/actions/get-wiki-articles';
import { CategoryPlaceholder, isBrandPlaceholder } from '@/features/monsters/components/wiki/CategoryPlaceholder';

/** Los enlaces automáticos que pone `remarkEntityLinks` (`data-entity="<slug>"`), solo dentro del cuerpo de la ficha. */
const ENTITY_LINK = 'a[data-entity]';
const ARTICLE_BODY = '[data-article-body]';
const CARD = '[data-entity-preview]';
/** Solo los punteros con hover real (ratón, lápiz); en táctil no hay vista previa al pasar. */
const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

const HOVER_DELAY_MS = 300;
/** Margen para cruzar el hueco entre el enlace y la tarjeta sin que se cierre (WCAG 1.4.13: se puede pasar por encima). */
const HIDE_DELAY_MS = 120;
const GAP = 8;
const MARGIN = 8;

interface Active {
  link: HTMLAnchorElement;
  slug: string;
  via: 'pointer' | 'keyboard';
  /** Dónde estaba el puntero al abrir: elige la línea de un enlace partido en dos. */
  y?: number;
}

const asElement = (target: EventTarget | null) => (target instanceof Element ? target : null);

function entityLinkOf(target: EventTarget | null): HTMLAnchorElement | null {
  const link = asElement(target)?.closest<HTMLAnchorElement>(ENTITY_LINK) ?? null;
  return link && link.dataset.entity && link.closest(ARTICLE_BODY) ? link : null;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Coloca la tarjeta (`position: fixed`) debajo del enlace o encima, según el espacio, y dentro del viewport. */
function place(card: HTMLElement, { link, y }: Active) {
  const rects = Array.from(link.getClientRects());
  const rect =
    (y !== undefined && rects.find((r) => y >= r.top && y <= r.bottom)) || rects[0] || link.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;
  const width = card.offsetWidth;
  const height = card.offsetHeight;

  const roomBelow = viewportHeight - rect.bottom - GAP - MARGIN;
  const roomAbove = rect.top - GAP - MARGIN;
  const below = height <= roomBelow || roomBelow >= roomAbove;
  const top = below ? rect.bottom + GAP : rect.top - GAP - height;

  card.style.left = `${clamp(rect.left, MARGIN, Math.max(MARGIN, viewportWidth - width - MARGIN))}px`;
  card.style.top = `${clamp(top, MARGIN, Math.max(MARGIN, viewportHeight - height - MARGIN))}px`;
}

/**
 * Vista previa de los enlaces automáticos de la ficha (spec Ola C §6): al pasar el ratón (300 ms) o al enfocar con
 * el teclado un `a[data-entity]` del cuerpo, una tarjeta con la miniatura, el título, «Categoría · Universo» y la
 * descripción. Se monta una vez por ficha; usa delegación de eventos en el documento, así que no toca el MDX.
 *
 * - Con puntero solo bajo `(hover: hover) and (pointer: fine)`; con el foco de teclado (`:focus-visible`) siempre.
 * - Se cierra al salir, con Esc, al hacer scroll o al pulsar. Con el teclado el scroll recoloca en vez de cerrar
 *   (el propio foco puede desplazar la página).
 * - Los datos son los del índice de la paleta (`['wiki-index']`): una sola petición compartida, y solo se pide
 *   cuando el fan se acerca por primera vez a un enlace.
 * - `position: fixed` en un portal: no mueve nada del texto y no le afecta ningún `transform` de los ancestros.
 */
export function EntityPreview() {
  const id = React.useId();
  const pathname = usePathname();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const activeRef = React.useRef<Active | null>(null);
  const hideRef = React.useRef<() => void>(() => {});
  const [active, setActive] = React.useState<Active | null>(null);
  const [armed, setArmed] = React.useState(false);
  const [tick, setTick] = React.useState(0);

  const { data: index } = useQuery({
    queryKey: ['wiki-index'],
    queryFn: () => getWikiIndex(),
    staleTime: Infinity,
    enabled: armed,
  });
  const entry = React.useMemo(
    () => (active ? index?.find((e) => e.slug === active.slug) : undefined),
    [index, active],
  );
  const shown = active && entry ? active : null;

  React.useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const canHover = () => window.matchMedia(HOVER_QUERY).matches;
    const commit = (next: Active | null) => {
      activeRef.current = next;
      setActive(next);
    };
    const hide = () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      if (activeRef.current) commit(null);
    };
    const hideSoon = () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      if (activeRef.current) hideTimer = setTimeout(hide, HIDE_DELAY_MS);
    };
    hideRef.current = hide;

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !canHover()) return;
      const target = asElement(event.target);
      if (target?.closest(CARD)) {
        clearTimeout(hideTimer);
        return;
      }
      const link = entityLinkOf(target);
      if (!link) return;
      clearTimeout(hideTimer);
      if (activeRef.current?.link === link) return;
      // De un enlace a otro: la tarjeta del primero se va ya; la del segundo llega tras el retardo.
      if (activeRef.current) commit(null);
      clearTimeout(showTimer);
      setArmed(true);
      const y = event.clientY;
      showTimer = setTimeout(() => commit({ link, slug: link.dataset.entity!, via: 'pointer', y }), HOVER_DELAY_MS);
    };

    const onOut = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const target = asElement(event.target);
      const from = entityLinkOf(target) ?? target?.closest(CARD) ?? null;
      if (!from) return;
      const to = asElement(event.relatedTarget);
      // Seguir dentro del enlace (entre sus hijos) o pasar del enlace a la tarjeta no cierra nada.
      if (to && (from.contains(to) || to.closest(CARD))) return;
      hideSoon();
    };

    const onFocusIn = (event: FocusEvent) => {
      const link = entityLinkOf(event.target);
      // `:focus-visible` distingue el teclado del clic con el ratón o el toque, que no deben abrir la vista previa.
      if (!link || !link.matches(':focus-visible')) return;
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      setArmed(true);
      commit({ link, slug: link.dataset.entity!, via: 'keyboard' });
    };

    const onFocusOut = (event: FocusEvent) => {
      if (entityLinkOf(event.target)) hide();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };

    const onScrollOrResize = () => {
      if (activeRef.current?.via === 'keyboard') setTick((n) => n + 1);
      else hide();
    };

    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', hide, true);
    window.addEventListener('scroll', onScrollOrResize, { capture: true, passive: true });
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', hide, true);
      window.removeEventListener('scroll', onScrollOrResize, { capture: true });
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  // Si la ruta cambia (navegación del cliente), la tarjeta no puede quedarse apuntando a un enlace que ya no existe.
  React.useEffect(() => () => hideRef.current(), [pathname]);

  // Colocar antes de pintar: la tarjeta nunca se ve en un sitio provisional.
  React.useLayoutEffect(() => {
    if (shown && cardRef.current) place(cardRef.current, shown);
  }, [shown, tick]);

  // El enlace se describe con la tarjeta mientras ésta se ve; al ocultarla, vuelve a como estaba.
  React.useEffect(() => {
    if (!shown) return;
    const { link } = shown;
    const previous = link.getAttribute('aria-describedby');
    link.setAttribute('aria-describedby', [previous, id].filter(Boolean).join(' '));
    return () => {
      if (previous) link.setAttribute('aria-describedby', previous);
      else link.removeAttribute('aria-describedby');
    };
  }, [shown, id]);

  if (!shown || !entry) return null;

  const cover = entry.image && !isBrandPlaceholder(entry.image) ? entry.image : undefined;
  const pending = entry.status === 'proximamente';
  const meta = [entry.category, entry.universe].filter(Boolean).join(' · ');

  return createPortal(
    <div
      ref={cardRef}
      id={id}
      role="tooltip"
      data-entity-preview=""
      className="fixed left-0 top-0 z-50 w-[min(20rem,calc(100vw-1rem))] max-w-xs overflow-hidden rounded-xl border border-white/15 bg-[#061a2e] shadow-[0_24px_48px_rgba(0,0,0,0.6)]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#00122E]">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="320px"
            loading="eager"
            className={cn('object-cover', pending && 'opacity-70 grayscale')}
            style={{ objectPosition: entry.imagePosition ?? '50% 50%' }}
          />
        ) : (
          <CategoryPlaceholder category={entry.category} variant="corner" />
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <p className="font-display text-lg font-black uppercase italic leading-tight tracking-tight text-white">
          {entry.title}
        </p>
        {pending && <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Próximamente</p>}
        {meta && <p className="text-[12px] font-semibold text-white/60">{meta}</p>}
        {entry.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-white/70">{entry.description}</p>
        )}
      </div>
    </div>,
    document.body,
  );
}
