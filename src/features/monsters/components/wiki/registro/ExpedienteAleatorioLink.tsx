import Link from 'next/link';
import type { Route } from 'next';

/** Estilo de los enlaces de texto del registro: el mismo «Ver todo ›» de `Section`, con objetivo de 44 px. */
export const REGISTRO_TEXT_LINK =
  'inline-flex min-h-11 items-center gap-1.5 rounded-sm text-[12px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none';

/**
 * «Expediente aleatorio ›». `/wiki/aleatorio` es un route handler que redirige a una ficha al azar:
 * `prefetch={false}` es obligatorio, porque una precarga guardaría en caché un único destino.
 */
export function ExpedienteAleatorioLink({ className }: { className?: string }) {
  return (
    <Link
      href={'/wiki/aleatorio' as Route}
      prefetch={false}
      className={className ? `${REGISTRO_TEXT_LINK} ${className}` : REGISTRO_TEXT_LINK}
    >
      Expediente aleatorio
      <span aria-hidden="true">›</span>
    </Link>
  );
}
