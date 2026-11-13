import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkArticle, checkMdxBody, entityProblems, parseArticleData, standardAgreesWithCheckContent, standardProblems } from '../../src/features/admin/lib/article-check.ts';
import { ARTICLE_CATEGORIES, newArticleData, SECTIONS_BY_CATEGORY } from '../../src/features/admin/lib/article-template.ts';
import type { ArticleData } from '../../src/core/content/overlay.ts';

const COMPONENTS = new Set(['WikiImage', 'Proximamente', 'WikiQuote']);
const complete: ArticleData = {
  frontmatter: {
    title: 'Criatura',
    universe: 'Colosos',
    category: 'Coloso',
    description: 'Un coloso.',
    image: '/assets/x.webp',
    imageCaption: 'Foto',
    infobox: { 'Información Biológica': { Especie: 'X' } },
  },
  content: '## Características\n\nTexto.\n\n## Comportamiento\n\n<Proximamente />\n',
};

test('parseArticleData: acepta una ficha y explica los campos que faltan', () => {
  assert.ok('data' in parseArticleData(complete));
  const bad = parseArticleData({ frontmatter: { universe: 'Colosos' }, content: 'x' });
  assert.ok('errors' in bad && bad.errors.some((message) => message.startsWith('Título:')));
});

test('standardProblems: una ficha completa no tiene problemas; una incompleta los explica', () => {
  assert.deepEqual(standardProblems(complete), []);
  const incomplete = { frontmatter: { title: 'X', universe: 'Colosos', category: 'Coloso', image: '/a.webp' }, content: '## Solo uno\n\n## Referencias\n' };
  const problems = standardProblems(incomplete);
  assert.equal(problems.length, 4);
  assert.ok(problems.some((p) => p.includes('tiene 1')));
});

test('standardProblems: los sellados y los índices no se miden', () => {
  assert.deepEqual(standardProblems({ frontmatter: { title: 'X', universe: 'U', status: 'proximamente' }, content: '' }), []);
  assert.deepEqual(standardProblems({ frontmatter: { title: 'X', universe: 'U', category: 'Directorio' }, content: '' }), []);
});

test('standardProblems coincide con checkArticleStandard (check:content)', () => {
  const variants: ArticleData[] = [
    complete,
    { ...complete, frontmatter: { ...complete.frontmatter, description: ' ' } },
    { ...complete, frontmatter: { ...complete.frontmatter, imageCaption: undefined } },
    { ...complete, frontmatter: { ...complete.frontmatter, infobox: {} } },
    { ...complete, content: '## Uno\n\n## Referencias\n' },
    { ...complete, content: '```\n## falso\n```\n## Uno\n## Dos\n' },
    { ...complete, frontmatter: { ...complete.frontmatter, status: 'proximamente', description: undefined } },
  ];
  for (const variant of variants) assert.ok(standardAgreesWithCheckContent('criatura', variant), JSON.stringify(variant));
});

test('checkMdxBody: explica el MDX roto y lo que el filtro quitaría', async () => {
  assert.deepEqual(await checkMdxBody('## Hola\n\n<WikiImage alt="a" />\n', COMPONENTS), []);
  const broken = await checkMdxBody('Texto <WikiImage alt="a"\n', COMPONENTS);
  assert.equal(broken.length, 1);
  assert.match(broken[0], /línea/);
  const unsafe = await checkMdxBody('{1 + 1}\n\n<script>x</script>\n', COMPONENTS);
  assert.equal(unsafe.length, 2);
});

test('entityProblems: apodos repetidos o iguales a otro título, y relacionados inexistentes', () => {
  const others = [
    { slug: 'the-bloop', title: 'The Bloop', aliases: ['Ojo Solo'] },
    { slug: 'luque', title: 'Luque' },
  ];
  const data = { ...complete, frontmatter: { ...complete.frontmatter, aliases: ['ojo solo', 'Luque'], related: ['the-bloop', 'nada', 'the-bloop', 'nueva'] } };
  const problems = entityProblems('nueva', data, others);
  assert.ok(problems.includes('El apodo «ojo solo» ya lo usa otra ficha.'), problems.join('\n'));
  assert.ok(problems.includes('El apodo «Luque» es el título de la ficha «luque».'));
  assert.ok(problems.includes('La ficha relacionada «nada» no existe.'));
  assert.ok(problems.includes('La ficha relacionada «the-bloop» está repetida.'));
  assert.ok(problems.includes('Una ficha no puede ser relacionada de sí misma.'));
  // Los problemas de otras fichas no se le achacan a esta.
  assert.deepEqual(entityProblems('nueva', complete, [...others, { slug: 'a', title: 'A', related: ['zzz'] }]), []);
});

test('checkArticle: imágenes fuera de la biblioteca o inexistentes, y slug no válido', async () => {
  const data = { ...complete, content: complete.content + '\n<WikiImage src="/assets/no.webp" alt="a" />\n' };
  const result = await checkArticle('Mal Slug', data, { others: [], components: COMPONENTS, assetExists: (p) => p === '/assets/x.webp' });
  assert.ok(result.errors.includes('La dirección de la ficha no es válida.'));
  assert.ok(result.errors.includes('La imagen «/assets/no.webp» no existe.'));
  const external = { ...complete, frontmatter: { ...complete.frontmatter, image: 'https://example.com/a.png' } };
  const outside = await checkArticle('criatura', external, { others: [], components: COMPONENTS, assetExists: () => true });
  assert.ok(outside.errors.some((e) => e.includes('biblioteca')));
  assert.deepEqual((await checkArticle('criatura', complete, { others: [], components: COMPONENTS, assetExists: () => true })).errors, []);
});

test('newArticleData: ficha sellada con los apartados de su tipo', () => {
  const data = newArticleData({ title: 'Nueva', universe: 'Colosos', category: 'Humano' });
  assert.equal(data.frontmatter.status, 'proximamente');
  assert.match(data.content, /## Biografía\n\n<Proximamente \/>/);
  assert.equal(newArticleData({ title: 'I', universe: 'U', category: 'Directorio' }).content, '');
  assert.ok(ARTICLE_CATEGORIES.includes('Coloso') && ARTICLE_CATEGORIES.includes('Directorio'));
  // Cada tipo con plantilla cumple el mínimo de 2 apartados del estándar.
  for (const sections of Object.values(SECTIONS_BY_CATEGORY)) assert.ok(sections.length >= 2);
});
