import crypto from 'node:crypto';

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 10;

export function sha256Base64Url(value) {
  return crypto.createHash('sha256').update(value).digest('base64url');
}

export function randomBase64Url(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function generateRefreshToken(jti) {
  return `${jti}.${randomBase64Url(32)}`;
}

export function buildAuditEntry({ event, userId, ip, ua }) {
  return {
    event,
    userId,
    ip,
    ua,
    timestamp: new Date().toISOString()
  };
}

export function getEnvList(value) {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
