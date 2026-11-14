'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Eye, PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ArticleData } from '@/core/content/overlay';
import { discardArticleDraft, publishArticle, saveArticleDraft, stashArticlePreview, type ArticleActionResult } from '../../actions/articles';
import { fromForm, toForm, type ArticleForm } from './form-model';
import { FIELD, HINT, LABEL, SMALL_BUTTON } from './field-styles';
import { InfoboxEditor } from './InfoboxEditor';
import { FaqEditor } from './FaqEditor';
import { RelatedEditor, type ArticleOption } from './RelatedEditor';
import { GO_TO_TEXT, SectionsEditor } from './SectionsEditor';
import { MediaPicker } from './MediaPicker';
import { FocalPointPicker } from './FocalPointPicker';
import { errorTarget, type ArticleField, type ErrorTarget } from '../../lib/error-target';
import { useLeaveGuard } from '../use-leave-guard';
import { Section, TextField } from './EditorFields';

interface Props {
  slug: string;
  initial: ArticleData;
  token: string;
  hasDraft: boolean;
  universes: string[];
  categories: string[];
  articles: ArticleOption[];
}

const fieldId = (field: ArticleField) => `campo-${field}`;

/** Lleva al campo de un error: lo centra y le da el foco. Los del texto los resuelve `SectionsEditor` (bloque o línea). */
function goTo(target: ErrorTarget) {
  if (target.field === 'content') {
    window.dispatchEvent(new CustomEvent(GO_TO_TEXT, { detail: { line: target.line } }));
    return;
  }
  const element = document.getElementById(fieldId(target.field));
  if (!element) return;
  const controls = 'input, textarea, select, button';
  // Un marcador sin controles (ficha lateral, relacionadas…) lleva al primero de su sección.
  const focusable = element.matches(controls) ? element : (element.querySelector<HTMLElement>(controls) ?? element.parentElement?.querySelector<HTMLElement>(controls));
  element.scrollIntoView({ block: 'center' });
  focusable?.focus({ preventScroll: true });
}

