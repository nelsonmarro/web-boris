'use client';

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { activeSpyHash, type SpySection } from "../lib/scroll-spy";

const NAV_LINKS = [
  { name: "Inicio", href: "/" },
  { name: "Wiki", href: "/wiki" },
  { name: "Universos", href: "/#universos" },
  { name: "Comunidad", href: "/comunidad" },
  { name: "Contacto", href: "/#contacto" },
];

/** Anclas de la portada que tienen enlace en la navbar, y la línea de lectura (px bajo el borde superior). */
const SPY_IDS = ["universos", "contacto"] as const;
const SPY_LINE = 200;

interface NavLinksProps {
  /** Se llama tras pulsar cualquier enlace (el menú móvil lo usa para cerrar el panel). */
  onNavigate?: () => void;
  /** Ningún enlace aparece activo (la 404: el servidor no conoce la URL pedida). */
  noActive?: boolean;
}

export function NavLinks({ onNavigate, noActive = false }: NavLinksProps = {}) {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = React.useState("");

  // Solo depende de la ruta: si dependiera de activeHash, cada cambio de sección
  // relanzaría el efecto y restauraría el hash viejo (A1-5) y acumularía listeners (A6-10).
  React.useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash);
    syncHash();

    const handleScroll = () => {
      // Fuera de la portada solo la ruta decide qué enlace está activo.
      if (pathname !== "/") return;

      // Arriba del todo: «Inicio».
      if (window.scrollY < 100) {
        setActiveHash((prev) => (prev === "" ? prev : ""));
        return;
      }

      // La sección que cruza la línea de lectura (UX fase 1 §A.6). Sobre Vídeos o Personajes, que no tienen enlace,
      // queda «Inicio» (la página en la que se está); antes «Universos» seguía activo hasta llegar a «Contacto».
      // «Contacto» abarca toda la sección «Sobre Boris», de la que es la columna derecha en escritorio.
      const sections: SpySection[] = [];
      for (const id of SPY_IDS) {
        const anchor = document.getElementById(id);
        const box = (id === "contacto" ? anchor?.closest("section") : anchor) ?? anchor;
        if (!box) continue;
        const { top, bottom } = box.getBoundingClientRect();
        sections.push({ hash: `#${id}`, top, bottom });
      }
      const currentSection = activeSpyHash(sections, SPY_LINE);
      setActiveHash((prev) => (prev === currentSection ? prev : currentSection));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("hashchange", syncHash);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", syncHash);
    };
  }, [pathname]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // El scroll programático de abajo cancela la navegación que desmontaba el panel,
    // así que el cierre del menú móvil se avisa siempre aquí (A1-2).
    onNavigate?.();
    if (href === "/" && pathname === "/") setActiveHash("");
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
    if (noActive) return false;
    if (href === "/") return pathname === "/" && activeHash === "";
    if (href === "/wiki") return pathname.startsWith("/wiki");
    if (href.startsWith("/#")) {
      return pathname === "/" && activeHash === href.substring(1);
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
              "px-5 py-3 rounded-full text-[13px] font-bold uppercase tracking-wider transition-all hover:text-white hover:bg-white/5 min-h-[44px] flex items-center justify-center relative group",
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
