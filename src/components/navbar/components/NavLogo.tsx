'use client';

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/cn";

interface NavLogoProps {
  hideLogoOnDesktop?: boolean;
}

export function NavLogo({ hideLogoOnDesktop }: NavLogoProps) {
  return (
    <Link 
      href="/" 
      className={cn(
        "flex items-center gap-3 group relative z-10",
        hideLogoOnDesktop && "md:hidden"
      )}
    >
      <div className="relative w-11 h-11 overflow-hidden rounded-xl border border-white/20 bg-white/5 p-1 transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(255,115,0,0.2)] glass-liquid">
        <Image
          src="/assets/logo.png"
          alt="BorisaoBlois Logo"
          width={44}
          height={44}
          className="rounded-lg object-cover"
        />
      </div>
      <span className="text-2xl font-black tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] uppercase italic">
        Borisao<span className="text-primary">Blois</span>
      </span>
    </Link>
  );
}
