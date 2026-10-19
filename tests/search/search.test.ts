import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEntityIndex } from '../../src/core/search/entity-index.ts';
import { compareDiscovery } from '../../src/core/search/discovery-order.ts';
import { levenshtein, search, suggest } from '../../src/core/search/search.ts';

const art = (slug: string, title: string, extra: Record<string, unknown> = {}) => ({
  slug,
  frontmatter: { title, universe: 'Colosos', category: 'Coloso', image: '/assets/x.webp', ...extra },
});

const { entries } = buildEntityIndex([
  art('the-bloop', 'The Bloop Ojo Solo', { stats: {} }),
  art('phillip-forte', 'Phillip Forte', { category: 'Humano' }),
  art('vlad-julia', 'Vlad Julia', { aliases: ['el pez cangrejo'], stats: {} }),
  art('capitan-de-galeon', 'Capitán de Galeón', { category: 'Historia', universe: 'Capitán de Galeón' }),
  art('humanos-colosos', 'Humanos del Universo Colosos', { category: 'Directorio', description: 'Encabezados por Phillip Forte.' }),
  art('labodotype', 'Labodotype macrostoma', { category: 'Especie' }),
  art('cael-cortes', 'Cael Cortés', { category: 'Humano', status: 'proximamente' }),
  art('cael', 'Cael', { category: 'Humano' }),
  art('el-gran-maja', 'El Gran Majá', { aliases: ['Cranioplanus', 'anguila sonriente'] }),
  art('le-mug', "Le'Mug", { category: 'Titán' }),
  art('vehiculos', 'Vehículos y Tecnología', { category: 'Directorio' }),
  art('destello', 'El Destello de los Colosos', { category: 'Historia' }),
]);

const slugs = (q: string) => search(q, entries).map((h) => h.entry.slug);

test('levenshtein', () => {
  assert.equal(levenshtein('philip', 'phillip'), 1);
  assert.equal(levenshtein('blopu', 'bloop'), 2);
});

test('levenshtein con max: sale antes cuando las longitudes ya difieren en más de max', () => {
  assert.equal(levenshtein('bloop', 'bloopbloopbloop', 2), 3);
  assert.equal(levenshtein('a'.repeat(1000), 'b', 1), 2);
  // Dentro del margen sigue siendo la distancia real; sin max no cambia nada.
  assert.equal(levenshtein('philip', 'phillip', 1), 1);
  assert.equal(levenshtein('blopu', 'bloop', 2), 2);
  assert.equal(levenshtein('bloop', 'bloopbloopbloop'), 10);
});

test('palabras en cualquier orden', () => {
  assert.equal(slugs('bloop solo')[0], 'the-bloop');
  assert.equal(slugs('solo bloop')[0], 'the-bloop');
});

test('errata de una letra en palabras de 5 o más', () => {
  assert.equal(slugs('philip')[0], 'phillip-forte');
  assert.equal(slugs('bloup')[0], 'the-bloop');
});

test('apodo con matchedAlias', () => {
  const [hit] = search('cangrejo', entries);
  assert.equal(hit.entry.slug, 'vlad-julia');
  assert.equal(hit.matchedAlias, 'el pez cangrejo');
});

test('tildes y orden: la ficha va antes que el directorio', () => {
  assert.equal(slugs('galeon')[0], 'capitan-de-galeon');
  assert.deepEqual(slugs('phillip').slice(0, 2), ['phillip-forte', 'humanos-colosos']);
});

test('una palabra vacía sola no descarta todo', () => {
  assert.ok(slugs('la').includes('labodotype'));
});

test('título exacto primero; los Próximamente detrás de su grupo', () => {
  assert.equal(slugs('cael')[0], 'cael');
  assert.equal(slugs('cael c')[0], 'cael-cortes'); // 80 (el título empieza por la consulta) > 60
  const humanos = slugs('humano'); // directorio por título (60) y luego tres por categoría (10)
  assert.equal(humanos[0], 'humanos-colosos');
  assert.equal(humanos.at(-1), 'cael-cortes');
});

test('consulta vacía: orden por riqueza', () => {
  const all = slugs('');
  assert.equal(all.at(-1), 'cael-cortes');
  assert.equal(all.length, entries.length);
});

test('suggest para lo que la búsqueda no encuentra', () => {
  assert.equal(search('blopu', entries).length, 0);
  assert.deepEqual(suggest('blopu', entries), { slug: 'the-bloop', title: 'The Bloop Ojo Solo' });
  assert.equal(suggest('zzzz', entries), null);
});

