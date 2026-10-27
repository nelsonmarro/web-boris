import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NavLogo } from '@/components/navbar/components/NavLogo';
import { NavLinks } from '@/components/navbar/components/NavLinks';
import { NavActions } from '@/components/navbar/components/NavActions';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { SearchTrigger } from '@/components/search/SearchTrigger';

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0a2339] relative z-0">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0 bg-transparent overflow-x-clip">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 bg-[#061a2e] border-b border-white/5 px-4 sm:px-6 shadow-sm">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 h-11 min-w-11 text-primary hover:bg-primary/10 transition-all hover:scale-110 active:scale-95" />
              {/* Oculto en escritorio con el menú expandido (ya muestra la marca). */}
              <div className="md:group-has-[[data-slot=sidebar][data-state=expanded]]/sidebar-wrapper:hidden">
                <NavLogo size="sm" />
              </div>
            </div>

            <div className="h-6 w-[1px] bg-white/10 mx-6 hidden 2xl:block" />

            <div className="flex-1 flex items-center justify-end 2xl:justify-start">
              {/* De md a xl no hay NavLinks (2xl) ni «Sitio Principal» (solo móvil): Comunidad sale aquí. */}
              <Link
                href="/comunidad"
                className="hidden md:flex 2xl:hidden min-h-11 items-center rounded-full px-4 text-[13px] font-bold uppercase tracking-wider text-white/70 transition-all hover:bg-white/5 hover:text-white outline-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                Comunidad
              </Link>
              <div className="hidden 2xl:flex items-center gap-1">
                <NavLinks />
              </div>
              <div className="hidden lg:flex items-center">
                <NavActions />
              </div>
            </div>

          <div className="flex items-center gap-4 pl-2 lg:ml-4 lg:border-l lg:border-white/10 lg:pl-6">
            <SearchTrigger variant="pill" className="hidden md:inline-flex" />
            <SearchTrigger variant="icon" className="md:hidden" />
          </div>
        </header>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">{children}</div>
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
