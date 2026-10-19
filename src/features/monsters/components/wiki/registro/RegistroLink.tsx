'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { progress } from '@/core/search/registro';
import { useSeen } from '@/features/monsters/store/registro-store';
import { REGISTRO_TEXT_LINK } from './ExpedienteAleatorioLink';

interface RegistroLinkProps {
  /** Slugs de las fichas que cuentan para el progreso (ni sellados ni índices): `registroSlugs(entries)`. */
  slugs: readonly string[];
}

/** «Tu registro · N/T ›». Hasta hidratar muestra 0/T (el estado neutro); no lee nada en el servidor. */
export function RegistroLink({ slugs }: RegistroLinkProps) {
  const entries = useMemo(() => slugs.map((slug) => ({ slug })), [slugs]);
  const { opened, total } = progress(entries, useSeen());
  return (
    <Link href="/wiki/registro" className={REGISTRO_TEXT_LINK}>
      Tu registro ·
      <span className="tabular-nums">
        {opened}/{total}
      </span>
      <span aria-hidden="true">›</span>
    </Link>
  );
}
