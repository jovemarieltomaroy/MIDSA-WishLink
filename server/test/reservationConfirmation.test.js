import test from 'node:test';
import assert from 'node:assert/strict';
import OrganizationSettings from '../src/models/OrganizationSettings.js';
import { sendReservationConfirmation } from '../src/services/notificationService.js';

test('reservation email uses the holiday message with dynamic, escaped wish details', async (t) => {
  const savedEnv = { ...process.env };
  t.after(() => { process.env = savedEnv; });
  process.env.BREVO_API_KEY = 'test';
  process.env.BREVO_SENDER_EMAIL = 'sender@example.com';
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
  t.mock.method(console, 'log', () => {});
  t.mock.method(OrganizationSettings, 'findOne', async () => ({
    contactName: 'MIDSA Holiday Program Team', contactEmail: 'midsapartnerships@gmail.com',
    dropOffLocation: 'MIDSA Designated Drop-off Point'
  }));
  let email;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    email = JSON.parse(options.body);
    return { ok: true, json: async () => ({ messageId: 'test' }) };
  });
  const result = await sendReservationConfirmation({
    nickname: '<Joy>', wishItems: ['Supermeal & drink'],
    reservationExpiresAt: new Date('2026-11-18T09:00:00Z'),
    donor: { email: 'donor@example.com', phoneNumber: '09123456789' }
  });
  assert.equal(result[0].status, 'fulfilled');
  assert.match(email.subject, /You've Made Someone's Holiday Brighter!/);
  assert.match(email.htmlContent, /Holiday Season 2026/);
  assert.match(email.htmlContent, /&lt;Joy&gt;/);
  assert.match(email.htmlContent, /Supermeal &amp; drink/);
  assert.match(email.htmlContent, /November 18, 2026/);
  assert.match(email.htmlContent, /5:00\s*pm/i);
  assert.match(email.htmlContent, /MIDSA Designated Drop-off Point/);
  assert.match(email.htmlContent, /midsapartnerships@gmail.com/);
  assert.match(email.htmlContent, /Warmest holiday wishes!/);
  assert.doesNotMatch(email.htmlContent, /<Joy>/);
});
