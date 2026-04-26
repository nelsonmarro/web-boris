'use client';

import * as React from 'react';
import { Quote } from 'lucide-react';

interface WikiQuoteProps {
  children: React.ReactNode;
  author?: string;
  source?: string;
}

export function WikiQuote({ children, author, source }: WikiQuoteProps) {
  return (
    <div className="relative my-12 p-8 md:p-12 glass-liquid rounded-[2rem] border-white/10 shadow-2xl overflow-hidden group">
      <div className="glass-reflection opacity-20" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <Quote className="absolute top-6 left-6 w-12 h-12 text-primary/20 -scale-x-100" />
      
      <blockquote className="relative z-10">
        <p className="text-xl md:text-2xl font-bold text-white/90 italic leading-relaxed text-center px-4 md:px-12">
          {children}
        </p>
        
        {(author || source) && (
          <footer className="mt-8 flex flex-col items-center">
            <div className="w-12 h-0.5 bg-primary/30 rounded-full mb-4" />
            <cite className="not-italic flex flex-col items-center">
              {author && <span className="text-primary font-bold uppercase tracking-widest text-xs">— {author}</span>}
              {source && <span className="text-white/40 font-medium text-[10px] uppercase tracking-wider mt-1">{source}</span>}
            </cite>
          </footer>
        )}
      </blockquote>

      <Quote className="absolute bottom-6 right-6 w-12 h-12 text-primary/20" />
    </div>
  );
}
