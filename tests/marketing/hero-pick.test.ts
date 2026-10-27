import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { WikiArticle, WikiFrontmatter } from '../../src/core/types/wiki.ts';
import { pickHeroCreature, resolveHeroSlug } from '../../src/features/marketing/lib/hero-pick.ts';

const art = (slug: string, fm: Partial<WikiFrontmatter> = {}): WikiArticle => ({
  slug,
  content: 'cuerpo',
  frontmatter: { title: slug, universe: 'Colosos', image: `/assets/${slug}.webp`, ...fm },
});

/** Lo que hace `coverOf` en la app, sin React: sin imagen o con una de marca no hay portada. */
const hasCover = (src?: string) => !!src && !src.includes('/assets/Branding/');

const ARTICLES = [
  art('the-bloop'),
  art('el-gran-maja'),
  art('sin-imagen', { image: undefined }),
  art('de-marca', { image: '/assets/Branding/logo.webp' }),
  art('sellada', { status: 'proximamente' }),
  art('bogbo'),
  art('fuera-del-pool'),
];

const POOL = ['the-bloop', 'el-gran-maja', 'bogbo'];
const slugOf = (pool: readonly string[], rand: number) => pickHeroCreature(pool, ARTICLES, rand, hasCover)?.slug;

test('pool vacío → null', () => {
  assert.equal(pickHeroCreature([], ARTICLES, 0.5, hasCover), null);
});

test('sin candidatos válidos → null', () => {
  assert.equal(pickHeroCreature(['no-existe', 'sin-imagen', 'de-marca', 'sellada'], ARTICLES, 0.5, hasCover), null);
});

test('descarta slugs inexistentes, sin portada (falta o de marca) y sellados; el orden es el del pool', () => {
  const pool = ['no-existe', 'bogbo', 'sin-imagen', 'the-bloop', 'de-marca', 'sellada', 'el-gran-maja'];
  assert.equal(slugOf(pool, 0), 'bogbo');
  assert.equal(slugOf(pool, 0.5), 'the-bloop');
  assert.equal(slugOf(pool, 0.999), 'el-gran-maja');
});

test('rand 0 da el primero y 0.999 el último', () => {
  assert.equal(slugOf(POOL, 0), 'the-bloop');
  assert.equal(slugOf(POOL, 0.999), 'bogbo');
});

test('rand fuera de rango se acota: negativo o NaN → primero; 1 o más → último', () => {
  assert.equal(slugOf(POOL, -0.5), 'the-bloop');
  assert.equal(slugOf(POOL, Number.NaN), 'the-bloop');
  assert.equal(slugOf(POOL, 1), 'bogbo');
  assert.equal(slugOf(POOL, 7), 'bogbo');
  assert.equal(slugOf(POOL, Number.POSITIVE_INFINITY), 'bogbo');
});

test('un slug repetido en el pool no pesa doble', () => {
  // Sin repetidos: [the-bloop, bogbo] → 0.6 · 2 = 1.2 → bogbo (con repetidos saldría the-bloop).
  assert.equal(slugOf(['the-bloop', 'the-bloop', 'bogbo'], 0.6), 'bogbo');
});

test('devuelve el resumen (slug + frontmatter), sin content', () => {
  const pick = pickHeroCreature(['the-bloop'], ARTICLES, 0, hasCover);
  assert.deepEqual(pick, { slug: 'the-bloop', frontmatter: ARTICLES[0].frontmatter });
  assert.equal(pick !== null && 'content' in pick, false);
});

test('resolveHeroSlug: solo un slug del pool, recortado; si no, undefined', () => {
  assert.equal(resolveHeroSlug(POOL, 'bogbo'), 'bogbo');
  assert.equal(resolveHeroSlug(POOL, '  bogbo '), 'bogbo');
  assert.equal(resolveHeroSlug(POOL, 'fuera-del-pool'), undefined);
  assert.equal(resolveHeroSlug(POOL, ''), undefined);
  assert.equal(resolveHeroSlug(POOL, undefined), undefined);
});
