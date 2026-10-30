'use client';

import * as React from "react";
import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { WIKI_NAVIGATION } from "@/features/monsters/config/wiki-navigation";
import { RANDOM_ROUTE, REGISTRO_ROUTE } from "@/features/monsters/config/wiki-routes";
import { ESCALA_ROUTE, TAMANOS_ROUTE } from "@/core/search/wiki-routes";
import { SidebarCollapsibleItem } from "./SidebarCollapsibleItem";
import { Home, Globe, MessageSquare, ListChecks, Shuffle, Users, Ruler, Scale, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

const ARCHIVO_ITEM =
  "min-h-11 h-auto py-2 hover:bg-white/5 transition-all group rounded-md mb-0.5 flex items-center px-4 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:mb-1";

/** Enlace de «Tu archivo» con estado activo (marca naranja, `aria-current`), también en el menú plegado a iconos. */
function ArchivoLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: LucideIcon; active: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={label}
        className={cn(ARCHIVO_ITEM, active && "bg-primary/10 text-primary hover:bg-primary/15")}
        render={<Link href={href as Route} aria-label={label} aria-current={active ? "page" : undefined} />}
      >
        <Icon className={cn(
          "h-4 w-4 mr-3 shrink-0 transition-colors group-data-[collapsible=icon]:mr-0 group-data-[collapsible=icon]:size-5",
          active ? "text-primary" : "text-primary/60 group-hover:text-primary"
        )} />
        <span className={cn(
          "font-semibold text-[13.5px] transition-colors group-data-[collapsible=icon]:hidden",
          active ? "text-primary" : "text-white/80 group-hover:text-white"
        )}>
          {label}
        </span>
        {active && <div className="absolute left-0 w-1 h-4 bg-primary rounded-r-full shadow-[0_0_10px_rgba(255,115,0,0.5)] group-data-[collapsible=icon]:hidden" />}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <SidebarContent className="relative z-10 py-4 scrollbar-none group-data-[collapsible=icon]:overflow-y-auto group-data-[collapsible=icon]:overflow-x-hidden group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:[mask-image:linear-gradient(to_bottom,transparent,black_16px,black_calc(100%-16px),transparent)]">
      {/* Global Navigation (Mobile Only) */}
      <SidebarGroup className="mb-6 md:hidden">
        <SidebarGroupLabel className="text-primary font-bold tracking-wider text-[11px] uppercase mb-2 px-6">
          Sitio Principal
        </SidebarGroupLabel>
        <SidebarMenu className="px-2 group-data-[collapsible=icon]:px-0">
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
              tooltip="Comunidad" 
              className="min-h-[36px] h-auto py-2 hover:bg-white/5 transition-all group rounded-md mb-0.5 flex items-center px-4"
              render={<Link href="/comunidad" />}
            >
              <Users className="h-4 w-4 mr-3 text-primary shrink-0" />
              <span className="font-medium text-[13.5px] text-white/80 group-hover:text-white transition-colors">Comunidad</span>
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

      {/* Tu archivo: visible en todos los tamaños, también con el menú plegado a iconos (spec Ola C §5–§6). */}
      <SidebarGroup className="mb-2">
        <SidebarGroupLabel className="text-primary font-bold tracking-wider text-[11px] uppercase mb-2 px-6 group-data-[collapsible=icon]:hidden">
          Tu archivo
        </SidebarGroupLabel>
        <SidebarMenu className="px-2 group-data-[collapsible=icon]:px-0">
          <ArchivoLink href={REGISTRO_ROUTE} label="Registro del archivo" icon={ListChecks} active={pathname === REGISTRO_ROUTE} />
          <SidebarMenuItem>
            {/* /wiki/aleatorio es un route handler que redirige: `prefetch={false}` es obligatorio (una precarga guardaría un único destino). */}
            <SidebarMenuButton
              tooltip="Expediente aleatorio"
              className={ARCHIVO_ITEM}
              render={<Link href={RANDOM_ROUTE as Route} prefetch={false} aria-label="Expediente aleatorio" />}
            >
              <Shuffle className="h-4 w-4 mr-3 shrink-0 text-primary/60 transition-colors group-hover:text-primary group-data-[collapsible=icon]:mr-0 group-data-[collapsible=icon]:size-5" />
              <span className="font-semibold text-[13.5px] text-white/80 transition-colors group-hover:text-white group-data-[collapsible=icon]:hidden">
                Expediente aleatorio
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <ArchivoLink href={ESCALA_ROUTE} label="Escala de tamaños" icon={Ruler} active={pathname === ESCALA_ROUTE} />
          <ArchivoLink href={TAMANOS_ROUTE} label="¿Quién mide más?" icon={Scale} active={pathname === TAMANOS_ROUTE} />
        </SidebarMenu>
      </SidebarGroup>

      {WIKI_NAVIGATION.map((universe) => (
        <SidebarGroup key={universe.title} className="mb-2">
          <SidebarGroupLabel className="text-primary font-bold tracking-wider text-[11px] uppercase mb-2 px-6 group-data-[collapsible=icon]:hidden">
            {universe.title}
          </SidebarGroupLabel>
          <SidebarMenu className="px-2 group-data-[collapsible=icon]:px-0">
            {universe.items.map((item) => (
              <SidebarCollapsibleItem key={item.title} item={item} groupTitle={universe.title} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
