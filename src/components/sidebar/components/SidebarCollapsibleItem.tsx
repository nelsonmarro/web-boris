'use client';

import * as React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { cn } from "@/utils/cn";

export function SidebarCollapsibleItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.url;
  
  // Check if any child is active to auto-expand (optional, but good UX)
  const isChildActive = item.items?.some(sub => 
    pathname === sub.url || sub.items?.some(deep => pathname === deep.url)
  );

  if (!item.items || item.items.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip={item.title} 
          className={cn(
            "min-h-[36px] h-auto py-2 hover:bg-white/5 transition-all group rounded-md mb-0.5 flex items-center px-4",
            isActive && "bg-primary/10 text-primary hover:bg-primary/15"
          )}
          render={<Link href={item.url as React.ComponentProps<typeof Link>['href']} aria-label={`Ir a ${item.title}`} />}
        >
          {item.icon && (
            <item.icon className={cn(
              "h-4 w-4 mr-3 shrink-0 transition-colors",
              isActive ? "text-primary" : "text-primary/60 group-hover:text-primary"
            )} />
          )}
          <span className={cn(
            "font-semibold text-[13.5px] transition-colors",
            isActive ? "text-primary" : "text-white/80 group-hover:text-white"
          )}>
            {item.title}
          </span>
          {isActive && <div className="absolute left-0 w-1 h-4 bg-primary rounded-r-full shadow-[0_0_10px_rgba(255,115,0,0.5)]" />}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible 
      defaultOpen={isChildActive}
      render={<SidebarMenuItem />} 
      className="group/collapsible mb-0.5"
    >
      <CollapsibleTrigger render={
        <SidebarMenuButton 
          tooltip={item.title}
          className="min-h-[36px] h-auto py-2 hover:bg-white/5 transition-all rounded-md px-4 flex items-center group mb-0"
        />
      }>
        {item.icon && <item.icon className="h-4 w-4 mr-3 text-primary/60 group-hover:text-primary shrink-0 transition-colors" />}
        <span className="font-semibold text-[13.5px] text-white/80 group-hover:text-white transition-colors">{item.title}</span>
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
  const pathname = usePathname();
  const isActive = pathname === item.url;
  const isDeepChildActive = item.items?.some(deep => pathname === deep.url);

  if (!item.items || item.items.length === 0) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton 
          className={cn(
            "hover:text-primary transition-all min-h-[32px] h-auto py-1.5 rounded-md pl-11 flex items-center bg-transparent border-none translate-x-0 relative group/sub",
            isActive && "bg-primary/5 text-primary"
          )} 
          render={<Link href={item.url as React.ComponentProps<typeof Link>['href']} />}
        >
          <span className={cn(
            "text-[13px] font-semibold transition-colors",
            isActive ? "text-primary" : "text-white/60 group-hover/sub:text-white"
          )}>
            {item.title}
          </span>
          {isActive && <div className="absolute left-4 w-1 h-3 bg-primary/60 rounded-full" />}
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <Collapsible 
      defaultOpen={isDeepChildActive}
      render={<SidebarMenuSubItem />} 
      className="group/sub-collapsible"
    >
      <CollapsibleTrigger render={
        <SidebarMenuSubButton 
          className="hover:text-primary transition-all min-h-[32px] h-auto py-1.5 rounded-md pl-11 flex items-center bg-transparent border-none translate-x-0"
          render={<button type="button" />}
        />
      }>
        <span className="text-[13px] font-semibold text-white/70 group-hover:text-white transition-colors">{item.title}</span>
        <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-300 text-white/10 group-data-[state=open]/sub-collapsible:rotate-90 shrink-0" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub className="ml-0 pl-0 border-none translate-x-0 space-y-0.5 mt-0.5 mb-0.5">
          {item.items.map((deepItem) => {
            const isDeepActive = pathname === deepItem.url;
            return (
              <SidebarMenuSubItem key={deepItem.title}>
                <SidebarMenuSubButton 
                  className={cn(
                    "hover:text-primary transition-all min-h-[28px] h-auto py-1 rounded-sm pl-16 flex items-center bg-transparent border-none translate-x-0 relative group/deep",
                    isDeepActive && "bg-primary/5 text-primary"
                  )} 
                  render={<Link href={deepItem.url as React.ComponentProps<typeof Link>['href']} />}
                >
                  <span className={cn(
                    "text-[13px] font-semibold transition-colors",
                    isDeepActive ? "text-primary" : "text-white/70 group-hover/deep:text-white"
                  )}>
                    {deepItem.title}
                  </span>
                  {isDeepActive && <div className="absolute left-10 w-1 h-2 bg-primary/40 rounded-full" />}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
