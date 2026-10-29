import { Pool } from 'pg';
import { createHmac, timingSafeEqual } from 'node:crypto';
import seed from '../../app/portfolio/works.json' with { type: 'json' };

let pool;
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });
const equal = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
const sign = (value, secret) => createHmac('sha256', secret).update(value).digest('hex');
const databaseUrl = () => process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const configured = () => Boolean(databaseUrl());
let initialization;
async function initialize() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(73288520)');
    await client.query('CREATE TABLE IF NOT EXISTS portfolio_meta (key text PRIMARY KEY)');
    await client.query('CREATE TABLE IF NOT EXISTS portfolio_works (position integer PRIMARY KEY, data jsonb NOT NULL)');
    const result = await client.query("INSERT INTO portfolio_meta (key) VALUES ('seeded_v1') ON CONFLICT DO NOTHING RETURNING key");
    if (result.rowCount) for (const [i, work] of seed.entries()) await client.query('INSERT INTO portfolio_works (position, data) VALUES ($1, $2)', [i, JSON.stringify(work)]);
    await client.query('COMMIT');
  } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}
async function db() {
  pool ??= new Pool({ connectionString: databaseUrl(), max: 2, connectionTimeoutMillis: 8000 });
  // Share schema initialization in a warm function instance; retry after failure.
  initialization ??= initialize().catch(error => { initialization = undefined; throw error; });
  await initialization;
  return pool;
}
function authorized(request) {
  const token = request.headers.get('cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith('portfolio_session='))?.slice(18);
  if (!token || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'preview123' || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) return false;
  const [expires, signature] = token.split('.');
  return Boolean(signature && Number(expires) > Date.now() && equal(signature, sign(expires, process.env.SESSION_SECRET)));
}
function validate(works) {
  const text = (v, max = 300) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
  const localized = v => v && text(v.zh) && text(v.en);
  return Array.isArray(works) && works.length <= 50 && works.every(w => {
    if (!w || !text(w.id, 100) || !text(w.year, 50) || !localized(w.title) || !localized(w.credit) || !w.image || !localized(w.image.alt) || !text(w.image.src, 2000)) return false;
    return /^\/(?![\/\\])/.test(w.image.src) || /^https:\/\//i.test(w.image.src);
  }) && new Set(works.map(w => w.id)).size === works.length;
}
export default async (request) => {
  const action = new URL(request.url).searchParams.get('action') || 'works';
  if (!configured()) {
    if (request.method === 'GET' && (action === 'works' || action === 'status')) return json({ mode: 'demo' });
    return json({ error: 'Database not configured' }, 503);
  }
  try {
    if (action === 'status') { await db(); return json({ mode: 'database', authConfigured: Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD !== 'preview123' && process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32) }); }
    if (request.method === 'GET' && action === 'works') {
      const result = await (await db()).query('SELECT data FROM portfolio_works ORDER BY position');
      return json({ mode: 'database', works: result.rows.map(row => row.data) });
    }
    if (request.method !== 'POST' && request.method !== 'PUT') return json({ error: 'Method not allowed' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Invalid origin' }, 403);
    if (action === 'login' && request.method === 'POST') {
      const password = process.env.ADMIN_PASSWORD, secret = process.env.SESSION_SECRET;
      if (!password || password === 'preview123' || !secret || secret.length < 32) return json({ error: 'Admin credentials are not configured' }, 503);
      const body = await request.json();
      if (typeof body.password !== 'string' || !equal(body.password, password)) return json({ error: 'Invalid password' }, 401);
      const expires = String(Date.now() + 8 * 60 * 60 * 1000);
      return json({ ok: true }, 200, { 'Set-Cookie': `portfolio_session=${expires}.${sign(expires, secret)}; Path=/.netlify/functions/works; HttpOnly; Secure; SameSite=Strict; Max-Age=28800` });
    }
    if (action === 'logout' && request.method === 'POST') return json({ ok: true }, 200, { 'Set-Cookie': 'portfolio_session=; Path=/.netlify/functions/works; HttpOnly; Secure; SameSite=Strict; Max-Age=0' });
    if (action === 'works' && request.method === 'PUT') {
      if (!authorized(request)) return json({ error: 'Unauthorized' }, 401);
      const body = await request.json();
      if (!validate(body.works)) return json({ error: 'Invalid works data' }, 400);
      const client = await (await db()).connect();
      try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(73288520)');
        await client.query('DELETE FROM portfolio_works');
        for (const [i, work] of body.works.entries()) await client.query('INSERT INTO portfolio_works (position, data) VALUES ($1, $2)', [i, JSON.stringify(work)]);
        await client.query('COMMIT');
      } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
      return json({ ok: true });
    }
    return json({ error: 'Not found' }, 404);
  } catch (error) { console.error('Portfolio API error:', error); return json({ error: 'Database or server error. Check Netlify function logs.' }, 503); }
};
