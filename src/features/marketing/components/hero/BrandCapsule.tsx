import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface BrandCapsuleProps {
  children: React.ReactNode;
  className?: string;
}

export function BrandCapsule({ children, className }: BrandCapsuleProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2.5 px-5 py-2 glass-liquid rounded-full border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.4)] bg-black/40",
      className
    )}>
      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
      <span className="text-white text-[10px] font-bold tracking-wider uppercase">
        {children}
      </span>
    </div>
  );
}
