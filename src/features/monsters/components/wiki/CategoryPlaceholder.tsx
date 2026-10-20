import {
  Waves,
  Mountain,
  Fish,
  Dna,
  User,
  Building2,
  Ship,
  BookOpen,
  Book,
  Ghost,
  Layers,
  FolderOpen,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';

/** Icono por categoría del frontmatter; las categorías sin entrada usan `Layers`. */
const ICONS: Record<string, LucideIcon> = {
  Coloso: Waves,
  Titán: Mountain,
  Mediano: Fish,
  Animal: Fish,
  Especie: Dna,
  Humano: User,
  Organización: Building2,
  Vehículo: Ship,
  Historia: BookOpen,
  Libro: Book,
  Entidad: Ghost,
  Categoría: Layers,
  Directorio: FolderOpen,
};

/** Los directorios/organizaciones usan el logo del canal como portada: se tratan como "sin imagen". */
export const isBrandPlaceholder = (src?: string) => !!src && src.includes('/assets/Branding/');

/** Portada utilizable: la `image` del frontmatter, salvo que falte o sea de marca (nunca va de portada). */
export const coverOf = (src?: string) => (src && !isBrandPlaceholder(src) ? src : undefined);

interface CategoryPlaceholderProps {
  category?: string;
  className?: string;
  /** `full`: icono y etiqueta centrados. `corner`: sin etiqueta, icono pequeño en la esquina superior derecha. */
  variant?: 'full' | 'corner';
}

/** Portada de marca para artículos sin imagen propia: degradado abisal + icono de la categoría. */
export function CategoryPlaceholder({ category, className, variant = 'full' }: CategoryPlaceholderProps) {
  const Icon = (category && ICONS[category]) || Layers;
  if (variant === 'corner') {
    return (
      <div
        aria-hidden="true"
        className={cn('absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0064A0_0%,#00203F_55%,#00122E_100%)]', className)}
      >
        <Icon className="absolute right-6 top-6 h-6 w-6 text-primary/80 drop-shadow-[0_0_18px_rgba(255,115,0,0.5)]" />
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(ellipse_at_top,#0064A0_0%,#00203F_55%,#00122E_100%)]',
        className,
      )}
    >
      <Icon className="h-10 w-10 text-primary/80 drop-shadow-[0_0_18px_rgba(255,115,0,0.5)]" />
      <span className="eyebrow text-white/60">{category ?? 'Archivo'}</span>
    </div>
  );
}
