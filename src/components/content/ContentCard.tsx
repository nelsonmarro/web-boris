import { useId } from 'react';
import Image from 'next/image';
import { IMAGE_QUALITY } from '@/utils/image';
import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/utils/cn';
import { CategoryPlaceholder, coverOf } from './CategoryPlaceholder';
import { PendingLabel } from './PendingLabel';

/** `external` solo tiene sentido con `href`. */
type ContentCardLink = { href: string; external?: boolean } | { href?: undefined; external?: never };

export type ContentCardProps = ContentCardLink & {
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
};

const CLAMP = { 1: 'line-clamp-1', 2: 'line-clamp-2', 3: 'line-clamp-3' } as const;

/**
 * Tarjeta sobria única del sitio (spec #55 §1–§2): imagen a sangre, título, una o dos líneas. Con `href`, el título es el
 * enlace y su `::after` cubre toda la tarjeta, así que toda ella es clicable. El nombre del enlace es el título (WCAG 2.5.3:
 * el nombre es el texto visible del enlace); la meta y la descripción son su descripción accesible.
 */
export function ContentCard({
  href, external = false, title, meta, description, lines = 2, titleLines, image, imagePosition, category,
  aspect = 'video', pending = false, headingLevel = 3, sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  eager = false, className,
}: ContentCardProps) {
  const metaId = useId();
  const descriptionId = useId();
  const Heading = `h${headingLevel}` as 'h2' | 'h3';
  const cover = coverOf(image);
  const classes = cn(
    'crystal-surface group flex h-full flex-col overflow-hidden rounded-2xl',
    href && 'transition-colors duration-200 hover:border-primary/40 has-[a:focus-visible]:border-primary/40 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary motion-reduce:transition-none',
    className,
  );
  // Nombre = el título; la meta y la descripción, como descripción.
  const describedBy = [meta && metaId, description && descriptionId].filter(Boolean).join(' ') || undefined;
  // El `::after` se ancla a la tarjeta (`.crystal-surface` es `relative`; el título y el cuerpo son estáticos).
  const linkClasses = "outline-none focus-visible:outline-hidden after:absolute after:inset-0 after:content-['']";
  const pendingNote = pending && <span className="sr-only"> (próximamente)</span>;
  const label = !href ? (
    <>
      {title}
      {pendingNote}
    </>
  ) : external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClasses} aria-describedby={describedBy}>
      {title}
      {pendingNote}
      <span className="sr-only">{/youtu\.?be/.test(href) ? ' (se abre en YouTube)' : ' (se abre en una pestaña nueva)'}</span>
    </a>
  ) : (
    <Link href={href as Route} className={linkClasses} aria-describedby={describedBy}>
      {title}
      {pendingNote}
    </Link>
  );
  return (
    <div className={classes}>
      <div className={cn('relative w-full overflow-hidden bg-[#00122E]', aspect === 'portrait' ? 'aspect-[4/5]' : 'aspect-video')}>
        {cover ? (
          <Image
            quality={IMAGE_QUALITY}
            src={cover}
            alt=""
            fill
            sizes={sizes}
            fetchPriority={eager ? 'high' : undefined}
            loading={eager ? 'eager' : undefined}
            // Las miniaturas de YouTube ya vienen optimizadas: pasarlas por /_next/image no gana nada y depende del DNS del servidor.
            unoptimized={cover.startsWith('https://i.ytimg.com/')}
            className={cn('object-cover', pending && 'opacity-70 grayscale')}
            style={{ objectPosition: imagePosition ?? '50% 50%' }}
          />
        ) : (
          <CategoryPlaceholder category={category} variant="corner" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4 md:p-5">
        <Heading className={cn('font-display text-xl font-black uppercase italic leading-tight tracking-tight text-white', titleLines && CLAMP[titleLines])}>
          {label}
        </Heading>
        {pending && (
          // El título ya anuncia «(próximamente)» a los lectores de pantalla: la etiqueta visible no se repite.
          <PendingLabel aria-hidden="true" className="block" />
        )}
        {meta && <p id={metaId} className="text-[12px] font-semibold text-white/55">{meta}</p>}
        {description && <p id={descriptionId} className={cn('text-sm leading-relaxed text-white/70', CLAMP[lines])}>{description}</p>}
      </div>
    </div>
  );
}
