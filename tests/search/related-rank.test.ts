import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEntityIndex } from '../../src/core/search/entity-index.ts';
import { buildMentionGraph } from '../../src/core/search/mention-graph.ts';
import { rankRelated } from '../../src/core/search/related-rank.ts';

test('buildMentionGraph: menciones y enlaces a mano en ambos sentidos', () => {
  const arts = [
    { slug: 'phillip', frontmatter: { title: 'Phillip Forte', universe: 'C', category: 'Humano' }, content: 'Lidera DELIRIUM.' },
    { slug: 'delirium', frontmatter: { title: 'DELIRIUM', universe: 'C', category: 'Organización' }, content: 'Dirigida por Phillip Forte.' },
    { slug: 'bogbo', frontmatter: { title: 'Bogbo', universe: 'C', category: 'Coloso' }, content: 'Ver [ficha](/wiki/delirium).' },
  ];
  const g = buildMentionGraph(arts, buildEntityIndex(arts));
  assert.deepEqual([...g.out.get('phillip')!], ['delirium']);
  assert.deepEqual([...g.in.get('delirium')!].sort(), ['bogbo', 'phillip']);
  assert.deepEqual([...g.in.get('phillip')!], ['delirium']);
});

const graph = {
  out: new Map([['phillip', new Set(['delirium', 'maja', 'ipcaro'])]]),
  in: new Map([['phillip', new Set(['delirium', 'maja', 'bogbo'])]]),
};
const base = {
  slug: 'phillip',
  graph,
  siblings: ['cael', 'animales'],
  sameCategory: ['cael'],
  sameUniverse: ['bloop', 'animales', 'vlad'],
  isDirectory: (s: string) => s === 'animales',
  isStub: (s: string) => s === 'cael',
};

test('orden: mutuas → salientes → entrantes → menú → categoría → universo', () => {
  assert.deepEqual(rankRelated({ ...base, max: 10 }), ['delirium', 'maja', 'ipcaro', 'bogbo', 'bloop', 'vlad', 'cael']);
});

test('curated va primero y se respeta el límite después de mover los stubs', () => {
  assert.deepEqual(rankRelated({ ...base, curated: ['vlad'], max: 3 }), ['vlad', 'delirium', 'maja']);
});

test('sin directorios ni la propia ficha', () => {
  const r = rankRelated({ ...base, siblings: ['phillip', 'animales'], max: 10 });
  assert.ok(!r.includes('animales') && !r.includes('phillip'));
});
