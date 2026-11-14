import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EDITOR_TOUR, presentSteps, TOURS, tourSeenKey, tourSelector } from '../../src/features/admin/lib/panel-tours.ts';

const source = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('presentSteps: quita los pasos cuyo elemento no está y conserva los centrados', () => {
  const steps = [{ title: 'Hola', description: 'a' }, { target: 'barra', title: 'B', description: 'b' }, { target: 'arena', title: 'C', description: 'c' }];
  assert.deepEqual(
    presentSteps(steps, (target) => target === 'barra').map((s) => s.title),
    ['Hola', 'B'],
  );
});

test('tourSeenKey y tourSelector', () => {
  assert.equal(tourSeenKey({ id: 'editor-ficha', version: 2 }), 'wb-panel-tour:editor-ficha:v2');
  assert.equal(tourSelector('ficha-lateral'), '[data-tour="ficha-lateral"]');
});

test('TOURS: cada recorrido está bajo su id', () => {
  for (const [key, tour] of Object.entries(TOURS)) assert.equal(key, tour.id);
});

test('recorrido del editor: cada paso señala algo que existe en la página de la ficha', () => {
  const page = source('src/features/admin/components/editor/ArticleEditor.tsx') + source('src/app/(admin)/admin/(panel)/fichas/[slug]/page.tsx');
  for (const step of EDITOR_TOUR.steps) {
    if (!step.target) continue;
    assert.ok(page.includes(`data-tour="${step.target}"`) || page.includes(`tour="${step.target}"`), `falta data-tour="${step.target}"`);
  }
  const targets = EDITOR_TOUR.steps.flatMap((step) => (step.target ? [step.target] : []));
  assert.equal(new Set(targets).size, targets.length, 'sin pasos repetidos');
});

test('recorrido del editor: empieza y acaba centrado, y los textos no llevan HTML (driver.js usa innerHTML)', () => {
  assert.equal(EDITOR_TOUR.steps[0].target, undefined);
  assert.equal(EDITOR_TOUR.steps.at(-1)!.target, undefined);
  for (const step of EDITOR_TOUR.steps) {
    assert.doesNotMatch(`${step.title} ${step.description}`, /[<>&]/);
    assert.ok(step.description.length <= 320, `«${step.title}» es demasiado largo para un globo`);
  }
});
