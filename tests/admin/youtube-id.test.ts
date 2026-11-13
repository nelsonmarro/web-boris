import { test } from 'node:test';
import assert from 'node:assert/strict';
import { youtubeIdFrom } from '../../src/features/admin/lib/youtube-id.ts';

test('youtubeIdFrom: id suelto y enlaces de vídeo, short, youtu.be y embed', () => {
  for (const input of ['hedUAqopPBg', ' https://www.youtube.com/watch?v=hedUAqopPBg&t=3 ', 'https://youtu.be/hedUAqopPBg?si=x', 'https://m.youtube.com/shorts/hedUAqopPBg', 'https://www.youtube-nocookie.com/embed/hedUAqopPBg']) {
    assert.equal(youtubeIdFrom(input), 'hedUAqopPBg', input);
  }
  for (const input of ['', 'hola', 'https://evil.example/watch?v=hedUAqopPBg', 'https://youtube.com/watch?v=corto', 'javascript:alert(1)']) {
    assert.equal(youtubeIdFrom(input), null, input);
  }
});
