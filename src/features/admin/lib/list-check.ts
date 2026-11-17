/** Comprobaciones de las listas del panel antes de publicar, con mensajes para quien edita. Puro. */
import { parseList, type ListKey, type ListValues } from '../../../core/content/lists.ts';
import type { CuratedPoll } from '../../../core/content/schemas.ts';
import { crossCheckNews, crossCheckPolls, crossCheckStartHere, crossCheckStoryOrder, crossCheckVideoLinks } from '../../../core/content/validate.ts';
import { isoWeekKey } from '../../../core/content/iso-week.ts';
import { navigationProblems } from '../../../core/content/navigation.ts';
import '../../../core/zod-es.ts';

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
  /**
   * Fichas retiradas de la web (por su dirección, con su nombre). En el menú y en «Empieza por aquí» no impiden publicar:
   * la web no las muestra y vuelven a salir donde estaban si se muestran otra vez. Una votación futura con una ficha
   * retirada sí hay que cambiarla, con un aviso que la nombra.
   */
  retired: ReadonlyMap<string, string>;
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

/** Una lista ya comprobada con su clave: el `switch` sobre `key` sabe el tipo de `data`. */
type ParsedList = { [K in ListKey]: { key: K; data: ListValues[K] } }[ListKey];

/** Referencias de una lista ya comprobada (fichas, vídeos, universos y semanas que existan). */
function crossCheck(list: ParsedList, ctx: ListContext): string[] {
  switch (list.key) {
    case 'news':
      return crossCheckNews(list.data, ctx.slugs);
    case 'polls': {
      const generic = crossCheckPolls(list.data, ctx.slugs, ctx.fighterSlugs, ctx.sealedSlugs, ctx.now).filter(
        (message) => ![...ctx.retired.keys()].some((slug) => message.includes(`"${slug}" no existe`)),
      );
      const week = isoWeekKey(ctx.now);
      const retired = list.data.filter((poll) => poll.semana > week).flatMap((poll) =>
        [poll.a, poll.b].filter((slug) => ctx.retired.has(slug)).map((slug) => `La votación de la semana ${poll.semana} usa «${ctx.retired.get(slug)}», que está retirada de la web: vuelve a mostrarla o elige otra ficha.`),
      );
      return [...lockedPollProblems(list.data, ctx.currentPolls, ctx.now), ...retired, ...generic];
    }
    case 'videos':
      return crossCheckVideoLinks(list.data, ctx.slugs, ctx.knownVideoIds);
    case 'storyOrder':
      return crossCheckStoryOrder(list.data, ctx.universeKeys, ctx.canalIds);
    case 'startHere':
      return crossCheckStartHere(list.data.filter((slug) => !ctx.retired.has(slug)), ctx.slugs, ctx.sealedSlugs);
    case 'navigation':
      return navigationProblems(list.data, new Set([...ctx.slugs, ...ctx.retired.keys()]));
  }
}

/** Forma y referencias de una lista. Devuelve el valor normalizado (p. ej. con `tipo` por defecto) o los errores. */
export function checkList<K extends ListKey>(key: K, value: unknown, ctx: ListContext): { value: ListValues[K] } | { errors: string[] } {
  const parsed = parseList(key, value);
  if (!parsed.success) {
    // En el menú, el primer índice es el universo; en el resto de listas, la fila.
    const where = (path: PropertyKey[]) => {
      const n = typeof path[0] === 'number' ? path[0] + 1 : '?';
      if (key !== 'navigation') return `Fila ${n}`;
      const title = Array.isArray(value) ? (value[Number(path[0])] as { title?: unknown } | undefined)?.title : undefined;
      return typeof title === 'string' && title.trim() ? `Universo «${title.trim()}»` : `Universo ${n}`;
    };
    return { errors: [...new Set(parsed.error.issues.map((issue) => `${where(issue.path)}: ${issue.message}`))] };
  }
  const errors = crossCheck({ key, data: parsed.data } as ParsedList, ctx);
  return errors.length ? { errors: [...new Set(errors.map(plain))] } : { value: parsed.data };
}