const previewUrl = (slug: string, embed: boolean) => `/admin/vista-previa/${slug}?vivo=1${embed ? '&embed=1' : ''}`;

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
  // Vista previa al lado (pantallas anchas): un iframe que se recarga al dejar de escribir.
  const [split, setSplit] = useState(false);
  const [previewProblem, setPreviewProblem] = useState('');
  const frame = useRef<HTMLIFrameElement>(null);

  const payload = useMemo(() => JSON.stringify(fromForm(form)), [form]);
  // Errores de publicar con el campo al que se refieren, para llevar a él y marcarlo.
  const errors = useMemo(() => (result && !result.ok ? (result.errors ?? []).map((message) => ({ message, target: errorTarget(message, form.image) })) : []), [result, form.image]);
  const invalid = new Set(errors.flatMap(({ target }) => (target ? [target.field] : [])));
  const field = (key: ArticleField) => ({ id: fieldId(key), invalid: invalid.has(key) });
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

  // Lo que se está editando, sin guardar, va a la vista previa 800 ms después del último cambio.
  useEffect(() => {
    if (!split) return;
    const timer = window.setTimeout(async () => {
      const res = await stashArticlePreview(slug, payload);
      if (!res.ok) {
        setPreviewProblem(res.message ?? 'No se pudo actualizar la vista previa.');
        return;
      }
      setPreviewProblem('');
      const iframe = frame.current;
      if (!iframe) return;
      // Recarga conservando por dónde iba (mismo origen: se puede leer y fijar su scroll). Si el iframe no es nuestro
      // (página de error, sesión caducada…), el navegador no deja leerlo: se vuelve a cargar desde cero.
      let y = 0;
      let loaded = false;
      try {
        loaded = iframe.contentWindow?.location.pathname.startsWith('/admin/vista-previa') ?? false;
        if (loaded) y = iframe.contentWindow!.scrollY;
      } catch {
        loaded = false;
      }
      iframe.onload = () => {
        try {
          iframe.contentWindow?.scrollTo(0, y);
        } catch {
          // Otra página dentro del iframe: no se toca.
        }
      };
      if (loaded) iframe.contentWindow!.location.reload();
      else iframe.src = previewUrl(slug, true);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [split, payload, slug]);

  /** Vista previa en una pestaña nueva, con lo que hay ahora en el editor (aunque no esté guardado). */
  const openPreview = async () => {
    // Se abre ya (dentro del clic) para que el navegador no la bloquee; la dirección se pone al guardar la vista previa.
    const tab = window.open('about:blank', '_blank');
    const res = await stashArticlePreview(slug, payload);
    if (!tab) return;
    tab.opener = null;
    tab.location.href = res.ok ? previewUrl(slug, false) : `/admin/vista-previa/${slug}`;
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

  useLeaveGuard(dirty, '¿Salir sin guardar? Los cambios que no has guardado se perderán.');

  const universeOptions = universes.includes(form.universe) || !form.universe ? universes : [form.universe, ...universes];
  const categoryOptions = categories.includes(form.category) || !form.category ? categories : [form.category, ...categories];

  return (
    <div data-split={split || undefined} className={split ? 'xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start xl:gap-6' : ''}>
    <div className="min-w-0 space-y-6">
      {/* Barra fija y opaca: estado, guardar, publicar y el aviso, siempre a la vista al bajar por el formulario. */}
      <div data-tour="barra" className="sticky top-0 z-20 -mx-4 space-y-3 border-b border-white/10 bg-[#00122E] px-4 py-3">
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
                <button type="button" className="inline-flex min-h-10 items-center text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-primary" onClick={() => setResult(null)}>
                  Cerrar<span className="sr-only"> el aviso</span>
                </button>
              </div>
              {errors.length ? (
                <ul className="list-disc space-y-1 pl-5 text-white/90">
                  {errors.map(({ message, target }) => (
                    <li key={message}>
                      {target ? (
                        <button type="button" className="text-left underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary" onClick={() => goTo(target)}>
                          {message}
                          <span className="sr-only"> (ir al campo)</span>
                        </button>
                      ) : (
                        message
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
              {errors.some(({ target }) => target) ? <p className={HINT}>Pulsa un aviso para ir a su campo.</p> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div data-tour="acciones" className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 basis-full flex-col gap-1 text-sm text-white/80 @lg:basis-auto @lg:flex-1 @lg:flex-row @lg:items-center @lg:gap-2">
          <span className="shrink-0">Nota del cambio (opcional):</span>
          <input className={`${FIELD} py-1.5`} value={note} maxLength={200} placeholder="p. ej. Corrijo la longitud" onChange={(event) => setNote(event.target.value)} />
        </label>
        <button type="button" className={SMALL_BUTTON} onClick={openPreview}>
          <Eye aria-hidden="true" className="size-4" />
          Vista previa<span className="sr-only"> (se abre en una pestaña nueva, con lo que hay ahora en el editor)</span>
        </button>
        <button type="button" className={`${SMALL_BUTTON} hidden xl:inline-flex ${split ? 'border-primary text-primary' : ''}`} aria-pressed={split} onClick={() => setSplit((value) => !value)}>
          <PanelRight aria-hidden="true" className="size-4" />
          Vista previa al lado
        </button>
        {hasDraft ? (
          <button type="button" className={SMALL_BUTTON} disabled={pending} onClick={discard}>
            Descartar borrador
          </button>
        ) : null}
      </div>

      <Section title="Datos básicos" tour="datos">
        <TextField {...field('title')} label="Título" value={form.title} maxLength={200} onChange={(value) => set('title', value)} />
        <div className="grid gap-4 @2xl:grid-cols-2">
          <label className="block space-y-1">
            <span className={LABEL}>Universo</span>
            <select id={fieldId('universe')} className={FIELD} value={form.universe} onChange={(event) => set('universe', event.target.value)}>
              {universeOptions.map((universe) => (
                <option key={universe} value={universe}>
                  {universe}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className={LABEL}>Categoría</span>
            <select id={fieldId('category')} className={FIELD} value={form.category} onChange={(event) => set('category', event.target.value)}>
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
          {...field('description')}
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

      <Section title="Portada" tour="portada" invalid={invalid.has('image')}>
        <div id={fieldId('image')} className="flex flex-wrap items-start gap-4">
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
            // La descripción que se acaba de escribir sirve de primer pie; nunca el nombre del archivo.
            if (!form.imageCaption.trim()) set('imageCaption', image.alt);
            setPickingCover(false);
          }}
        />
        <p className={HINT}>Sin portada, la web muestra el dibujo de su categoría.</p>
        <TextField {...field('imageCaption')} label="Pie de la portada" value={form.imageCaption} maxLength={300} onChange={(value) => set('imageCaption', value)} />
        {form.image ? <FocalPointPicker id={fieldId('imagePosition')} src={form.image} value={form.imagePosition} onChange={(value) => set('imagePosition', value)} /> : null}
      </Section>

      <Section title="Ficha lateral" tour="ficha-lateral" invalid={invalid.has('infobox')}>
        <div id={fieldId('infobox')} />
        <InfoboxEditor value={form.infobox} onChange={(value) => set('infobox', value)} />
      </Section>

      <Section title="Texto" tour="texto" invalid={invalid.has('content')}>
        <SectionsEditor invalid={invalid.has('content')} articles={articles} value={form.content} onChange={(value) => set('content', value)} />
      </Section>

      <Section title="Apodos y fichas relacionadas" tour="relacionadas" invalid={invalid.has('aliases') || invalid.has('related')}>
        <TextField
          {...field('aliases')}
          label="Apodos"
          value={form.aliases}
          multiline
          maxLength={2000}
          hint="Uno por línea. Solo apodos que Boris use: la búsqueda y los enlaces automáticos los reconocen."
          onChange={(value) => set('aliases', value)}
        />
        <div id={fieldId('related')} />
        <RelatedEditor slug={slug} value={form.related} options={articles} onChange={(value) => set('related', value)} />
      </Section>

      <Section title="Preguntas frecuentes" invalid={invalid.has('faq')}>
        <div id={fieldId('faq')} />
        <FaqEditor value={form.faq} onChange={(value) => set('faq', value)} />
      </Section>

      <Section title="Datos de la Arena" tour="arena" invalid={invalid.has('stats')}>
        <p id={fieldId('stats')} className={HINT}>Opcionales. Con ellos la criatura puede combatir en la Arena.</p>
        <div className="grid gap-4 @2xl:grid-cols-2">
          <TextField label="Longitud (metros)" value={form.stats.length} range={{ min: 0, step: 0.1 }} onChange={(value) => setStat('length', value)} />
          <TextField
            label="Peso"
            value={form.stats.weight}
            maxLength={60}
            placeholder="20,000 toneladas"
            hint="El que muestra la Arena. El de la ficha lateral se escribe aparte."
            onChange={(value) => setStat('weight', value)}
          />
          <TextField label="Inteligencia (1 a 10)" value={form.stats.intelligence} range={{ min: 1, max: 10, step: 1 }} onChange={(value) => setStat('intelligence', value)} />
          <TextField label="Hostilidad (1 a 10)" value={form.stats.hostility} range={{ min: 1, max: 10, step: 1 }} onChange={(value) => setStat('hostility', value)} />
          <TextField label="Poder (0 a 100)" value={form.stats.power} range={{ min: 0, max: 100, step: 1 }} onChange={(value) => setStat('power', value)} />
          <TextField label="Defensa (0 a 100)" value={form.stats.defense} range={{ min: 0, max: 100, step: 1 }} onChange={(value) => setStat('defense', value)} />
          <TextField label="Tipo de mordida" value={form.stats.biteType} maxLength={80} onChange={(value) => setStat('biteType', value)} />
        </div>
        <TextField label="Habilidades especiales" value={form.stats.specialAbilities} multiline maxLength={2000} hint="Una por línea." onChange={(value) => setStat('specialAbilities', value)} />
      </Section>
    </div>
    {split ? (
      <aside aria-label="Vista previa" className="sticky top-4 hidden h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-white/15 xl:flex">
        <p className="border-b border-white/10 bg-[#061a2e] px-4 py-2 text-sm text-white/80" aria-live="polite">
          {previewProblem || 'Vista previa: se actualiza sola mientras escribes. Aún no está en la web.'}
        </p>
        <iframe ref={frame} title="Vista previa de la ficha" className="min-h-0 w-full flex-1 bg-[#0a2339]" />
      </aside>
    ) : null}
    </div>
  );
}
