'use client';

import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SidebarFooter as BaseFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

export function SidebarActionGroup() {
  return (
    <BaseFooter className="relative z-10 border-t border-white/5 p-4 group-data-[collapsible=icon]:p-3">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Volver al inicio"
            className="group h-10 rounded-lg text-white/60 transition-all hover:bg-white/5 hover:text-white group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:p-0!"
            render={<Link href="/" aria-label="Volver al inicio" className="flex w-full items-center gap-3 px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center" />}
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:-translate-x-0.5 group-data-[collapsible=icon]:size-5" />
            <span className="text-[13px] font-medium group-data-[collapsible=icon]:hidden">Volver al inicio</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </BaseFooter>
  );
}
