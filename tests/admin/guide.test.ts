import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { GUIDE_IMAGE_FILE, GUIDE_IMAGE_NAME, guideImageNames, guideImageSrc, guideSections } from '../../src/features/admin/lib/guide.ts';

const root = new URL('../../src/content/panel/', import.meta.url);
const guide = readFileSync(new URL('guia.md', root), 'utf8');

test('guideSections: anclas como las de los títulos (h2 y h3 comparten el contador) y la primera frase de resumen', () => {
  const md = '## Entrar\n\nTu correo y un código.\n\n### Entrar\n\nTexto.\n\n## Imágenes y portada\n\n<Captura nombre="x" />\n\n1. Paso\n\nResumen tardío.\n\n## Entrar\n';
  assert.deepEqual(guideSections(md), [
    { id: 'entrar', title: 'Entrar', summary: 'Tu correo y un código.' },
    { id: 'imagenes-y-portada', title: 'Imágenes y portada', summary: 'Resumen tardío.' },
    { id: 'entrar-3', title: 'Entrar', summary: '' },
  ]);
});

test('el manual: cada sección tiene su frase de resumen para la tarjeta', () => {
  const sections = guideSections(guide);
  assert.ok(sections.length >= 6);
  for (const section of sections) assert.ok(section.summary.length > 0 && section.summary.length <= 120, `«${section.title}» sin resumen corto`);
});

test('el manual: cada captura existe, ninguna sobra y todas llevan texto alternativo', () => {
  const used = guideImageNames(guide);
  const files = readdirSync(new URL('capturas/', root)).filter((file) => !file.startsWith('.'));
  assert.deepEqual([...new Set(used)].sort(), files.map((file) => GUIDE_IMAGE_FILE.exec(file)?.[1]).sort());
  for (const tag of guide.match(/<Captura\s[^>]*\/>/g) ?? []) assert.match(tag, /\balt="[^"]{10,}"/, tag);
});

test('nombres de captura: sin rutas ni extensiones raras', () => {
  assert.ok(GUIDE_IMAGE_NAME.test('nueva-ficha'));
  assert.equal(GUIDE_IMAGE_NAME.test('../secreto'), false);
  assert.equal(GUIDE_IMAGE_FILE.exec('inicio.webp')?.[1], 'inicio');
  for (const bad of ['../guia.md', 'inicio.png', 'a/b.webp', '.webp', 'Inicio.webp', 'inicio.webp.png']) assert.equal(GUIDE_IMAGE_FILE.test(bad), false, bad);
  assert.equal(guideImageSrc('inicio'), '/admin/ayuda/capturas/inicio.webp');
});
