# Central Auth Monorepo

This monorepo provides a production-ready central authentication service that issues a refresh token cookie shared across subdomains and short-lived JWT access tokens for APIs. It also includes an example API service and a web client demo that exercises the flows.

## Packages

- `packages/auth-service`: Central auth service (Express).
- `packages/api-service`: Example API service with JWT verification middleware.
- `packages/shared`: Shared helpers and constants.
- `packages/web-client-demo`: Minimal browser demo.

## Local Development

### 1) Add hosts entries

Add the following entry to your hosts file (`/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`):

```
127.0.0.1 auth.example.com app1.example.com app2.example.com api1.example.com
```

### 2) Install dependencies

```
npm install
```

If you use pnpm instead of npm, approve build scripts so Vite can run `esbuild`:

```
pnpm approve-builds
```

Select `esbuild` (and any other required build tooling) when prompted.

### 3) Configure environment

Copy the `.env.example` files and adjust as needed:

```
cp packages/auth-service/.env.example packages/auth-service/.env
cp packages/api-service/.env.example packages/api-service/.env
```

By default, cookies are `Secure` and require HTTPS. For local development without TLS, set:

```
COOKIE_SECURE=false
```

### 4) Run all services

```
npm run dev
```

This starts:

- Auth service on `http://auth.example.com:3000`
- API service on `http://api1.example.com:4000`
- Web demo on `http://app1.example.com:3001`

If you want HTTPS locally, use a reverse proxy (e.g. Caddy, Nginx) to terminate TLS and forward to the ports above.

## Auth Service Endpoints

- `POST /login`
  - Body: `{ email, password }`
  - Sets `__Secure-rt` refresh cookie (`Domain=.example.com; HttpOnly; Secure; SameSite=Lax`)
- `POST /refresh`
  - Validates Origin against `ALLOWED_ORIGINS`, rotates refresh token, returns `{ accessToken }`
- `POST /logout`
  - Validates Origin, revokes refresh token, clears cookie
- `GET /jwks.json`
  - Returns JWKS for access token verification

## Token Storage

Refresh tokens are stored **server-side** with a SHA-256 hash only. The auth service selects a store in this order:

1. Redis (`REDIS_URL`)
2. Postgres (`DATABASE_URL`)
3. In-memory (development only)

Refresh tokens are rotated on every `/refresh` call and the previous token is revoked.

## API Service

- `GET /private` requires a valid access token.
- `GET /admin` requires a valid access token with `admin` role.

JWT validation uses the auth service JWKS with issuer/audience checks.

## Web Client Demo

The demo app:

- Calls `POST https://auth.example.com/login`
- Calls `POST https://auth.example.com/refresh` with `credentials: "include"`
- Stores access token in memory (not localStorage)
- Calls the protected API endpoint with `Authorization: Bearer <token>`

## Scripts

- `npm run dev` - start all services
- `npm run lint` - basic syntax checks
- `npm run test` - run Node.js tests

## Security Notes

- Refresh cookies are `HttpOnly`, `Secure`, `SameSite=Lax`, and scoped to `.example.com`.
- Origin validation is enforced on cookie endpoints to mitigate CSRF.
- Access tokens are signed with RS256 and published via JWKS.
- Rate limiting is enabled on `/login` and `/refresh`.
- Audit logging is emitted for login, refresh, and logout events.
