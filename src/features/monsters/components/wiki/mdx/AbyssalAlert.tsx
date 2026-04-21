'use client';

import * as React from 'react';
import { ShieldAlert, Info, Skull, LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

type AlertVariant = 'info' | 'warning' | 'danger' | 'classified';

interface AbyssalAlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<AlertVariant, { icon: LucideIcon; bg: string; border: string; text: string; accent: string }> = {
  info: {
    icon: Info,
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
    text: 'text-blue-200/80',
    accent: 'text-blue-400',
  },
  warning: {
    icon: ShieldAlert,
    bg: 'bg-orange-500/5',
    border: 'border-orange-500/20',
    text: 'text-orange-200/80',
    accent: 'text-orange-400',
  },
  danger: {
    icon: ShieldAlert,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-200/90',
    accent: 'text-red-500',
  },
  classified: {
    icon: Skull,
    bg: 'bg-primary/5',
    border: 'border-primary/20',
    text: 'text-white/80',
    accent: 'text-primary',
  },
};

export function AbyssalAlert({ variant = 'info', title, children, className }: AbyssalAlertProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl border p-6 my-8 glass-liquid",
      config.bg,
      config.border,
      className
    )}>
      <div className="glass-reflection opacity-20" />
      
      <div className="flex gap-4 relative z-10">
        <div className={cn("shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center", config.accent)}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="space-y-1">
          {title && (
            <h4 className={cn("text-[10px] font-black uppercase tracking-[0.3em]", config.accent)}>
              {title}
            </h4>
          )}
          <div className={cn("text-sm font-medium leading-relaxed", config.text)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
