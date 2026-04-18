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
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
            <SidebarTrigger className="-ml-1 text-primary hover:bg-primary/10" />
            <div className="h-4 w-[1px] bg-border mx-2 hidden md:block" />
            <Navbar hideLogoOnDesktop />
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
            <Footer />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
