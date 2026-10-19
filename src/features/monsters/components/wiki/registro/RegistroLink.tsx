'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { progress } from '@/core/search/registro';
import { REGISTRO_ROUTE } from '@/features/monsters/config/wiki-routes';
import { useRegistroHydrated, useSeen } from '@/features/monsters/store/registro-store';
import { REGISTRO_TEXT_LINK } from './ExpedienteAleatorioLink';

interface RegistroLinkProps {
  /** Slugs de las fichas que cuentan para el progreso (ni sellados ni índices): `registroSlugs(entries)`. */
  slugs: readonly string[];
}

/**
 * «Tu registro · N/T ›». Hasta hidratar muestra 0/T (el estado neutro); no lee nada en el servidor.
 * El texto visual va oculto a los lectores de pantalla y el nombre accesible es una frase: «Tu registro: N de T
 * expedientes abiertos» ya hidratado y «Tu registro del archivo» antes (cuando N todavía no es el del fan).
 */
export function RegistroLink({ slugs }: RegistroLinkProps) {
  const entries = useMemo(() => slugs.map((slug) => ({ slug })), [slugs]);
  const hydrated = useRegistroHydrated();
  const { opened, total } = progress(entries, useSeen());
  return (
    <Link href={REGISTRO_ROUTE} className={REGISTRO_TEXT_LINK}>
      <span aria-hidden="true">Tu registro ·</span>
      <span aria-hidden="true" className="tabular-nums">
        {opened}/{total}
      </span>
      <span aria-hidden="true">›</span>
      <span className="sr-only">
        {hydrated ? `Tu registro: ${opened} de ${total} expedientes abiertos` : 'Tu registro del archivo'}
      </span>
    </Link>
  );
}
