import Image from 'next/image';

interface HeroVisualProps {
  imageSrc: string;
  alt: string;
  badgeEmoji: string;
  badgeLabel: string;
  badgeTitle: string;
}

export function HeroVisual({
  imageSrc,
  alt,
  badgeEmoji,
  badgeLabel,
  badgeTitle,
}: HeroVisualProps) {
  return (
    <div className="relative hidden lg:block w-full max-w-xl justify-self-end">
      <div className="relative z-10 w-full aspect-[16/11] rounded-[3.5rem] overflow-hidden border border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.7)] animate-float glass-liquid group/image">
        <div className="glass-reflection opacity-30" />

        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover transition-transform duration-1000 group-hover/image:scale-110"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
      </div>

      <div className="absolute bottom-[20px] left-[-8%] glass-liquid p-6 md:p-8 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)] z-30 flex items-center gap-6 border-white/20 backdrop-blur-3xl group transition-all hover:scale-105 border-refractive">
        <div className="glass-reflection opacity-40" />

        <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 backdrop-blur-3xl rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.3)] relative z-10 rotate-[-8deg] group-hover:rotate-0 transition-all duration-500 bg-gradient-to-br from-white/10 to-transparent">
          <span className="text-4xl md:text-5xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] relative z-10">
            {badgeEmoji}
          </span>
        </div>

        <div className="relative z-10 space-y-0.5 pr-4">
          <p className="text-[9px] text-primary font-bold tracking-wider uppercase drop-shadow-sm">
            {badgeLabel}
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-white italic uppercase tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] leading-none">
            {badgeTitle}
          </h3>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
    </div>
  );
}
