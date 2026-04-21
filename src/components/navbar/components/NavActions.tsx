'use client';

import * as React from "react";
import Link from "next/link";

export function NavActions() {
  return (
    <Link 
      href="/wiki/arena" 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      className="ml-4 px-8 py-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-full text-[13px] font-black uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] glass-liquid min-h-[44px] flex items-center justify-center"
    >
      Versus
    </Link>
  );
}
