'use client';

import * as React from "react";
import { Sidebar, SidebarRail } from "@/components/ui/sidebar";
import { SidebarBranding } from "./sidebar/components/SidebarBranding";
import { SidebarNavigation } from "./sidebar/components/SidebarNavigation";
import { SidebarActionGroup } from "./sidebar/components/SidebarActionGroup";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-white/10 bg-black/40 backdrop-blur-3xl shadow-[30px_0_60px_rgba(0,0,0,0.8)] border-refractive">
      {/* Dynamic Glass Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="glass-reflection opacity-10" />
         <div className="glass-shine opacity-5" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <SidebarBranding />
        <SidebarNavigation />
        <SidebarActionGroup />
      </div>
      
      <SidebarRail className="hover:after:bg-primary/50 transition-colors" />
    </Sidebar>
  );
}
