import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanChildProfile } from '../src/utils/childProfile.js';

test('existing wishes can omit the optional donor profile', () => {
  assert.deepEqual(cleanChildProfile(), { interests: '', otherWishes: '', worksheetImage: '' });
});

test('only donor profile fields are retained and text is trimmed', () => {
  assert.deepEqual(cleanChildProfile({ interests: ' Drawing ', otherWishes: ' Bicycle ', notes: 'private' }), {
    interests: 'Drawing', otherWishes: 'Bicycle', worksheetImage: ''
  });
});

test('accepts inline raster images and rejects remote, SVG, malformed, and oversized images', () => {
  const worksheetImage = 'data:image/png;base64,aGVsbG8=';
  assert.equal(cleanChildProfile({ worksheetImage }).worksheetImage, worksheetImage);
  for (const value of ['https://example.com/image.png', 'data:image/svg+xml;base64,aGVsbG8=', 'data:image/png;base64,<>', 'x'.repeat(850001), {}]) {
    assert.throws(() => cleanChildProfile({ worksheetImage: value }));
  }
});

test('rejects malformed profiles and excessive text', () => {
  for (const value of [null, [], 'profile', { interests: {} }, { otherWishes: 'x'.repeat(4001) }]) {
    assert.throws(() => cleanChildProfile(value));
  }
});
