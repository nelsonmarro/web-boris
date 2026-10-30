import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { slugify } from '../../src/utils/slugify.ts';
import {
  ANY_RIVAL,
  CANON_BATTLES,
  CANON_FACTS,
  canonHref,
  type CanonSource,
} from '../../src/features/monsters/config/canon-battles.ts';

/** Cuerpo del MDX sin el marcado de énfasis (`**`, `_`): las citas son el texto que se lee. */
function body(slug: string): string {
  const file = `src/content/${slug}.mdx`;
  assert.ok(existsSync(file), `no existe ${file}`);
  return matter(readFileSync(file, 'utf8')).content.replace(/\*\*|__/g, '').replace(/(^|[\s(])_([^_\n]+)_/g, '$1$2');
}

/** Texto de cada apartado `##` por su `id` (el mismo `slugify` que `rehypeHeadingIds`, sin duplicados en estas fichas). */
function sections(slug: string): Map<string, string> {
  const map = new Map<string, string>();
  let current = '';
  for (const line of body(slug).split('\n')) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      current = slugify(h2[1]);
      map.set(current, '');
    } else if (current) {
      map.set(current, `${map.get(current)}${line}\n`);
    }
  }
  return map;
}

function assertQuoteInSection(quote: string, source: CanonSource) {
  const text = sections(source.slug).get(source.anchor);
  assert.ok(text !== undefined, `${source.slug} no tiene el apartado #${source.anchor}`);
  assert.ok(text.replace(/\s+/g, ' ').includes(quote), `la cita no está literal en ${canonHref(source)}: «${quote}»`);
}

const isFighter = (slug: string) => /^stats:/m.test(readFileSync(`src/content/${slug}.mdx`, 'utf8'));

test('CANON_BATTLES: cita literal en el apartado enlazado, entre combatientes de la Arena', () => {
  assert.ok(CANON_BATTLES.length >= 1);
  for (const battle of CANON_BATTLES) {
    assert.ok(isFighter(battle.a) && isFighter(battle.b), `${battle.a} vs ${battle.b}: ambos deben tener stats`);
    assert.ok(battle.winner === battle.a || battle.winner === battle.b, 'el ganador es uno de los dos');
    assertQuoteInSection(battle.quote, battle.source);
  }
});

test('The Bloop vs El Gran Majá: ganó El Gran Majá', () => {
  const battle = CANON_BATTLES.find((c) => [c.a, c.b].sort().join('|') === 'el-gran-maja|the-bloop');
  assert.ok(battle);
  assert.equal(battle.winner, 'el-gran-maja');
  assert.equal(canonHref(battle.source), '/wiki/the-bloop#el-enigma-de-la-batalla-contra-el-gran-maja');
});

test('CANON_FACTS: cita literal en el apartado enlazado; nunca repiten una batalla', () => {
  for (const fact of CANON_FACTS) {
    assert.ok(isFighter(fact.a), `${fact.a} debe tener stats`);
    if (fact.b !== ANY_RIVAL) {
      assert.ok(isFighter(fact.b), `${fact.b} debe tener stats`);
      assert.ok(!CANON_BATTLES.some((c) => [c.a, c.b].sort().join('|') === [fact.a, fact.b].sort().join('|')));
    }
    assertQuoteInSection(fact.quote, fact.source);
  }
});
