import test from 'node:test';
import assert from 'node:assert/strict';
import Wish from '../src/models/Wish.js';
import Campaign from '../src/models/Campaign.js';
import { getPublicWishes } from '../src/controllers/publicController.js';
import express from 'express';
import publicRoutes from '../src/routes/publicRoutes.js';

test('gallery limits publication and campaign visibility and omits private fields', async (t) => {
  const campaign = { _id: 'campaign', name: 'Christmas', status: 'active', startDate: new Date(0), deadline: new Date('2099-12-31') };
  const wish = { ornamentCode: 'ABC', nickname: 'Joy', wishItems: ['Books'], status: 'available', campaign, donor: { email: 'private@example.com' }, history: ['private'], partnerFoundation: 'private' };
  let filter;
  let skip;
  let limit;
  t.mock.method(Campaign, 'find', (query) => {
    assert.equal(query.status, 'active');
    assert.ok(query.deadline.$gte instanceof Date);
    return { select: async () => [campaign] };
  });
  t.mock.method(Wish, 'find', (query) => {
    if (query.reservationExpiresAt) return Promise.resolve([]);
    filter = query;
    const chain = {
      select() { return this; }, populate() { return this; }, sort() { return this; },
      skip(value) { skip = value; return this; },
      limit(value) { limit = value; return Promise.resolve([wish]); },
    };
    return chain;
  });
  t.mock.method(Wish, 'countDocuments', async (query) => { assert.deepEqual(query, filter); return 25; });
  let payload;
  await getPublicWishes({ query: { page: '2' } }, { json(value) { payload = value; } });
  assert.equal(filter.isPublished, true);
  assert.deepEqual(filter.campaign, { $in: ['campaign'] });
  assert.deepEqual(filter.status.$in, ['available', 'reserved', 'granted']);
  assert.equal(skip, 24);
  assert.equal(limit, 24);
  assert.equal(payload.pages, 2);
  assert.equal(payload.wishes[0].nickname, 'Joy');
  for (const field of ['donor', 'history', 'partnerFoundation', 'organization', '_id']) assert.equal(field in payload.wishes[0], false);
  const app = express();
  app.use('/api/public', publicRoutes);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/public/wishes?page=1`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.wishes[0].nickname, 'Joy');
    assert.equal(body.page, 1);
    const reserved = await fetch(`http://127.0.0.1:${server.address().port}/api/public/wishes?status=reserved`);
    assert.equal(reserved.status, 200);
    assert.equal(filter.status, 'reserved');
    const invalid = await fetch(`http://127.0.0.1:${server.address().port}/api/public/wishes?status=paused`);
    assert.equal(invalid.status, 200);
    assert.deepEqual(filter.status.$in, ['available', 'reserved', 'granted']);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
