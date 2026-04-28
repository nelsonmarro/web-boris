'use client';

import * as React from 'react';
import { ListTree } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
  numbering: string;
}

export function WikiTOC() {
  const [headings, setHeadings] = React.useState<Heading[]>([]);
  const [isOpen, setIsOpen] = React.useState(true);

  React.useEffect(() => {
    const container = document.querySelector('.wiki-content');
    if (!container) return;

    const elements = Array.from(container.querySelectorAll('h2, h3'));
    
    // Assign IDs to elements if they don't have one
    elements.forEach((elem) => {
      if (!elem.id) {
        elem.id = elem.textContent?.toLowerCase().trim().replace(/\s+/g, '-') || '';
      }
    });

    // Calculate hierarchical numbering
    let h2Count = 0;
    let h3Count = 0;
    
    const processedHeadings: Heading[] = elements.map((elem) => {
      const level = Number(elem.tagName.replace('H', ''));
      let numbering = '';

      if (level === 2) {
        h2Count++;
        h3Count = 0;
        numbering = `${h2Count}.`;
      } else if (level === 3) {
        h3Count++;
        numbering = `${h2Count}.${h3Count}.`;
      }

      return {
        id: elem.id,
        text: elem.textContent || '',
        level,
        numbering,
      };
    });

    setHeadings(processedHeadings);
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="my-10 inline-block min-w-[320px] bg-[#071d31] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
      {/* Header Style Wikipedia/Fandom */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <ListTree className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-bold text-white tracking-wide">
            Contenido
          </h4>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-1 group"
        >
          <span className="opacity-40 group-hover:opacity-100">[</span>
          {isOpen ? 'ocultar' : 'mostrar'}
          <span className="opacity-40 group-hover:opacity-100">]</span>
        </button>
      </div>

      {isOpen && (
        <ul className="p-6 py-5 space-y-3">
          {headings.map((h, i) => (
            <li 
              key={i} 
              className="flex items-baseline gap-2"
              style={{ paddingLeft: h.level === 3 ? '1.5rem' : '0' }}
            >
              <span className="text-xs font-mono text-primary/80 font-bold shrink-0 min-w-[1.5rem]">
                {h.numbering}
              </span>
              <a 
                href={`#${h.id}`}
                className="text-sm md:text-base font-semibold text-white/70 hover:text-white transition-all leading-tight"
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
