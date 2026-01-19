import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';

async function startJwksServer(jwk) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (req.url === '/jwks.json') {
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ keys: [jwk] }));
      } else {
        res.statusCode = 404;
        res.end();
      }
    });
    server.listen(0, () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

test('verifyAccessToken validates signature and claims', async () => {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const publicJwk = await exportJWK(publicKey);
  publicJwk.kid = 'test';
  publicJwk.use = 'sig';
  publicJwk.alg = 'RS256';

  const { server, port } = await startJwksServer(publicJwk);

  process.env.ISSUER = 'https://auth.example.com';
  process.env.AUDIENCE = 'your-apis';
  process.env.JWKS_URL = `http://localhost:${port}/jwks.json`;

  const { verifyAccessToken } = await import('../src/auth.js');

  const token = await new SignJWT({ roles: ['user'] })
    .setProtectedHeader({ alg: 'RS256', kid: 'test' })
    .setIssuer(process.env.ISSUER)
    .setAudience(process.env.AUDIENCE)
    .setSubject('user-1')
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(privateKey);

  const payload = await verifyAccessToken(token);
  assert.equal(payload.sub, 'user-1');
  assert.deepEqual(payload.roles, ['user']);

  server.close();
});
