'use client';

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

const NAV_LINKS = [
  { name: "Inicio", href: "/" },
  { name: "Wiki", href: "/wiki" },
  { name: "Universos", href: "/#universos" },
  { name: "Contacto", href: "/#contacto" },
];

export function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeHash, setActiveHash] = React.useState("");

  React.useEffect(() => {
    // Initial check
    setActiveHash(window.location.hash);

    const handleScroll = () => {
      // If we are not on home page, only /wiki can be active (handled by pathname)
      if (pathname !== "/") {
        setActiveHash("");
        return;
      }

      const sections = ["universos", "contacto"];
      let currentSection = "";

      // Check if we are at the very top
      if (window.scrollY < 100) {
        setActiveHash("");
        return;
      }

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If section is in the upper half of the viewport
          if (rect.top <= 200 && rect.bottom >= 200) {
            currentSection = `#${id}`;
            break;
          }
        }
      }

      if (currentSection !== activeHash) {
        setActiveHash(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("hashchange", () => setActiveHash(window.location.hash));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", () => setActiveHash(window.location.hash));
    };
  }, [pathname, activeHash]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      const id = href.split("#")[1];
      
      if (pathname === "/") {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
          const offset = 80; // Navbar height
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = el.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
          
          window.history.pushState(null, "", `#${id}`);
          setActiveHash(`#${id}`);
        }
      }
    }
  };

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/" && activeHash === "";
    if (href === "/wiki") return pathname.startsWith("/wiki");
    if (href.startsWith("/#")) {
      return activeHash === href.substring(1);
    }
    return pathname === href;
  };

  return (
    <>
      {NAV_LINKS.map((link) => {
        const active = isLinkActive(link.href);
        return (
          <Link
            key={link.name}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={link.href as any}
            onClick={(e) => handleLinkClick(e, link.href)}
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
