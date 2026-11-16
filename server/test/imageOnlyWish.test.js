import test from 'node:test';
import assert from 'node:assert/strict';
import Campaign from '../src/models/Campaign.js';
import Wish from '../src/models/Wish.js';
import { createWish } from '../src/controllers/officerController.js';

test('creates an image-based wish without a text wishlist', async (t) => {
  t.mock.method(Campaign, 'findById', async () => ({ _id: 'campaign', name: 'Holiday 2026', status: 'active' }));
  t.mock.method(Wish, 'exists', async () => false);
  let created;
  t.mock.method(Wish, 'create', async (data) => {
    created = data;
    return { ...data, populate: async () => {} };
  });
  let status;
  let response;
  const res = { status(value) { status = value; return this; }, json(value) { response = value; } };
  await createWish({
    body: { campaignId: 'campaign', nickname: 'Joy', partnerFoundation: 'Partner', childProfile: { worksheetImage: 'data:image/png;base64,aGVsbG8=' } },
    user: { name: 'Officer' }
  }, res);
  assert.equal(status, 201);
  assert.deepEqual(created.wishItems, []);
  assert.equal(response.wish.childProfile.worksheetImage, 'data:image/png;base64,aGVsbG8=');
});
