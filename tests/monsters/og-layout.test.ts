import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clampText,
  coverCrop,
  ogFacts,
  parseObjectPosition,
  titleFontSize,
  UNBOUNDED_EM,
} from '../../src/features/monsters/og/og-layout.ts';

test('ogFacts: Longitud · Amenaza · Peso, en ese orden y sin los que falten', () => {
  assert.deepEqual(ogFacts({ length: 1200, hostility: 9, weight: '20.000 t' }), [
    { label: 'Longitud', value: `${(1200).toLocaleString('es-ES')} m` },
    { label: 'Amenaza', value: 'Extremo', tone: 'red' },
    { label: 'Peso', value: '20.000 t' },
  ]);
  assert.deepEqual(ogFacts({ hostility: 2 }), [{ label: 'Amenaza', value: 'Bajo', tone: 'green' }]);
  assert.deepEqual(ogFacts({ intelligence: 5 }), []);
  // «No determinado» no cuenta como dato.
  assert.deepEqual(ogFacts({ length: 200, weight: 'No determinado' }).map((f) => f.label), ['Longitud']);
  assert.deepEqual(ogFacts(undefined), []);
});

test('titleFontSize: los títulos cortos van grandes y los largos bajan sin partir palabras', () => {
  const short = titleFontSize('Bogbo');
  const long = titleFontSize('Universo Capitán de Galeón: la flota submarina');
  assert.equal(short, 76);
  assert.ok(long < short);
  // Se prefiere un cuerpo menor en dos líneas a uno mayor en tres.
  assert.equal(titleFontSize('La Hecatombe del Lapeón'), 56);
  // La palabra más larga cabe en una línea con el cuerpo elegido.
  for (const word of ['Cranioplanus', 'macrostoma', 'Kaiserosteus']) {
    assert.ok(word.length * titleFontSize(`${word} risus`) * UNBOUNDED_EM <= 600, word);
  }
});

test('clampText: corta en límite de palabra y añade «…»', () => {
  assert.equal(clampText('corto', 50), 'corto');
  const out = clampText('una criatura colosal que emerge de las profundidades del océano Pacífico', 40);
  assert.ok(out.length <= 40);
  assert.ok(out.endsWith('…'));
  assert.ok(!out.includes(' …'));
  assert.equal(clampText('  varios   espacios  ', 50), 'varios espacios');
});

test('parseObjectPosition: porcentajes, palabras clave y valor por defecto', () => {
  assert.deepEqual(parseObjectPosition('50% 12%'), [0.5, 0.12]);
  assert.deepEqual(parseObjectPosition('center top'), [0.5, 0]);
  assert.deepEqual(parseObjectPosition('top'), [0.5, 0]);
  assert.deepEqual(parseObjectPosition('right'), [1, 0.5]);
  assert.deepEqual(parseObjectPosition(undefined), [0.5, 0.3]);
  assert.deepEqual(parseObjectPosition('calc(10px)'), [0.5, 0.3]);
});

test('coverCrop: cubre la caja y respeta el encuadre', () => {
  // Retrato 1500×2000 en una caja 560×630: manda el ancho.
  const crop = coverCrop(1500, 2000, 560, 630, [0.5, 0]);
  assert.equal(crop.resizeWidth, 560);
  assert.ok(crop.resizeHeight >= 630);
  assert.equal(crop.top, 0);
  assert.equal(crop.left, 0);
  const bottom = coverCrop(1500, 2000, 560, 630, [0.5, 1]);
  assert.equal(bottom.top, bottom.resizeHeight - 630);
  // Apaisada 1920×1080: manda el alto y el recorte horizontal se centra.
  const wide = coverCrop(1920, 1080, 560, 630, [0.5, 0.5]);
  assert.equal(wide.resizeHeight, 630);
  assert.equal(wide.left, Math.round((wide.resizeWidth - 560) / 2));
});
