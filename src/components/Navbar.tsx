'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { NavLogo } from './navbar/components/NavLogo';
import { NavLinks } from './navbar/components/NavLinks';
import { NavActions } from './navbar/components/NavActions';
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
}

export default function Navbar({ hideLogoOnDesktop = false }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'p-0' : 'px-6 py-6',
        hideLogoOnDesktop &&
          'md:px-0 md:py-0 md:relative md:top-auto md:left-auto md:right-auto',
      )}
    >
      <div
        className={cn(
          'transition-all duration-700 flex items-center justify-between glass-liquid',
          scrolled
            ? 'w-full max-w-full rounded-none px-6 md:px-12 py-5 bg-black/80 backdrop-blur-[120px] border-b border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.9)]'
            : 'max-w-7xl mx-auto rounded-full px-6 md:px-8 py-3 bg-black/10 border-white/10 border-refractive shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
          hideLogoOnDesktop &&
            'md:bg-transparent md:border-none md:shadow-none md:px-0 md:py-0 md:w-full',
        )}
      >
        {/* Shine and Reflection layers */}
        {!hideLogoOnDesktop && (
          <>
            <div className="glass-shine opacity-10" />
            {!scrolled && <div className="glass-reflection" />}
          </>
        )}

        <NavLogo hideLogoOnDesktop={hideLogoOnDesktop} />

        {/* Desktop Links */}
        <div
          className={cn(
            'hidden md:flex items-center gap-2 relative z-10',
            hideLogoOnDesktop && 'md:gap-1',
          )}
        >
          <NavLinks />
          <NavActions />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2 relative z-10">
          <Sheet>
            <SheetTrigger 
              render={
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
              }
            />
            <SheetContent side="right" className="bg-[#001226] border-l border-white/10 p-0 w-[80%] max-w-[300px]">
              <SheetHeader className="p-8 border-b border-white/5">
                <SheetTitle className="text-left">
                  <NavLogo />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-6 space-y-2">
                <NavLinks />
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
