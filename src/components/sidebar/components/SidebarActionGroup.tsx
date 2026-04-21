'use client';

import * as React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { SidebarFooter as BaseFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export function SidebarActionGroup() {
  return (
    <BaseFooter className="p-4 border-t border-white/5 relative z-10 bg-black/20">
      <SidebarMenu>
         <SidebarMenuItem>
           <SidebarMenuButton 
              tooltip="Volver al Inicio"
              className="h-12 bg-white/5 hover:bg-primary/10 text-white/80 hover:text-primary transition-all rounded-2xl border border-white/10 hover:border-primary/30 group"
              asChild
           >
              <Link href="/" className="flex items-center gap-3 px-4 w-full">
                 <ChevronRight className="rotate-180 w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                 <span className="font-black uppercase tracking-widest text-[10px] group-data-[collapsible=icon]:hidden">Inicio</span>
              </Link>
           </SidebarMenuButton>
         </SidebarMenuItem>
      </SidebarMenu>
    </BaseFooter>
  );
}
