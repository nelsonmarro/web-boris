'use client';

import * as React from "react";
import { cn } from "@/utils/cn";
import { NavLogo } from "./navbar/components/NavLogo";
import { NavLinks } from "./navbar/components/NavLinks";
import { NavActions } from "./navbar/components/NavActions";

interface NavbarProps {
  hideLogoOnDesktop?: boolean;
}

export default function Navbar({ hideLogoOnDesktop = false }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
        scrolled ? "py-3" : "py-6",
        hideLogoOnDesktop && "md:px-0 md:py-0 md:relative md:top-auto md:left-auto md:right-auto"
      )}
    >
      <div className={cn(
        "max-w-7xl mx-auto rounded-full transition-all duration-500 flex items-center justify-between px-8 py-3 glass-liquid",
        scrolled ? "bg-black/60 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-white/20" : "bg-black/20 border-white/10",
        hideLogoOnDesktop && "md:bg-transparent md:border-none md:shadow-none md:px-0 md:py-0 md:w-full"
      )}>
        {/* Shine and Reflection layers */}
        {!hideLogoOnDesktop && (
          <>
            <div className="glass-shine opacity-10" />
            <div className="glass-reflection" />
          </>
        )}

        <NavLogo hideLogoOnDesktop={hideLogoOnDesktop} />

        <div className={cn(
          "hidden md:flex items-center gap-2 relative z-10",
          hideLogoOnDesktop && "md:gap-1"
        )}>
          <NavLinks />
          <NavActions />
        </div>
      </div>
    </nav>
  );
}
