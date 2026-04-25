'use client';

import * as React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarMenuSub, 
  SidebarMenuSubButton, 
  SidebarMenuSubItem 
} from "@/components/ui/sidebar";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { NavItem } from "@/features/monsters/config/wiki-navigation";

export function SidebarCollapsibleItem({ item }: { item: NavItem }) {
  if (!item.items || item.items.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip={item.title} 
          className="h-10 hover:bg-primary/10 transition-all group rounded-lg mb-0.5 flex items-center px-4"
          asChild
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={item.url as any} aria-label={`Ir a ${item.title}`}>
            {item.icon && <item.icon className="h-4 w-4 mr-3 text-primary group-hover:scale-110 transition-transform duration-300" />}
            <span className="font-bold text-[11px] tracking-widest uppercase text-white/70 group-hover:text-white transition-all">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible className="group/collapsible mb-0.5" asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton 
            tooltip={item.title} 
            className="h-10 hover:bg-white/5 transition-all rounded-lg px-4 flex items-center"
          >
            {item.icon && <item.icon className="h-4 w-4 mr-3 text-primary" />}
            <span className="font-bold text-[11px] tracking-widest uppercase text-white/80">{item.title}</span>
            <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-300 text-white/20 group-data-[state=open]/collapsible:rotate-90 group-data-[state=open]/collapsible:text-primary" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="border-l border-white/10 ml-6 pl-4 space-y-0.5 mt-1 mb-2">
            {item.items.map((subItem) => (
              <SidebarSubItem key={subItem.title} item={subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SidebarSubItem({ item }: { item: NavItem }) {
  if (!item.items || item.items.length === 0) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton 
          className="hover:text-primary transition-all h-9 rounded-md px-3 group/sub flex items-center" 
          asChild
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={item.url as any}>
            <span className="text-[11px] font-medium text-white/60 uppercase tracking-widest group-hover/sub:text-primary group-hover/sub:translate-x-1 transition-all">{item.title}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <Collapsible className="group/sub-collapsible" asChild>
      <SidebarMenuSubItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuSubButton 
            className="hover:text-primary transition-all h-9 rounded-md px-3 flex items-center"
          >
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">{item.title}</span>
            <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-300 text-white/10 group-data-[state=open]/sub-collapsible:rotate-90" />
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="border-l border-white/5 ml-3 pl-3 space-y-0.5 mt-1">
            {item.items.map((deepItem) => (
              <SidebarMenuSubItem key={deepItem.title}>
                <SidebarMenuSubButton 
                  className="hover:text-primary transition-all h-8 rounded-sm px-2 group/deep flex items-center" 
                  asChild
                >
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Link href={deepItem.url as any}>
                    <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest group-hover/deep:text-primary transition-colors">{deepItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  );
}
