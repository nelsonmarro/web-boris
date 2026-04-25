'use client';

import * as React from "react";
import { Sidebar, SidebarRail } from "@/components/ui/sidebar";
import { SidebarBranding } from "./sidebar/components/SidebarBranding";
import { SidebarNavigation } from "./sidebar/components/SidebarNavigation";
import { SidebarActionGroup } from "./sidebar/components/SidebarActionGroup";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-white/5 bg-[#001226] shadow-2xl">
      <div className="relative z-10 flex flex-col h-full">
        <SidebarBranding />
        <SidebarNavigation />
        <SidebarActionGroup />
      </div>
      
      <SidebarRail className="hover:after:bg-primary/50 transition-colors" />
    </Sidebar>
  );
}
