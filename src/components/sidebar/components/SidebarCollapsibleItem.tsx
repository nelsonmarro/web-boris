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
          className="min-h-[36px] h-auto py-2 hover:bg-white/5 transition-all group rounded-md mb-0.5 flex items-center px-4"
          render={<Link href={item.url as React.ComponentProps<typeof Link>['href']} aria-label={`Ir a ${item.title}`} />}
        >
          {item.icon && <item.icon className="h-4 w-4 mr-3 text-primary shrink-0" />}
          <span className="font-medium text-[13.5px] text-white/80 group-hover:text-white transition-colors">{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible render={<SidebarMenuItem />} className="group/collapsible mb-0.5">
      <CollapsibleTrigger render={
        <SidebarMenuButton 
          className="min-h-[36px] h-auto py-2 hover:bg-white/5 transition-all rounded-md px-4 flex items-center group mb-0"
        />
      }>
        {item.icon && <item.icon className="h-4 w-4 mr-3 text-primary shrink-0" />}
        <span className="font-medium text-[13.5px] text-white/80 group-hover:text-white">{item.title}</span>
        <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-300 text-white/20 group-data-[state=open]/collapsible:rotate-90 group-data-[state=open]/collapsible:text-primary shrink-0" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub className="ml-0 pl-0 border-none translate-x-0 space-y-0.5 mt-0.5 mb-1">
          {item.items.map((subItem) => (
            <SidebarSubItem key={subItem.title} item={subItem} />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SidebarSubItem({ item }: { item: NavItem }) {
  if (!item.items || item.items.length === 0) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton 
          className="hover:text-primary transition-all min-h-[32px] h-auto py-1.5 rounded-md pl-11 flex items-center bg-transparent border-none translate-x-0" 
          render={<Link href={item.url as React.ComponentProps<typeof Link>['href']} />}
        >
          <span className="text-[13px] font-medium text-white/60 group-hover/sub:text-primary transition-colors">{item.title}</span>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <Collapsible render={<SidebarMenuSubItem />} className="group/sub-collapsible">
      <CollapsibleTrigger render={
        <SidebarMenuSubButton 
          className="hover:text-primary transition-all min-h-[32px] h-auto py-1.5 rounded-md pl-11 flex items-center bg-transparent border-none translate-x-0"
          render={<button type="button" />}
        />
      }>
        <span className="text-[13px] font-medium text-white/70 group-hover:text-white">{item.title}</span>
        <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-300 text-white/10 group-data-[state=open]/sub-collapsible:rotate-90 shrink-0" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub className="ml-0 pl-0 border-none translate-x-0 space-y-0.5 mt-0.5 mb-0.5">
          {item.items.map((deepItem) => (
            <SidebarMenuSubItem key={deepItem.title}>
              <SidebarMenuSubButton 
                className="hover:text-primary transition-all min-h-[28px] h-auto py-1 rounded-sm pl-16 flex items-center bg-transparent border-none translate-x-0" 
                render={<Link href={deepItem.url as React.ComponentProps<typeof Link>['href']} />}
              >
                <span className="text-[12px] font-medium text-white/40 group-hover/deep:text-primary transition-colors">{deepItem.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
