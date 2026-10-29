import { strict as assert } from 'node:assert';
import pg from 'pg';
import { databaseSettings } from '../src/database/database-settings.ts';

Deno.test('separate database credentials preserve special characters and override URL credentials', () => {
  const password = 'p@ss:#/%!ą';
  const settings = databaseSettings({
    DATABASE_URL: 'postgres://old:old@localhost:5432/vermont?user=old&password=old&application_name=vermont',
    DATABASE_LOGIN: 'vermont', DATABASE_PASSWORD: password,
  });
  assert.ok(settings);
  const client = new pg.Client(settings);
  assert.equal(client.user, 'vermont');
  assert.equal(client.password, password);
  assert.equal(client.database, 'vermont');
  assert.equal(client.host, 'localhost');
  assert.equal(client.port, 5432);
  assert.equal(new URL(settings.connectionString!).searchParams.get('application_name'), 'vermont');
});

Deno.test('full database URL stays compatible when separate credentials are absent or blank', () => {
  for (const extra of [{}, { DATABASE_LOGIN: '', DATABASE_PASSWORD: '' }]) {
    const settings = databaseSettings({ DATABASE_URL: 'postgres://legacy:pass@localhost:5432/legacy', ...extra });
    assert.ok(settings);
    const client = new pg.Client(settings);
    assert.equal(client.user, 'legacy');
    assert.equal(client.password, 'pass');
  }
});

Deno.test('missing address, invalid protocol and incomplete separate credentials are rejected', () => {
  for (const env of [
    {}, { DATABASE_URL: 'invalid' }, { DATABASE_URL: 'https://localhost/db' },
    { DATABASE_URL: 'postgres://localhost' },
    { DATABASE_URL: 'postgres://localhost/vermont', DATABASE_LOGIN: 'vermont' },
    { DATABASE_URL: 'postgres://localhost/vermont', DATABASE_PASSWORD: 'secret' },
  ]) assert.equal(databaseSettings(env), undefined);
});
