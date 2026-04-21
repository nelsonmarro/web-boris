'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';

interface AbyssalTableProps {
  headers: string[];
  rows: string[][];
  className?: string;
}

export function AbyssalTable({ headers, rows, className }: AbyssalTableProps) {
  return (
    <div className={cn("my-8 overflow-hidden rounded-[2rem] border border-white/10 glass-liquid shadow-2xl", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {headers.map((header, i) => (
                <th 
                  key={i} 
                  className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-primary italic"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                {row.map((cell, j) => (
                  <td 
                    key={j} 
                    className="px-6 py-5 text-sm font-medium text-white/70 group-hover:text-white transition-colors"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
