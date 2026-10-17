import Image from 'next/image';
import { Mail, Sparkles } from 'lucide-react';
import { YoutubeIcon } from '@/features/marketing/components/icons/YoutubeIcon';
import {
  SOCIAL_LINKS,
  YOUTUBE_HANDLE,
  CONTACT_EMAIL,
} from '@/features/marketing/config/social';

export function AboutBorisSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Dynamic Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="glass-liquid rounded-[4rem] border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden relative group">
          <div className="glass-reflection opacity-30" />

          <div className="flex flex-col lg:flex-row items-stretch">
            {/* Visual Column */}
            <div className="w-full lg:w-1/2 relative min-h-[300px] sm:min-h-[400px] lg:min-h-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
              <Image
                src="/assets/Branding/Logo2.webp"
                alt="BorisaoBlois Creator"
                fill
                className="object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-black/20 to-transparent" />

              {/* Floating Tag */}
              <div className="absolute top-10 left-10 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/20 shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  Señal de Origen
                </span>
              </div>
            </div>

            {/* Content Column */}
            <div className="w-full lg:w-1/2 p-10 md:p-20 flex flex-col justify-center space-y-10 relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 text-primary">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    El Arquitecto del Lore
                  </span>
                </div>
                <h2 className="text-4xl md:text-7xl font-bold text-white italic tracking-tight uppercase leading-none">
                  Borisao<span className="text-primary">Blois</span>
                </h2>
                <p className="text-xl text-white/60 font-medium leading-relaxed">
                  Creador de contenido, narrador de misterios y guardián de los
                  archivos abisales. Mi misión es documentar lo inexplicable y
                  dar voz a las criaturas que habitan en la penumbra de nuestra
                  imaginación.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="eyebrow text-white/30">Canal</p>
                  <a
                    href={SOCIAL_LINKS.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-2xl font-bold uppercase italic tracking-tight text-white transition-colors hover:text-primary md:text-3xl"
                  >
                    {YOUTUBE_HANDLE}
                  </a>
                </div>
                <div className="space-y-2">
                  <p className="eyebrow text-white/30">Contenido</p>
                  <p className="text-2xl font-bold uppercase italic tracking-tight text-white md:text-3xl">Lore original</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-6">
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-liquid inline-flex h-14 items-center gap-3 rounded-2xl border border-white/10 px-6 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.03] hover:bg-red-600/20 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <YoutubeIcon className="h-5 w-5" />
                  Ver canal en YouTube
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="glass-liquid inline-flex h-14 items-center gap-3 rounded-2xl border border-white/10 px-6 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.03] hover:bg-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Mail className="h-5 w-5" />
                  Escribir a Boris
                </a>
              </div>

              {/* Boris Personal Signature Style Badge */}
              <div className="pt-8 border-t border-white/5 opacity-40">
                <p className="text-[8px] font-bold uppercase tracking-wider text-white">
                  Documentación Autorizada // Código 343-B
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
