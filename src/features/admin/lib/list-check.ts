/** Comprobaciones de las listas del panel antes de publicar, con mensajes para quien edita. Puro. */
import { LIST_SCHEMAS, type ListKey } from '../../../core/content/lists.ts';
import type { CuratedPoll, NewsEntry, StoryOrderEntry, VideoLink } from '../../../core/content/schemas.ts';
import { crossCheckNews, crossCheckPolls, crossCheckStartHere, crossCheckStoryOrder, crossCheckVideoLinks } from '../../../core/content/validate.ts';
import { isoWeekKey } from '../../../core/content/iso-week.ts';
import { navigationProblems, type NavGroup } from '../../../core/content/navigation.ts';

export interface ListContext {
  slugs: ReadonlySet<string>;
  /** Fichas con datos de la Arena (pueden ir a un duelo). */
  fighterSlugs: ReadonlySet<string>;
  sealedSlugs: ReadonlySet<string>;
  universeKeys: ReadonlySet<string>;
  /** Vídeos de `canal.json`. */
  canalIds: ReadonlySet<string>;
  /** Vídeos con título conocido sin el feed (destacados y `canal.json`). */
  knownVideoIds: ReadonlySet<string>;
  /** Votaciones que ve la web ahora: las de semanas pasadas y la actual no se pueden cambiar. */
  currentPolls: readonly CuratedPoll[];
  now: Date;
}

/** Quita de los mensajes de `validate.ts` las referencias a archivos, que a Boris no le dicen nada. */
const plain = (message: string) =>
  message
    .replace(/^(encuestas\.json|videos\.json|orden-historia\.json|start-here\.ts|novedades\/[^:]+\.md):?\s*/, '')
    .replace(/ en src\/content/g, '')
    .replace(/ de universes\.ts \(universeKey\)/, '')
    .replace(/ en canal\.json/g, ' en la lista del canal')
    .replace(/\(status: proximamente\)/g, '')
    .replace(/no tiene stats/, 'no tiene datos de la Arena')
    .replace(/ en FEATURED_VIDEOS y/, ' entre los vídeos conocidos y')
    .replace(/\s+/g, ' ')
    .trim();

const samePoll = (a: CuratedPoll, b: CuratedPoll) => a.semana === b.semana && a.tipo === b.tipo && a.a === b.a && a.b === b.b && a.pregunta === b.pregunta;

/**
 * Las votaciones de semanas pasadas y la de la semana actual quedan fijas: su id (`<semana>-<a>-vs-<b>`) es el de sus
 * votos, y el historial deduce su tipo de esta lista. Solo se pueden añadir o cambiar las de semanas futuras.
 */
export function lockedPollProblems(next: readonly CuratedPoll[], current: readonly CuratedPoll[], now: Date): string[] {
  const week = isoWeekKey(now);
  const problems: string[] = [];
  for (const poll of current.filter((p) => p.semana <= week)) {
    const kept = next.find((p) => p.semana === poll.semana);
    if (!kept) problems.push(`La votación de la semana ${poll.semana} ya empezó o terminó: no se puede quitar.`);
    else if (!samePoll(kept, poll)) problems.push(`La votación de la semana ${poll.semana} ya empezó o terminó: no se puede cambiar.`);
  }
  for (const poll of next.filter((p) => p.semana <= week)) {
    if (!current.some((p) => p.semana === poll.semana)) {
      problems.push(`No se puede añadir una votación para la semana ${poll.semana}: ya empezó o terminó. Elige una semana futura.`);
    }
  }
  return problems;
}

/** Forma y referencias de una lista. Devuelve el valor normalizado (p. ej. con `tipo` por defecto) o los errores. */
export function checkList(key: ListKey, value: unknown, ctx: ListContext): { value: unknown[] } | { errors: string[] } {
  const parsed = LIST_SCHEMAS[key].safeParse(value);
  if (!parsed.success) {
    return { errors: [...new Set(parsed.error.issues.map((issue) => `Fila ${typeof issue.path[0] === 'number' ? issue.path[0] + 1 : '?'}: ${issue.message}`))] };
  }
  const data = parsed.data as unknown[];
  let errors: string[] = [];
  switch (key) {
    case 'news':
      errors = crossCheckNews(data as NewsEntry[], ctx.slugs);
      break;
    case 'polls':
      errors = [...lockedPollProblems(data as CuratedPoll[], ctx.currentPolls, ctx.now), ...crossCheckPolls(data as CuratedPoll[], ctx.slugs, ctx.fighterSlugs, ctx.sealedSlugs, ctx.now)];
      break;
    case 'videos':
      errors = crossCheckVideoLinks(data as VideoLink[], ctx.slugs, ctx.knownVideoIds);
      break;
    case 'storyOrder':
      errors = crossCheckStoryOrder(data as StoryOrderEntry[], ctx.universeKeys, ctx.canalIds);
      break;
    case 'startHere':
      errors = crossCheckStartHere(data as string[], ctx.slugs, ctx.sealedSlugs);
      break;
    case 'navigation':
      errors = navigationProblems(data as NavGroup[], ctx.slugs);
      break;
  }
  return errors.length ? { errors: [...new Set(errors.map(plain))] } : { value: data };
}
