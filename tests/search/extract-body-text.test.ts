import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractBodyText, extractWikiLinks } from '../../src/core/search/extract-body-text.ts';

const MDX = `Phillip Forte lidera DELIRIUM.

<WikiImage src="/x.webp" alt="El Gran Majá" caption="Bogbo de frente" align="right" />

<RegistroDelirium>Informe sobre IPCARO.</RegistroDelirium>

## Conflicto con [The Bloop Ojo Solo](/wiki/the-bloop)

\`\`\`
Bogbo en código
\`\`\`
`;

test('quita JSX con atributos pero conserva los hijos', () => {
  const t = extractBodyText(MDX);
  assert.ok(t.includes('Informe sobre IPCARO.'));
  assert.ok(!t.includes('Bogbo de frente'));
  assert.ok(!t.includes('El Gran Majá'));
});

test('enlaces markdown → su texto; títulos se conservan; código fuera', () => {
  const t = extractBodyText(MDX);
  assert.ok(t.includes('Conflicto con The Bloop Ojo Solo'));
  assert.ok(!t.includes('/wiki/the-bloop'));
  assert.ok(!t.includes('Bogbo en código'));
});

test('extractWikiLinks devuelve los slugs enlazados a mano', () => {
  assert.deepEqual(extractWikiLinks(MDX), ['the-bloop']);
});

test('extractWikiLinks admite sufijos (#ancla, / final, ?query) y descarta lo externo', () => {
  const links = extractWikiLinks(
    '[A](/wiki/the-bloop#anatomia) [B](/wiki/bogbo/) [C](/wiki/el-angel?x=1) [E](/wiki/x-y) [D](https://otro/wiki/no) [F](/wikipedia/foo)',
  );
  assert.deepEqual(links.sort(), ['bogbo', 'el-angel', 'the-bloop', 'x-y']);
});
