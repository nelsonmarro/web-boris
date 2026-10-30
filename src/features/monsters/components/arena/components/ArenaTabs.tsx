'use client';

import * as React from 'react';
import { Tabs } from '@base-ui/react/tabs';

export interface ArenaTab {
  value: string;
  label: string;
  content: React.ReactNode;
}

/**
 * Pestañas de la Arena: el aspecto de `WikiTabs` (indicador naranja) sobre fondo transparente, como antes, y sin sus
 * reglas de prosa para los `div` del panel, que pisarían la maquetación del combate y del torneo.
 */
export function ArenaTabs({ tabs, defaultValue }: { tabs: ArenaTab[]; defaultValue?: string }) {
  if (tabs.length === 0) return null;
  return (
    <Tabs.Root
      defaultValue={defaultValue ?? tabs[0].value}
      className="overflow-visible"
    >
      <Tabs.List className="relative flex flex-nowrap gap-1 overflow-x-auto rounded-t-2xl border-b border-white/10 bg-black/20 px-2 pt-2">
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            className="relative z-10 min-h-11 shrink-0 whitespace-nowrap rounded-t-lg px-2 py-2.5 text-[11px] font-bold uppercase tracking-[0.04em] text-white/60 outline-none transition-colors hover:text-white/80 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 data-[active]:text-primary data-[selected]:text-primary sm:px-4 sm:tracking-[0.18em] motion-reduce:transition-none"
          >
            {tab.label}
          </Tabs.Tab>
        ))}
        <Tabs.Indicator className="absolute bottom-0 left-[var(--active-tab-left)] h-[2px] w-[var(--active-tab-width)] bg-primary shadow-[0_0_12px_rgba(255,115,0,0.8)] transition-all duration-300 motion-reduce:transition-none" />
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value} className="py-6 text-white/80 outline-none focus-visible:outline-hidden">
          {tab.content}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
