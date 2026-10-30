'use client';

import { Suspense, useId, type MouseEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Section } from '@/components/content/Section';
import { cn } from '@/utils/cn';
import {
  ORDER_PARAM,
  parseVideoOrder,
  sortVideosByDate,
  type VideoOrder,
} from '../../lib/videos-by-universe';
import { ArchiveVideoCard, type ArchiveCardVideo } from './ArchiveVideoCard';

export interface ArchiveGroup {
  /** Ancla de la sección. */
  id: string;
  title: string;
  /** Ordenados «Ver en orden» (los más antiguos primero). */
  videos: ArchiveCardVideo[];
}

const ORDERS: readonly { order: VideoOrder; label: string; href: string }[] = [
  { order: 'antiguos', label: 'Ver en orden', href: '/videos' },
  { order: 'recientes', label: 'Más recientes primero', href: `/videos?${ORDER_PARAM}=recientes` },
];

const OPTION =
  'inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-bold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

// Dos columnas en móvil (la lista pasa de 70 vídeos) y cuatro en escritorio (`max-w-6xl`).
const CARD_SIZES = '(min-width: 1024px) 276px, 50vw';

interface ViewProps {
  groups: ArchiveGroup[];
  order: VideoOrder;
  /** Sin él (antes de leer la URL), las opciones son enlaces normales a `?orden=…`. */
  onSelect?: (order: VideoOrder) => void;
}

function ArchiveView({ groups, order, onSelect }: ViewProps) {
  const labelId = useId();
  const select = (next: VideoOrder) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onSelect || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    onSelect(next);
  };
  return (
    <div className="space-y-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <p id={labelId} className="text-[12px] font-bold uppercase tracking-wider text-white/70">
          Orden de publicación
        </p>
        <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
          {ORDERS.map((option) => {
            const active = option.order === order;
            return (
              <a
                key={option.order}
                href={option.href}
                aria-current={active ? 'true' : undefined}
                onClick={select(option.order)}
                className={cn(
                  OPTION,
                  active
                    ? 'border-primary bg-primary text-[#00122E]'
                    : 'border-white/15 bg-[#061a2e] text-white hover:border-primary/40 hover:text-primary',
                )}
              >
                {option.label}
              </a>
            );
          })}
        </div>
      </div>

      {groups.map((group) => {
        const videos = order === 'antiguos' ? group.videos : sortVideosByDate(group.videos, order);
        return (
          <Section key={group.id} id={group.id} title={group.title} contained={false}>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {videos.map((video) => (
                <li key={video.id}>
                  <ArchiveVideoCard video={video} sizes={CARD_SIZES} />
                </li>
              ))}
            </ul>
          </Section>
        );
      })}
    </div>
  );
}

/** Lee `?orden=` y lo cambia con `history.pushState` (Next sincroniza `useSearchParams`): sin petición al servidor. */
function ArchiveFromUrl({ groups }: { groups: ArchiveGroup[] }) {
  const searchParams = useSearchParams();
  const order = parseVideoOrder(searchParams.get(ORDER_PARAM));
  const onSelect = (next: VideoOrder) => {
    if (next === order) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'recientes') params.set(ORDER_PARAM, next);
    else params.delete(ORDER_PARAM);
    const query = params.toString();
    window.history.pushState(null, '', query ? `?${query}` : window.location.pathname);
  };
  return <ArchiveView groups={groups} order={order} onSelect={onSelect} />;
}

/**
 * Los grupos de `/videos` con el selector de orden. La página es estática (ISR): leer `searchParams` en el servidor la
 * volvería dinámica, así que el orden se lee en el cliente. El HTML del servidor es el respaldo del `<Suspense>`, en el
 * orden por defecto; con `?orden=recientes`, el cliente reordena al hidratar.
 */
export function VideoArchive({ groups }: { groups: ArchiveGroup[] }) {
  return (
    <Suspense fallback={<ArchiveView groups={groups} order="antiguos" />}>
      <ArchiveFromUrl groups={groups} />
    </Suspense>
  );
}
