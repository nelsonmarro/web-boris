'use client';

import * as React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { SidebarFooter as BaseFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export function SidebarActionGroup() {
  return (
    <BaseFooter className="p-4 border-t border-white/5 relative z-10">
      <SidebarMenu>
         <SidebarMenuItem>
           <SidebarMenuButton 
              tooltip="Volver al Inicio"
              className="h-10 hover:bg-white/5 text-white/60 hover:text-white transition-all rounded-lg group"
              render={<Link href="/" className="flex items-center gap-3 px-4 w-full" />}
           >
                 <ChevronRight className="rotate-180 w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                 <span className="font-medium text-[13px] group-data-[collapsible=icon]:hidden">Volver a Inicio</span>
           </SidebarMenuButton>
         </SidebarMenuItem>
      </SidebarMenu>
    </BaseFooter>
  );
}
