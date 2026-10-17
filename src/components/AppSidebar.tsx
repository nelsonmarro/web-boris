'use client';

import * as React from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { SidebarBranding } from './sidebar/components/SidebarBranding';
import { SidebarNavigation } from './sidebar/components/SidebarNavigation';
import { SidebarActionGroup } from './sidebar/components/SidebarActionGroup';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-white/5 bg-[#061a2e] shadow-2xl">
      <div className="relative z-10 flex h-full flex-col">
        <SidebarBranding />
        <SidebarNavigation />
        <SidebarActionGroup />
      </div>
    </Sidebar>
  );
}
