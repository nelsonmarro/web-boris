import { Database } from 'lucide-react';

interface WikiBannerProps {
  label: string;
  title: string;
  gradientTitle: string;
  description: string;
}

export function WikiBanner({ label, title, gradientTitle, description }: WikiBannerProps) {
  return (
    <section className="relative glass-liquid bg-[#061d33] rounded-[3rem] p-10 md:p-16 border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden group border-refractive">
      <div className="glass-reflection opacity-30" />

      {/* Scanning Line Animation */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="w-full h-[1px] bg-primary/20 absolute top-0 animate-[scan_4s_linear_infinite]" />
      </div>

      {/* Glow Effects */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
      
      <div className="relative z-10 max-w-4xl space-y-8">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
          <Database className="h-3.5 w-3.5" />
          {label}
        </div>
        
        <div className="space-y-4">
           <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
             {title} <span className="block md:inline">de</span>
             <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-white drop-shadow-[0_10px_20px_rgba(255,115,0,0.5)] italic">
               {gradientTitle}
             </span>
           </h1>
        </div>

        <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-medium max-w-3xl">
          {description}
        </p>
      </div>
    </section>
  );
}
