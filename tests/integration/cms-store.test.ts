/**
 * Escrituras del panel contra un Postgres de verdad (`server/cms-store.ts`): concurrencia por `updatedAt`, publicar,
 * descartar y publicar listas. Solo corren con `TEST_DATABASE_URL`, que debe apuntar a una base desechable y migrada
 * cuyo nombre acabe en `_test` (la vacían de fichas y listas de prueba). En local:
 *   docker compose exec db createdb -U root webboris_test
 *   DATABASE_URL=postgresql://root:rootpassword@localhost:5432/webboris_test npx prisma migrate deploy
 *   TEST_DATABASE_URL=postgresql://root:rootpassword@localhost:5432/webboris_test npm test
 */
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { commitList, discardDraft, NEW_TOKEN, publishDraft, VERSIONS_INCLUDE, versionItems, writeDraft } from '../../src/features/admin/server/cms-store.ts';
import { ARTICLE_KIND, type ArticleData } from '../../src/core/content/overlay.ts';
import { LIST_KIND } from '../../src/core/content/lists.ts';

const url = process.env.TEST_DATABASE_URL;
if (url && !new URL(url).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL debe ser una base desechable cuyo nombre acabe en «_test»: estos tests borran datos.');
}
const skip = url ? false : 'sin TEST_DATABASE_URL (base de pruebas migrada)';

