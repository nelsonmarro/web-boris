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
    <nav className="my-8 inline-block min-w-[300px] glass-liquid bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <ListTree className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Contenido</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
      </button>

      {isOpen && (
        <ul className="p-4 pt-0 space-y-2 border-t border-white/5">
          {headings.map((h, i) => (
            <li 
              key={i} 
              style={{ paddingLeft: `${(h.level - 2) * 1.5}rem` }}
              className="group/item"
            >
              <a 
                href={`#${h.id}`}
                className="text-sm font-medium text-white/40 hover:text-primary transition-all flex items-center gap-2"
              >
                <span className="text-[9px] font-mono text-primary/40 group-hover/item:text-primary transition-colors">
                  {i + 1}.
                </span>
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
