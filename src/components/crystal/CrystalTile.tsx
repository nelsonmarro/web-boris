import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CategoryPlaceholder, isBrandPlaceholder } from '@/features/monsters/components/wiki/CategoryPlaceholder';
import { IconChip, type IconTone } from './IconChip';

export interface CrystalTileProps {
  eyebrow: string;
  title: ReactNode;
  icon?: LucideIcon;
  iconTone?: IconTone;
  /** Nivel del título: 1 solo en la tile principal de la página. */
  headingLevel?: 1 | 2 | 3;
  titleSize?: 'page' | 'tile' | 'compact';
  /** Clases extra para el título (p. ej. `line-clamp-2`); no usar para cambiar fuente o tamaño. */
  titleClassName?: string;
  className?: string;
  children?: ReactNode;
  variant?: 'default' | 'media' | 'hero';
  /** Solo `media`: portada; sin imagen (o con el logo) se pinta el placeholder de `category`. */
  image?: string;
  imagePosition?: string;
  category?: string;
  sizes?: string;
  /** Solo `media`: imagen prioritaria (LCP). */
  priority?: boolean;
  /** Toda la tile es un enlace interno. No anidar enlaces en `children`. */
  href?: Route;
  /** Toda la tile es un enlace externo (pestaña nueva). */
  externalHref?: string;
}

const SURFACE = { default: 'crystal-surface', media: 'crystal-surface', hero: 'crystal-glow' } as const;

const TITLE_SIZE = {
  page: 'font-display-wide text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-4xl xl:text-5xl',
  tile: 'font-display text-2xl font-black uppercase italic leading-[1.05] tracking-tight text-white md:text-3xl',
  compact: 'font-display text-xl font-black uppercase italic leading-[1.05] tracking-tight text-white md:text-2xl',
} as const;

/** Estado de selección "consola" para tiles enlazables. */
const INTERACTIVE =
  'transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)] hover:[--crystal-line:rgba(255,180,120,0.85)] focus-visible:-translate-y-0.5 focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:[--crystal-line:rgba(255,180,120,0.85)] motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0';

/**
 * Tile del material "cristal sutil" (#11): superficie sólida, hilo de brillo superior y sombra profunda.
 * Cambiar el look del sitio = cambiar este componente y las clases `crystal-*` de globals.css.
 */
export function CrystalTile({
  eyebrow,
  title,
  icon,
  iconTone = 'primary',
  headingLevel = 2,
  titleSize = 'tile',
  titleClassName,
  className,
  children,
  variant = 'default',
  image,
  imagePosition,
  category,
  sizes = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
  priority = false,
  href,
  externalHref,
}: CrystalTileProps) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3';
  const isMedia = variant === 'media';
  const isLink = Boolean(href || externalHref);
  const cover = image && !isBrandPlaceholder(image) ? image : undefined;

  const classes = cn(
    'group/tile relative flex h-full flex-col overflow-hidden rounded-3xl p-6 md:p-7',
    SURFACE[variant],
    isMedia && 'min-h-[180px] justify-end',
    isLink && INTERACTIVE,
    className,
  );

  const body = (
    <>
      {isMedia && (
        <>
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              sizes={sizes}
              fetchPriority={priority ? 'high' : undefined}
              loading={priority ? 'eager' : undefined}
              className="object-cover transition-transform duration-700 group-hover/tile:scale-105 motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100"
              style={{ objectPosition: imagePosition ?? '50% 50%' }}
            />
          ) : (
            <CategoryPlaceholder category={category} className="pb-16 [&_span]:hidden" />
          )}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#061a2e] via-[#061a2e]/80 via-40% to-transparent" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--crystal-line),transparent)]" />
        </>
      )}
      <header className="relative z-10">
        <p className="eyebrow flex items-center gap-2 text-primary">
          {icon && <IconChip icon={icon} tone={iconTone} />}
          {eyebrow}
        </p>
        <Heading className={cn('mt-2', TITLE_SIZE[titleSize], titleClassName)}>{title}</Heading>
      </header>
      {children && <div className={cn('relative z-10 mt-4 flex flex-col', !isMedia && 'flex-1')}>{children}</div>}
    </>
  );

  if (externalHref) {
    return (
      <a href={externalHref} target="_blank" rel="noopener noreferrer" className={classes}>
        {body}
        <span className="sr-only"> (se abre en una pestaña nueva)</span>
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return <section className={classes}>{body}</section>;
}
