import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { exportJWK, calculateJwkThumbprint, importPKCS8, importSPKI } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { buildAuditEntry, generateRefreshToken, sha256Base64Url } from '@central-auth/shared';
import { config, assertConfig } from './config.js';
import { loadOrCreateKeys } from './keys.js';
import { InMemoryTokenStore, PostgresTokenStore, RedisTokenStore } from './tokenStore.js';
import { findUserById, validateUser } from './userStore.js';
import { issueAccessToken } from './tokens.js';

assertConfig();

const app = express();
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin) return callback(null, false);
    if (config.allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  }
};

app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false
});

function originGuard(req, res, next) {
  const origin = req.get('origin');
  if (!origin || !config.allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  return next();
}

const tokenStore = config.redisUrl
  ? new RedisTokenStore(config.redisUrl)
  : config.databaseUrl
    ? new PostgresTokenStore(config.databaseUrl)
    : new InMemoryTokenStore();

const { privateKey: privatePem, publicKey: publicPem } = await loadOrCreateKeys();
const privateKey = await importPKCS8(privatePem, 'RS256');
const publicKey = await importSPKI(publicPem, 'RS256');
const publicJwk = await exportJWK(publicKey);
const kid = await calculateJwkThumbprint(publicJwk);
publicJwk.kid = kid;
publicJwk.use = 'sig';
publicJwk.alg = 'RS256';

function buildCookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
    domain: config.cookieDomain,
    path: '/'
  };
}

function logAudit(event, { userId, ip, ua }) {
  const entry = buildAuditEntry({ event, userId, ip, ua });
  console.log(JSON.stringify(entry));
}

async function issueRefreshToken({ userId, ip, ua }) {
  const jti = uuidv4();
  const refreshToken = generateRefreshToken(jti);
  const tokenHash = sha256Base64Url(refreshToken);
  const expiresAt = new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000).toISOString();
  const record = {
    tokenHash,
    userId,
    jti,
    expiresAt,
    revokedAt: null,
    rotatedToJti: null,
    createdAt: new Date().toISOString(),
    ip,
    ua
  };
  await tokenStore.save(record);
  return { refreshToken, record };
}


function extractRefreshToken(req) {
  return req.cookies['__Secure-rt'];
}

function clearRefreshCookie(res) {
  res.clearCookie('__Secure-rt', buildCookieOptions());
}

app.post('/login', originGuard, limiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const user = await validateUser(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const { refreshToken } = await issueRefreshToken({
    userId: user.id,
    ip: req.ip,
    ua: req.get('user-agent')
  });

  res.cookie('__Secure-rt', refreshToken, buildCookieOptions());
  logAudit('login', { userId: user.id, ip: req.ip, ua: req.get('user-agent') });
  return res.json({ ok: true });
});

app.post('/refresh', originGuard, limiter, async (req, res) => {
  const refreshToken = extractRefreshToken(req);
  if (!refreshToken) {
    return res.status(401).json({ error: 'Missing refresh token' });
  }

  const tokenHash = sha256Base64Url(refreshToken);
  const record = await tokenStore.findByHash(tokenHash);
  if (!record || record.revokedAt) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    await tokenStore.revokeByHash(tokenHash, { revokedAt: new Date().toISOString() });
    return res.status(401).json({ error: 'Refresh token expired' });
  }

  const user = await findUserById(record.userId);
  if (!user) {
    await tokenStore.revokeByHash(tokenHash, { revokedAt: new Date().toISOString() });
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'User not found' });
  }

  const { refreshToken: newRefreshToken, record: newRecord } = await issueRefreshToken({
    userId: record.userId,
    ip: req.ip,
    ua: req.get('user-agent')
  });
  await tokenStore.revokeByHash(tokenHash, { revokedAt: new Date().toISOString(), rotatedToJti: newRecord.jti });

  const accessToken = await issueAccessToken({
    user,
    jti: uuidv4(),
    kid,
    privateKey,
    issuer: config.issuer,
    audience: config.audience
  });

  res.cookie('__Secure-rt', newRefreshToken, buildCookieOptions());
  logAudit('refresh', { userId: record.userId, ip: req.ip, ua: req.get('user-agent') });
  return res.json({ accessToken });
});

app.post('/logout', originGuard, async (req, res) => {
  const refreshToken = extractRefreshToken(req);
  if (refreshToken) {
    const tokenHash = sha256Base64Url(refreshToken);
    await tokenStore.revokeByHash(tokenHash, { revokedAt: new Date().toISOString() });
  }
  clearRefreshCookie(res);
  logAudit('logout', { userId: 'unknown', ip: req.ip, ua: req.get('user-agent') });
  return res.json({ ok: true });
});

app.get('/jwks.json', (req, res) => {
  return res.json({ keys: [publicJwk] });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(config.port, () => {
  console.log(`Auth service listening on port ${config.port}`);
});
