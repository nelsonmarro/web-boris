import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type IconTone = 'primary' | 'cyan';

const TONES: Record<IconTone, string> = {
  primary: 'border-primary/35 bg-primary/10 text-primary',
  cyan: 'border-sky-400/40 bg-[#0064A0]/20 text-sky-300',
};

/** Icono en un cuadrado redondeado teñido (material "cristal sutil"). Decorativo. */
export function IconChip({ icon: Icon, tone = 'primary', className }: { icon: LucideIcon; tone?: IconTone; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border', TONES[tone], className)}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}
