import { Database } from 'lucide-react';

interface WikiBannerProps {
  label: string;
  title: string;
  gradientTitle: string;
  description: string;
}

export function WikiBanner({ label, title, gradientTitle, description }: WikiBannerProps) {
  return (
    <section className="group relative overflow-hidden rounded-3xl glass-liquid border-white/15 bg-[#061a2e] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-refractive md:p-12 lg:p-14">
      <div className="glass-reflection opacity-30" />
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 h-px w-full bg-primary/20 animate-[scan_4s_linear_infinite]" />
      </div>
      <div className="pointer-events-none absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/20 opacity-50 blur-[100px] mix-blend-screen transition-opacity duration-1000 group-hover:opacity-70" />

      <div className="relative z-10 max-w-3xl space-y-6">
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

        <p className="max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">{description}</p>
      </div>
    </section>
  );
}
