import Image from 'next/image';
import { Building2, Fish, Landmark, Ship, Waves, type LucideIcon } from 'lucide-react';
import { coverOf } from '@/components/content/CategoryPlaceholder';
import type { SizeEntry } from '@/features/monsters/lib/size-references';
import { IMAGE_QUALITY } from '@/utils/image';
import { cn } from '@/utils/cn';

/** Icono de las referencias reales (no tienen imagen: el sitio no usa fotos del mundo real) y de las criaturas sin portada. */
const REFERENCE_ICONS: Record<string, LucideIcon> = {
  'ref-ballena-azul': Fish,
  'ref-titanic': Ship,
  'ref-torre-eiffel': Landmark,
  'ref-empire-state': Building2,
  'ref-burj-khalifa': Building2,
};

interface SizeThumbProps {
  entry: SizeEntry;
  /** `sizes` de `next/image` (ancho con que se pinta). */
  sizes: string;
  className?: string;
  iconClassName?: string;
}

/**
 * Imagen de una entrada de tamaño, decorativa (el nombre va siempre en texto al lado). Criatura con portada: su portada
 * (`coverOf`, nunca la de marca). Referencia real o criatura sin portada: un icono sobre el degradado abisal; las reales,
 * en cian para que no se confundan con el archivo.
 */
export function SizeThumb({ entry, sizes, className, iconClassName }: SizeThumbProps) {
  const cover = entry.kind === 'criatura' ? coverOf(entry.image) : undefined;
  const Icon = REFERENCE_ICONS[entry.id] ?? Waves;
  return (
    <span aria-hidden="true" className={cn('relative block overflow-hidden bg-[#00122E]', className)}>
      {cover ? (
        <Image
          quality={IMAGE_QUALITY}
          src={cover}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition: entry.imagePosition ?? '50% 50%' }}
        />
      ) : (
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            entry.kind === 'real'
              ? 'bg-[radial-gradient(ellipse_at_top,#0b4f7a_0%,#00203F_60%,#00122E_100%)]'
              : 'bg-[radial-gradient(ellipse_at_top,#0064A0_0%,#00203F_55%,#00122E_100%)]',
          )}
        >
          <Icon className={cn('h-1/2 w-1/2 max-h-12 max-w-12', entry.kind === 'real' ? 'text-sky-300/80' : 'text-primary/80', iconClassName)} />
        </span>
      )}
    </span>
  );
}
