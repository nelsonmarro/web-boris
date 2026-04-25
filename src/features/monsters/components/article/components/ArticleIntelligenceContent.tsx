'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Maximize2, ShieldAlert, Zap } from 'lucide-react';
import { ArticleStatCard } from './ArticleStatCard';

interface ArticleIntelligenceContentProps {
  article?: {
    title: string;
    universe: string;
    description: string;
    content: string;
    stats: {
      size: string;
      danger: string;
      speed: string;
    };
  };
  displayTitle: string;
  displayUniverse: string;
  displayDescription: string;
  children?: React.ReactNode;
}

export function ArticleIntelligenceContent({ 
  article, 
  displayTitle, 
  displayUniverse, 
  displayDescription, 
  children 
}: ArticleIntelligenceContentProps) {
  const [activeTab] = React.useState<'lore' | 'data'>('lore');

  return (
    <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-3xl overflow-hidden relative">
       <div className="glass-reflection opacity-20" />
       
       {!article && (
          <div className="px-12 pt-12">
             <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
                {displayUniverse}
             </Badge>
             <h1 className="text-4xl md:text-6xl font-bold text-white italic uppercase tracking-tight leading-none drop-shadow-2xl">
                {displayTitle}
             </h1>
             {displayDescription && (
                <p className="mt-4 text-white/60 text-sm font-medium tracking-tight">
                   {displayDescription}
                </p>
             )}
          </div>
       )}

       {/* Dynamic Content Area */}
       <div className="flex-1 overflow-y-auto custom-scrollbar p-12 relative z-10">
          {children || (article && (
             activeTab === 'lore' ? (
              <div className="prose prose-invert prose-lg max-w-none space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-wider mb-8">
                   <Sparkles className="w-3 h-3 text-primary" />
                   Desclasificado por Iniciativa Abisal
                </div>
                <div className="text-white/80 leading-relaxed font-medium space-y-6">
                   {article.content.split('\n\n').map((paragraph, i) => (
                     <p key={i}>{paragraph}</p>
                   ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <ArticleStatCard icon={<Maximize2 className="w-5 h-5" />} label="Escala Estimada" value={article.stats.size} />
                   <ArticleStatCard icon={<ShieldAlert className="w-5 h-5 text-red-500" />} label="Nivel de Amenaza" value={article.stats.danger} />
                   <ArticleStatCard icon={<Zap className="w-5 h-5 text-blue-500" />} label="Actividad Bio-Eléctrica" value={article.stats.speed} />
                </div>
              </div>
            )
          ))}
       </div>
    </div>
  );
}
