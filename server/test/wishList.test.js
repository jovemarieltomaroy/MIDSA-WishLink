import test from 'node:test';
import assert from 'node:assert/strict';
import Wish from '../src/models/Wish.js';
import { listWishes } from '../src/controllers/officerController.js';

test('wish log returns lightweight records and campaign-wide foundation options', async (t) => {
  const calls = [];
  t.mock.method(Wish, 'find', filter => {
    calls.push(filter);
    if (filter.status === 'reserved' && filter.reservationExpiresAt) return Promise.resolve([]);
    return {
      select(fields) {
        assert.doesNotMatch(fields, /childProfile|worksheetImage/);
        return { sort() { return { lean: async () => [{ nickname: 'Joy', partnerFoundation: 'A' }] }; } };
      }
    };
  });
  t.mock.method(Wish, 'distinct', async (field, filter) => {
    assert.equal(field, 'partnerFoundation');
    assert.deepEqual(filter, { campaign: 'campaign-1' });
    return ['B', 'A'];
  });
  let response;
  await listWishes({ query: { campaignId: 'campaign-1', status: 'available', foundation: 'A' } }, { json(value) { response = value; } });
  assert.deepEqual(response.foundations, ['A', 'B']);
  assert.equal(response.wishes[0].nickname, 'Joy');
  assert.equal(calls[1].status, 'available');
});
