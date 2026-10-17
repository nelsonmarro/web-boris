import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NavLogo } from '@/components/navbar/components/NavLogo';
import { NavLinks } from '@/components/navbar/components/NavLinks';
import { NavActions } from '@/components/navbar/components/NavActions';
import Footer from '@/components/Footer';
import BubbleTrail from '@/components/ui/bubble-trail';
import { WikiCommandPalette } from '@/features/monsters/components/wiki/WikiCommandPalette';

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <BubbleTrail />
      <div className="flex min-h-screen w-full bg-[#0a2339] relative z-0">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0 bg-transparent overflow-x-clip">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 bg-[#061a2e] border-b border-white/5 px-6 shadow-sm">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 text-primary hover:bg-primary/10 transition-all hover:scale-110 active:scale-95" />
              <NavLogo size="sm" />
            </div>

            <div className="h-6 w-[1px] bg-white/10 mx-6 hidden 2xl:block" />

            <div className="flex-1 flex items-center justify-end 2xl:justify-start">
              <div className="hidden 2xl:flex items-center gap-1">
                <NavLinks />
              </div>
              <div className="hidden lg:flex items-center">
                <NavActions />
              </div>
            </div>

          <div className="flex items-center gap-4 pl-4 lg:ml-4 lg:border-l lg:border-white/10 lg:pl-6">
            <WikiCommandPalette />
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
