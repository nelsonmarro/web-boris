'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, useSidebar } from '@/components/ui/sidebar';
import { SidebarBranding } from './sidebar/components/SidebarBranding';
import { SidebarNavigation } from './sidebar/components/SidebarNavigation';
import { SidebarActionGroup } from './sidebar/components/SidebarActionGroup';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  // En móvil el menú es una hoja: se cierra al llegar a la página nueva.
  React.useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  // Y también al pulsar un enlace que no cambia la ruta (la página actual o un ancla).
  const closeOnLink = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a')) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-white/5 bg-[#061a2e] shadow-2xl">
      {/* `nav` es el landmark del menú: sin él axe marca `region` en todo su contenido. */}
      <nav
        aria-label="Menú de la wiki"
        onClick={closeOnLink}
        className="relative z-10 flex h-full flex-col"
      >
        <SidebarBranding />
        <SidebarNavigation />
        <SidebarActionGroup />
      </nav>
    </Sidebar>
  );
}
