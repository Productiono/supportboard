import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, jwtVerify } from 'jose';
import { issueAccessToken } from '../src/tokens.js';

test('issueAccessToken sets exp after iat and token verifies', async () => {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const now = 1_700_000_000_000;
  const ttlSeconds = 600;

  const token = await issueAccessToken({
    user: { id: 'user-123', roles: ['user'], scopes: ['read'] },
    jti: 'token-1',
    kid: 'test',
    privateKey,
    issuer: 'https://auth.example.com',
    audience: 'your-apis',
    ttlSeconds,
    now
  });

  const { payload } = await jwtVerify(token, publicKey, {
    issuer: 'https://auth.example.com',
    audience: 'your-apis',
    currentDate: new Date(now)
  });

  assert.equal(payload.sub, 'user-123');
  assert.equal(payload.iat, Math.floor(now / 1000));
  assert.equal(payload.exp, Math.floor(now / 1000) + ttlSeconds);
  assert.ok(payload.exp > payload.iat);
});
