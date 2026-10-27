import { connection } from 'next/server';
import type { WikiArticleSummary } from '@/core/types/wiki';
import { getContentRepository } from '@/core/content';
import { coverOf } from '@/components/content/CategoryPlaceholder';
import { HERO_POOL } from '../config/hero-pool';
import { pickHeroCreature, resolveHeroSlug } from '../lib/hero-pick';

const hasCover = (src?: string) => coverOf(src) !== undefined;

/**
 * Expediente que abre la landing (spec 2026-10-27 §4). `connection()` saca la página del prerender: cada visita sortea
 * de nuevo y la imagen elegida viaja ya en el HTML (sin parpadeo). El sorteo vive aquí y no en `HeroAbisal` porque
 * `react-hooks/purity` no admite `Math.random()` durante el render de un componente.
 */
export async function getHeroCreature(): Promise<WikiArticleSummary | null> {
  await connection();
  const articles = await getContentRepository().getArticles();
  // `HERO_FORCE_SLUG=<slug del pool>` fija el expediente para la QA (contraste por imagen, Lighthouse). Es una variable
  // de ejecución: se lee en cualquier entorno, también en `next start`; en producción simplemente no se define.
  const forced = resolveHeroSlug(HERO_POOL, process.env.HERO_FORCE_SLUG);
  return pickHeroCreature(forced ? [forced] : HERO_POOL, articles, Math.random(), hasCover);
}
