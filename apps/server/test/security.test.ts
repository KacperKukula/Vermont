import { strict as assert } from 'node:assert';
import { hashPassword, verifyPassword, tokenHash } from '../src/password.ts';
import { looksLikeMp3 } from '../src/mp3.ts';
import { credentialsSchema, uploadSchema } from '@vermont/contracts';

Deno.test('passwords are salted and verified', async () => {
  const hash = await hashPassword('a-long-test-password');
  assert.notEqual(hash, await hashPassword('a-long-test-password'));
  assert.equal(await verifyPassword('a-long-test-password', hash), true);
  assert.equal(await verifyPassword('wrong-password', hash), false);
  assert.equal(await verifyPassword('anything', 'broken'), false);
  assert.equal(tokenHash('secret').length, 64);
});

Deno.test('MP3 signatures reject unrelated payloads', () => {
  assert.equal(looksLikeMp3(new TextEncoder().encode('<script>bad</script>')), false);
  assert.equal(looksLikeMp3(new Uint8Array([0x49, 0x44, 0x33, 0x04])), true);
  assert.equal(looksLikeMp3(new Uint8Array([0xff, 0xfb, 0x90, 0x00])), true);
  assert.equal(looksLikeMp3(new Uint8Array([0xff, 0xff, 0xff, 0xff])), false);
  assert.equal(looksLikeMp3(new Uint8Array()), false);
});

Deno.test('contracts normalize email and validate uploads', () => {
  assert.equal(credentialsSchema.parse({ email: ' USER@example.com ', password: 'long-enough-password' }).email, 'user@example.com');
  assert.equal(credentialsSchema.safeParse({ email: 'not-email', password: 'short' }).success, false);
  assert.equal(uploadSchema.safeParse({ title: 'Track', filename: 'file.exe', sizeBytes: 10 }).success, false);
  assert.equal(uploadSchema.safeParse({ title: 'Track', filename: 'file.MP3', sizeBytes: 10 }).success, true);
});
