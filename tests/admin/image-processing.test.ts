import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crc32 } from 'node:zlib';
import sharp from 'sharp';
import { ImageRejected, MAX_SIDE, processImage } from '../../src/features/admin/lib/image-processing.ts';
import { isMediaPath } from '../../src/core/content/media-path.ts';

const png = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: { r: 255, g: 115, b: 0 } } }).png().toBuffer();

test('recodifica a WebP con nombre por contenido, y la misma imagen da el mismo nombre', async () => {
  const input = await png(40, 30);
  const a = await processImage(input);
  const b = await processImage(input);
  assert.match(a.filename, /^[a-f0-9]{32}\.webp$/);
  assert.equal(a.filename, b.filename);
  assert.equal((await sharp(a.data).metadata()).format, 'webp');
  assert.deepEqual([a.width, a.height], [40, 30]);
  assert.ok(isMediaPath(`/media/${a.filename}`));
});

test('reduce las imágenes grandes a 2560 px de lado mayor, sin agrandar las pequeñas', async () => {
  const big = await processImage(await png(4000, 1000));
  assert.deepEqual([big.width, big.height], [MAX_SIDE, 640]);
  const small = await processImage(await png(10, 10));
  assert.deepEqual([small.width, small.height], [10, 10]);
});

test('quita los metadatos (EXIF con GPS) y aplica la orientación', async () => {
  const withExif = await sharp({ create: { width: 20, height: 10, channels: 3, background: '#000' } })
    .jpeg()
    .withMetadata({ orientation: 6, exif: { IFD0: { Copyright: 'secreto', Artist: 'GPS 40.4,-3.7' } } })
    .toBuffer();
  assert.ok((await sharp(withExif).metadata()).exif);
  const out = await processImage(withExif);
  const meta = await sharp(out.data).metadata();
  assert.equal(meta.exif, undefined);
  assert.equal(meta.orientation, undefined);
  // Orientación 6 = girada 90°: la imagen guardada queda en vertical.
  assert.deepEqual([out.width, out.height], [10, 20]);
});

test('descarta lo que va escondido detrás de la imagen', async () => {
  const input = Buffer.concat([await png(8, 8), Buffer.from('<script>alert(1)</script>')]);
  const out = await processImage(input);
  assert.equal(out.data.includes(Buffer.from('<script>')), false);
});

test('rechaza SVG, texto, archivos vacíos y bombas de píxeles', async () => {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script></svg>');
  await assert.rejects(processImage(svg), ImageRejected);
  await assert.rejects(processImage(Buffer.from('hola, no soy una imagen')), ImageRejected);
  await assert.rejects(processImage(Buffer.alloc(0)), ImageRejected);
  // PNG pequeño cuya cabecera declara 20 000 × 20 000 px (400 Mpx): así es una «bomba» de descompresión.
  const bomb = Buffer.from(await png(8, 8));
  bomb.writeUInt32BE(20000, 16); // IHDR: ancho
  bomb.writeUInt32BE(20000, 20); // IHDR: alto
  bomb.writeUInt32BE(crc32(bomb.subarray(12, 29)) >>> 0, 29); // CRC del bloque IHDR
  await assert.rejects(processImage(bomb), (error: Error) => error instanceof ImageRejected && /píxeles/.test(error.message));
});

test('isMediaPath: solo /media/<32 hex>.webp', () => {
  for (const ok of ['/media/0123456789abcdef0123456789abcdef.webp']) assert.equal(isMediaPath(ok), true);
  for (const bad of ['/media/../x.webp', '/media/abc.webp', '/media/0123456789abcdef0123456789abcdef.png', '/assets/a.webp', 'media/0123456789abcdef0123456789abcdef.webp']) {
    assert.equal(isMediaPath(bad), false, bad);
  }
});
