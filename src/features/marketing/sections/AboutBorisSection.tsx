'use client';

import * as React from 'react';
import Image from 'next/image';
import { Video, Camera, Send, MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
            <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
              <Image
                src="/assets/Logo2.png"
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
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">
                    Comunidad
                  </p>
                  <p className="text-3xl font-bold text-white italic tracking-tight uppercase">
                    +2M Exploradores
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">
                    Contenido
                  </p>
                  <p className="text-3xl font-bold text-white italic tracking-tight uppercase">
                    Lore Original
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-6">
                <SocialLink
                  icon={<Video className="w-5 h-5" />}
                  href="#"
                  color="hover:bg-red-600/20 hover:text-red-500"
                />
                <SocialLink
                  icon={<Camera className="w-5 h-5" />}
                  href="#"
                  color="hover:bg-pink-600/20 hover:text-pink-500"
                />
                <SocialLink
                  icon={<Send className="w-5 h-5" />}
                  href="#"
                  color="hover:bg-blue-400/20 hover:text-blue-400"
                />
                <SocialLink
                  icon={<MessageCircle className="w-5 h-5" />}
                  href="#"
                  color="hover:bg-indigo-600/20 hover:text-indigo-400"
                />
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

function SocialLink({
  icon,
  href,
  color,
}: {
  icon: React.ReactNode;
  href: string;
  color: string;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      href={href as any}
      className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white transition-all duration-300 shadow-xl glass-liquid ${color} hover:scale-110 active:scale-95`}
    >
      {icon}
    </Link>
  );
}