test('suggest no inventa sugerencias con palabras cortas o vacías del título', () => {
  // "y" (título "Vehículos y Tecnología") está a distancia 2 de "xyz"; "de"/"los" lo están de "dos".
  assert.equal(suggest('xyz', entries), null);
  assert.equal(suggest('dos', entries), null);
  // las palabras de menos de 4 letras ("mug" de Le'Mug) no son candidatas; el título entero sí
  assert.equal(suggest('mugg', entries), null);
  assert.deepEqual(suggest('lemuk', entries), { slug: 'le-mug', title: "Le'Mug" });
  assert.deepEqual(suggest('blopu', entries), { slug: 'the-bloop', title: 'The Bloop Ojo Solo' });
});

test('suggest: la distancia máxima crece con la longitud de la consulta', () => {
  // 3 letras: distancia 1 como mucho. "cael" -> "cal" es 1; "cael" -> "dal" es 2.
  assert.deepEqual(suggest('cal', entries), { slug: 'cael', title: 'Cael' });
  assert.equal(suggest('dal', entries), null);
});

test('los títulos con apóstrofo se encuentran por sus partes', () => {
  for (const q of ['le mug', 'mug', 'le']) {
    const [hit] = search(q, entries);
    assert.equal(hit.entry.slug, 'le-mug', q);
    assert.ok(hit.score >= 60, `${q}: ${hit.score}`);
  }
  assert.equal(search("Le'Mug", entries)[0].score, 100);
});

test('apodo por prefijo: 50 con matchedAlias', () => {
  const [hit] = search('cranio', entries);
  assert.equal(hit.entry.slug, 'el-gran-maja');
  assert.equal(hit.score, 50);
  assert.equal(hit.matchedAlias, 'Cranioplanus');
});

test('tier 40: todos los tokens entre el título y los apodos combinados', () => {
  const [hit] = search('cranioplanus sonriente', entries);
  assert.equal(hit.entry.slug, 'el-gran-maja');
  assert.equal(hit.score, 40);
  assert.equal(hit.matchedAlias, 'Cranioplanus'); // el primer apodo que aportó un token

  // una errata en uno de los tokens resta 5
  const [typo] = search('cranioplanos sonriente', entries);
  assert.equal(typo.entry.slug, 'el-gran-maja');
  assert.equal(typo.score, 35);

  // título + apodo: el apodo que aporta es el que casa el token que el título no cubre
  const [mix] = search('gran sonriente', entries);
  assert.equal(mix.entry.slug, 'el-gran-maja');
  assert.equal(mix.score, 40);
  assert.equal(mix.matchedAlias, 'anguila sonriente');
});

test('una errata puntúa estrictamente menos que el acierto exacto de la misma ficha', () => {
  const typo = search('philip', entries).find((h) => h.entry.slug === 'phillip-forte')!;
  const exact = search('phillip', entries).find((h) => h.entry.slug === 'phillip-forte')!;
  assert.ok(typo.score > 0);
  assert.ok(typo.score < exact.score, `${typo.score} < ${exact.score}`);

  // misma banda (todos los tokens en el título): la errata resta 5 al acierto exacto
  const typoInBand = search('forte philip', entries).find((h) => h.entry.slug === 'phillip-forte')!;
  const exactInBand = search('forte phillip', entries).find((h) => h.entry.slug === 'phillip-forte')!;
  assert.equal(exactInBand.score, 60);
  assert.equal(typoInBand.score, 55);
});

test('las palabras vacías de la consulta se ignoran: "el pez" y "pez" dan la misma ficha por apodo', () => {
  const withStop = search('el pez', entries)[0];
  const without = search('pez', entries)[0];
  assert.equal(withStop.entry.slug, 'vlad-julia');
  assert.equal(without.entry.slug, 'vlad-julia');
  assert.equal(withStop.matchedAlias, 'el pez cangrejo');
  assert.equal(without.matchedAlias, 'el pez cangrejo');
  // "de" no aparece en la ficha: solo casa si se ignora
  assert.equal(search('de pez', entries)[0].entry.slug, 'vlad-julia');
});

test('limit recorta los resultados, también limit: 0', () => {
  assert.equal(search('', entries, { limit: 3 }).length, 3);
  assert.equal(search('cael', entries, { limit: 1 }).length, 1);
  assert.equal(search('', entries, { limit: 0 }).length, 0);
  assert.equal(search('cael', entries, { limit: 0 }).length, 0);
  assert.equal(search('', entries).length, entries.length);
});

test('compareDiscovery usa la richness precalculada antes que la calculada', () => {
  const stub = { title: 'Zzz', status: 'proximamente' as const, richness: 50 };
  const full = { title: 'Aaa', stats: {} };
  assert.ok(compareDiscovery(stub, full) < 0); // sin override el stub iría detrás (-100)
  const boosted = entries.map((e) => (e.slug === 'cael-cortes' ? { ...e, richness: 99 } : e));
  assert.equal(search('', boosted)[0].entry.slug, 'cael-cortes');
});
