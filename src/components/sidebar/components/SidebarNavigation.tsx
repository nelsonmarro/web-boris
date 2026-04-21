'use client';

import * as React from "react";
import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { WIKI_NAVIGATION } from "@/features/monsters/config/wiki-navigation";
import { SidebarCollapsibleItem } from "./SidebarCollapsibleItem";

export function SidebarNavigation() {
  return (
    <SidebarContent className="relative z-10 py-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {WIKI_NAVIGATION.map((universe) => (
        <SidebarGroup key={universe.title} className="mb-6">
          <SidebarGroupLabel className="text-white/40 font-black tracking-[0.3em] text-[9px] uppercase mb-4 px-6 group-data-[collapsible=icon]:hidden">
            {universe.title}
          </SidebarGroupLabel>
          <SidebarMenu className="px-2">
            {universe.items.map((item) => (
              <SidebarCollapsibleItem key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
