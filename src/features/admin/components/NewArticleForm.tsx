'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { createArticleAction, type CreateArticleState } from '../actions/articles';
import { FIELD, HINT, LABEL } from './editor/field-styles';

/** Dirección sugerida a partir del nombre: minúsculas sin tildes y guiones. */
const toSlug = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const INITIAL: CreateArticleState = {};

export function NewArticleForm({ universes, categories }: { universes: string[]; categories: string[] }) {
  const [state, action, pending] = useActionState(createArticleAction, INITIAL);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={action} className="space-y-5">
      <label className="block space-y-1">
        <span className={LABEL}>Nombre</span>
        <input
          name="title"
          required
          maxLength={200}
          className={FIELD}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugTouched) setSlug(toSlug(event.target.value));
          }}
        />
      </label>
      <label className="block space-y-1">
        <span className={LABEL}>Dirección</span>
        <input
          name="slug"
          required
          maxLength={80}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className={FIELD}
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
        />
        <span className={`block ${HINT}`}>
          La ficha estará en /wiki/{slug || '…'}. Solo minúsculas sin tildes, números y guiones. No se podrá cambiar después.
        </span>
      </label>
      <div className="grid gap-4 @2xl:grid-cols-2">
        <label className="block space-y-1">
          <span className={LABEL}>Universo</span>
          <select name="universe" required className={FIELD} defaultValue={universes[0]}>
            {universes.map((universe) => (
              <option key={universe}>{universe}</option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className={LABEL}>Categoría</span>
          <select name="category" required className={FIELD} defaultValue="">
            <option value="" disabled>
              Elige una
            </option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>
      <p className={HINT}>
        La ficha empieza sellada y con los apartados de su tipo. No se verá en la web hasta que la publiques.
      </p>
      <p role="alert" aria-live="assertive" className="min-h-5 text-sm font-semibold text-red-300">
        {state.error}
      </p>
      <Button type="submit" disabled={pending}>
        {pending ? 'Creando…' : 'Crear ficha'}
      </Button>
    </form>
  );
}
