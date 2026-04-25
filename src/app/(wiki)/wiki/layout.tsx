import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NavLinks } from "@/components/navbar/components/NavLinks";
import { NavActions } from "@/components/navbar/components/NavActions";
import Footer from "@/components/Footer";

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#154c79] relative z-0">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0 bg-transparent overflow-hidden">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 bg-[#0f3b5e] border-b border-white/5 px-6 shadow-sm">
            <div className="flex items-center gap-2">
               <SidebarTrigger className="-ml-1 text-primary hover:bg-primary/10 transition-all hover:scale-110 active:scale-95" />
               <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-white/30 leading-none">Terminal</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary italic leading-tight">Acceso Lore</span>
               </div>
            </div>
            
            <div className="h-6 w-[1px] bg-white/10 mx-6 hidden md:block" />
            
            <div className="flex-1 flex justify-end md:justify-start">
              <div className="hidden md:flex items-center gap-1">
                <NavLinks />
                <NavActions />
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4 px-6 border-l border-white/10 ml-4">
               <div className="flex flex-col text-right">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-white/20">Status</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-green-500/80 animate-pulse">Encriptado</span>
               </div>
               <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
               </div>
            </div>
          </header>
          <main className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              {children}
            </div>
            <Footer />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
