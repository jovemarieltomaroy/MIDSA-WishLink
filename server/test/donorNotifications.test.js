import test from 'node:test';
import assert from 'node:assert/strict';
import Wish from '../src/models/Wish.js';
import OrganizationSettings from '../src/models/OrganizationSettings.js';
import { releaseExpiredReservations, sendUpcomingDeadlineReminders } from '../src/services/wishService.js';
import { changeStatus } from '../src/controllers/officerController.js';

test('donor lifecycle sends reminders, release notices, and a single intake receipt', async (t) => {
  const oldKey = process.env.BREVO_API_KEY;
  const oldSender = process.env.BREVO_SENDER_EMAIL;
  process.env.BREVO_API_KEY = 'test';
  process.env.BREVO_SENDER_EMAIL = 'sender@example.com';
  t.after(() => {
    if (oldKey === undefined) delete process.env.BREVO_API_KEY; else process.env.BREVO_API_KEY = oldKey;
    if (oldSender === undefined) delete process.env.BREVO_SENDER_EMAIL; else process.env.BREVO_SENDER_EMAIL = oldSender;
  });
  t.mock.method(OrganizationSettings, 'findOne', async () => ({ contactName: 'MIDSA', contactEmail: 'team@example.com', dropOffLocation: 'Office' }));
  const emails = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    emails.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ messageId: 'test' }) };
  });
  const wish = {
    _id: 'wish', nickname: '<Joy>', wishItems: ['Books'], status: 'reserved',
    donor: { email: 'donor@example.com', reservedAt: new Date() },
    reservationExpiresAt: new Date(Date.now() + 3600000), history: [],
    save: async () => {}
  };
  t.mock.method(Wish, 'find', async () => [wish]);
  let claimed = false;
  t.mock.method(Wish, 'findOneAndUpdate', async (filter, update) => {
    assert.equal(filter.status, 'reserved');
    assert.equal(filter.reservationExpiresAt, wish.reservationExpiresAt);
    if (update.$unset) {
      assert.equal(update.$unset.donor, 1);
      assert.equal(update.$set.status, 'available');
      return claimed ? null : (claimed = true, wish);
    }
    return claimed ? null : (claimed = true, wish);
  });
  await sendUpcomingDeadlineReminders();
  await sendUpcomingDeadlineReminders();
  assert.equal(emails.length, 1);
  assert.match(emails[0].htmlContent, /record an extension/);
  assert.match(emails[0].htmlContent, /&lt;Joy&gt;/);
  wish.reservationExpiresAt = new Date(Date.now() + 7200000);
  claimed = false;
  await sendUpcomingDeadlineReminders();
  assert.equal(emails.length, 2);
  claimed = false;
  assert.equal(await releaseExpiredReservations(), 1);
  assert.equal(await releaseExpiredReservations(), 0);
  assert.equal(emails[2].to[0].email, 'donor@example.com');
  assert.match(emails[2].subject, /An Update on Your Holiday Wish Reservation/);
  assert.match(emails[2].htmlContent, /automatically released because the drop-off deadline passed/);
  assert.match(emails[2].htmlContent, /Reservation Status:<\/strong> Released/);
  assert.match(emails[2].htmlContent, /Warmest holiday wishes!/);
  t.mock.method(Wish, 'findById', () => ({ populate: async () => wish }));
  const req = { body: { status: 'granted' }, params: { id: 'wish' }, user: { _id: 'officer', name: 'Officer' } };
  await changeStatus(req, { json() {} });
  await new Promise(resolve => setImmediate(resolve));
  await changeStatus(req, { json() {} });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(emails.length, 4);
  assert.match(emails[3].subject, /drop-off confirmed/);
  assert.match(emails[3].htmlContent, /Thank you/);
  wish.status = 'reserved';
  req.body.status = 'available';
  let releaseResponse;
  await changeStatus(req, { json(value) { releaseResponse = value; } });
  assert.equal(releaseResponse.releaseEmail.status, 'accepted');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(wish.donor, undefined);
  assert.equal(emails.length, 5);
  assert.equal(emails[4].to[0].email, 'donor@example.com');
  assert.match(emails[4].htmlContent, /has been released\./);
  assert.match(emails[4].htmlContent, /Hello, Holiday Giver!/);
  assert.match(emails[4].htmlContent, /Have Questions\?/);
  assert.doesNotMatch(emails[4].htmlContent, /deadline passed/);
  await changeStatus(req, { json() {} });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(emails.length, 5);
  // Provider rejection must be visible while the reservation stays released.
  wish.status = 'reserved';
  wish.donor = { email: 'donor@example.com' };
  globalThis.fetch.mock.mockImplementation(async () => ({
    ok: false, json: async () => ({ message: 'Provider rejected email' })
  }));
  t.mock.method(console, 'error', () => {});
  await changeStatus(req, { json(value) { releaseResponse = value; } });
  assert.equal(releaseResponse.releaseEmail.status, 'failed');
  assert.equal(wish.status, 'available');
  assert.equal(wish.donor, undefined);
  wish.status = 'reserved';
  wish.donor = {};
  await changeStatus(req, { json(value) { releaseResponse = value; } });
  assert.equal(releaseResponse.releaseEmail.status, 'missing_email');
});
