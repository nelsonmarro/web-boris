'use client';

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { SidebarHeader as BaseHeader } from "@/components/ui/sidebar";

export function SidebarBranding() {
  return (
    <BaseHeader className="p-6 relative z-10 border-b border-white/5 bg-black/20">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-foreground shadow-[0_0_20px_rgba(255,115,0,0.3)] border border-primary/20 transition-all group-hover:scale-110 group-hover:bg-primary/20">
          <Image src="/assets/logo.png" alt="Logo" width={34} height={32} className="rounded-full object-cover" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate font-black text-white text-base tracking-tighter uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Borisao Wiki</span>
          <span className="truncate text-[9px] text-primary font-black uppercase tracking-[0.3em]">Archivo Central</span>
        </div>
      </Link>
    </BaseHeader>
  );
}
