import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { Fish } from 'lucide-react';

interface HeroVisualProps {
  imageSrc: string;
  alt: string;
  badge: { href: Route; label: string; title: string; thumb?: string } | null;
}

export function HeroVisual({ imageSrc, alt, badge }: HeroVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-xl lg:justify-self-end">
      <div className="glass-liquid group/image relative z-10 aspect-[16/11] w-full animate-float overflow-hidden rounded-3xl border border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.7)] motion-reduce:animate-none">
        <div className="glass-reflection opacity-30" />

        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 576px, 100vw"
          className="object-cover transition-transform duration-1000 group-hover/image:scale-110"
          priority
        />

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {badge && (
        <Link
          href={badge.href}
          className="glass-liquid group relative z-30 mt-4 flex min-w-[240px] items-center gap-4 rounded-2xl border-white/20 p-3 shadow-[0_30px_70px_rgba(0,0,0,0.8)] transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:min-w-[320px] md:gap-5 md:p-4 lg:absolute lg:-left-[8%] lg:bottom-5 lg:mt-0"
        >
          <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/5">
            {badge.thumb ? (
              <Image src={badge.thumb} alt="" width={56} height={56} className="h-full w-full object-cover" />
            ) : (
              <Fish className="h-7 w-7 text-primary" aria-hidden="true" />
            )}
          </span>

          <span className="relative z-10 block space-y-1 pr-2 md:pr-4">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-primary">
              {badge.label}
            </span>
            <span className="block text-lg font-bold uppercase italic leading-none tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] md:text-2xl">
              {badge.title}
            </span>
          </span>
        </Link>
      )}

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px] mix-blend-screen" />
    </div>
  );
}
