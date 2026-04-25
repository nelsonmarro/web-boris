'use client';

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { SidebarHeader as BaseHeader } from "@/components/ui/sidebar";

export function SidebarBranding() {
  return (
    <BaseHeader className="p-4 relative z-10 border-b border-white/5">
      <Link href="/" className="flex items-center gap-3 px-2 group">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary-foreground shadow-[0_0_20px_rgba(255,115,0,0.3)] border border-white/20 transition-transform group-hover:scale-110">
          <Image src="/assets/logo.png" alt="Logo" width={32} height={32} className="rounded-full" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate font-black text-white text-base tracking-tighter uppercase">Borisao Wiki</span>
          <span className="truncate text-[10px] text-primary font-black uppercase tracking-[0.2em]">Oficial Lore</span>
        </div>
      </Link>
    </BaseHeader>
  );
}
