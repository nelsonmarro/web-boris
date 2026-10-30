import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SIZE_REFERENCES,
  barPercent,
  creatureSizeEntries,
  formatMeters,
  formatSize,
  parseCanonicalLength,
  withReferences,
  type SizeSource,
} from '../../src/features/monsters/lib/size-references.ts';

const fm = (title: string, extra: Partial<SizeSource['frontmatter']> = {}): SizeSource['frontmatter'] => ({ title, ...extra });
const box = (longitud: string) => ({ 'Información Biológica': { Especie: 'x', Longitud: longitud } });

test('parseCanonicalLength: número y precisión tal como los escribe el canon', () => {
  assert.deepEqual(parseCanonicalLength('675 metros'), { meters: 675, precision: 'exact' });
  assert.deepEqual(parseCanonicalLength('~300 metros'), { meters: 300, precision: 'approx' });
  assert.deepEqual(parseCanonicalLength('alrededor de 300 metros'), { meters: 300, precision: 'approx' });
  assert.deepEqual(parseCanonicalLength('aproximadamente 200 metros'), { meters: 200, precision: 'approx' });
  assert.deepEqual(parseCanonicalLength('500+ metros'), { meters: 500, precision: 'atLeast' });
  assert.deepEqual(parseCanonicalLength('más de 500 metros'), { meters: 500, precision: 'atLeast' });
  assert.deepEqual(parseCanonicalLength('1.200 metros'), { meters: 1200, precision: 'exact' });
  assert.deepEqual(parseCanonicalLength('12,5 m'), { meters: 12.5, precision: 'exact' });
  assert.equal(parseCanonicalLength('No determinado'), null);
  assert.equal(parseCanonicalLength('0 metros'), null);
});

test('las seis fichas del archivo con su longitud canónica (stats + infobox)', () => {
  // Valores de `src/content/*.mdx` a 2026-10-29 (infobox «Longitud» y `stats.length`).
  const articles: SizeSource[] = [
    { slug: 'el-gran-maja', frontmatter: fm('El Gran Majá', { stats: { length: 675 }, infobox: box('675 metros') }) },
    { slug: 'vlad-julia', frontmatter: fm('Vlad Julia', { stats: { length: 500 }, infobox: box('500+ metros') }) },
    { slug: 'bogbo', frontmatter: fm('Bogbo', { stats: { length: 382 }, infobox: box('382 metros') }) },
    { slug: 'the-bloop', frontmatter: fm('The Bloop Ojo Solo', { stats: { length: 351 }, infobox: box('351 metros') }) },
    { slug: 'slowdown-criyonte', frontmatter: fm('Slowdown Criyonte', { stats: { length: 300 }, infobox: box('~300 metros') }) },
    { slug: 'le-mug', frontmatter: fm("Le'Mug", { stats: { length: 200 }, infobox: box('~200 metros') }) },
  ];
  assert.deepEqual(
    creatureSizeEntries(articles).map((e) => `${e.id}:${e.meters}:${e.precision}`),
    [
      'el-gran-maja:675:exact',
      'vlad-julia:500:atLeast',
      'bogbo:382:exact',
      'the-bloop:351:exact',
      'slowdown-criyonte:300:approx',
      'le-mug:200:approx',
    ],
  );
});

