'use client';

import * as React from "react";
import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { WIKI_NAVIGATION } from "@/features/monsters/config/wiki-navigation";
import { SidebarCollapsibleItem } from "./SidebarCollapsibleItem";
import { Home, Globe, MessageSquare } from "lucide-react";
import Link from "next/link";

export function SidebarNavigation() {
  return (
    <SidebarContent className="relative z-10 py-4 scrollbar-none">
      {/* Global Navigation (Mobile Only) */}
      <SidebarGroup className="mb-6 md:hidden">
        <SidebarGroupLabel className="text-primary font-bold tracking-wider text-[10px] uppercase mb-2 px-6">
          Sitio Principal
        </SidebarGroupLabel>
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Inicio" 
              className="min-h-[36px] h-auto py-2 hover:bg-white/5 transition-all group rounded-md mb-0.5 flex items-center px-4"
              render={<Link href="/" />}
            >
              <Home className="h-4 w-4 mr-3 text-primary shrink-0" />
              <span className="font-medium text-[13.5px] text-white/80 group-hover:text-white transition-colors">Inicio</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Universos" 
              className="min-h-[36px] h-auto py-2 hover:bg-white/5 transition-all group rounded-md mb-0.5 flex items-center px-4"
              render={<Link href="/#universos" />}
            >
              <Globe className="h-4 w-4 mr-3 text-primary shrink-0" />
              <span className="font-medium text-[13.5px] text-white/80 group-hover:text-white transition-colors">Universos</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Contacto" 
              className="min-h-[36px] h-auto py-2 hover:bg-white/5 transition-all group rounded-md mb-0.5 flex items-center px-4"
              render={<Link href="/#contacto" />}
            >
              <MessageSquare className="h-4 w-4 mr-3 text-primary shrink-0" />
              <span className="font-medium text-[13.5px] text-white/80 group-hover:text-white transition-colors">Contacto</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {WIKI_NAVIGATION.map((universe) => (
        <SidebarGroup key={universe.title} className="mb-2">
          <SidebarGroupLabel className="text-primary font-bold tracking-wider text-[10px] uppercase mb-2 px-6 group-data-[collapsible=icon]:hidden">
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
