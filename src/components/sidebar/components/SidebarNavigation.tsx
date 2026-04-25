'use client';

import * as React from "react";
import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { WIKI_NAVIGATION } from "@/features/monsters/config/wiki-navigation";
import { SidebarCollapsibleItem } from "./SidebarCollapsibleItem";

export function SidebarNavigation() {
  return (
    <SidebarContent className="relative z-10 py-4 scrollbar-none">
      {WIKI_NAVIGATION.map((universe) => (
        <SidebarGroup key={universe.title} className="mb-4">
          <SidebarGroupLabel className="text-primary font-black tracking-[0.2em] text-[10px] uppercase mb-2 px-6 group-data-[collapsible=icon]:hidden">
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