test('fuera: selladas, sin longitud válida y las que contradicen su infobox', () => {
  const entries = creatureSizeEntries([
    { slug: 'pequeno', frontmatter: fm('Pequeño', { stats: { length: 200 }, category: 'Titán' }) },
    { slug: 'grande', frontmatter: fm('Grande', { stats: { length: 675 }, image: '/a.webp', imagePosition: '50% 55%' }) },
    { slug: 'sellado', frontmatter: fm('Sellado', { stats: { length: 900 }, status: 'proximamente' }) },
    { slug: 'sin-stats', frontmatter: fm('Sin stats') },
    { slug: 'sin-longitud', frontmatter: fm('Sin longitud', { stats: {} }) },
    { slug: 'cero', frontmatter: fm('Cero', { stats: { length: 0 } }) },
    { slug: 'nan', frontmatter: fm('NaN', { stats: { length: Number.NaN } }) },
    { slug: 'contradice', frontmatter: fm('Contradice', { stats: { length: 400 }, infobox: box('450 metros') }) },
    { slug: 'ilegible', frontmatter: fm('Ilegible', { stats: { length: 400 }, infobox: box('Desconocida') }) },
  ]);
  assert.deepEqual(entries.map((e) => e.id), ['grande', 'pequeno']);
  assert.deepEqual(entries[0], {
    id: 'grande',
    name: 'Grande',
    meters: 675,
    precision: 'exact',
    dimension: 'longitud',
    kind: 'criatura',
    href: '/wiki/grande',
    image: '/a.webp',
    imagePosition: '50% 55%',
    category: undefined,
  });
  assert.equal(entries[1].category, 'Titán');
});

test('las referencias reales están marcadas como reales, con ids que no chocan con slugs', () => {
  assert.equal(SIZE_REFERENCES.length, 5);
  for (const r of SIZE_REFERENCES) {
    assert.equal(r.kind, 'real');
    assert.ok(r.id.startsWith('ref-'));
    assert.equal(r.href, undefined);
  }
  assert.deepEqual(
    SIZE_REFERENCES.map((r) => `${r.id}:${r.meters}:${r.precision}:${r.dimension}`),
    [
      'ref-ballena-azul:30:approx:longitud',
      'ref-titanic:269:exact:eslora',
      'ref-torre-eiffel:330:exact:altura',
      'ref-empire-state:443:exact:altura',
      'ref-burj-khalifa:828:exact:altura',
    ],
  );
});

test('withReferences mezcla y ordena de mayor a menor', () => {
  const creatures = creatureSizeEntries([
    { slug: 'a', frontmatter: fm('A', { stats: { length: 675 } }) },
    { slug: 'b', frontmatter: fm('B', { stats: { length: 200 } }) },
  ]);
  assert.deepEqual(withReferences(creatures).map((e) => e.meters), [828, 675, 443, 330, 269, 200, 30]);
});

test('a igual número, la criatura va antes que la referencia', () => {
  const all = withReferences(creatureSizeEntries([{ slug: 'empate', frontmatter: fm('Empate', { stats: { length: 330 } }) }]));
  const i = all.findIndex((e) => e.id === 'empate');
  assert.equal(all[i + 1].id, 'ref-torre-eiffel');
});

test('barPercent: proporcional al mayor, con mínimo visible y acotado', () => {
  assert.equal(barPercent(828, 828), 100);
  assert.equal(barPercent(414, 828), 50);
  assert.equal(barPercent(1, 828), 1);
  assert.equal(barPercent(1, 828, 2), 2);
  assert.equal(barPercent(2000, 828), 100);
  assert.equal(barPercent(0, 828), 0);
  assert.equal(barPercent(100, 0), 0);
  assert.equal(barPercent(Number.NaN, 828), 0);
});

test('formatMeters / formatSize lo escriben como la fuente', () => {
  assert.equal(formatMeters({ meters: 675, precision: 'exact' }), '675 m');
  assert.equal(formatMeters({ meters: 300, precision: 'approx' }), '≈ 300 m');
  assert.equal(formatMeters({ meters: 500, precision: 'atLeast' }), 'más de 500 m');
  assert.equal(formatSize({ meters: 675, precision: 'exact', dimension: 'longitud' }), '675 m de longitud');
  assert.equal(formatSize({ meters: 269, precision: 'exact', dimension: 'eslora' }), '269 m de eslora');
  assert.equal(formatSize({ meters: 500, precision: 'atLeast', dimension: 'longitud' }), 'más de 500 m de longitud');
});
