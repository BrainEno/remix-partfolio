import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/works.mjs';

test('unconfigured database only exposes preview mode, never accepts writes', async () => {
  delete process.env.DATABASE_URL; delete process.env.NETLIFY_DATABASE_URL;
  for (const method of ['GET', 'PUT', 'POST']) {
    const response = await handler(new Request('https://example.com/.netlify/functions/works', { method }));
    assert.deepEqual(await response.json(), { mode: 'demo' });
  }
});
test('configured but unreachable database fails closed instead of exposing demo', async () => {
  process.env.DATABASE_URL = 'postgresql://invalid:invalid@127.0.0.1:1/invalid?connect_timeout=1';
  const response = await handler(new Request('https://example.com/.netlify/functions/works?action=status'));
  assert.equal(response.status, 503);
  assert.notEqual((await response.json()).mode, 'demo');
  delete process.env.DATABASE_URL;
});
