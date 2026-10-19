import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEntityIndex } from '../../src/core/search/entity-index.ts';
import { remarkEntityLinks } from '../../src/utils/remark-entity-links.ts';

const index = buildEntityIndex([
  { slug: 'ipcaro', frontmatter: { title: 'IPCARO', universe: 'Colosos', category: 'Organización' } },
  { slug: 'delirium', frontmatter: { title: 'DELIRIUM', universe: 'Colosos', category: 'Organización' } },
  { slug: 'cael', frontmatter: { title: 'Cael Cortés', universe: 'Colosos', category: 'Humano', status: 'proximamente' } },
]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const run = (tree: any, self?: string) => { remarkEntityLinks({ index, self })(tree); return tree; };
const text = (value: string) => ({ type: 'text', value });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = (...children: any[]) => ({ type: 'paragraph', children });

test('solo la primera mención se enlaza', () => {
  const tree = run({ type: 'root', children: [p(text('IPCARO e IPCARO.'))] });
  const kids = tree.children[0].children;
  assert.equal(kids.filter((k: { type: string }) => k.type === 'link').length, 1);
  assert.equal(kids[0].type, 'link');
  assert.equal(kids[0].url, '/wiki/ipcaro');
  assert.equal(kids[0].data.hProperties['data-entity'], 'ipcaro');
});

test('nada en títulos ni dentro de enlaces existentes', () => {
  const tree = run({ type: 'root', children: [
    { type: 'heading', depth: 2, children: [text('IPCARO')] },
    p({ type: 'link', url: '/x', children: [text('DELIRIUM')] }),
  ] });
  assert.equal(tree.children[0].children[0].type, 'text');
  assert.equal(tree.children[1].children[0].children[0].type, 'text');
});

test('negrita: el enlace queda dentro de strong', () => {
  const tree = run({ type: 'root', children: [p({ type: 'strong', children: [text('DELIRIUM')] })] });
  assert.equal(tree.children[0].children[0].children[0].type, 'link');
});

test('WikiImage se ignora y los Próximamente se marcan', () => {
  const tree = run({ type: 'root', children: [
    { type: 'mdxJsxFlowElement', name: 'WikiImage', attributes: [], children: [p(text('IPCARO'))] },
    p(text('Cael Cortés espera.')),
  ] });
  assert.equal(tree.children[0].children[0].children[0].type, 'text');
  assert.equal(tree.children[1].children[0].data.hProperties['data-entity-pending'], 'true');
});

test('nunca enlaza la propia ficha', () => {
  const tree = run({ type: 'root', children: [p(text('IPCARO.'))] }, 'ipcaro');
  assert.equal(tree.children[0].children[0].type, 'text');
});

test('un enlace escrito a mano gana: no se añade un segundo enlace al mismo destino', () => {
  const tree = run({ type: 'root', children: [
    p({ type: 'link', url: '/wiki/ipcaro', children: [text('la organización')] }, text(' y luego IPCARO y DELIRIUM.')),
  ] });
  const kids = tree.children[0].children;
  const links = kids.filter((k: { type: string }) => k.type === 'link');
  // El manual a ipcaro se conserva y el texto "IPCARO" queda sin enlazar; DELIRIUM sí se enlaza.
  assert.deepEqual(links.map((l: { url: string }) => l.url), ['/wiki/ipcaro', '/wiki/delirium']);
  assert.ok(kids.some((k: { type: string; value?: string }) => k.type === 'text' && k.value?.includes('IPCARO')));
});

test('el enlace manual cuenta aunque aparezca después del texto plano', () => {
  const tree = run({ type: 'root', children: [
    p(text('IPCARO manda.')),
    p({ type: 'link', url: '/wiki/ipcaro#historia', children: [text('ficha')] }),
  ] });
  assert.equal(tree.children[0].children[0].type, 'text');
});

test('HTML escrito a mano en el MDX: ni <a>, ni <code>, ni <pre>, ni h1-h6 se enlazan', () => {
  for (const name of ['a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
    const tree = run({ type: 'root', children: [
      p({ type: 'mdxJsxTextElement', name, attributes: [], children: [text('IPCARO')] }),
    ] });
    assert.equal(tree.children[0].children[0].children[0].type, 'text', `<${name}> no debe contener enlaces`);
  }
});

test('un <a> escrito a mano con texto «IPCARO» no se enlaza, pero la prosa vecina sí', () => {
  const tree = run({ type: 'root', children: [
    p({ type: 'mdxJsxTextElement', name: 'a', attributes: [], children: [text('IPCARO')] }, text(' y DELIRIUM.')),
  ] });
  const kids = tree.children[0].children;
  assert.equal(kids[0].children[0].type, 'text');
  const links = kids.filter((k: { type: string }) => k.type === 'link');
  assert.deepEqual(links.map((l: { url: string }) => l.url), ['/wiki/delirium']);
});
