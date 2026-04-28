'use client';

import * as React from 'react';
import { ListTree, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';

export function WikiTOC() {
  const [headings, setHeadings] = React.useState<{ id: string; text: string; level: number }[]>([]);
  const [isOpen, setIsOpen] = React.useState(true);

  React.useEffect(() => {
    const elements = Array.from(document.querySelectorAll('h2, h3'))
      .map((elem) => ({
        id: elem.id || elem.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
        text: elem.textContent || '',
        level: Number(elem.tagName.replace('H', '')),
      }))
      .filter(h => h.id);
    
    // Assign IDs to elements if they don't have one
    document.querySelectorAll('h2, h3').forEach((elem) => {
      if (!elem.id) {
        elem.id = elem.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
      }
    });

    setHeadings(elements);
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="my-10 inline-block min-w-[320px] bg-[#0a2339] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="bg-primary/10 border-b border-white/5 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListTree className="w-5 h-5 text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white italic">
            Contenido
          </h4>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-md hover:bg-white/5 text-white/40 transition-colors"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <ul className="p-6 space-y-3">
          {headings.map((h, i) => (
            <li 
              key={i} 
              style={{ paddingLeft: `${(h.level - 2) * 1.5}rem` }}
              className="group/item flex items-baseline gap-3"
            >
              <span className="text-[11px] font-mono text-primary font-bold">
                {i + 1}.
              </span>
              <a 
                href={`#${h.id}`}
                className="text-base font-semibold text-white/60 hover:text-white transition-all underline decoration-white/0 hover:decoration-primary/50 underline-offset-4"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
