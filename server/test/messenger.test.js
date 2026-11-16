import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidMessengerUrl } from '../src/utils/messenger.js';
import { isValidMessengerUrl as clientValidate } from '../../client/src/utils/messenger.js';

test('Messenger links validate consistently in settings and browser', () => {
  for (const validate of [isValidMessengerUrl, clientValidate]) {
    for (const url of ['', 'https://m.me/MIDSAOnline', 'https://www.messenger.com/t/12345', 'https://www.facebook.com/messages/t/12345']) assert.equal(validate(url), true, url);
    for (const url of ['09123456789', 'http://m.me/MIDSAOnline', 'javascript:alert(1)', 'https://m.me.evil.com/test', 'https://example.com/test', 'https://m.me', 'https://user:password@m.me/test']) assert.equal(validate(url), false, url);
  }
});
