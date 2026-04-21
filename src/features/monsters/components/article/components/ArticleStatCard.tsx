'use client';

import * as React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function ArticleStatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="glass-liquid p-6 rounded-3xl border-white/10 flex flex-col gap-4 group hover:border-primary/30 transition-all">
       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
          {icon}
       </div>
       <div className="space-y-1">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-black text-white italic uppercase tracking-tighter">{value}</p>
       </div>
    </div>
  );
}
