'use client';

import { useId, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { flattenNav, NAV_ICON_NAMES, unlistedSlugs, type NavGroup, type NavIconName } from '@/core/content/navigation';
import { NAV_ICON_COMPONENTS, NAV_ICON_LABELS } from '@/components/sidebar/nav-icons';
import {
  addItem,
  canHaveChildren,
  destinations,
  keysAlong,
  moveItem,
  moveItemTo,
  moveTargets,
  pathKey,
  removeItem,
  suggestDestination,
  updateItem,
  withKeys,
  withoutKeys,
  type KeyedGroup,
  type KeyedItem,
  type NavPath,
} from '../../lib/nav-tree';
import { ListShell } from './ListShell';
import { moved } from './row-controls';
import type { ListEditorProps } from './types';
import { useUndo } from '../UndoProvider';
import { DANGER_BUTTON, FIELD, HINT, LABEL, SMALL_BUTTON } from '../editor/field-styles';

const ICON_BUTTON =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none';

// Clave estable de cada entrada en el editor (plegar y editar no dependen de su posición). No se publica.
let sequence = 0;
const nextKey = () => `n${++sequence}`;

const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Editor del menú lateral: un árbol compacto, una línea por entrada, con los grupos plegados. */
export function NavigationEditor({ path, token, initial, articles }: ListEditorProps<NavGroup>) {
  const listId = useId();
  const [nav, setNav] = useState<KeyedGroup[]>(() => withKeys(initial, nextKey));
  const value = useMemo(() => withoutKeys(nav), [nav]);
  const apply = (change: (current: NavGroup[]) => NavGroup[]) => setNav((current) => change(current) as KeyedGroup[]);
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<Record<string, string>>({});
  const offerUndo = useUndo();

  const titleOf = (slug: string) => articles.find((a) => a.slug === slug)?.title ?? slug;
  const missing = unlistedSlugs(value, articles.map((a) => a.slug));
  const targets = destinations(nav);

  const search = normalize(query.trim());
  const matches = (item: KeyedItem): boolean => normalize(item.title).includes(search) || item.url.toLowerCase().includes(search);
  const visible = (item: KeyedItem): boolean => !search || matches(item) || (item.items ?? []).some(visible);
  const isOpen = (key: string) => Boolean(search) || open.has(key);
  const toggle = (key: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  const reveal = (keys: string[]) => setOpen((current) => new Set([...current, ...keys]));
  const allKeys = () => {
    const keys: string[] = [];
    const walk = (items: KeyedItem[]) =>
      items.forEach((item) => {
        if (item.items?.length) keys.push(item.key);
        walk(item.items ?? []);
      });
    nav.forEach((group) => {
      keys.push(group.key);
      walk(group.items);
    });
    return keys;
  };

  /** Añade una entrada vacía bajo `parent` y la deja abierta para escribir su nombre. */
  const addEntry = (parent: NavPath) => {
    const item: KeyedItem = { key: nextKey(), title: '', url: '/wiki/' };
    apply((current) => addItem(current, parent, item));
    reveal(keysAlong(nav, parent));
    setEditing(item.key);
  };

  const renderItem = (item: KeyedItem, itemPath: NavPath, siblings: number) => {
    if (!visible(item)) return null;
    const label = item.title || 'entrada sin nombre';
    const Icon = item.icon ? NAV_ICON_COMPONENTS[item.icon] : null;
    const hasChildren = Boolean(item.items?.length);
    const expanded = hasChildren && isOpen(item.key);
    const isEditing = editing === item.key;
    const formId = `menu-entrada-${item.key}`;
    const childrenId = `menu-hijos-${item.key}`;
    const moveOptions = isEditing ? moveTargets(nav, itemPath) : [];
    return (
      <li key={item.key}>
        <div className={`flex min-h-11 items-center gap-1 rounded-lg pr-1 ${isEditing ? 'bg-white/10' : 'hover:bg-white/5'}`}>
          {hasChildren ? (
            <button type="button" className={ICON_BUTTON} aria-expanded={expanded} aria-controls={childrenId} onClick={() => toggle(item.key)}>
              <ChevronRight aria-hidden="true" className={`size-4 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-90' : ''}`} />
              <span className="sr-only">
                {expanded ? 'Plegar' : 'Desplegar'} {label}
              </span>
            </button>
          ) : (
            <span className="w-10 shrink-0" aria-hidden="true" />
          )}
          <button
            type="button"
            className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-lg px-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-expanded={isEditing}
            aria-controls={formId}
            onClick={() => setEditing(isEditing ? null : item.key)}
          >
            {Icon ? <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" /> : null}
            <span className={`truncate font-semibold ${item.title ? 'text-white' : 'text-white/60 italic'}`}>{label}</span>
            <span className="hidden truncate text-sm text-white/60 @lg:inline">{item.url === '#' ? `Grupo · ${item.items?.length ?? 0}` : item.url}</span>
            <span className="sr-only">(editar)</span>
          </button>
          <button type="button" className={ICON_BUTTON} disabled={itemPath.at(-1) === 0} onClick={() => apply((current) => moveItem(current, itemPath, -1))}>
            <ArrowUp aria-hidden="true" className="size-4" />
            <span className="sr-only">Subir {label}</span>
          </button>
          <button type="button" className={ICON_BUTTON} disabled={itemPath.at(-1) === siblings - 1} onClick={() => apply((current) => moveItem(current, itemPath, 1))}>
            <ArrowDown aria-hidden="true" className="size-4" />
            <span className="sr-only">Bajar {label}</span>
          </button>
        </div>

        {isEditing ? (
          <div id={formId} className="mb-3 ml-2 mt-1 space-y-3 rounded-xl border border-white/15 bg-[#061a2e] p-4 @lg:ml-10">
            <div className="grid gap-3 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_14rem]">
              <label className="block space-y-1">
                <span className={LABEL}>Nombre</span>
                <input className={FIELD} value={item.title} maxLength={80} onChange={(event) => apply((current) => updateItem(current, itemPath, { title: event.target.value }))} />
              </label>
              <label className="block space-y-1">
                <span className={LABEL}>Enlace</span>
                <input
                  className={FIELD}
                  list={listId}
                  value={item.url}
                  placeholder="/wiki/… o # para un grupo"
                  onChange={(event) => apply((current) => updateItem(current, itemPath, { url: event.target.value.trim() }))}
                />
              </label>
              <label className="block space-y-1">
                <span className={LABEL}>Icono</span>
                <select
                  className={FIELD}
                  value={item.icon ?? ''}
                  onChange={(event) => apply((current) => updateItem(current, itemPath, { icon: (event.target.value || undefined) as NavIconName | undefined }))}
                >
                  <option value="">Sin icono</option>
                  {NAV_ICON_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {NAV_ICON_LABELS[name]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {moveOptions.length ? (
              <label className="block max-w-xl space-y-1">
                <span className={LABEL}>Mover a</span>
                <select
                  className={FIELD}
                  value=""
                  onChange={(event) => {
                    const destination = moveOptions.find((option) => pathKey(option.path) === event.target.value);
                    if (!destination) return;
                    const before = nav;
                    apply((current) => moveItemTo(current, itemPath, destination.path));
                    reveal(keysAlong(nav, destination.path));
                    offerUndo(`«${label}» movido a «${destination.label}».`, () => setNav(before));
                  }}
                >
                  <option value="">Elige otro sitio del menú</option>
                  {moveOptions.map((option) => (
                    <option key={pathKey(option.path)} value={pathKey(option.path)}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className={`block ${HINT}`}>Va al final de ese grupo{hasChildren ? ', con todo lo que tiene dentro' : ''}.</span>
              </label>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {canHaveChildren(itemPath) ? (
                <button type="button" className={SMALL_BUTTON} onClick={() => addEntry(itemPath)}>
                  <Plus aria-hidden="true" className="size-4" />
                  Añadir dentro<span className="sr-only"> de {label}</span>
                </button>
              ) : null}
              <button
                type="button"
                className={DANGER_BUTTON}
                onClick={() => {
                  const before = nav;
                  apply((current) => removeItem(current, itemPath));
                  setEditing(null);
                  offerUndo(hasChildren ? `«${label}» quitado del menú, con todo lo que tenía dentro.` : `«${label}» quitado del menú.`, () => setNav(before));
                }}
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Quitar<span className="sr-only"> {label}</span>
              </button>
              <button type="button" className={SMALL_BUTTON} onClick={() => setEditing(null)}>
                Listo
              </button>
            </div>
          </div>
        ) : null}

        {expanded ? (
          <ol id={childrenId} className="ml-5 border-l border-white/10 pl-1 @lg:pl-2">
            {item.items!.map((child, i) => renderItem(child, [...itemPath, i], item.items!.length))}
          </ol>
        ) : null}
      </li>
    );
  };

  return (
    <ListShell listKey="navigation" path={path} token={token} initial={initial} value={value}>
      <p className={HINT}>
        Pulsa una entrada para cambiar su nombre, su enlace o su icono, o para moverla a otro grupo. El orden de cada grupo es también el de
        «Anterior / Siguiente» en las fichas. Como mucho tres niveles dentro de cada universo.
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
        <section aria-labelledby="sin-menu" className="space-y-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 @2xl:p-5">
          <h2 id="sin-menu" className="text-lg font-bold text-white">
            Fichas que no están en el menú ({missing.length})
          </h2>
          <p className={HINT}>Se ven en la web y en la búsqueda, pero no en el menú lateral. Elige dónde va cada una (hay un sitio sugerido).</p>
          <ul className="space-y-3">
            {missing.map((slug) => {
              const article = articles.find((a) => a.slug === slug);
              const suggested = article ? suggestDestination(nav, article, articles) : null;
              const chosen = target[slug] ?? (suggested ? pathKey(suggested) : '');
              return (
                <li key={slug} className="flex flex-wrap items-end gap-2">
                  <span className="min-w-0 flex-1 basis-40 font-semibold text-white">{titleOf(slug)}</span>
                  <label className="min-w-0 flex-1 basis-56 space-y-1">
                    <span className="sr-only">Dónde añadir {titleOf(slug)}</span>
                    <select className={`${FIELD} py-2`} value={chosen} onChange={(event) => setTarget((t) => ({ ...t, [slug]: event.target.value }))}>
                      <option value="">Elige dónde</option>
                      {targets.map((destination) => (
                        <option key={pathKey(destination.path)} value={pathKey(destination.path)}>
                          {destination.label}
                          {suggested && pathKey(suggested) === pathKey(destination.path) ? ' (sugerido)' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className={SMALL_BUTTON}
                    disabled={!chosen}
                    onClick={() => {
                      const parent = chosen.split('.').map(Number);
                      const item: KeyedItem = { key: nextKey(), title: titleOf(slug), url: `/wiki/${slug}` };
                      apply((current) => addItem(current, parent, item));
                      reveal(keysAlong(nav, parent));
                    }}
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    Añadir<span className="sr-only"> {titleOf(slug)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1 basis-64 space-y-1">
          <span className={LABEL}>Buscar en el menú</span>
          <span className="relative block">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
            <input type="search" className={`${FIELD} pl-9`} value={query} placeholder="Nombre o dirección de una entrada" onChange={(event) => setQuery(event.target.value)} />
          </span>
        </label>
        <button type="button" className={SMALL_BUTTON} disabled={Boolean(search)} onClick={() => setOpen(new Set(allKeys()))}>
          Desplegar todo
        </button>
        <button type="button" className={SMALL_BUTTON} disabled={Boolean(search)} onClick={() => setOpen(new Set())}>
          Plegar todo
        </button>
      </div>

      <div className="space-y-3">
        {nav.map((group, g) => {
          if (search && !group.items.some(visible)) return null;
          const expanded = isOpen(group.key);
          const isEditing = editing === group.key;
          const name = group.title || `Universo ${g + 1}`;
          return (
            <section key={group.key} aria-label={name} className="rounded-2xl border border-white/10 bg-[#061a2e]/60 p-2 @lg:p-3">
              <div className="flex min-h-11 items-center gap-1">
                <button
                  type="button"
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg px-2 text-left hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-expanded={expanded}
                  aria-controls={`menu-hijos-${group.key}`}
                  onClick={() => toggle(group.key)}
                >
                  <ChevronRight aria-hidden="true" className={`size-4 shrink-0 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-90' : ''}`} />
                  <span className="truncate font-bold uppercase tracking-wide text-white">{name}</span>
                  <span className="hidden shrink-0 text-sm text-white/60 @md:inline">{flattenNav([group]).length} entradas</span>
                </button>
                <button type="button" className={ICON_BUTTON} aria-expanded={isEditing} onClick={() => setEditing(isEditing ? null : group.key)}>
                  <Pencil aria-hidden="true" className="size-4" />
                  <span className="sr-only">Editar el universo {name}</span>
                </button>
              </div>
              {isEditing ? (
                <div className="mx-2 mb-2 mt-1 flex flex-wrap items-end gap-3 rounded-xl border border-white/15 bg-[#061a2e] p-4">
                  <label className="min-w-0 flex-1 basis-56 space-y-1">
                    <span className={LABEL}>Nombre del universo</span>
                    <input
                      className={`${FIELD} font-bold uppercase`}
                      value={group.title}
                      maxLength={60}
                      onChange={(event) => setNav((n) => n.map((item, i) => (i === g ? { ...item, title: event.target.value } : item)))}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={SMALL_BUTTON} disabled={g === 0} onClick={() => setNav((n) => moved(n, g, -1))}>
                      <ArrowUp aria-hidden="true" className="size-4" />
                      <span className="sr-only">Subir el universo {name}</span>
                    </button>
                    <button type="button" className={SMALL_BUTTON} disabled={g === nav.length - 1} onClick={() => setNav((n) => moved(n, g, 1))}>
                      <ArrowDown aria-hidden="true" className="size-4" />
                      <span className="sr-only">Bajar el universo {name}</span>
                    </button>
                    <button
                      type="button"
                      className={DANGER_BUTTON}
                      onClick={() => {
                        const before = nav;
                        setNav((n) => n.filter((_, i) => i !== g));
                        setEditing(null);
                        offerUndo(`Universo «${name}» quitado del menú, con todas sus entradas.`, () => setNav(before));
                      }}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      Quitar<span className="sr-only"> el universo {name}</span>
                    </button>
                    <button type="button" className={SMALL_BUTTON} onClick={() => setEditing(null)}>
                      Listo
                    </button>
                  </div>
                </div>
              ) : null}
              {expanded ? (
                <div id={`menu-hijos-${group.key}`} className="space-y-2 pb-1">
                  <ol>{group.items.map((item, i) => renderItem(item, [g, i], group.items.length))}</ol>
                  {!search ? (
                    <button type="button" className={`${SMALL_BUTTON} ml-2`} onClick={() => addEntry([g])}>
                      <Plus aria-hidden="true" className="size-4" />
                      Añadir entrada<span className="sr-only"> a {name}</span>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
      {search && !nav.some((group) => group.items.some(visible)) ? <p className="text-white/80">Ninguna entrada del menú coincide con «{query.trim()}».</p> : null}
      <button
        type="button"
        className={SMALL_BUTTON}
        onClick={() => {
          const group: KeyedGroup = { key: nextKey(), title: 'NUEVO UNIVERSO', items: [] };
          setNav((n) => [...n, group]);
          reveal([group.key]);
          setEditing(group.key);
        }}
      >
        <Plus aria-hidden="true" className="size-4" />
        Añadir universo
      </button>
    </ListShell>
  );
}
