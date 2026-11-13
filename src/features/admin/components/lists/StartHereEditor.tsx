'use client';

import { useState } from 'react';
import { RelatedEditor } from '../editor/RelatedEditor';
import { ListShell } from './ListShell';
import type { ListEditorProps } from './types';
import { HINT } from '../editor/field-styles';

export function StartHereEditor({ path, token, initial, articles }: ListEditorProps<string>) {
  const [slugs, setSlugs] = useState<string[]>(() => [...initial]);
  // Solo expedientes abiertos: un sellado no sirve para empezar.
  const options = articles.filter((article) => !article.sealed).map(({ slug, title }) => ({ slug, title }));
  return (
    <ListShell listKey="startHere" path={path} token={token} initial={initial} value={slugs}>
      <p className={HINT}>Las fichas que ve primero quien llega nuevo, arriba de la wiki y en «Empieza aquí». Funcionan mejor 5, con portada.</p>
      <RelatedEditor slug="" value={slugs} options={options} hint="" addLabel="Añadir ficha" onChange={setSlugs} />
    </ListShell>
  );
}
