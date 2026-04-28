'use client';

import * as React from 'react';
import { ListTree, ChevronDown, ChevronUp } from 'lucide-react';
import { useWikiHeadings } from '../../../hooks/useWikiHeadings';

export function WikiTOC() {
  const headings = useWikiHeadings('.wiki-content');
  const [isOpen, setIsOpen] = React.useState(true);

  if (headings.length === 0) return null;

  return (
    <nav className="my-10 inline-block min-w-[320px] bg-[#061a2e] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
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
