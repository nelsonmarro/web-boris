import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-transparent">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0 bg-transparent overflow-hidden">
          <header className="sticky top-6 z-40 flex h-20 shrink-0 items-center gap-2 mx-6 rounded-full glass-liquid border-refractive px-6 shadow-2xl">
            <SidebarTrigger className="-ml-1 text-primary hover:bg-primary/10 transition-all hover:scale-110 active:scale-95" />
            <div className="h-6 w-[1px] bg-white/10 mx-4 hidden md:block" />
            <Navbar hideLogoOnDesktop />
          </header>
          <main className="flex-1">
            {children}
            <Footer />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
