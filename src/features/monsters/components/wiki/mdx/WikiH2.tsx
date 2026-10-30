import type * as React from 'react';

/**
 * Apartado `##` de la ficha: lo usan el MDX y las secciones que la ficha añade al cuerpo (las preguntas frecuentes).
 * Lleva `clear-both` para no solaparse con un `WikiImage` flotado.
 */
export function WikiH2({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className="text-2xl font-black text-white italic tracking-widest uppercase mt-16 mb-8 pl-5 py-5 clear-both scroll-mt-24 relative bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border-t border-white/5 flex items-center group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      {...props}
    >
      <span className="relative z-10 drop-shadow-[0_2px_8px_rgba(255,115,0,0.6)] group-hover:text-primary transition-colors duration-300">
        {children}
      </span>
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent opacity-40" />
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-50" />
    </h2>
  );
}
