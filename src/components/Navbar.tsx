'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { NavLogo } from './navbar/components/NavLogo';
import { NavLinks } from './navbar/components/NavLinks';
import { NavActions } from './navbar/components/NavActions';
import { SearchTrigger } from './search/SearchTrigger';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NavbarProps {
  hideLogoOnDesktop?: boolean;
  /** Sin enlace activo: la 404 se prerrenderiza como `/_not-found` pero el cliente ve la URL real (#418). */
  noActive?: boolean;
}

export default function Navbar({ hideLogoOnDesktop = false, noActive = false }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  // Sheet controlado: los enlaces de ancla no desmontan el panel, hay que cerrarlo a mano.
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'p-0' : 'px-3 py-4 sm:px-6 sm:py-6',
        hideLogoOnDesktop &&
          'md:px-0 md:py-0 md:relative md:top-auto md:left-auto md:right-auto',
      )}
    >
      {/* Con scroll, barra sólida (`#00122E` al 95 %) y sin `backdrop-filter`: el cristal se aclaraba sobre imágenes
          claras (el boceto de El Gran Majá) y un desenfoque de 120 px a todo el ancho costaba frames en Firefox
          (UX fase 1 §A.6). El cristal (`glass-liquid`) queda para la píldora de arriba del todo. */}
      <div
        className={cn(
          'transition-all duration-700 flex items-center justify-between',
          scrolled
            ? 'w-full max-w-full rounded-none px-4 sm:px-6 md:px-12 py-4 sm:py-5 bg-[#00122E]/95 border-b border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
            : 'glass-liquid max-w-7xl mx-auto rounded-full px-3 sm:px-6 md:px-8 py-3 bg-black/10 border-white/10 border-refractive shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
          hideLogoOnDesktop &&
            'md:bg-transparent md:border-none md:shadow-none md:px-0 md:py-0 md:w-full',
        )}
      >
        {/* Shine and Reflection layers */}
        {!hideLogoOnDesktop && !scrolled && (
          <>
            <div className="glass-shine opacity-10" />
            <div className="glass-reflection" />
          </>
        )}

        <NavLogo hideLogoOnDesktop={hideLogoOnDesktop} />

        {/* Desktop Links */}
        <div
          className={cn(
            'hidden xl:flex items-center gap-2 relative z-10',
            hideLogoOnDesktop && 'md:gap-1',
          )}
        >
          <NavLinks noActive={noActive} />
          <NavActions />
          {/* Búsqueda global: la barra completa solo cabe desde xl (por debajo, menú + lupa). */}
          <SearchTrigger variant="pill" className="ml-2" />
        </div>

        {/* Mobile Menu */}
        <div className="xl:hidden flex shrink-0 items-center gap-1 sm:gap-2 relative z-10">
          <SearchTrigger variant="icon" />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <button aria-label="Abrir menú de navegación" className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  <Menu className="w-5 h-5" aria-hidden />
                </button>
              }
            />
            <SheetContent
              side="right"
              className="bg-[#001226] border-l border-white/10 p-0 w-[80%] max-w-[300px]"
              // Cualquier enlace del panel (logo, enlaces, Versus) lo cierra.
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('a')) setMenuOpen(false);
              }}
            >
              <SheetHeader className="p-8 border-b border-white/5">
                <SheetTitle className="text-left">
                  <NavLogo />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-6 space-y-2">
                <NavLinks noActive={noActive} onNavigate={() => setMenuOpen(false)} />
                <div className="pt-6 mt-4 border-t border-white/5">
                  <NavActions />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
