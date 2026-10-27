'use client';

import * as React from 'react';
import { Tabs } from '@base-ui/react/tabs';
import { cn } from '@/utils/cn';

interface WikiTabProps {
  value: string;
  label: string;
  children: React.ReactNode;
}

/** Pestaña individual. Solo transporta props; el render lo hace `WikiTabs`. */
export function WikiTab({ children }: WikiTabProps) {
  return <>{children}</>;
}

interface WikiTabsProps {
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Tabber para variantes dentro de un artículo (formas, etapas, relaciones).
 * Superficie sólida #061a2e, indicador naranja. Patrón visto en Genshin/VS Battles.
 */
export function WikiTabs({ defaultValue, children, className }: WikiTabsProps) {
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<WikiTabProps> =>
      React.isValidElement(child) &&
      typeof (child.props as Partial<WikiTabProps>).label === 'string' &&
      typeof (child.props as Partial<WikiTabProps>).value === 'string',
  );

  if (tabs.length === 0) return null;

  return (
    <Tabs.Root
      defaultValue={defaultValue ?? tabs[0].props.value}
      className={cn(
        'not-prose clear-both my-10 overflow-hidden rounded-2xl border border-white/10 bg-[#061a2e] shadow-2xl',
        className,
      )}
    >
      <Tabs.List className="relative flex flex-nowrap gap-1 overflow-x-auto border-b border-white/10 bg-black/20 px-2 pt-2">
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.props.value}
            value={tab.props.value}
            className="relative z-10 min-h-11 shrink-0 whitespace-nowrap rounded-t-lg px-2.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] sm:px-4 sm:tracking-[0.18em] text-white/50 outline-none focus-visible:outline-hidden transition-colors hover:text-white/80 focus-visible:ring-2 focus-visible:ring-primary/40 data-[active]:text-primary data-[selected]:text-primary"
          >
            {tab.props.label}
          </Tabs.Tab>
        ))}
        <Tabs.Indicator className="absolute bottom-0 left-[var(--active-tab-left)] h-[2px] w-[var(--active-tab-width)] bg-primary shadow-[0_0_12px_rgba(255,115,0,0.8)] transition-all duration-300" />
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Panel
          key={tab.props.value}
          value={tab.props.value}
          className="px-5 py-5 text-[16px] leading-[1.7] text-white/80 outline-none focus-visible:outline-hidden md:px-6 [&_div]:mb-4 [&_div]:text-[16px] [&_div]:font-normal [&_div]:leading-[1.7] [&_div:last-child]:mb-0"
        >
          {tab.props.children}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
