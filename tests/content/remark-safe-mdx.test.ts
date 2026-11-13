import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compile } from '@mdx-js/mdx';
import { isSafeUrl, remarkSafeMdx, type MdxIssue } from '../../src/utils/remark-safe-mdx.ts';

const COMPONENTS = new Set(['WikiImage', 'WikiQuote', 'Proximamente']);

/** Compila MDX real con el plugin y devuelve el JavaScript generado y lo que se quitó. */
async function run(source: string): Promise<{ code: string; issues: string[] }> {
  const issues: MdxIssue[] = [];
  const file = await compile(source, { remarkPlugins: [[remarkSafeMdx, { components: COMPONENTS, onIssue: (issue: MdxIssue) => issues.push(issue) }]] });
  return { code: String(file), issues: issues.map((issue) => issue.message) };
}

test('deja intacto el MDX normal de una ficha', async () => {
  const { code, issues } = await run(
    '## Características\n\nTexto con **negrita** y un [enlace](/wiki/the-bloop).\n\n<WikiImage src="/assets/a.webp" alt="Foto" align="left" />\n\n<Proximamente />\n\n<details><summary>Ver</summary>Más</details>\n',
  );
  assert.deepEqual(issues, []);
  assert.match(code, /WikiImage/);
  assert.match(code, /\/assets\/a\.webp/);
  assert.match(code, /Proximamente/);
  assert.match(code, /details/);
});

test('quita las expresiones, los import y los export (código que se ejecutaría en el servidor)', async () => {
  const { code, issues } = await run(
    'import fs from "node:fs"\n\nexport const robo = 1\n\nHola {process.env.AUTH_SECRET} mundo\n\n{globalThis.process.exit(1)}\n',
  );
  assert.doesNotMatch(code, /node:fs|AUTH_SECRET|process\.exit|robo/);
  assert.match(code, /Hola/);
  assert.equal(issues.length, 2);
});

test('quita los atributos con código y se queda con los literales', async () => {
  const { code, issues } = await run('<WikiImage src={process.env.DATABASE_URL} alt="Foto" {...globalThis} />\n');
  assert.doesNotMatch(code, /DATABASE_URL|globalThis/);
  assert.match(code, /alt: "Foto"/);
  assert.equal(issues.length, 1);
});

test('quita etiquetas y componentes que no están en la lista', async () => {
  const { code, issues } = await run(
    'Antes\n\n<script>alert(1)</script>\n\n<iframe src="https://example.com" />\n\n<style>{"body{}"}</style>\n\n<Desconocido />\n\nDespués\n',
  );
  assert.doesNotMatch(code, /script|alert|iframe|style|Desconocido/);
  assert.match(code, /Antes/);
  assert.match(code, /Después/);
  assert.equal(issues.length, 4);
});

test('quita manejadores de eventos, estilos y direcciones peligrosas', async () => {
  const { code, issues } = await run(
    '<a href="javascript:alert(1)" onclick="alert(2)" style="position:fixed">x</a>\n\n[clic](javascript:alert(3))\n\n![img](data:text/html;base64,AAAA)\n',
  );
  assert.doesNotMatch(code, /javascript:|onclick|position:fixed|data:text/);
  assert.equal(issues.length, 4);
});

test('isSafeUrl: rutas, anclas y esquemas permitidos; el resto no (ni disfrazado con espacios)', () => {
  for (const url of ['/wiki/the-bloop', '#ancla', 'https://youtu.be/x', 'http://a.b', 'mailto:a@b.c', 'tel:+34', '../x', 'wiki:the-bloop'.replace('wiki:', './')]) {
    assert.equal(isSafeUrl(url), true, url);
  }
  for (const url of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', ' java\tscript:alert(1)', 'data:text/html,x', 'vbscript:x', 'file:///etc/passwd']) {
    assert.equal(isSafeUrl(url), false, url);
  }
});
