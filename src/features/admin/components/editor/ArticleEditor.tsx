'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import type { ArticleData } from '@/core/content/overlay';
import { discardArticleDraft, publishArticle, saveArticleDraft, type ArticleActionResult } from '../../actions/articles';
import { fromForm, toForm, type ArticleForm } from './form-model';
import { FIELD, HINT, LABEL, SMALL_BUTTON } from './field-styles';
import { InfoboxEditor } from './InfoboxEditor';
import { FaqEditor } from './FaqEditor';
import { RelatedEditor, type ArticleOption } from './RelatedEditor';
import { BodyEditor } from './BodyEditor';
import { MediaPicker } from './MediaPicker';

interface Props {
  slug: string;
  initial: ArticleData;
  token: string;
  hasDraft: boolean;
  universes: string[];
  categories: string[];
  articles: ArticleOption[];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-[#061a2e]/60 p-5 @2xl:p-6">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

function TextField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  multiline?: boolean;
  maxLength?: number;
  placeholder?: string;
  inputMode?: 'decimal' | 'numeric' | 'text';
}) {
  const { label, value, onChange, hint, multiline, maxLength = 500, placeholder, inputMode } = props;
  return (
    <label className="block space-y-1">
      <span className={LABEL}>{label}</span>
      {multiline ? (
        <textarea className={`${FIELD} min-h-24`} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={FIELD} value={value} maxLength={maxLength} placeholder={placeholder} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint ? <span className={`block ${HINT}`}>{hint}</span> : null}
    </label>
  );
}

/** Editor de una ficha: guarda borradores, publica y avisa de lo que falta en lenguaje llano. */
export function ArticleEditor({ slug, initial, token: initialToken, hasDraft: initialHasDraft, universes, categories, articles }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ArticleForm>(() => toForm(initial));
  const [saved, setSaved] = useState(() => JSON.stringify(fromForm(toForm(initial))));
  const [token, setToken] = useState(initialToken);
  const [hasDraft, setHasDraft] = useState(initialHasDraft);
  const [result, setResult] = useState<ArticleActionResult | null>(null);
  const [note, setNote] = useState('');
  const [pending, startTransition] = useTransition();
  const [pickingCover, setPickingCover] = useState(false);

  const payload = useMemo(() => JSON.stringify(fromForm(form)), [form]);
  const dirty = payload !== saved;
  // Un aviso de éxito se va en cuanto se vuelve a editar; uno de error se queda hasta cerrarlo o corregir y reintentar.
  const edited = () => setResult((current) => (current?.ok ? null : current));
  const set = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => {
    edited();
    setForm((current) => ({ ...current, [key]: value }));
  };
  const setStat = (key: keyof ArticleForm['stats'], value: string) => {
    edited();
    setForm((current) => ({ ...current, stats: { ...current.stats, [key]: value } }));
  };

  const run = useCallback(
    (action: () => Promise<ArticleActionResult>, after?: (res: ArticleActionResult) => void) => {
      startTransition(async () => {
        setResult(null);
        const res = await action();
        setResult(res);
        if (res.token) setToken(res.token);
        after?.(res);
        // El mensaje se anuncia en la región viva; el foco no se mueve.
      });
    },
    [],
  );

  const save = useCallback(() => {
    const sent = payload;
    run(() => saveArticleDraft(slug, sent, token), (res) => {
      if (res.ok) {
        setSaved(sent);
        setHasDraft(true);
      }
    });
  }, [payload, run, slug, token]);

  const publish = () => {
    const sent = payload;
    run(() => publishArticle(slug, sent, token, note), (res) => {
      if (res.token) setSaved(sent);
      if (res.ok) {
        // Recarga la página (historial y estado nuevos) con el aviso en la URL: el editor se monta de nuevo.
        router.replace(`/admin/fichas/${slug}?publicada=1` as Route, { scroll: false });
      } else if (res.token) {
        setHasDraft(true);
      }
    });
  };

  const discard = () => {
    if (!window.confirm('¿Descartar el borrador? Se perderán los cambios que no se hayan publicado.')) return;
    run(() => discardArticleDraft(slug, token));
  };

  // Ctrl/Cmd + S guarda el borrador.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (!pending) save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending, save]);

  // Avisa antes de salir con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [dirty]);

  const universeOptions = universes.includes(form.universe) || !form.universe ? universes : [form.universe, ...universes];
  const categoryOptions = categories.includes(form.category) || !form.category ? categories : [form.category, ...categories];

  return (
    <div className="space-y-6">
      {/* Barra fija y opaca: estado, guardar, publicar y el aviso, siempre a la vista al bajar por el formulario. */}
      <div className="sticky top-0 z-20 -mx-4 space-y-3 border-b border-white/10 bg-[#00122E] px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="min-w-0 basis-full text-sm text-white/80 @lg:basis-auto @lg:flex-1" aria-live="polite">
            {pending ? 'Guardando…' : dirty ? 'Hay cambios sin guardar.' : hasDraft ? 'Borrador guardado, sin publicar.' : 'Sin cambios: es lo que ve la web.'}
          </p>
          <Button type="button" variant="outline" size="sm" disabled={pending || !dirty} onClick={save}>
            Guardar borrador
          </Button>
          <Button type="button" size="sm" disabled={pending || (!dirty && !hasDraft)} onClick={publish}>
            Publicar
          </Button>
        </div>
        <div role="alert" aria-live="assertive">
          {result ? (
            <div className={`max-h-[40vh] space-y-2 overflow-y-auto rounded-xl border p-4 ${result.ok ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-red-400/40 bg-red-500/10'}`}>
              <div className="flex items-start gap-3">
                {result.message ? <p className="min-w-0 flex-1 font-semibold text-white">{result.message}</p> : <span className="flex-1" />}
                <button type="button" className="text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-primary" onClick={() => setResult(null)}>
                  Cerrar<span className="sr-only"> el aviso</span>
                </button>
              </div>
              {result.errors?.length ? (
                <ul className="list-disc space-y-1 pl-5 text-white/90">
                  {result.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 basis-full flex-col gap-1 text-sm text-white/80 @lg:basis-auto @lg:flex-1 @lg:flex-row @lg:items-center @lg:gap-2">
          <span className="shrink-0">Nota del cambio (opcional):</span>
          <input className={`${FIELD} py-1.5`} value={note} maxLength={200} placeholder="p. ej. Corrijo la longitud" onChange={(event) => setNote(event.target.value)} />
        </label>
        {hasDraft && !dirty ? (
          <Link href={`/admin/fichas/${slug}/vista-previa` as Route} target="_blank" rel="noopener noreferrer" className={SMALL_BUTTON}>
            Vista previa del borrador<span className="sr-only"> (se abre en una pestaña nueva)</span>
          </Link>
        ) : (
          <span className={HINT}>{dirty ? 'Guarda para ver la vista previa.' : ''}</span>
        )}
        {hasDraft ? (
          <button type="button" className={SMALL_BUTTON} disabled={pending} onClick={discard}>
            Descartar borrador
          </button>
        ) : null}
      </div>

      <Section title="Datos básicos">
        <TextField label="Título" value={form.title} maxLength={200} onChange={(value) => set('title', value)} />
        <div className="grid gap-4 @2xl:grid-cols-2">
          <label className="block space-y-1">
            <span className={LABEL}>Universo</span>
            <select className={FIELD} value={form.universe} onChange={(event) => set('universe', event.target.value)}>
              {universeOptions.map((universe) => (
                <option key={universe} value={universe}>
                  {universe}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className={LABEL}>Categoría</span>
            <select className={FIELD} value={form.category} onChange={(event) => set('category', event.target.value)}>
              <option value="">Sin categoría</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
        <TextField
          label="Descripción corta"
          value={form.description}
          multiline
          maxLength={400}
          hint="Una o dos frases. Sale en los listados, en la búsqueda y al compartir el enlace."
          onChange={(value) => set('description', value)}
        />
        <label className="flex items-start gap-3 rounded-xl border border-white/15 p-4">
          <input type="checkbox" className="mt-1 size-5 accent-[#FF7300]" checked={form.sealed} onChange={(event) => set('sealed', event.target.checked)} />
          <span>
            <span className={LABEL}>Expediente sellado</span>
            <span className={`block ${HINT}`}>
              Para fichas sin información todavía: la web muestra el sello «Boris aún no ha desclasificado este expediente» en lugar del texto.
            </span>
          </span>
        </label>
      </Section>

      <Section title="Portada">
        <div className="flex flex-wrap items-start gap-4">
          {form.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- miniatura del panel
            <img src={form.image} alt="" className="aspect-video w-48 rounded-xl border border-white/15 object-cover" />
          ) : (
            <div className="flex aspect-video w-48 items-center justify-center rounded-xl border border-dashed border-white/25 text-sm text-white/60">Sin portada</div>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={SMALL_BUTTON} onClick={() => setPickingCover(true)}>
              {form.image ? 'Cambiar portada' : 'Elegir portada'}
            </button>
            {form.image ? (
              <button type="button" className={SMALL_BUTTON} onClick={() => set('image', '')}>
                Quitar portada
              </button>
            ) : null}
          </div>
        </div>
        <MediaPicker
          open={pickingCover}
          onClose={() => setPickingCover(false)}
          onSelect={(image) => {
            set('image', image.path);
            if (!form.imageCaption.trim()) set('imageCaption', image.alt);
            setPickingCover(false);
          }}
        />
        <p className={HINT}>Sin portada, la web muestra el dibujo de su categoría.</p>
        <TextField label="Pie de la portada" value={form.imageCaption} maxLength={300} onChange={(value) => set('imageCaption', value)} />
        <TextField
          label="Encuadre (opcional)"
          value={form.imagePosition}
          maxLength={40}
          placeholder="50% 20%"
          hint="Qué parte de la imagen se ve al recortarla: horizontal y vertical en %. «50% 20%» centra y sube."
          onChange={(value) => set('imagePosition', value)}
        />
      </Section>

      <Section title="Ficha lateral">
        <InfoboxEditor value={form.infobox} onChange={(value) => set('infobox', value)} />
      </Section>

      <Section title="Texto">
        <BodyEditor value={form.content} onChange={(value) => set('content', value)} />
      </Section>

      <Section title="Apodos y fichas relacionadas">
        <TextField
          label="Apodos"
          value={form.aliases}
          multiline
          maxLength={2000}
          hint="Uno por línea. Solo apodos que Boris use: la búsqueda y los enlaces automáticos los reconocen."
          onChange={(value) => set('aliases', value)}
        />
        <RelatedEditor slug={slug} value={form.related} options={articles} onChange={(value) => set('related', value)} />
      </Section>

      <Section title="Preguntas frecuentes">
        <FaqEditor value={form.faq} onChange={(value) => set('faq', value)} />
      </Section>

      <Section title="Datos de la Arena">
        <p className={HINT}>Opcionales. Con ellos la criatura puede combatir en la Arena.</p>
        <div className="grid gap-4 @2xl:grid-cols-2">
          <TextField label="Longitud (metros)" value={form.stats.length} inputMode="decimal" maxLength={12} onChange={(value) => setStat('length', value)} />
          <TextField label="Peso" value={form.stats.weight} maxLength={60} placeholder="20,000 toneladas" onChange={(value) => setStat('weight', value)} />
          <TextField label="Inteligencia (1 a 10)" value={form.stats.intelligence} inputMode="numeric" maxLength={3} onChange={(value) => setStat('intelligence', value)} />
          <TextField label="Hostilidad (1 a 10)" value={form.stats.hostility} inputMode="numeric" maxLength={3} onChange={(value) => setStat('hostility', value)} />
          <TextField label="Poder (0 a 100)" value={form.stats.power} inputMode="numeric" maxLength={3} onChange={(value) => setStat('power', value)} />
          <TextField label="Defensa (0 a 100)" value={form.stats.defense} inputMode="numeric" maxLength={3} onChange={(value) => setStat('defense', value)} />
          <TextField label="Tipo de mordida" value={form.stats.biteType} maxLength={80} onChange={(value) => setStat('biteType', value)} />
        </div>
        <TextField label="Habilidades especiales" value={form.stats.specialAbilities} multiline maxLength={2000} hint="Una por línea." onChange={(value) => setStat('specialAbilities', value)} />
      </Section>
    </div>
  );
}
