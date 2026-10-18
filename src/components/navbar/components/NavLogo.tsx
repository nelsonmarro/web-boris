'use client';

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/cn";

interface NavLogoProps {
  hideLogoOnDesktop?: boolean;
  size?: 'md' | 'sm';
}

export function NavLogo({ hideLogoOnDesktop, size = 'md' }: NavLogoProps) {
  const compact = size === 'sm';
  const logoPx = compact ? 36 : 44;

  return (
    <Link 
      href="/" 
      className={cn(
        "flex items-center gap-3 group relative z-10",
        hideLogoOnDesktop && "md:hidden"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-white/20 bg-white/5 p-1 transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(255,115,0,0.2)] glass-liquid",
          compact ? "h-9 w-9" : "h-11 w-11"
        )}
      >
        <Image
          src="/assets/Branding/logo.webp"
          alt=""
          width={logoPx}
          height={logoPx}
          className="rounded-lg object-cover"
        />
      </div>
      <span
        className={cn(
          "font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] uppercase italic",
          compact ? "text-lg" : "text-2xl"
        )}
      >
        Borisao<span className="text-primary">Blois</span>
      </span>
    </Link>
  );
}
