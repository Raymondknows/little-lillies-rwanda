import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlatformAdminHeaders } from './actions.js';

test('buildPlatformAdminHeaders includes the session cookie and fallback header when provided', async () => {
  assert.deepEqual(await buildPlatformAdminHeaders('abc123'), {
    'Content-Type': 'application/json',
    Cookie: 'schoolbase_session=abc123',
    'X-Schoolbase-Session': 'abc123',
  });
});

test('buildPlatformAdminHeaders omits the cookie header when missing', async () => {
  assert.deepEqual(await buildPlatformAdminHeaders(null), {
    'Content-Type': 'application/json',
  });
});
