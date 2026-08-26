'use client';

import * as React from 'react';

interface RadarSeries {
  name: string;
  color: string;
  values: number[]; // 0-100, same order as labels
}

interface RadarChartProps {
  labels: string[];
  series: RadarSeries[];
  size?: number;
}

/** Radar SVG de 5 ejes para comparar dos combatientes. */
export function RadarChart({ labels, series, size = 280 }: RadarChartProps) {
  const center = size / 2;
  const radius = size * 0.36;
  const n = labels.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, r: number) => [center + r * Math.cos(angle(i)), center + r * Math.sin(angle(i))] as const;
  const polygon = (values: number[]) =>
    values.map((v, i) => point(i, (Math.max(0, Math.min(100, v)) / 100) * radius).join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[320px]" role="img" aria-label="Comparativa de atributos">
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <polygon
          key={ring}
          points={labels.map((_, i) => point(i, radius * ring).join(',')).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}
      {labels.map((_, i) => {
        const [x, y] = point(i, radius);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />;
      })}
      {series.map((s) => (
        <polygon
          key={s.name}
          points={polygon(s.values)}
          fill={s.color}
          fillOpacity={0.18}
          stroke={s.color}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      ))}
      {labels.map((label, i) => {
        const [x, y] = point(i, radius + 18);
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.55)"
            fontSize={10}
            fontWeight={700}
            style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