let db: PrismaClient;
let pool: pg.Pool;
let userId = '';
const prefix = `t-${randomBytes(4).toString('hex')}`;
let n = 0;
const slug = () => `${prefix}-${++n}`;
/** `updatedAt` tiene precisión de milisegundos: dos escrituras seguidas en el mismo milisegundo darían la misma marca. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 3));
const data = (title: string): ArticleData => ({ frontmatter: { title, universe: 'Colosos' }, content: `## Características\n\n${title}.\n` });
const doc = (key: string) => db.cmsDocument.findUnique({ where: { kind_key: { kind: ARTICLE_KIND, key } }, include: { versions: true } });

before(async () => {
  if (!url) return;
  pool = new pg.Pool({ connectionString: url });
  db = new PrismaClient({ adapter: new PrismaPg(pool) });
  userId = (await db.user.create({ data: { email: `${prefix}@example.invalid`, name: 'Prueba', role: 'admin' } })).id;
});

after(async () => {
  if (!url) return;
  await db.cmsDocument.deleteMany({ where: { OR: [{ key: { startsWith: prefix } }, { kind: LIST_KIND }] } });
  await db.user.deleteMany({ where: { id: userId } });
  await db.$disconnect();
  await pool.end();
});

test('borrador: crear con «nuevo», guardar con la marca y rechazar marcas viejas o inventadas', { skip }, async () => {
  const key = slug();
  const first = await writeDraft(db, key, data('Uno'), NEW_TOKEN, userId);
  assert.ok(first);
  assert.equal(await writeDraft(db, key, data('Otra vez nuevo'), NEW_TOKEN, userId), null, 'crear dos veces es conflicto');
  await tick();
  const second = await writeDraft(db, key, data('Dos'), first, userId);
  assert.ok(second);
  assert.notEqual(second, first);
  assert.equal(await writeDraft(db, key, data('Vieja'), first, userId), null, 'la marca anterior ya no vale');
  assert.equal(await writeDraft(db, key, data('Basura'), 'no-es-una-fecha', userId), null);
  assert.equal(((await doc(key))!.draft as ArticleData).frontmatter.title, 'Dos');
});

test('dos pestañas con la misma marca: la segunda en guardar recibe conflicto y no pisa a la primera', { skip }, async () => {
  const key = slug();
  const token = (await writeDraft(db, key, data('Base'), NEW_TOKEN, userId))!;
  await tick();
  const [a, b] = [await writeDraft(db, key, data('Pestaña A'), token, userId), await writeDraft(db, key, data('Pestaña B'), token, userId)];
  assert.ok(a);
  assert.equal(b, null);
  assert.equal(((await doc(key))!.draft as ArticleData).frontmatter.title, 'Pestaña A');
});

test('publicar: pasa a lo publicado, vacía el borrador, apunta la versión; con marca vieja no hace nada', { skip }, async () => {
  const key = slug();
  const saved = (await writeDraft(db, key, data('Para publicar'), NEW_TOKEN, userId))!;
  await tick();
  const published = await publishDraft(db, key, data('Para publicar'), saved, userId, '  primera vez  ');
  assert.ok(published);
  const after1 = (await doc(key))!;
  assert.equal(after1.draft, null);
  assert.equal((after1.published as ArticleData).frontmatter.title, 'Para publicar');
  assert.ok(after1.publishedAt);
  assert.equal(after1.versions.length, 1);
  assert.equal(after1.versions[0].note, 'primera vez');

  assert.equal(await publishDraft(db, key, data('Tarde'), saved, userId, ''), null);
  const after2 = (await doc(key))!;
  assert.equal(after2.versions.length, 1, 'la transacción no deja versión huérfana');
  assert.equal((after2.published as ArticleData).frontmatter.title, 'Para publicar');
});

test('publicar una ficha retirada la vuelve a mostrar', { skip }, async () => {
  const key = slug();
  await db.cmsDocument.create({ data: { kind: ARTICLE_KIND, key, deleted: true, updatedById: userId } });
  const token = (await db.cmsDocument.findUniqueOrThrow({ where: { kind_key: { kind: ARTICLE_KIND, key } } })).updatedAt.toISOString();
  await tick();
  const saved = (await writeDraft(db, key, data('De vuelta'), token, userId))!;
  await tick();
  assert.ok(await publishDraft(db, key, data('De vuelta'), saved, userId, ''));
  assert.equal((await doc(key))!.deleted, false);
});

test('descartar: una ficha del panel nunca publicada se elimina; una publicada o de los archivos conserva lo suyo', { skip }, async () => {
  const fresh = slug();
  const t1 = (await writeDraft(db, fresh, data('Nueva'), NEW_TOKEN, userId))!;
  assert.deepEqual(await discardDraft(db, fresh, t1, userId, false), { removed: true });
  assert.equal(await doc(fresh), null);

  const fromFile = slug();
  const t2 = (await writeDraft(db, fromFile, data('Archivo editado'), NEW_TOKEN, userId))!;
  assert.deepEqual(await discardDraft(db, fromFile, t2, userId, true), { removed: false });
  assert.equal((await doc(fromFile))!.draft, null);

  const live = slug();
  const t3 = (await writeDraft(db, live, data('Publicada'), NEW_TOKEN, userId))!;
  await tick();
  const t4 = (await publishDraft(db, live, data('Publicada'), t3, userId, ''))!;
  await tick();
  const t5 = (await writeDraft(db, live, data('Cambio a medias'), t4, userId))!;
  assert.equal(await discardDraft(db, live, t4, userId, false), null, 'marca vieja: conflicto');
  assert.deepEqual(await discardDraft(db, live, t5, userId, false), { removed: false });
  const kept = (await doc(live))!;
  assert.equal(kept.draft, null);
  assert.equal((kept.published as ArticleData).frontmatter.title, 'Publicada');

  assert.equal(await discardDraft(db, slug(), NEW_TOKEN, userId, false), null, 'sin documento no hay nada que descartar');
});

test('listas: publicar con «nuevo» crea el documento, luego con la marca; las marcas viejas son conflicto', { skip }, async () => {
  await db.cmsDocument.deleteMany({ where: { kind: LIST_KIND, key: 'startHere' } });
  const t1 = await commitList(db, userId, 'startHere', ['the-bloop'], NEW_TOKEN, 'primera');
  assert.ok(t1);
  assert.equal(await commitList(db, userId, 'startHere', ['luque'], NEW_TOKEN, null), null);
  await tick();
  const t2 = await commitList(db, userId, 'startHere', ['the-bloop', 'luque'], t1, null);
  assert.ok(t2);
  assert.equal(await commitList(db, userId, 'startHere', ['otra'], t1, null), null);

  const saved = await db.cmsDocument.findUniqueOrThrow({ where: { kind_key: { kind: LIST_KIND, key: 'startHere' } }, include: VERSIONS_INCLUDE });
  assert.deepEqual(saved.published, ['the-bloop', 'luque']);
  assert.equal(saved.updatedAt.toISOString(), t2, 'la marca devuelta es la del documento');
  const history = versionItems(saved.versions);
  assert.deepEqual(history.map((v) => v.note), [null, 'primera']);
  assert.ok(history.every((v) => v.author === 'Prueba' && !v.isDeletion));
});
