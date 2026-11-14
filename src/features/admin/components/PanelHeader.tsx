'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SECTIONS: readonly { href: Route; label: string }[] = [
  { href: '/admin/fichas', label: 'Fichas' },
  { href: '/admin/imagenes', label: 'Imágenes' },
  { href: '/admin/contenido', label: 'Contenido' },
  { href: '/admin/ayuda', label: 'Ayuda' },
];

const LINK = 'inline-flex min-h-11 items-center rounded-lg px-2 text-white/80 underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[current=page]:text-white aria-[current=page]:underline aria-[current=page]:decoration-primary aria-[current=page]:decoration-2';

/**
 * Cabecera del panel. En escritorio, secciones y cuenta en una fila; en el móvil (auditoría #23), una sola fila con
 * «Menú», que despliega lo mismo y se cierra al cambiar de página.
 */
export function PanelHeader({ account, logout }: { account: string; logout: (formData: FormData) => Promise<void> }) {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);
  const current = (href: string) => (pathname === href || pathname.startsWith(`${href}/`) ? ('page' as const) : undefined);

  const nav = (className: string) => (
    <nav aria-label="Secciones del panel" className={className}>
      {SECTIONS.map((section) => (
        <Link key={section.href} href={section.href} aria-current={current(section.href)} className={LINK}>
          {section.label}
        </Link>
      ))}
    </nav>
  );
  const accountActions = (
    <>
      <span className="text-sm text-white/70">{account}</span>
      <Button asChild variant="outline" size="sm">
        <Link href="/" target="_blank" rel="noopener noreferrer">
          Ver la web<span className="sr-only"> (se abre en una pestaña nueva)</span>
        </Link>
      </Button>
      <form action={logout}>
        <Button type="submit" variant="ghost" size="sm">
          Cerrar sesión
        </Button>
      </form>
    </>
  );

  return (
    <header className="relative border-b border-white/10 bg-[#061a2e]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 md:py-3">
        <Link href="/admin" className="inline-flex min-h-11 items-center text-lg font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          Panel de la wiki
        </Link>
        {nav('hidden flex-wrap gap-2 text-sm font-semibold md:flex')}
        <div className="hidden flex-wrap items-center gap-3 md:flex">{accountActions}</div>
        <details ref={menu} className="group md:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg border border-white/20 px-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden="true" className="size-4" />
            Menú
          </summary>
          <div className="absolute inset-x-0 z-40 mt-2 space-y-3 border-b border-white/10 bg-[#061a2e] px-4 pb-4 pt-2 shadow-lg shadow-black/40">
            {nav('grid grid-cols-2 gap-1 text-base font-semibold')}
            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">{accountActions}</div>
          </div>
        </details>
      </div>
    </header>
  );
}
