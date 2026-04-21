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

  return (
    <>
      {NAV_LINKS.map((link) => (
        <Link
          key={link.name}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          href={link.href as any}
          className={cn(
            "px-5 py-3 rounded-full text-[13px] font-black uppercase tracking-[0.2em] transition-all hover:text-white hover:bg-white/5 min-h-[44px] flex items-center justify-center relative group",
            pathname === link.href ? "text-primary bg-white/5" : "text-white/70"
          )}
        >
          {link.name}
          {pathname === link.href && (
             <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-4 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(255,115,0,0.8)]" />
          )}
        </Link>
      ))}
    </>
  );
}
