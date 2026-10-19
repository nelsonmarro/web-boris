'use client';

import { ContentCard } from '@/components/content/ContentCard';
import { useIsSeen } from '@/features/monsters/store/registro-store';

export interface RegistroGridItem {
  slug: string;
  title: string;
  category?: string;
  image?: string;
  imagePosition?: string;
  /** `status: proximamente`: expediente sellado. */
  sealed: boolean;
}

const SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw';

/**
 * Una tarjeta del registro. El estado lo aplica el cliente (la página es ISR y el servidor no sabe qué ha
 * abierto el fan) sin cambiar el tamaño de la tarjeta: la línea de estado existe siempre
 * («Sin abrir» es el estado neutro) y el atenuado de la imagen es solo `filter` + `opacity`.
 *
 * `ContentCard` no se toca: el contenedor lleva `data-slug` y `data-state`, y los selectores
 * `data-[state=…]:[&_img]:` de Tailwind aplican `grayscale opacity-60` al `<img>` interno.
 * Las selladas ya salen atenuadas y con «Próximamente» por el `pending` de `ContentCard`.
 */
function RegistroCard({ slug, title, category, image, imagePosition, sealed }: RegistroGridItem) {
  const seen = useIsSeen(slug);
  const state = sealed ? 'sellado' : seen ? 'abierto' : 'sin-abrir';
  const status = state === 'abierto' ? 'Abierto' : state === 'sin-abrir' ? 'Sin abrir' : undefined;

  return (
    <li
      data-slug={slug}
      data-state={state}
      className="[&_img]:transition-[filter,opacity] [&_img]:duration-300 motion-reduce:[&_img]:transition-none data-[state=sin-abrir]:[&_img]:opacity-60 data-[state=sin-abrir]:[&_img]:grayscale data-[state=abierto]:[&_p:last-child]:text-white"
    >
      <ContentCard
        href={`/wiki/${slug}`}
        title={title}
        meta={category}
        description={status}
        lines={1}
        image={image}
        imagePosition={imagePosition}
        category={category}
        pending={sealed}
        sizes={SIZES}
      />
    </li>
  );
}

/** Rejilla de un grupo del registro: 2 columnas en móvil, 3 desde `sm`, 4 desde `lg`. */
export function RegistroGrid({ items }: { items: readonly RegistroGridItem[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <RegistroCard key={item.slug} {...item} />
      ))}
    </ul>
  );
}
