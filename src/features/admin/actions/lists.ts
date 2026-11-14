'use server';

import type { Prisma } from '@prisma/client';
import { isListKey } from '@/core/content/lists';
import { navSlugs, type NavGroup } from '@/core/content/navigation';
import { isValidSlug } from '@/core/content/overlay';
import { getContentRepository } from '@/core/content';
import { revalidateContent } from '@/core/content/revalidate';
import { checkList } from '../lib/list-check';
import { addItem, destinations, pathKey } from '../lib/nav-tree';
import { requireAdmin } from '../server/require-admin';
import { audit } from '../server/audit';
import { commitList, listContext, loadList } from '../server/lists';

const PAYLOAD_MAX = 400_000;

export interface ListActionResult {
  ok: boolean;
  token?: string;
  message?: string;
  errors?: string[];
  conflict?: boolean;
}

const CONFLICT: ListActionResult = {
  ok: false,
  conflict: true,
  message: 'La lista ha cambiado desde que la abriste (en otra pestaña o por otra persona). Recarga la página y vuelve a aplicar tus cambios.',
};

/**
 * Publica una lista entera (novedades, votaciones…). Se comprueba como `check:content` y contra lo que ve la web
 * ahora; luego se guarda con su versión en el historial. Las listas no tienen borrador: son cortas y la vista previa
 * es la propia página.
 */
export async function publishList(key: string, payload: string, token: string, note: string): Promise<ListActionResult> {
  const admin = await requireAdmin();
  if (!isListKey(key)) return { ok: false, message: 'Lista desconocida.' };
  if (typeof payload !== 'string' || payload.length > PAYLOAD_MAX) return { ok: false, message: 'La lista es demasiado grande.' };
  let value: unknown;
  try {
    value = JSON.parse(payload);
  } catch {
    return { ok: false, message: 'No se pudieron leer los datos del editor.' };
  }
  const checked = checkList(key, value, await listContext());
  if ('errors' in checked) return { ok: false, message: 'No se puede publicar todavía:', errors: checked.errors };

  const cleanNote = typeof note === 'string' ? note.trim().slice(0, 200) || null : null;
  const done = await commitList(admin.id, key, checked.value as Prisma.InputJsonValue, token, cleanNote);
  if (!done) return CONFLICT;
  await audit('list.publish', { userId: admin.id, target: key });
  revalidateContent();
  return { ok: true, token: done, message: 'Publicado. Ya se ve en la web.' };
}

/**
 * «Añadir al menú» desde el editor de una ficha: la pone al final de `destination` (la clave de uno de los
 * `destinations` del menú) y publica el menú. `token` es la marca del menú que vio el editor.
 */
export async function addArticleToMenu(slug: string, destination: string, token: string): Promise<ListActionResult> {
  const admin = await requireAdmin();
  if (typeof slug !== 'string' || !isValidSlug(slug) || typeof destination !== 'string' || typeof token !== 'string') return { ok: false, message: 'Datos no válidos.' };
  const [state, article] = await Promise.all([loadList('navigation'), getContentRepository().getArticle(slug)]);
  if (!article) return { ok: false, message: 'La ficha todavía no se ve en la web: publícala antes de añadirla al menú.' };
  if (state.token !== token) return CONFLICT;
  const nav = state.value as NavGroup[];
  if (navSlugs(nav).has(slug)) return { ok: true, token: state.token, message: 'Ya estaba en el menú.' };
  const target = destinations(nav).find((item) => pathKey(item.path) === destination);
  if (!target) return { ok: false, message: 'Elige dónde va la ficha en el menú.' };

  const title = article.frontmatter.title;
  const checked = checkList('navigation', addItem(nav, target.path, { title, url: `/wiki/${slug}` }), await listContext());
  if ('errors' in checked) return { ok: false, message: 'No se puede publicar el menú todavía:', errors: checked.errors };
  const done = await commitList(admin.id, 'navigation', checked.value as Prisma.InputJsonValue, token, `Añade «${title}» desde su ficha`.slice(0, 200));
  if (!done) return CONFLICT;
  await audit('list.publish', { userId: admin.id, target: 'navigation' });
  revalidateContent();
  return { ok: true, token: done, message: `Añadida al menú en «${target.label}».` };
}
