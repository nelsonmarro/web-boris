import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ContactFieldProps {
  label: string;
  /** `id` del campo: asocia la etiqueta con su control. */
  htmlFor?: string;
  icon: LucideIcon;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function ContactField({ label, htmlFor, icon: Icon, error, children, className }: ContactFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="eyebrow text-white/60 mb-1 block pl-1">
        {label}
      </label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
        {children}
      </div>
      {error && (
        <p className="text-red-400 text-[11px] font-bold italic pl-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}

// Specialized Textarea Field (Icon position differs)
export function ContactTextAreaField({ label, htmlFor, icon: Icon, error, children, className }: ContactFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="eyebrow text-white/60 mb-1 block pl-1">
        {label}
      </label>
      <div className="relative group">
        <Icon className="absolute left-4 top-6 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
        {children}
      </div>
      {error && (
        <p className="text-red-400 text-[11px] font-bold italic pl-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
