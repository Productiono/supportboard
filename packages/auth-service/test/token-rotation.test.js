import { test } from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryTokenStore } from '../src/tokenStore.js';
import { generateRefreshToken, sha256Base64Url } from '@central-auth/shared';
import { v4 as uuidv4 } from 'uuid';

function buildRecord({ token }) {
  return {
    tokenHash: sha256Base64Url(token),
    userId: 'user-1',
    jti: token.split('.')[0],
    expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    revokedAt: null,
    rotatedToJti: null,
    createdAt: new Date().toISOString(),
    ip: '127.0.0.1',
    ua: 'test'
  };
}

test('refresh token rotation revokes old token and sets rotatedToJti', async () => {
  const store = new InMemoryTokenStore();
  const oldToken = generateRefreshToken(uuidv4());
  const oldRecord = buildRecord({ token: oldToken });
  await store.save(oldRecord);

  const newToken = generateRefreshToken(uuidv4());
  const newRecord = buildRecord({ token: newToken });
  await store.save(newRecord);

  await store.revokeByHash(oldRecord.tokenHash, {
    revokedAt: new Date().toISOString(),
    rotatedToJti: newRecord.jti
  });

  const stored = await store.findByHash(oldRecord.tokenHash);
  assert.ok(stored.revokedAt);
  assert.equal(stored.rotatedToJti, newRecord.jti);
});
