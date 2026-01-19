import { SignJWT } from 'jose';
import { ACCESS_TOKEN_TTL_SECONDS } from '@central-auth/shared';

export async function issueAccessToken({
  user,
  jti,
  kid,
  privateKey,
  issuer,
  audience,
  ttlSeconds = ACCESS_TOKEN_TTL_SECONDS,
  now = Date.now()
}) {
  const issuedAt = Math.floor(now / 1000);
  const expiresAt = issuedAt + ttlSeconds;

  return new SignJWT({ roles: user.roles, scopes: user.scopes || [] })
    .setProtectedHeader({ alg: 'RS256', kid })
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject(user.id)
    .setJti(jti)
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .sign(privateKey);
}
