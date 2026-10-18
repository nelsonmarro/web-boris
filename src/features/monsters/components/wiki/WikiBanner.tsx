import Link from 'next/link';
import type { Route } from 'next';
import { Database, Search } from 'lucide-react';

interface WikiBannerProps {
  label: string;
  title: string;
  gradientTitle: string;
  description: string;
  ctaHref?: Route;
  ctaLabel?: string;
}

export function WikiBanner({ label, title, gradientTitle, description, ctaHref, ctaLabel }: WikiBannerProps) {
  return (
    <section className="group relative overflow-hidden rounded-3xl glass-liquid border-white/15 bg-[#061a2e] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-refractive md:p-10 lg:p-12">
      <div className="glass-reflection opacity-30" />
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 h-px w-full bg-primary/20 animate-[scan_4s_linear_infinite]" />
      </div>
      <div className="pointer-events-none absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/20 opacity-50 blur-[100px] mix-blend-screen transition-opacity duration-1000 group-hover:opacity-70" />

      <div className="relative z-10 max-w-3xl space-y-5 md:space-y-6">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-primary backdrop-blur-md">
          <Database className="h-3.5 w-3.5" />
          <span className="eyebrow">{label}</span>
        </div>

        <h1 className="page-title">
          {title} <span className="block md:inline">de</span>
          <span className="block bg-gradient-to-r from-primary via-orange-400 to-white bg-clip-text italic text-transparent drop-shadow-[0_10px_20px_rgba(255,115,0,0.5)]">
            {gradientTitle}
          </span>
        </h1>

        <p className="max-w-xl text-base leading-relaxed text-white/80 md:text-lg">{description}</p>

        {ctaHref && ctaLabel && (
          <Link
            href={ctaHref}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[11px] font-bold uppercase tracking-wider text-[#00122E] shadow-[0_10px_30px_rgba(255,115,0,0.35)] transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_14px_36px_rgba(255,115,0,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
