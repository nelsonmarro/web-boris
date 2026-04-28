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
    <div className={cn("my-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0a2339] shadow-2xl", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/10 border-b border-white/5">
              {headers.map((header, i) => (
                <th 
                  key={i} 
                  className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary italic"
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
                    className="px-8 py-5 text-base font-medium text-white/70 group-hover:text-white transition-colors"
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
