import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavbarProps {
  hideLogoOnDesktop?: boolean;
}

export default function Navbar({ hideLogoOnDesktop }: NavbarProps) {
  return (
    <nav className={cn(
      "w-full z-50 transition-all",
      !hideLogoOnDesktop && "fixed bg-background/80 backdrop-blur-md border-b border-border"
    )}>
      <div className={cn(
        "container mx-auto px-4 h-16 flex items-center justify-between",
        hideLogoOnDesktop && "px-0 w-full"
      )}>
        <Link href="/" className={cn(
          "flex items-center gap-2 transition-transform hover:scale-105",
          hideLogoOnDesktop && "md:hidden"
        )}>
          <Image src="/assets/logo.png" alt="BorisaoBlois Logo" width={40} height={40} className="rounded-full" />
          <span className="text-xl font-bold text-foreground">BorisaoBlois</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 ml-auto">
          <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Inicio</Link>
          <Link href="/wiki" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Wiki</Link>
          <Link href="/#universos" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Universos</Link>
          <Link href="/#contacto" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Contacto</Link>
        </div>
      </div>
    </nav>
  );
}
