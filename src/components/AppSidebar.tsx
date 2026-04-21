'use client';

import * as React from "react";
import { Sidebar, SidebarRail } from "@/components/ui/sidebar";
import { SidebarBranding } from "./sidebar/components/SidebarBranding";
import { SidebarNavigation } from "./sidebar/components/SidebarNavigation";
import { SidebarActionGroup } from "./sidebar/components/SidebarActionGroup";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-white/10 bg-black/60 backdrop-blur-3xl shadow-[10px_0_40px_rgba(0,0,0,0.6)]">
      {/* Dynamic Glass Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="glass-reflection opacity-20" />
      </div>

      <SidebarBranding />
      <SidebarNavigation />
      <SidebarActionGroup />
      
      <SidebarRail className="hover:after:bg-primary/50 transition-colors" />
    </Sidebar>
  );
}
