import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Pool } from 'pg';
import seed from '../app/portfolio/works.json' with { type: 'json' };
import handler from '../netlify/functions/works.mjs';

// Run only against a dedicated disposable database: this test drops its tables.
test('PostgreSQL initialization, authentication and persistence', { skip: !process.env.TEST_DATABASE_URL }, async () => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  delete process.env.NETLIFY_DATABASE_URL;
  process.env.ADMIN_PASSWORD = 'test-password-not-preview';
  process.env.SESSION_SECRET = 'test-secret-at-least-thirty-two-characters';
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await pool.query('DROP TABLE IF EXISTS portfolio_works, portfolio_meta');
  const base = 'https://example.com/.netlify/functions/works';
  const req = (action = '', method = 'GET', body, cookie, origin = 'https://example.com') => new Request(`${base}${action ? `?action=${action}` : ''}`, {
    method, headers: { origin, 'content-type': 'application/json', ...(cookie ? { cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}),
  });
  try {
    let response = await handler(req('status'));
    assert.deepEqual(await response.json(), { mode: 'database', authConfigured: true });
    response = await handler(req());
    assert.deepEqual((await response.json()).works, seed);
    assert.equal((await handler(req('', 'PUT', { works: [] }))).status, 401);
    assert.equal((await handler(req('login', 'POST', { password: 'preview123' }))).status, 401);
    response = await handler(req('login', 'POST', { password: process.env.ADMIN_PASSWORD }));
    assert.equal(response.status, 200);
    const cookie = response.headers.get('set-cookie').split(';')[0];
    assert.equal((await handler(req('', 'PUT', { works: seed }, cookie, 'https://evil.example'))).status, 403);
    assert.equal((await handler(req('', 'PUT', { works: [{ ...seed[0], image: { ...seed[0].image, src: 'javascript:alert(1)' } }] }, cookie))).status, 400);
    const updated = [{ ...seed[0], year: '2030-01-01' }];
    assert.equal((await handler(req('', 'PUT', { works: updated }, cookie))).status, 200);
    assert.deepEqual((await (await handler(req())).json()).works, updated);
    assert.equal((await handler(req('', 'PUT', { works: [] }, cookie))).status, 200);
    assert.deepEqual((await (await handler(req())).json()).works, []);
  } finally {
    await pool.query('DROP TABLE IF EXISTS portfolio_works, portfolio_meta');
    await pool.end();
  }
});
