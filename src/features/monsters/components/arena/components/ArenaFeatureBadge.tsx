'use client';

import * as React from 'react';

interface FeatureBadgeProps {
  icon: React.ReactNode;
  label: string;
}

export function ArenaFeatureBadge({ icon, label }: FeatureBadgeProps) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-3 group hover:border-primary/30 transition-all">
       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-all">
          {icon}
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
         {label}
       </span>
    </div>
  );
}
