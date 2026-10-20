import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/utils/cn';
import { CategoryPlaceholder, coverOf } from '@/features/monsters/components/wiki/CategoryPlaceholder';
import { PendingLabel } from './PendingLabel';

export interface ContentCardProps {
  href?: string;
  external?: boolean;
  title: string;
  meta?: string;
  description?: string;
  lines?: 1 | 2 | 3;
  /** Recorta el título a N líneas (por defecto no se recorta). */
  titleLines?: 1 | 2 | 3;
  image?: string;
  imagePosition?: string;
  category?: string;
  aspect?: 'video' | 'portrait';
  pending?: boolean;
  headingLevel?: 2 | 3;
  sizes?: string;
  eager?: boolean;
  className?: string;
}

const CLAMP = { 1: 'line-clamp-1', 2: 'line-clamp-2', 3: 'line-clamp-3' } as const;

/** Tarjeta sobria única del sitio (spec #55 §1–§2): imagen a sangre, título, una o dos líneas. Toda la tarjeta es el enlace. */
export function ContentCard({
  href, external = false, title, meta, description, lines = 2, titleLines, image, imagePosition, category,
  aspect = 'video', pending = false, headingLevel = 3, sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  eager = false, className,
}: ContentCardProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3';
  const cover = coverOf(image);
  const classes = cn(
    'crystal-surface group flex h-full flex-col overflow-hidden rounded-2xl',
    href && 'transition-colors duration-200 hover:border-primary/40 focus-visible:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none',
    className,
  );
  const body = (
    <>
      <div className={cn('relative w-full overflow-hidden bg-[#00122E]', aspect === 'portrait' ? 'aspect-[4/5]' : 'aspect-video')}>
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes={sizes}
            fetchPriority={eager ? 'high' : undefined}
            loading={eager ? 'eager' : undefined}
            className={cn('object-cover', pending && 'opacity-70 grayscale')}
            style={{ objectPosition: imagePosition ?? '50% 50%' }}
          />
        ) : (
          <CategoryPlaceholder category={category} variant="corner" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4 md:p-5">
        <Heading className={cn('font-display text-xl font-black uppercase italic leading-tight tracking-tight text-white', titleLines && CLAMP[titleLines])}>
          {title}
          {pending && <span className="sr-only"> (próximamente)</span>}
        </Heading>
        {pending && (
          // El título ya anuncia «(próximamente)» a los lectores de pantalla: la etiqueta visible no se repite.
          <PendingLabel aria-hidden="true" className="block" />
        )}
        {meta && <p className="text-[12px] font-semibold text-white/55">{meta}</p>}
        {description && <p className={cn('text-sm leading-relaxed text-white/70', CLAMP[lines])}>{description}</p>}
      </div>
    </>
  );
  if (!href) return <div className={classes}>{body}</div>;
  if (external) {
    const isYoutube = /youtu\.?be/.test(href);
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {body}
        <span className="sr-only">{isYoutube ? ' (se abre en YouTube)' : ' (se abre en una pestaña nueva)'}</span>
      </a>
    );
  }
  return <Link href={href as Route} className={classes}>{body}</Link>;
}
