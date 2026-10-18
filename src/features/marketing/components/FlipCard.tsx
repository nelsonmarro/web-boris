'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Hourglass, RotateCcw } from 'lucide-react';
import type { UniverseDef } from '../config/universes';

interface FlipCardProps {
  universe: UniverseDef;
  count: number;
}

const FACE =
  'absolute inset-0 h-full w-full backface-hidden overflow-hidden rounded-3xl border border-white/15 shadow-[0_30px_60px_rgba(0,0,0,0.5)]';

export function FlipCard({ universe, count }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const backId = useId();
  const backRef = useRef<HTMLDivElement>(null);
  const frontButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const openedBy = useRef<'hover' | 'toggle' | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerInside = useRef(false);

  // Escape cierra la tarjeta también cuando se abrió con hover (el foco no está dentro).
  useEffect(() => {
    if (!flipped) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const root = rootRef.current;
      const focusInside = !!root && root.contains(document.activeElement);
      if (!pointerInside.current && !focusInside) return;
      openedBy.current = null;
      setFlipped(false);
      if (focusInside) requestAnimationFrame(() => frontButtonRef.current?.focus());
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [flipped]);

  const label = universe.comingSoon
    ? 'Próximamente'
    : `${count} ${count === 1 ? 'artículo' : 'artículos'}`;

  const open = () => {
    openedBy.current = 'toggle';
    setFlipped(true);
    requestAnimationFrame(() => backRef.current?.focus());
  };
  const close = () => {
    openedBy.current = null;
    setFlipped(false);
    requestAnimationFrame(() => frontButtonRef.current?.focus());
  };

  return (
    <div
      ref={rootRef}
      className="group h-[600px] lg:h-[520px] w-full [perspective:2000px]"
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return;
        pointerInside.current = true;
        openedBy.current = openedBy.current ?? 'hover';
        setFlipped(true);
        if (document.activeElement === frontButtonRef.current) {
          requestAnimationFrame(() => backRef.current?.focus());
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return;
        pointerInside.current = false;
        if (openedBy.current === 'hover' && !e.currentTarget.contains(document.activeElement)) {
          openedBy.current = null;
          setFlipped(false);
        }
      }}
    >
      <div
        className={`preserve-3d relative h-full w-full transition-transform duration-700 will-change-transform motion-reduce:transition-none ${flipped ? 'rotate-y-180' : 'rotate-y-0'}`}
      >
        {/* Cara frontal: portada */}
        <div
          className={`${FACE} glass-liquid`}
          style={{ transform: 'translateZ(1px)' }}
          inert={flipped}
          aria-hidden={flipped}
        >
          <button
            ref={frontButtonRef}
            type="button"
            onClick={open}
            aria-expanded={flipped}
            aria-controls={backId}
            className="absolute inset-0 z-20 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          >
            <span className="sr-only">Ver sinopsis de {universe.title}</span>
          </button>
          <div className="glass-reflection opacity-40" />
          {universe.image ? (
            <Image
              src={universe.image}
              alt=""
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              style={{ objectPosition: universe.imagePosition ?? '50% 50%' }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0064A0_0%,#00203F_45%,#00122E_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 z-10 flex flex-col justify-end p-8">
            <span className="eyebrow mb-2 text-primary drop-shadow-md">{universe.era}</span>
            <h3 className="text-3xl font-bold uppercase italic leading-none tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              {universe.title}
            </h3>
            <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/80">
              {universe.comingSoon && <Hourglass className="h-3 w-3 text-primary" />}
              {label} · Ver sinopsis
            </span>
          </div>
        </div>

        {/* Cara trasera: texto de Boris sobre fondo sólido */}
        <div
          id={backId}
          ref={backRef}
          tabIndex={-1}
          role="region"
          aria-labelledby={titleId}
          inert={!flipped}
          aria-hidden={!flipped}
          className={`${FACE} flex flex-col bg-[#061a2e] p-8 focus-visible:outline-none`}
          style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
        >
          <span className="eyebrow text-primary">{universe.era}</span>
          <h3 id={titleId} className="mt-2 text-2xl font-bold uppercase italic tracking-tight text-white">{universe.title}</h3>
          <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
          <p className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 text-[15px] leading-relaxed text-white/80">{universe.description}</p>
          <div className="mt-4 flex items-center justify-between pt-4">
            {universe.universeKey ? (
              <Link
                href={{ pathname: '/wiki', query: { universe: universe.universeKey }, hash: 'explorar' }}
                className="group/link flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Explorar lore
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover/link:translate-x-1" />
              </Link>
            ) : (
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Arte y lore en producción</span>
            )}
            <button
              type="button"
              onClick={close}
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <RotateCcw className="h-4 w-4" />
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
