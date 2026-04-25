import { BookOpen, Users, Play, Globe } from 'lucide-react';
import { getLoreStats } from '../actions/get-lore-stats';

export async function LoreStatsSection() {
  const statsData = await getLoreStats();

  const STATS = [
    {
      label: 'Entradas de Lore',
      value: `${statsData.loreEntries}+`,
      icon: BookOpen,
      color: 'text-primary',
    },
    {
      label: 'Exploradores Activos',
      value: statsData.explorers,
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Archivos Visuales',
      value: `${statsData.visualFiles}+`,
      icon: Play,
      color: 'text-red-500',
    },
    {
      label: 'Universos Paralelos',
      value: statsData.universes.toString(),
      icon: Globe,
      color: 'text-emerald-400',
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-transparent">
      {/* Background Ambience for the Stats Container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="glass-liquid rounded-[4rem] border-white/20 shadow-[0_60px_120px_rgba(0,0,0,0.9)] p-12 md:p-20 relative group border-refractive overflow-hidden bg-white/[0.03]">
          {/* Internal Glows */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-all duration-1000" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="glass-reflection opacity-30" />
          <div className="glass-shine" />

          <div className="absolute top-10 left-10 flex items-center gap-3 opacity-30 group-hover:opacity-60 transition-opacity"></div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-20 relative z-10 divide-x-0 lg:divide-x divide-white/10">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center space-y-8 group/item first:pl-0 lg:pl-10"
              >
                <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/20 flex items-center justify-center transition-all group-hover/item:scale-110 group-hover/item:border-primary/50 group-hover/item:bg-primary/10 shadow-2xl glass-liquid relative border-refractive">
                  <stat.icon
                    className={`w-9 h-9 ${stat.color} drop-shadow-[0_0_15px_currentColor]`}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-5xl md:text-6xl font-bold text-white tracking-tight italic uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                    {stat.value}
                  </h3>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 group-hover/item:text-white/80 transition-colors">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
