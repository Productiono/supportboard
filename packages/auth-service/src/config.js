import { getEnvList } from '@central-auth/shared';
import dotenv from 'dotenv';

dotenv.config();

const REQUIRED = ['ISSUER', 'AUDIENCE', 'COOKIE_DOMAIN'];

export const config = {
  port: Number(process.env.PORT || 3000),
  issuer: process.env.ISSUER || 'https://auth.example.com',
  audience: process.env.AUDIENCE || 'your-apis',
  cookieDomain: process.env.COOKIE_DOMAIN || '.example.com',
  cookieSecure: process.env.COOKIE_SECURE !== 'false',
  allowedOrigins: getEnvList(process.env.ALLOWED_ORIGINS),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30),
  redisUrl: process.env.REDIS_URL,
  databaseUrl: process.env.DATABASE_URL,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 50)
};

export function assertConfig() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`Missing env vars: ${missing.join(', ')}. Defaults will be used for dev.`);
  }
}
