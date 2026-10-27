import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { WikiArticle, WikiFrontmatter } from '../../src/core/types/wiki.ts';
import type { HeroPoolEntry } from '../../src/features/marketing/config/hero-pool.ts';
import { heroEntry, pickHeroCreature, resolveHeroSlug } from '../../src/features/marketing/lib/hero-pick.ts';

const art = (slug: string, fm: Partial<WikiFrontmatter> = {}): WikiArticle => ({
  slug,
  content: 'cuerpo',
  frontmatter: { title: slug, universe: 'Colosos', image: `/assets/${slug}.webp`, ...fm },
});

/** Lo que hace `coverOf` en la app, sin React: sin imagen o con una de marca no hay portada. */
const hasCover = (src?: string) => !!src && !src.includes('/assets/Branding/');

const ARTICLES = [
  art('the-bloop', { imagePosition: '30% 70%' }),
  art('el-gran-maja'),
  art('sin-imagen', { image: undefined }),
  art('de-marca', { image: '/assets/Branding/logo.webp' }),
  art('sellada', { status: 'proximamente' }),
  art('bogbo'),
  art('fuera-del-pool'),
];

const e = (slug: string, extra: Partial<HeroPoolEntry> = {}): HeroPoolEntry => ({ slug, ...extra });
const pool = (...slugs: string[]) => slugs.map((s) => e(s));

const POOL = pool('the-bloop', 'el-gran-maja', 'bogbo');
const slugOf = (p: readonly HeroPoolEntry[], rand: number) =>
  pickHeroCreature(p, ARTICLES, rand, hasCover)?.creature.slug;

test('pool vacío → null', () => {
  assert.equal(pickHeroCreature([], ARTICLES, 0.5, hasCover), null);
});

test('sin candidatos válidos → null', () => {
  assert.equal(pickHeroCreature(pool('no-existe', 'sin-imagen', 'de-marca', 'sellada'), ARTICLES, 0.5, hasCover), null);
});

test('descarta slugs inexistentes, sin portada (falta o de marca) y sellados; el orden es el del pool', () => {
  const p = pool('no-existe', 'bogbo', 'sin-imagen', 'the-bloop', 'de-marca', 'sellada', 'el-gran-maja');
  assert.equal(slugOf(p, 0), 'bogbo');
  assert.equal(slugOf(p, 0.5), 'the-bloop');
  assert.equal(slugOf(p, 0.999), 'el-gran-maja');
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

test('un slug repetido en el pool no pesa doble (cuenta la primera entrada)', () => {
  // Sin repetidos: [the-bloop, bogbo] → 0.6 · 2 = 1.2 → bogbo (con repetidos saldría the-bloop).
  assert.equal(slugOf(pool('the-bloop', 'the-bloop', 'bogbo'), 0.6), 'bogbo');
  const twice = [e('bogbo', { image: '/a.webp' }), e('bogbo', { image: '/b.webp' })];
  assert.equal(pickHeroCreature(twice, ARTICLES, 0.9, hasCover)?.image, '/a.webp');
});

test('sin toma propia: la portada y el encuadre de la ficha (o el centro); devuelve el resumen, sin content', () => {
  const pick = pickHeroCreature(pool('the-bloop'), ARTICLES, 0, hasCover);
  assert.deepEqual(pick, {
    creature: { slug: 'the-bloop', frontmatter: ARTICLES[0].frontmatter },
    image: '/assets/the-bloop.webp',
    imagePosition: '30% 70%',
  });
  assert.equal(pick !== null && 'content' in pick.creature, false);
  assert.equal(pickHeroCreature(pool('bogbo'), ARTICLES, 0, hasCover)?.imagePosition, '50% 50%');
});

test('la toma propia y su encuadre mandan sobre los de la ficha', () => {
  const pick = pickHeroCreature(
    [e('the-bloop', { image: '/assets/hero/bloop.webp', imagePosition: '50% 40%' })],
    ARTICLES,
    0,
    hasCover,
  );
  assert.equal(pick?.image, '/assets/hero/bloop.webp');
  assert.equal(pick?.imagePosition, '50% 40%');
  // Toma propia sin encuadre: el de la ficha.
  assert.equal(
    pickHeroCreature([e('the-bloop', { image: '/assets/hero/bloop.webp' })], ARTICLES, 0, hasCover)?.imagePosition,
    '30% 70%',
  );
});

test('la toma propia rescata una ficha sin portada, pero una toma de marca no cuenta', () => {
  assert.equal(slugOf([e('sin-imagen', { image: '/assets/hero/sin-imagen.webp' })], 0), 'sin-imagen');
  assert.equal(slugOf([e('de-marca', { image: '/assets/hero/de-marca.webp' })], 0), 'de-marca');
  assert.equal(slugOf([e('bogbo', { image: '/assets/Branding/logo.webp' })], 0), undefined);
  // Una toma propia no desella una ficha.
  assert.equal(slugOf([e('sellada', { image: '/assets/hero/sellada.webp' })], 0), undefined);
});

test('heroEntry: la primera entrada con ese slug, o undefined', () => {
  const p = [e('bogbo', { image: '/a.webp' }), e('bogbo', { image: '/b.webp' })];
  assert.equal(heroEntry(p, 'bogbo')?.image, '/a.webp');
  assert.equal(heroEntry(p, 'the-bloop'), undefined);
});

test('resolveHeroSlug: solo un slug del pool, recortado; si no, undefined', () => {
  assert.equal(resolveHeroSlug(POOL, 'bogbo'), 'bogbo');
  assert.equal(resolveHeroSlug(POOL, '  bogbo '), 'bogbo');
  assert.equal(resolveHeroSlug(POOL, 'fuera-del-pool'), undefined);
  assert.equal(resolveHeroSlug(POOL, ''), undefined);
  assert.equal(resolveHeroSlug(POOL, undefined), undefined);
});
