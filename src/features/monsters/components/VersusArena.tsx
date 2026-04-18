'use client'

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { WikiArticle } from "@/core/types/wiki"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Flame, Activity, Brain, Swords, ShieldAlert } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VersusArenaProps {
  articles: WikiArticle[];
}

export function VersusArena({ articles }: VersusArenaProps) {
  // Filter for entities that can be compared
  const combatants = articles.filter(a => a.frontmatter.category !== "Libros" && a.frontmatter.category !== "Organización");
  
  const [fighter1Slug, setFighter1Slug] = React.useState<string>(
    combatants.find(c => c.slug === 'el-gran-maja')?.slug || combatants[0]?.slug || ""
  );
  const [fighter2Slug, setFighter2Slug] = React.useState<string>(
    combatants.find(c => c.slug === 'the-bloop')?.slug || combatants[1]?.slug || ""
  );
  const [isBattling, setIsBattling] = React.useState(false);
  const [winner, setWinner] = React.useState<string | null>(null);

  const fighter1 = combatants.find(c => c.slug === fighter1Slug);
  const fighter2 = combatants.find(c => c.slug === fighter2Slug);

  // Generate deterministic pseudo-stats for the demo if none exist
  const getStats = (slug: string, title: string) => {
    const seed = slug.length + title.length;
    return {
      length: (seed * 42) % 800 + 50,
      weight: `${(seed * 15) % 900 + 10} Toneladas`,
      intelligence: (seed % 10) + 1,
      hostility: ((seed * 3) % 10) + 1,
      power: ((seed * 7) % 100),
      defense: ((seed * 11) % 100),
      abilities: ["Regeneración Abisal", "Presión Aplastante", "Ecolocalización Ofensiva"].slice(0, (seed % 3) + 1)
    }
  }

  const simulateBattle = () => {
    setIsBattling(true);
    setWinner(null);
    
    // Simulate battle duration
    setTimeout(() => {
      // Prioritize actual lore stats from frontmatter if they exist
      const f1Stats = fighter1?.frontmatter.stats || getStats(fighter1?.slug || "", fighter1?.frontmatter.title || "");
      const f2Stats = fighter2?.frontmatter.stats || getStats(fighter2?.slug || "", fighter2?.frontmatter.title || "");
      
      const f1Score = (f1Stats.power || 0) + (f1Stats.defense || 0) + ((f1Stats.intelligence || 0) * 5) + ((f1Stats.hostility || 0) * 2);
      const f2Score = (f2Stats.power || 0) + (f2Stats.defense || 0) + ((f2Stats.intelligence || 0) * 5) + ((f2Stats.hostility || 0) * 2);
      
      setWinner(f1Score >= f2Score ? fighter1Slug : fighter2Slug);
      setIsBattling(false);
    }, 3000);
  }

  const renderFighterSelect = (
    value: string,
    onChange: (val: string) => void,
    label: string,
    align: 'left' | 'right'
  ) => (
    <div className={`w-full flex flex-col ${align === 'right' ? 'items-end' : 'items-start'}`}>
      <label className="text-xs font-black text-muted-foreground mb-3 uppercase tracking-[0.2em]">{label}</label>
      <Select value={value} onValueChange={(val) => { onChange(val); setWinner(null); }}>
        <SelectTrigger className={`w-full max-w-[300px] bg-black/40 border-border/50 h-14 text-lg font-bold backdrop-blur-xl ${align === 'right' ? 'text-right' : 'text-left'}`}>
          <SelectValue placeholder="Selecciona un combatiente" />
        </SelectTrigger>
        <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
          {combatants.map(c => (
            <SelectItem key={c.slug} value={c.slug} className="text-base cursor-pointer font-medium py-3">
              {c.frontmatter.title} <span className="text-muted-foreground text-xs ml-2 uppercase tracking-widest hidden md:inline-block">({c.frontmatter.universe})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderFighterCard = (fighter: WikiArticle | undefined, isRight: boolean) => {
    if (!fighter) return null;

    const stats = getStats(fighter.slug, fighter.frontmatter.title);
    const isWinner = winner === fighter.slug;
    const isLoser = winner && winner !== fighter.slug;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: isRight ? 50 : -50 }}
        animate={{ 
          opacity: isLoser ? 0.5 : 1, 
          x: 0,
          scale: isWinner ? 1.05 : (isLoser ? 0.95 : 1),
          filter: isLoser ? 'grayscale(100%)' : 'grayscale(0%)'
        }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="w-full relative z-10"
      >
        <Card className={`w-full bg-card/40 border-border/50 overflow-hidden shadow-2xl relative group backdrop-blur-sm ${isWinner ? 'ring-4 ring-primary shadow-[0_0_50px_rgba(255,115,0,0.3)]' : ''}`}>
          
          {/* Battle Shake Animation Wrapper */}
          <motion.div
            animate={isBattling ? {
              x: isRight ? [-5, 5, -8, 8, -5] : [5, -5, 8, -8, 5],
              y: [-2, 2, -4, 4, -2],
            } : { x: 0, y: 0 }}
            transition={isBattling ? { repeat: Infinity, duration: 0.4 } : { duration: 0.1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background z-10" />
            
            <div className="relative h-64 md:h-80 w-full overflow-hidden bg-black/50">
              {fighter.frontmatter.image ? (
                <Image 
                  src={fighter.frontmatter.image}
                  alt={fighter.frontmatter.title}
                  fill
                  className={`object-cover transition-transform duration-[2s] ${isBattling ? 'scale-110' : 'group-hover:scale-105'}`}
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShieldAlert className="h-20 w-20 text-muted-foreground opacity-20" />
                </div>
              )}
              
              {/* Overlay during battle */}
              <AnimatePresence>
                {isBattling && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className={`absolute inset-0 z-20 ${isRight ? 'bg-blue-500/30 mix-blend-overlay' : 'bg-red-500/30 mix-blend-overlay'}`}
                  />
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative z-30 -mt-16 p-6 md:p-8">
              <div className={`flex flex-col mb-8 ${isRight ? 'items-end text-right' : 'items-start text-left'}`}>
                <span className="inline-block px-3 py-1 bg-background/80 text-foreground border border-border/50 text-[10px] font-black rounded-full mb-4 uppercase tracking-[0.2em] backdrop-blur-md">
                  {fighter.frontmatter.universe}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-foreground drop-shadow-2xl leading-none tracking-tight">
                  {fighter.frontmatter.title}
                </h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-2">Longitud</p>
                    <p className="text-xl md:text-2xl font-black text-foreground">{stats.length} <span className="text-sm text-muted-foreground">m</span></p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-2">Masa Estimada</p>
                    <p className="text-sm md:text-base font-bold text-foreground leading-tight">{stats.weight}</p>
                  </div>
                </div>

                <div className="space-y-5 bg-black/20 p-5 rounded-2xl border border-white/5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-foreground uppercase flex items-center gap-2">
                        <Flame className="w-3 h-3 text-orange-500" /> Poder Bruto
                      </span>
                      <span className="text-xs font-black text-orange-500">{stats.power}/100</span>
                    </div>
                    <Progress value={stats.power} className="h-2 [&>div]:bg-orange-500 bg-orange-950/30" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-foreground uppercase flex items-center gap-2">
                        <Activity className="w-3 h-3 text-blue-500" /> Resistencia
                      </span>
                      <span className="text-xs font-black text-blue-500">{stats.defense}/100</span>
                    </div>
                    <Progress value={stats.defense} className="h-2 [&>div]:bg-blue-500 bg-blue-950/30" />
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 text-center">Hostilidad</p>
                      <p className="text-lg font-black text-center text-red-500">{stats.hostility}/10</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 text-center">Inteligencia</p>
                      <p className="text-lg font-black text-center text-emerald-500">{stats.intelligence}/10</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">Habilidades Clasificadas</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.abilities.map((ability, idx) => (
                      <span key={idx} className="bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full border border-primary/20">
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Winner Overlay */}
            <AnimatePresence>
              {isWinner && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-40 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center border-4 border-primary rounded-xl"
                >
                  <motion.div 
                    initial={{ y: 50 }} animate={{ y: 0 }} 
                    className="bg-background/90 text-primary px-8 py-4 rounded-2xl border-2 border-primary shadow-[0_0_50px_rgba(255,115,0,0.5)] transform -rotate-12"
                  >
                    <h3 className="text-5xl font-black uppercase tracking-tighter italic">Vencedor</h3>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </motion.div>
        </Card>
      </motion.div>
    );
  };

  if (combatants.length < 2) return null;

  return (
    <div className="w-full max-w-7xl mx-auto relative">
      
      {/* HUD Selector */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 relative z-30">
        {renderFighterSelect(fighter1Slug, setFighter1Slug, "Sujeto de Pruebas A", 'left')}
        
        <div className="shrink-0 flex flex-col items-center">
          <Button 
            size="lg" 
            onClick={simulateBattle}
            disabled={isBattling || fighter1Slug === fighter2Slug}
            className={`h-16 px-12 rounded-full font-black text-lg tracking-[0.2em] uppercase transition-all duration-300 ${isBattling ? 'bg-red-600 animate-pulse scale-105 shadow-[0_0_40px_rgba(220,38,38,0.6)]' : 'bg-primary hover:bg-primary/90 hover:scale-105 shadow-[0_0_20px_rgba(255,115,0,0.4)] hover:shadow-[0_0_40px_rgba(255,115,0,0.6)]'}`}
          >
            {isBattling ? 'Procesando...' : 'Iniciar Simulación'}
          </Button>
        </div>

        {renderFighterSelect(fighter2Slug, setFighter2Slug, "Sujeto de Pruebas B", 'right')}
      </div>
      
      {/* Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative">
        
        {/* VS Badge */}
        <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-32 h-32 bg-black rounded-full border-[10px] border-background items-center justify-center shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-red-600/20 animate-spin-slow" />
          <span className="font-black text-5xl text-transparent bg-clip-text bg-gradient-to-br from-primary to-red-600 italic tracking-tighter relative z-10">VS</span>
        </div>
        
        {/* Fighters */}
        <div className="relative">
          {renderFighterCard(fighter1, false)}
        </div>
        <div className="relative">
          {renderFighterCard(fighter2, true)}
        </div>
      </div>
    </div>
  );
}
