'use client'

import * as React from "react"
import Image from "next/image"
import { WikiArticle } from "@/core/types/wiki"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
  // Solo los artículos con stats son aptos para pelear
  const combatants = articles.filter(a => a.frontmatter.stats);
  const [fighter1Slug, setFighter1Slug] = React.useState<string>(combatants[0]?.slug || "");
  const [fighter2Slug, setFighter2Slug] = React.useState<string>(combatants[1]?.slug || "");

  const fighter1 = combatants.find(c => c.slug === fighter1Slug);
  const fighter2 = combatants.find(c => c.slug === fighter2Slug);

  const renderFighterSelect = (
    value: string,
    onChange: (val: string) => void,
    label: string
  ) => (
    <div className="w-full">
      <label className="text-sm font-bold text-muted-foreground mb-2 block uppercase tracking-wider">{label}</label>
      <Select value={value} onValueChange={(val) => val && onChange(val)}>
        <SelectTrigger className="w-full bg-background border-border h-12 text-lg">
          <SelectValue placeholder="Selecciona un combatiente" />
        </SelectTrigger>
        <SelectContent>
          {combatants.map(c => (
            <SelectItem key={c.slug} value={c.slug} className="text-base cursor-pointer">
              {c.frontmatter.title} <span className="text-muted-foreground text-xs ml-2">({c.frontmatter.universe})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderFighterCard = (fighter: WikiArticle | undefined, isRight: boolean) => {
    if (!fighter) {
      return (
        <Card className="h-[600px] flex flex-col items-center justify-center bg-card border-dashed border-2 border-border text-muted-foreground p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mb-4 animate-pulse" />
          <p className="font-medium text-lg">Esperando combatiente...</p>
          <p className="text-sm mt-2">Selecciona una entidad de la lista superior.</p>
        </Card>
      );
    }

    const stats = fighter.frontmatter.stats!;

    return (
      <Card className={`w-full bg-card border-border overflow-hidden shadow-2xl relative group transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,115,0,0.15)] ${isRight ? 'md:border-l-0' : 'md:border-r-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10" />
        
        {fighter.frontmatter.image && (
          <div className="relative h-72 w-full">
            <Image 
              src={fighter.frontmatter.image}
              alt={fighter.frontmatter.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </div>
        )}
        
        <div className="relative z-20 -mt-20 p-6 md:p-8">
          <div className="flex flex-col mb-8">
             <span className="inline-block self-start px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full mb-3 uppercase tracking-widest backdrop-blur-sm border border-primary/30">
               {fighter.frontmatter.universe}
             </span>
             <h2 className="text-3xl md:text-4xl font-black text-foreground drop-shadow-lg leading-tight">
               {fighter.frontmatter.title}
             </h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/80 p-4 rounded-xl border border-border backdrop-blur-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Longitud</p>
                <p className="text-xl font-bold text-foreground">{stats.length ? `${stats.length} m` : 'N/A'}</p>
              </div>
              <div className="bg-background/80 p-4 rounded-xl border border-border backdrop-blur-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Peso</p>
                <p className="text-sm font-bold text-foreground leading-snug">{stats.weight || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-foreground">Inteligencia</span>
                  <span className="text-sm font-black text-primary">{stats.intelligence || 0}/10</span>
                </div>
                <Progress value={(stats.intelligence || 0) * 10} className="h-3" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-foreground">Hostilidad</span>
                  <span className="text-sm font-black text-destructive">{stats.hostility || 0}/10</span>
                </div>
                {/* Usamos un truco con estilo inline o color si tuviéramos un Progress variante. Aquí usaremos el Progress por defecto, pero podríamos tematizarlo si shadcn lo permite. */}
                <Progress value={(stats.hostility || 0) * 10} className="h-3 [&>div]:bg-destructive" />
              </div>
            </div>

            <div className="pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Mordida Principal</p>
              <p className="text-sm font-medium text-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50">
                {stats.biteType || 'Sin información clasificada'}
              </p>
            </div>

            {stats.specialAbilities && stats.specialAbilities.length > 0 && (
              <div className="pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Habilidades Clasificadas</p>
                <ul className="flex flex-wrap gap-2">
                  {stats.specialAbilities.map((ability, idx) => (
                    <li key={idx} className="bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1.5 rounded-md border border-secondary/20">
                      {ability}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (combatants.length < 2) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-xl font-bold mb-2">Datos Insuficientes</p>
        <p>Necesitamos al menos 2 perfiles clasificados con estadísticas para la simulación de combate.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Selector de Combate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-card/40 p-6 md:p-8 rounded-3xl border border-border backdrop-blur-md shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="relative z-10">{renderFighterSelect(fighter1Slug, setFighter1Slug, "Combatiente Alfa")}</div>
        <div className="relative z-10">{renderFighterSelect(fighter2Slug, setFighter2Slug, "Combatiente Omega")}</div>
      </div>
      
      {/* Arena de Comparación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 items-stretch relative">
        <div className="hidden md:flex absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-24 h-24 bg-background rounded-full border-8 border-background items-center justify-center shadow-[0_0_50px_rgba(255,115,0,0.6)]">
          <span className="font-black text-3xl text-primary italic tracking-tighter">VS</span>
        </div>
        
        {renderFighterCard(fighter1, false)}
        {renderFighterCard(fighter2, true)}
      </div>
    </div>
  );
}
