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
          className="h-8 hover:bg-white/5 transition-all group rounded-md mb-0 flex items-center px-4"
          asChild
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={item.url as any} aria-label={`Ir a ${item.title}`}>
            {item.icon && <item.icon className="h-4 w-4 mr-3 text-primary shrink-0" />}
            <span className="font-medium text-[13.5px] text-white/80 group-hover:text-white transition-colors">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible className="group/collapsible" asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton 
            tooltip={item.title} 
            className="h-8 hover:bg-white/5 transition-all rounded-md px-4 flex items-center group mb-0"
          >
            {item.icon && <item.icon className="h-4 w-4 mr-3 text-primary shrink-0" />}
            <span className="font-medium text-[13.5px] text-white/80 group-hover:text-white">{item.title}</span>
            <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-300 text-white/20 group-data-[state=open]/collapsible:rotate-90 group-data-[state=open]/collapsible:text-primary" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="ml-0 pl-0 border-none translate-x-0 space-y-0">
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
          className="hover:text-primary transition-all h-8 rounded-md pl-11 flex items-center bg-transparent border-none translate-x-0" 
          asChild
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={item.url as any}>
            <span className="text-[13px] font-medium text-white/60 group-hover/sub:text-primary transition-colors">{item.title}</span>
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
            className="hover:text-primary transition-all h-8 rounded-md pl-11 flex items-center bg-transparent border-none translate-x-0"
          >
            <span className="text-[13px] font-medium text-white/70 group-hover:text-white">{item.title}</span>
            <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-300 text-white/10 group-data-[state=open]/sub-collapsible:rotate-90" />
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="ml-0 pl-0 border-none translate-x-0 space-y-0">
            {item.items.map((deepItem) => (
              <SidebarMenuSubItem key={deepItem.title}>
                <SidebarMenuSubButton 
                  className="hover:text-primary transition-all h-7 rounded-sm pl-16 flex items-center bg-transparent border-none translate-x-0" 
                  asChild
                >
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Link href={deepItem.url as any}>
                    <span className="text-[12px] font-medium text-white/40 group-hover/deep:text-primary transition-colors">{deepItem.title}</span>
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
