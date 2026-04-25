'use client';

import * as React from "react";
import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { WIKI_NAVIGATION } from "@/features/monsters/config/wiki-navigation";
import { SidebarCollapsibleItem } from "./SidebarCollapsibleItem";

export function SidebarNavigation() {
  return (
    <SidebarContent className="relative z-10 py-8 scrollbar-none">
      <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      
      {WIKI_NAVIGATION.map((universe) => (
        <SidebarGroup key={universe.title} className="mb-8">
          <SidebarGroupLabel className="text-white/30 font-black tracking-[0.4em] text-[8px] uppercase mb-5 px-8 group-data-[collapsible=icon]:hidden italic">
            {universe.title}
          </SidebarGroupLabel>
          <SidebarMenu className="px-4">
            {universe.items.map((item) => (
              <SidebarCollapsibleItem key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </SidebarContent>
  );
}
