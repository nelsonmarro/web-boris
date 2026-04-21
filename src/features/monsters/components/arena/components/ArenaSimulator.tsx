'use client';

import * as React from 'react';
import { Target, TrendingUp, ShieldAlert, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArenaFeatureBadge } from './ArenaFeatureBadge';

export function ArenaSimulator() {
  return (
    <div className="flex-1 glass-liquid rounded-[3rem] border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center p-12 text-center space-y-8 min-h-[500px] relative group overflow-hidden">
       <div className="glass-reflection opacity-40" />
       
       <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center relative z-10 rotate-12 group-hover:rotate-0 transition-transform duration-700 shadow-[0_0_40px_rgba(255,115,0,0.3)]">
             <Target className="w-12 h-12 text-primary" />
          </div>
       </div>

       <div className="space-y-4 max-w-md relative z-10">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Módulo en Construcción</h2>
          <p className="text-white/50 font-medium">
            Nuestros analistas de DELIRIUM están recopilando los datos biométricos necesarios para iniciar las simulaciones.
          </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl relative z-10">
          <ArenaFeatureBadge icon={<TrendingUp className="w-4 h-4" />} label="Cálculo de Daño" />
          <ArenaFeatureBadge icon={<ShieldAlert className="w-4 h-4 text-red-500" />} label="Resistencia Bio-Orgánica" />
          <ArenaFeatureBadge icon={<Zap className="w-4 h-4 text-blue-500" />} label="Habilidades Únicas" />
       </div>

       <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.3em] italic shadow-[0_15px_30px_rgba(255,115,0,0.4)] hover:scale-105 transition-all">
          RECIBIR NOTIFICACIÓN
       </Button>
    </div>
  );
}
