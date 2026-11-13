'use client';

import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { NAV_ICON_NAMES, unlistedSlugs, type NavGroup, type NavIconName, type NavItem } from '@/core/content/navigation';
import { NAV_ICON_COMPONENTS, NAV_ICON_LABELS } from '@/components/sidebar/nav-icons';
import { addItem, canHaveChildren, destinations, moveItem, pathKey, removeItem, updateItem, type NavPath } from '../../lib/nav-tree';
import { ListShell } from './ListShell';
import { RowControls } from './row-controls';
import type { ListEditorProps } from './types';
import { useUndo } from '../UndoProvider';
import { FIELD, HINT, LABEL, SMALL_BUTTON } from '../editor/field-styles';

const DEPTH_STYLE = ['border-white/15 bg-[#061a2e]/80', 'border-white/10 bg-[#061a2e]/50', 'border-white/10 bg-transparent'];

export function NavigationEditor({ path, token, initial, articles }: ListEditorProps<NavGroup>) {
  const listId = useId();
  const [nav, setNav] = useState<NavGroup[]>(() => structuredClone(initial));
  const offerUndo = useUndo();
  const titleOf = (slug: string) => articles.find((a) => a.slug === slug)?.title ?? slug;
  const missing = unlistedSlugs(nav, articles.map((a) => a.slug));
  const targets = destinations(nav);
  const [target, setTarget] = useState<Record<string, string>>({});

  const renderItem = (item: NavItem, itemPath: NavPath, siblings: number) => {
    const depth = itemPath.length - 2; // 0 = entrada de un universo
    const label = item.title || 'entrada sin nombre';
    const Icon = item.icon ? NAV_ICON_COMPONENTS[item.icon] : null;
    return (
      <li key={pathKey(itemPath)} className={`space-y-3 rounded-xl border p-4 ${DEPTH_STYLE[depth] ?? DEPTH_STYLE[2]}`}>
        <div className="grid gap-3 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_12rem]">
          <label className="block space-y-1">
            <span className={LABEL}>Nombre</span>
            <input className={FIELD} value={item.title} maxLength={80} onChange={(event) => setNav((n) => updateItem(n, itemPath, { title: event.target.value }))} />
          </label>
          <label className="block space-y-1">
            <span className={LABEL}>Enlace</span>
            <input
              className={FIELD}
              list={listId}
              value={item.url}
              placeholder="/wiki/… o # para un grupo"
              onChange={(event) => setNav((n) => updateItem(n, itemPath, { url: event.target.value.trim() }))}
            />
          </label>
          <label className="block space-y-1">
            <span className={LABEL}>Icono</span>
            <span className="flex items-center gap-2">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/15" aria-hidden="true">
                {Icon ? <Icon className="size-4 text-primary" /> : null}
              </span>
              <select
                className={FIELD}
                value={item.icon ?? ''}
                onChange={(event) => setNav((n) => updateItem(n, itemPath, { icon: (event.target.value || undefined) as NavIconName | undefined }))}
              >
                <option value="">Sin icono</option>
                {NAV_ICON_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {NAV_ICON_LABELS[name]}
                  </option>
                ))}
              </select>
            </span>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RowControls
            index={itemPath.at(-1)!}
            count={siblings}
            label={label}
            onMove={(delta) => setNav((n) => moveItem(n, itemPath, delta))}
            onRemove={() => {
              const before = nav;
              setNav((n) => removeItem(n, itemPath));
              offerUndo(item.items?.length ? `«${label}» quitado del menú, con todo lo que tenía dentro.` : `«${label}» quitado del menú.`, () => setNav(before));
            }}
          />
          {canHaveChildren(itemPath) ? (
            <button type="button" className={SMALL_BUTTON} onClick={() => setNav((n) => addItem(n, itemPath, { title: '', url: '/wiki/' }))}>
              <Plus aria-hidden="true" className="size-4" />
              Añadir dentro<span className="sr-only"> de {label}</span>
            </button>
          ) : null}
        </div>
        {item.items?.length ? <ol className="space-y-3 pl-3 @lg:pl-6">{item.items.map((child, i) => renderItem(child, [...itemPath, i], item.items!.length))}</ol> : null}
      </li>
    );
  };

  return (
    <ListShell listKey="navigation" path={path} token={token} initial={initial} value={nav}>
      <p className={HINT}>
        El orden de cada grupo es también el de «Anterior / Siguiente» en las fichas. Un grupo que solo despliega lleva «#» como enlace.
        Como mucho tres niveles dentro de cada universo.
      </p>
      <datalist id={listId}>
        <option value="#">Grupo (solo despliega)</option>
        <option value="/wiki">Portada de la wiki</option>
        <option value="/wiki/arena">Versus Arena</option>
        {articles.map((article) => (
          <option key={article.slug} value={`/wiki/${article.slug}`}>
            {article.title}
          </option>
        ))}
      </datalist>

      {missing.length ? (
        <section aria-labelledby="sin-menu" className="space-y-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5">
          <h2 id="sin-menu" className="text-lg font-bold text-white">
            Fichas que no están en el menú ({missing.length})
          </h2>
          <p className={HINT}>Se ven en la web y en la búsqueda, pero no en el menú lateral. Elige dónde va cada una.</p>
          <ul className="space-y-2">
            {missing.map((slug) => (
              <li key={slug} className="flex flex-wrap items-end gap-2">
                <span className="min-w-0 flex-1 font-semibold text-white">{titleOf(slug)}</span>
                <label className="min-w-0 space-y-1">
                  <span className="sr-only">Dónde añadir {titleOf(slug)}</span>
                  <select className={`${FIELD} py-2`} value={target[slug] ?? ''} onChange={(event) => setTarget((t) => ({ ...t, [slug]: event.target.value }))}>
                    <option value="">Elige dónde</option>
                    {targets.map((destination) => (
                      <option key={pathKey(destination.path)} value={pathKey(destination.path)}>
                        {destination.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className={SMALL_BUTTON}
                  disabled={!target[slug]}
                  onClick={() => setNav((n) => addItem(n, target[slug].split('.').map(Number), { title: titleOf(slug), url: `/wiki/${slug}` }))}
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Añadir<span className="sr-only"> {titleOf(slug)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {nav.map((group, g) => (
        <section key={g} aria-label={group.title || `Universo ${g + 1}`} className="space-y-3 rounded-2xl border border-white/10 p-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-0 basis-full space-y-1 @lg:basis-auto @lg:flex-1">
              <span className={LABEL}>Universo</span>
              <input
                className={`${FIELD} font-bold uppercase`}
                value={group.title}
                maxLength={60}
                onChange={(event) => setNav((n) => n.map((item, i) => (i === g ? { ...item, title: event.target.value } : item)))}
              />
            </label>
            <RowControls
              index={g}
              count={nav.length}
              label={`el universo ${group.title}`}
              onMove={(delta) =>
                setNav((n) => {
                  const next = [...n];
                  const [moved] = next.splice(g, 1);
                  next.splice(g + delta, 0, moved);
                  return next;
                })
              }
              onRemove={() => {
                const before = nav;
                setNav((n) => n.filter((_, i) => i !== g));
                offerUndo(`Universo «${group.title}» quitado del menú, con todas sus entradas.`, () => setNav(before));
              }}
            />
          </div>
          <ol className="space-y-3">{group.items.map((item, i) => renderItem(item, [g, i], group.items.length))}</ol>
          <button type="button" className={SMALL_BUTTON} onClick={() => setNav((n) => addItem(n, [g], { title: '', url: '/wiki/' }))}>
            <Plus aria-hidden="true" className="size-4" />
            Añadir entrada<span className="sr-only"> a {group.title}</span>
          </button>
        </section>
      ))}
      <button type="button" className={SMALL_BUTTON} onClick={() => setNav((n) => [...n, { title: 'NUEVO UNIVERSO', items: [] }])}>
        <Plus aria-hidden="true" className="size-4" />
        Añadir universo
      </button>
    </ListShell>
  );
}
