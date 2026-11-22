import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.js';

const server = createApp().listen(0);
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

test.after(() => new Promise((resolve) => server.close(resolve)));

test('GET /api/health responds without a database connection', async () => {
  const res = await fetch(`${base}/api/health`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.service, 'vtag-api');
  assert.equal(body.demo, true);
});

test('private routes reject unauthenticated requests', async () => {
  const res = await fetch(`${base}/api/owner/vehicles`);
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.error.code, 'UNAUTHORIZED');
});

test('invalid OTP input is rejected by validation middleware', async () => {
  const res = await fetch(`${base}/api/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '123' }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('unknown routes return a JSON 404', async () => {
  const res = await fetch(`${base}/api/does-not-exist`);
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
});
