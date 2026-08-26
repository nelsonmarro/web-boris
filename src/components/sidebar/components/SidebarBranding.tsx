'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SidebarHeader as BaseHeader } from '@/components/ui/sidebar';

export function SidebarBranding() {
  return (
    <BaseHeader className="relative z-10 border-b border-white/5 p-5 group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:py-4">
      <Link
        href="/"
        aria-label="Ir al inicio"
        className="group flex items-center gap-3 group-data-[collapsible=icon]:justify-center"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-primary/20 text-primary-foreground shadow-[0_0_20px_rgba(255,115,0,0.3)] transition-transform group-hover:scale-110">
          <Image src="/assets/Branding/logo.webp" alt="" width={32} height={32} className="rounded-full" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate text-base font-bold text-white">Borisao Wiki</span>
          <span className="truncate text-[11px] font-bold uppercase tracking-wider text-primary">Oficial Lore</span>
        </div>
      </Link>
    </BaseHeader>
  );
}
