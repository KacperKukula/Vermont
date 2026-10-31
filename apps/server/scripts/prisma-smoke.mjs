import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../dist/database/database.service.js';
import { AuthService } from '../dist/auth/auth.service.js';
import { RegisterService } from '../dist/auth/register/register.service.js';
import { LoginService } from '../dist/auth/login/login.service.js';
import { RecordingsService } from '../dist/recordings/recordings.service.js';

const database = new DatabaseService();
const auth = new AuthService(database);
const register = new RegisterService(database);
const login = new LoginService(database);
const prefix = `prisma-test-${randomUUID()}`;
const password = 'Prisma integration test password';
const removedKeys = [];
const storage = {
  upload: async () => 'https://example.invalid/upload',
  playback: async () => 'https://example.invalid/playback',
  head: async () => ({ ContentLength: 128, ContentType: 'audio/mpeg' }),
  prefix: async () => new Uint8Array([0x49, 0x44, 0x33, 0x00]),
  remove: async (key) => { removedKeys.push(key); },
};
const recordings = new RecordingsService(database, storage);

let databaseReady = false;
try {
  await database.client.$queryRaw`SELECT 1`;
  databaseReady = true;
  const email = `${prefix}@example.invalid`;
  const user = await register.register({ email, password });
  const other = await register.register({ email: `${prefix}-other@example.invalid`, password });
  assert.deepEqual(await login.login({ email, password }), user);
  await assert.rejects(register.register({ email, password }), (error) => error.getStatus() === 409);
  await assert.rejects(login.login({ email, password: 'incorrect' }), (error) => error.getStatus() === 401);

  const session = await auth.createSession(user.id);
  assert.deepEqual(await auth.session(session), user);
  await auth.logout(session);
  await assert.rejects(auth.session(session), (error) => error.getStatus() === 401);
  const expired = await auth.createSession(user.id);
  await database.client.session.updateMany({
    where: { userId: user.id }, data: { expiresAt: new Date(0) },
  });
  await assert.rejects(auth.session(expired), (error) => error.getStatus() === 401);

  const upload = await recordings.initiate(user.id, { title: 'Prisma test', filename: 'test.mp3', sizeBytes: 128 });
  assert.deepEqual(await recordings.list(user.id), []);
  await assert.rejects(recordings.complete(other.id, upload.id), (error) => error.getStatus() === 404);
  const completed = await recordings.complete(user.id, upload.id);
  assert.equal(completed.sizeBytes, 128);
  assert.equal(completed.originalFilename, 'test.mp3');
  assert.equal(typeof completed.createdAt, 'string');
  assert.doesNotThrow(() => JSON.stringify(completed));
  assert.equal((await recordings.list(user.id)).length, 1);
  assert.deepEqual(await recordings.list(other.id), []);
  assert.equal((await recordings.playback(user.id, upload.id)).expiresIn, 3600);
  await assert.rejects(recordings.remove(other.id, upload.id), (error) => error.getStatus() === 404);
  assert.equal(removedKeys.length, 0);
  await recordings.remove(user.id, upload.id);
  assert.equal(removedKeys.length, 1);
  assert.deepEqual(await recordings.list(user.id), []);
  console.log('Prisma/Deno database integration passed: accounts, sessions, recordings, ownership, and serialization.');
} catch (error) {
  console.error('Prisma integration failed:', error);
  throw error;
} finally {
  try {
    if (databaseReady) {
      await database.client.user.deleteMany({ where: { email: { startsWith: prefix } } });
    }
  } finally {
    await database.onModuleDestroy();
  }
}
