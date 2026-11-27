import test from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultExpiry } from '../src/utils/dates.js';

test('reservation deadlines use 5 PM on the fifth Philippine business day', (t) => {
  const originalDays = process.env.DEFAULT_RESERVATION_DAYS;
  process.env.DEFAULT_RESERVATION_DAYS = '5';
  t.after(() => {
    if (originalDays === undefined) delete process.env.DEFAULT_RESERVATION_DAYS;
    else process.env.DEFAULT_RESERVATION_DAYS = originalDays;
  });
  const cases = [
    ['2026-11-08T00:01:00+08:00', '2026-11-13T09:00:00.000Z'],
    ['2026-11-08T22:33:00+08:00', '2026-11-13T09:00:00.000Z'],
    ['2026-12-29T23:59:00+08:00', '2027-01-05T09:00:00.000Z'],
    ['2026-11-27T12:00:00+08:00', '2026-12-04T09:00:00.000Z'],
    ['2026-11-28T12:00:00+08:00', '2026-12-04T09:00:00.000Z']
  ];
  const clock = t.mock.method(Date, 'now');
  for (const [reservedAt, expected] of cases) {
    clock.mock.mockImplementation(() => new Date(reservedAt).getTime());
    assert.equal(getDefaultExpiry().toISOString(), expected);
  }
  clock.mock.mockImplementation(() => new Date('2026-12-29T23:59:00+08:00').getTime());
  const campaignDeadline = '2026-12-31T04:00:00.000Z';
  assert.equal(getDefaultExpiry(campaignDeadline).toISOString(), campaignDeadline);
  assert.equal(getDefaultExpiry('2027-01-02T09:00:00.000Z').toISOString(), '2027-01-01T09:00:00.000Z');
});
