'use client';

import * as React from 'react';
import { Play, Video } from 'lucide-react';
import Link from 'next/link';
import { YouTubeEmbed } from '@next/third-parties/google';

const VIDEOS = [
  {
    id: 'hedUAqopPBg',
    title: 'El Gran Majá vs The Bloop',
    category: 'COLOSOS',
    priority: true
  },
  {
    id: 'VQRNN3YNRWk',
    title: 'El Misterio de los Colosos',
    category: 'COLOSOS',
    priority: false
  },
  {
    id: 'IFpO2DqWDXQ',
    title: 'Ellos Llegaron: El Inicio',
    category: 'ELLOS LLEGARON',
    priority: false
  },
];

export function FeaturedVideosSection() {
  return (
    <section id="videos" className="py-24 bg-black/20 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <Video className="w-3.5 h-3.5" />
                Archivo Multimedia
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase">
                Videos <span className="text-primary">Destacados</span>
              </h2>
           </div>
           <Link 
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             href="https://youtube.com/@BorisaoBlois" 
             className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 mb-2 group"
           >
              CANAL DE BORISAOBLOIS <Play className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
           </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {VIDEOS.map((video) => (
            <div 
              key={video.id} 
              className={`group space-y-6 ${video.priority ? 'md:col-span-2' : 'md:col-span-1'}`}
            >
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] glass-liquid border-refractive">
                 <div className="glass-reflection opacity-30" />
                 
                 <YouTubeEmbed 
                    videoid={video.id} 
                    params="controls=1&rel=0"
                 />

                 {/* Hover Overlay - Only shows before interaction */}
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none group-hover:bg-black/10 transition-colors z-0">
                    <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_40px_rgba(255,115,0,0.3)]">
                       <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                 </div>
              </div>
              
              <div className="space-y-2 px-4">
                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{video.category}</span>
                 <h3 className={`font-black text-white italic uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors ${video.priority ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'}`}>
                    {video.title}
                 </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
}
