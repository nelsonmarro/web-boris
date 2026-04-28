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
    bg: 'bg-[#0a2339]',
    border: 'border-blue-500/30',
    text: 'text-blue-200/80',
    accent: 'text-blue-400',
  },
  warning: {
    icon: ShieldAlert,
    bg: 'bg-[#1a1406]',
    border: 'border-orange-500/30',
    text: 'text-orange-200/80',
    accent: 'text-orange-400',
  },
  danger: {
    icon: ShieldAlert,
    bg: 'bg-[#1a0606]',
    border: 'border-red-500/40',
    text: 'text-red-100/90',
    accent: 'text-red-500',
  },
  classified: {
    icon: Skull,
    bg: 'bg-[#0a2339]',
    border: 'border-primary/40',
    text: 'text-white/80',
    accent: 'text-primary',
  },
};

export function AbyssalAlert({ variant = 'info', title, children, className }: AbyssalAlertProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border p-6 my-8 shadow-xl",
      config.bg,
      config.border,
      className
    )}>
      <div className="flex gap-4 relative z-10">
        <div className={cn("shrink-0 w-12 h-12 rounded-xl bg-black/20 border border-white/5 flex items-center justify-center", config.accent)}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="space-y-1 py-1">
          {title && (
            <h4 className={cn("text-[11px] font-bold uppercase tracking-[0.2em] italic", config.accent)}>
              {title}
            </h4>
          )}
          <div className={cn("text-base font-medium leading-relaxed", config.text)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
