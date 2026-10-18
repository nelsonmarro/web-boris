import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CrystalTileProps {
  eyebrow: string;
  title: string;
  icon?: LucideIcon;
  className?: string;
  children?: ReactNode;
}

/**
 * Tile del hub /comunidad. Piel actual: superficie sólida bajo el texto y brillo de vidrio solo en el borde.
 * El estilo "crystal look" definitivo (#11) se aplica cambiando únicamente este componente.
 */
export function CrystalTile({ eyebrow, title, icon: Icon, className, children }: CrystalTileProps) {
  return (
    <section
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#061a2e] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] md:p-7',
        className,
      )}
    >
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.07] to-transparent" />
      <header className="relative">
        <p className="eyebrow flex items-center gap-2 text-primary">
          {Icon && <Icon className="h-4 w-4" aria-hidden />}
          {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl font-black uppercase italic tracking-tight text-white md:text-3xl">
          {title}
        </h2>
      </header>
      <div className="relative mt-5 flex flex-1 flex-col">{children}</div>
    </section>
  );
}
