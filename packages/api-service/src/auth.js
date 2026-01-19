import { createRemoteJWKSet, jwtVerify } from 'jose';
import { config } from './config.js';

const jwksUrl = new URL(config.jwksUrl);
const JWKS = createRemoteJWKSet(jwksUrl);

export async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: config.issuer,
    audience: config.audience
  });
  return payload;
}

export function requireAuth() {
  return async (req, res, next) => {
    try {
      const header = req.get('authorization') || '';
      const [, token] = header.split(' ');
      if (!token) {
        return res.status(401).json({ error: 'Missing token' });
      }
      const payload = await verifyAccessToken(token);
      req.user = payload;
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

export function requireRole(role) {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}
