'use client';

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

const NAV_LINKS = [
  { name: "Inicio", href: "/" },
  { name: "Wiki", href: "/wiki" },
  { name: "Universos", href: "/#universos" },
  { name: "Contacto", href: "/#contacto" },
];

export function NavLinks() {
  const pathname = usePathname();
  const [hash, setHash] = React.useState("");

  React.useEffect(() => {
    // Set initial hash
    setHash(window.location.hash);

    // Update hash on change
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    
    // Also listen for scroll to update hash (optional but better for UX)
    const handleScroll = () => {
      const sections = ["universos", "contacto"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 400) {
            if (window.location.hash !== `#${id}`) {
              setHash(`#${id}`);
            }
            break;
          }
        }
      }
      // If at top, clear hash
      if (window.scrollY < 100) setHash("");
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && hash === "";
    if (href === "/wiki") return pathname.startsWith("/wiki");
    if (href.startsWith("/#")) {
      const targetHash = href.substring(1);
      return hash === targetHash;
    }
    return pathname === href;
  };

  return (
    <>
      {NAV_LINKS.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.name}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={link.href as any}
            className={cn(
              "px-5 py-3 rounded-full text-[13px] font-black uppercase tracking-[0.2em] transition-all hover:text-white hover:bg-white/5 min-h-[44px] flex items-center justify-center relative group",
              active ? "text-primary bg-white/5" : "text-white/70"
            )}
          >
            {link.name}
            {active && (
               <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-4 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(255,115,0,0.8)]" />
            )}
          </Link>
        );
      })}
    </>
  );
}
