// Starts the real compiled NestJS server on Deno, without contacting PostgreSQL/R2.
import { spawn } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { once } from 'node:events';
import { setTimeout } from 'node:timers/promises';

const port = 19371;
const child = spawn('deno', ['run', '--allow-env', '--allow-net', '--allow-read', '--allow-sys', 'dist/main.js'], {
  env: {
    ...process.env,
    PORT: String(port),
    CLIENT_ORIGIN: 'http://localhost:5173',
    COOKIE_SECURE: 'false',
    DATABASE_URL: 'postgres://unused:unused@127.0.0.1:1/unused',
    R2_ENDPOINT: 'https://example.invalid',
    R2_BUCKET: 'smoke-test',
    R2_ACCESS_KEY_ID: 'unused',
    R2_SECRET_ACCESS_KEY: 'unused',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
child.stdout.on('data', (data) => { output += data; });
child.stderr.on('data', (data) => { output += data; });
let startupError;
child.on('error', (error) => { startupError = error; });
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (startupError) throw startupError;
    if (child.exitCode !== null) throw new Error(output);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/auth/me`);
      assert.equal(response.status, 401);
      ready = true;
      break;
    } catch { await setTimeout(200); }
  }
  assert.ok(ready, `Deno server failed to start:\n${output}`);
  const request = (path, options) => fetch(`http://127.0.0.1:${port}${path}`, options);
  const info = await request('/');
  assert.equal(info.status, 200);
  assert.deepEqual(await info.json(), { name: 'Fala MP3 API', version: '0.1.0' });
  assert.equal((await request('/api/recordings')).status, 401);
  assert.equal((await request('/api/auth/logout', { method: 'POST' })).status, 403);
  assert.equal((await request('/api/auth/logout', { method: 'POST', headers: { Origin: 'https://evil.invalid' } })).status, 403);
  assert.equal((await request('/api/auth/logout', { method: 'POST', headers: { Origin: 'http://localhost:5173' } })).status, 201);
  assert.equal((await request('/api/auth/register', {
    method: 'POST', headers: { Origin: 'http://localhost:5173', 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'invalid', password: 'short' }),
  })).status, 400);
  assert.equal((await request('/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 401);
  assert.equal((await request('/mcp')).status, 405);
  console.log('Deno/NestJS HTTP smoke test passed (auth, validation, Origin, MCP).');
} finally {
  if (child.exitCode === null && !startupError) {
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  }
}
