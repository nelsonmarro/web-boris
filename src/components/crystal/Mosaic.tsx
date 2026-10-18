import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface MosaicProps {
  /** En escritorio, alto mínimo de una pantalla (descontando navbar y márgenes); crece si no cabe. */
  fitViewport?: boolean;
  className?: string;
  children: ReactNode;
}

/** Rejilla de tiles. Columnas y colocación las define cada página con clases literales de Tailwind. */
export function Mosaic({ fitViewport = false, className, children }: MosaicProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 lg:gap-5', fitViewport && 'lg:min-h-[calc(100svh-9rem)]', className)}>
      {children}
    </div>
  );
}
