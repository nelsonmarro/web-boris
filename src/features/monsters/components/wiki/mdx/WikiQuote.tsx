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
    <div className="relative my-12 p-8 md:p-14 bg-[#0a2339] rounded-3xl border border-white/10 shadow-2xl overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <Quote className="absolute top-8 left-8 w-16 h-16 text-primary/10 -scale-x-100" />
      
      <blockquote className="relative z-10">
        <p className="text-xl md:text-3xl font-bold text-white leading-relaxed text-center px-4 md:px-16 drop-shadow-lg italic">
          &quot;{children}&quot;
        </p>
        
        {(author || source) && (
          <footer className="mt-10 flex flex-col items-center">
            <div className="w-16 h-1 bg-primary/60 rounded-full mb-6 shadow-[0_0_15px_rgba(255,115,0,0.5)]" />
            <cite className="not-italic flex flex-col items-center">
              {author && <span className="text-primary font-bold uppercase tracking-[0.3em] text-[11px] mb-2">{author}</span>}
              {source && <span className="text-white/30 font-bold text-[9px] uppercase tracking-widest">{source}</span>}
            </cite>
          </footer>
        )}
      </blockquote>

      <Quote className="absolute bottom-8 right-8 w-16 h-16 text-primary/10" />
    </div>
  );
}
