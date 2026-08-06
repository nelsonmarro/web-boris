import * as React from 'react';
import { Quote } from 'lucide-react';

interface WikiQuoteProps {
  children: React.ReactNode;
  author?: string;
  source?: string;
}

export function WikiQuote({ children, author, source }: WikiQuoteProps) {
  return (
    <div className="relative my-4 px-10 md:px-16 py-4 group">
      {/* Decorative vertical line (classic wiki) */}
      <div className="absolute left-9 top-0 bottom-0 w-[2px] bg-primary/20 rounded-full" />

      <Quote className="absolute top-0 left-0 w-8 h-8 text-primary opacity-40 -scale-x-100" />
      <Quote className="absolute bottom-42 right-100 w-8 h-8 text-primary opacity-40 rotate-180" />

      <blockquote className="relative">
        <div className="text-lg md:text-xl font-medium text-white/90 leading-relaxed italic">
          {children}
        </div>

        {(author || source) && (
          <footer className="mt-4 flex items-center gap-2">
            <span className="text-primary opacity-60">—</span>
            <cite className="not-italic text-sm font-bold flex items-center gap-2">
              {author && (
                <span className="text-primary/90 uppercase tracking-widest text-[11px]">
                  {author}
                </span>
              )}
              {source && (
                <span className="text-white/30 text-[10px] italic">
                  [{source}]
                </span>
              )}
            </cite>
          </footer>
        )}
      </blockquote>
    </div>
  );
}
