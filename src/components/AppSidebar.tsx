'use client';

import * as React from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { WIKI_NAVIGATION, NavItem } from "@/features/monsters/config/wiki-navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-border bg-card/50 backdrop-blur-sm">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,115,0,0.4)]">
            <Image src="/assets/logo.png" alt="Logo" width={24} height={24} className="rounded-full" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-bold text-foreground text-base tracking-tight">Borisao Wiki</span>
            <span className="truncate text-xs text-muted-foreground font-medium">Oficial Lore</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {WIKI_NAVIGATION.map((universe) => (
          <SidebarGroup key={universe.title}>
            <SidebarGroupLabel className="text-primary font-bold tracking-widest text-[10px] uppercase group-data-[collapsible=icon]:hidden">
              {universe.title}
            </SidebarGroupLabel>
            <SidebarMenu>
              {universe.items.map((item) => (
                <CollapsibleNav key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
           <SidebarMenuItem>
             <SidebarMenuButton 
                className="group-data-[collapsible=icon]:p-0" 
                render={
                  <Link href="/" className="font-semibold text-muted-foreground hover:text-primary transition-colors">
                     <ChevronRight className="rotate-180 group-data-[collapsible=icon]:rotate-0" />
                     <span className="group-data-[collapsible=icon]:hidden">Volver a Inicio</span>
                  </Link>
                }
             />
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function CollapsibleNav({ item }: { item: NavItem }) {
  if (!item.items || item.items.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip={item.title} 
          className="hover:bg-primary/10 transition-colors group"
          render={<Link href={item.url} className="flex items-center" />}
        >
          {item.icon && <item.icon className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />}
          <span className="font-medium">{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible className="group/collapsible" render={<SidebarMenuItem />}>
      <SidebarMenuButton 
        tooltip={item.title} 
        className="hover:bg-primary/10 transition-colors"
        render={<CollapsibleTrigger />}
      >
        {item.icon && <item.icon className="h-4 w-4 mr-2 text-primary" />}
        <span className="font-semibold">{item.title}</span>
        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
      </SidebarMenuButton>
      <CollapsibleContent>
        <SidebarMenuSub className="border-l border-primary/20 ml-6 pl-2 space-y-1 mt-1">
          {item.items.map((subItem) => (
            <CollapsibleSubNav key={subItem.title} item={subItem} />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

function CollapsibleSubNav({ item }: { item: NavItem }) {
  if (!item.items || item.items.length === 0) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton className="hover:text-primary transition-colors h-8" render={<Link href={item.url} />}>
          <span className="text-sm">{item.title}</span>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <Collapsible className="group/sub-collapsible" render={<SidebarMenuSubItem />}>
      <SidebarMenuSubButton 
        className="hover:text-primary transition-colors h-8"
        render={<CollapsibleTrigger />}
      >
        <span className="text-sm font-medium">{item.title}</span>
        <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-200 group-data-[state=open]/sub-collapsible:rotate-90" />
      </SidebarMenuSubButton>
      <CollapsibleContent>
        <SidebarMenuSub className="border-l border-secondary/30 ml-2 pl-2 space-y-0.5 mt-1">
          {item.items.map((deepItem) => (
            <SidebarMenuSubItem key={deepItem.title}>
              <SidebarMenuSubButton className="hover:text-secondary transition-colors h-7" render={<Link href={deepItem.url} />}>
                <span className="text-[13px] opacity-80">{deepItem.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
