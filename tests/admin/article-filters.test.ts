import { test } from 'node:test';
import assert from 'node:assert/strict';
import { articleBadges, countByState, filterArticles, isStateFilter } from '../../src/features/admin/lib/article-filters.ts';

const base = { universe: 'Colosos', sealed: false, hasDraft: false } as const;
const texts = (article: Parameters<typeof articleBadges>[0]) => articleBadges(article).map((b) => b.text);

test('articleBadges: etiquetas en llano para cada estado', () => {
  assert.deepEqual(texts({ ...base, status: 'archivo' }), ['Sin cambios']);
  assert.deepEqual(texts({ ...base, status: 'archivo', hasDraft: true }), ['Borrador pendiente']);
  assert.deepEqual(texts({ ...base, status: 'publicada' }), ['Editada']);
  assert.deepEqual(texts({ ...base, status: 'publicada', hasDraft: true, sealed: true }), ['Editada', 'Borrador pendiente', 'Sellada']);
  assert.deepEqual(texts({ ...base, status: 'nueva', hasDraft: true, sealed: true }), ['Nueva, sin publicar', 'Sellada']);
  assert.deepEqual(texts({ ...base, status: 'borrada', hasDraft: true }), ['Retirada']);
});

test('filterArticles y countByState: estado y universo combinados', () => {
  const list = [
    { ...base, slug: 'a', status: 'archivo' as const },
    { ...base, slug: 'b', status: 'publicada' as const, hasDraft: true },
    { ...base, slug: 'c', status: 'nueva' as const, hasDraft: true, sealed: true, universe: 'Ellos Llegaron' },
    { ...base, slug: 'd', status: 'borrada' as const, hasDraft: true, sealed: true },
  ];
  assert.deepEqual(filterArticles(list, { state: 'borrador' }).map((a) => a.slug), ['b', 'c']);
  assert.deepEqual(filterArticles(list, { state: 'sellada' }).map((a) => a.slug), ['c']);
  assert.deepEqual(filterArticles(list, { state: 'retirada' }).map((a) => a.slug), ['d']);
  assert.deepEqual(filterArticles(list, { universe: 'Colosos' }).map((a) => a.slug), ['a', 'b', 'd']);
  assert.deepEqual(filterArticles(list, { state: 'borrador', universe: 'Colosos' }).map((a) => a.slug), ['b']);
  assert.deepEqual(countByState(list), { '': 4, borrador: 2, nueva: 1, editada: 1, sellada: 1, retirada: 1 });
  assert.equal(isStateFilter('editada'), true);
  assert.equal(isStateFilter('rara'), false);
});
