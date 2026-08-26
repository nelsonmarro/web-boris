'use client';

import * as React from 'react';
import Link from 'next/link';
import { silhouetteFor, type SilhouetteKind } from '@/features/monsters/lib/arena';
import type { Fighter } from '@/features/monsters/lib/arena';

interface ComparadorEscalaProps {
  fighters: Fighter[];
}

const VIEW_W = 1000;
const LABEL_W = 0; // labels fuera del SVG
const TRACK_W = 900;

/** Paths genéricos en caja 100×30 (se escalan a la longitud real). */
const PATHS: Record<SilhouetteKind, { d: string; ratio: number }> = {
  anguila: { d: 'M0,15 C8,4 30,2 55,7 C75,10 92,12 100,15 C92,18 75,20 55,23 C30,28 8,26 0,15 Z', ratio: 0.09 },
  cetaceo: { d: 'M0,15 C3,8 12,4 30,4 C55,4 80,8 92,12 L100,6 L97,15 L100,24 L92,18 C80,22 55,26 30,26 C12,26 3,22 0,15 Z', ratio: 0.2 },
  acorazado: { d: 'M4,9 Q0,15 4,21 L20,24 L35,22 L50,25 L65,22 L80,25 L96,21 Q100,15 96,9 L80,6 L65,9 L50,5 L35,9 L20,6 Z', ratio: 0.28 },
  pez: { d: 'M0,15 C6,6 20,3 45,4 C70,5 88,9 93,13 L100,8 L98,15 L100,22 L93,17 C88,21 70,25 45,26 C20,27 6,24 0,15 Z', ratio: 0.22 },
};

const REFERENCES = [
  { label: 'Submarino nuclear (170 m, referencia real)', length: 170, kind: 'pez' as const },
  { label: 'Buzo humano (1,75 m)', length: 1.75, kind: 'pez' as const },
];

export function ComparadorEscala({ fighters }: ComparadorEscalaProps) {
  const rows = fighters
    .filter((f) => typeof f.frontmatter.stats.length === 'number')
    .map((f) => ({ slug: f.slug, label: f.frontmatter.title, length: f.frontmatter.stats.length as number, kind: silhouetteFor(f.slug) }))
    .sort((x, y) => y.length - x.length);

  const maxLength = Math.max(...rows.map((r) => r.length), 1);
  const pxPerMeter = TRACK_W / maxLength;

  const allRows = [...rows.map((r) => ({ ...r, isRef: false })), ...REFERENCES.map((r) => ({ ...r, slug: '', isRef: true }))];
  const ROW_H = 64;
  const height = allRows.length * ROW_H + 40;

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/60">
        Todas las siluetas comparten la misma escala horizontal: <span className="font-mono text-white/80">1 m ≈ {pxPerMeter.toFixed(2)} px</span>. Las formas son genéricas por tipo (anguila, cetáceo, acorazado, pez); la longitud proviene del registro biométrico de cada artículo.
      </p>

      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#061a2e] p-4 md:p-6">
        <svg viewBox={`0 0 ${VIEW_W} ${height}`} className="h-auto w-full min-w-[640px]" role="img" aria-label="Comparador de escala de colosos">
          {/* Ticks cada 100 m */}
          {Array.from({ length: Math.floor(maxLength / 100) + 1 }, (_, i) => i * 100).map((m) => (
            <g key={m}>
              <line x1={LABEL_W + m * pxPerMeter} y1={0} x2={LABEL_W + m * pxPerMeter} y2={height - 24} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 5" />
              <text x={LABEL_W + m * pxPerMeter} y={height - 8} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10} fontFamily="monospace">
                {m} m
              </text>
            </g>
          ))}

          {allRows.map((row, i) => {
            const w = Math.max(row.length * pxPerMeter, 0.5);
            const { d, ratio } = PATHS[row.kind];
            const h = Math.max(Math.min(w * ratio, ROW_H - 22), 6);
            const y = i * ROW_H + 8;
            const tiny = w < 6;
            return (
              <g key={`${row.label}-${i}`} transform={`translate(${LABEL_W}, ${y})`}>
                <text x={0} y={-2 + 10} fill={row.isRef ? 'rgba(255,255,255,0.45)' : '#ffffff'} fontSize={11} fontWeight={800} style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {row.label}
                  <tspan fill="rgba(255,115,0,0.9)" fontFamily="monospace" fontWeight={700}> · {row.length.toLocaleString('es-ES')} m</tspan>
                </text>
                {tiny ? (
                  <g transform={`translate(0, 16)`}>
                    <rect x={0} y={0} width={Math.max(w, 2)} height={h + 8} fill="#67e8f9" />
                    <text x={8} y={h + 4} fill="rgba(255,255,255,0.45)" fontSize={9} fontFamily="monospace">
                      ≈ {w.toFixed(1)} px a esta escala
                    </text>
                  </g>
                ) : (
                  <g transform={`translate(0, ${16 + (ROW_H - 26 - h) / 2}) scale(${w / 100}, ${h / 30})`}>
                    <path d={d} fill={row.isRef ? 'rgba(103,232,249,0.35)' : 'rgba(255,115,0,0.28)'} stroke={row.isRef ? '#67e8f9' : '#FF7300'} strokeWidth={row.isRef ? 30 / h : 60 / h} vectorEffect="non-scaling-stroke" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="flex flex-wrap gap-2">
        {rows.map((r) => (
          <li key={r.slug}>
            <Link href={`/wiki/${r.slug}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:border-primary/40 hover:text-primary">
              {r.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
