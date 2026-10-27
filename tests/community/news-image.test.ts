import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newsImage, type NewsArticleRef } from '../../src/features/community/lib/news-image.ts';

const ARTICLES = new Map<string, NewsArticleRef>([
  [
    'la-hecatombe-del-lapeon',
    { frontmatter: { image: '/assets/Hecatombe/portada.webp', imagePosition: '50% 20%', category: 'Historia' } },
  ],
  ['sin-imagen', { frontmatter: { category: 'Coloso' } }],
]);

const THUMB = (id: string) => `https://i.ytimg.com/vi/${id}/sddefault.jpg`;

test('enlace a una ficha: su imagen, su encuadre y su categoría', () => {
  const expected = { image: '/assets/Hecatombe/portada.webp', imagePosition: '50% 20%', category: 'Historia' };
  assert.deepEqual(newsImage({ enlace: '/wiki/la-hecatombe-del-lapeon' }, ARTICLES), expected);
  assert.deepEqual(newsImage({ enlace: '/wiki/la-hecatombe-del-lapeon#origen' }, ARTICLES), expected);
  assert.deepEqual(newsImage({ enlace: '/wiki/la-hecatombe-del-lapeon?x=1' }, ARTICLES), expected);
});

test('ficha sin imagen: solo la categoría, para el placeholder', () => {
  const result = newsImage({ enlace: '/wiki/sin-imagen' }, ARTICLES);
  assert.equal(result.image, undefined);
  assert.equal(result.category, 'Coloso');
});

test('enlace interno que no es una ficha (o ficha inexistente): sin imagen', () => {
  for (const enlace of ['/wiki/arena', '/wiki/no-existe', '/comunidad', '/', '/wiki']) {
    assert.deepEqual(newsImage({ enlace }, ARTICLES), {}, enlace);
  }
});

test('YouTube en sus cuatro formas: miniatura del vídeo', () => {
  const cases: [string, string][] = [
    ['https://www.youtube.com/watch?v=vRVFd7LfTTs', 'vRVFd7LfTTs'],
    ['https://youtube.com/watch?v=vRVFd7LfTTs&t=30s', 'vRVFd7LfTTs'],
    ['https://youtu.be/vRVFd7LfTTs?si=abc', 'vRVFd7LfTTs'],
    ['https://www.youtube.com/shorts/XurjKHinBIY', 'XurjKHinBIY'],
    ['https://m.youtube.com/live/hedUAqopPBg?feature=share', 'hedUAqopPBg'],
  ];
  for (const [enlace, id] of cases) {
    assert.deepEqual(newsImage({ enlace }, ARTICLES), { image: THUMB(id) }, enlace);
  }
});

test('YouTube sin id de vídeo válido (o host ajeno): sin imagen', () => {
  for (const enlace of [
    'https://youtube.com/@borisaoblois',
    'https://www.youtube.com/watch?v=corto',
    'https://www.youtube.com/playlist?list=PL1234567890',
    'https://youtu.be/',
    'https://example.com/watch?v=vRVFd7LfTTs',
  ]) {
    assert.deepEqual(newsImage({ enlace }, ARTICLES), {}, enlace);
  }
});
