import { createClient } from 'redis';
import pg from 'pg';

export class TokenStore {
  async save(record) {
    throw new Error('Not implemented');
  }

  async findByHash(tokenHash) {
    throw new Error('Not implemented');
  }

  async revokeByHash(tokenHash, { revokedAt, rotatedToJti } = {}) {
    throw new Error('Not implemented');
  }
}

export class InMemoryTokenStore extends TokenStore {
  constructor() {
    super();
    this.records = new Map();
  }

  async save(record) {
    this.records.set(record.tokenHash, { ...record });
  }

  async findByHash(tokenHash) {
    return this.records.get(tokenHash) || null;
  }

  async revokeByHash(tokenHash, { revokedAt, rotatedToJti } = {}) {
    const existing = this.records.get(tokenHash);
    if (!existing) return;
    this.records.set(tokenHash, {
      ...existing,
      revokedAt: revokedAt || new Date().toISOString(),
      rotatedToJti: rotatedToJti || existing.rotatedToJti || null
    });
  }
}

export class RedisTokenStore extends TokenStore {
  constructor(redisUrl) {
    super();
    this.client = createClient({ url: redisUrl });
    this.ready = this.client.connect();
  }

  async save(record) {
    await this.ready;
    const key = this.#key(record.tokenHash);
    const ttlSeconds = Math.max(1, Math.floor((new Date(record.expiresAt).getTime() - Date.now()) / 1000));
    await this.client.set(key, JSON.stringify(record), { EX: ttlSeconds });
  }

  async findByHash(tokenHash) {
    await this.ready;
    const value = await this.client.get(this.#key(tokenHash));
    return value ? JSON.parse(value) : null;
  }

  async revokeByHash(tokenHash, { revokedAt, rotatedToJti } = {}) {
    await this.ready;
    const existing = await this.findByHash(tokenHash);
    if (!existing) return;
    const updated = {
      ...existing,
      revokedAt: revokedAt || new Date().toISOString(),
      rotatedToJti: rotatedToJti || existing.rotatedToJti || null
    };
    await this.client.set(this.#key(tokenHash), JSON.stringify(updated), { EX: 60 * 60 * 24 });
  }

  #key(hash) {
    return `refresh:${hash}`;
  }
}

export class PostgresTokenStore extends TokenStore {
  constructor(databaseUrl) {
    super();
    this.pool = new pg.Pool({ connectionString: databaseUrl });
    this.ready = this.#ensureTable();
  }

  async #ensureTable() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        jti TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        rotated_to_jti TEXT,
        created_at TIMESTAMPTZ NOT NULL,
        ip TEXT,
        ua TEXT
      );
    `);
  }

  async save(record) {
    await this.ready;
    await this.pool.query(
      `
      INSERT INTO refresh_tokens (token_hash, user_id, jti, expires_at, revoked_at, rotated_to_jti, created_at, ip, ua)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (token_hash) DO UPDATE SET
        revoked_at = EXCLUDED.revoked_at,
        rotated_to_jti = EXCLUDED.rotated_to_jti
      `,
      [
        record.tokenHash,
        record.userId,
        record.jti,
        record.expiresAt,
        record.revokedAt,
        record.rotatedToJti,
        record.createdAt,
        record.ip,
        record.ua
      ]
    );
  }

  async findByHash(tokenHash) {
    await this.ready;
    const { rows } = await this.pool.query(
      `SELECT * FROM refresh_tokens WHERE token_hash = $1`,
      [tokenHash]
    );
    if (rows.length === 0) return null;
    return mapRow(rows[0]);
  }

  async revokeByHash(tokenHash, { revokedAt, rotatedToJti } = {}) {
    await this.ready;
    await this.pool.query(
      `UPDATE refresh_tokens SET revoked_at = $2, rotated_to_jti = $3 WHERE token_hash = $1`,
      [tokenHash, revokedAt || new Date().toISOString(), rotatedToJti || null]
    );
  }
}

function mapRow(row) {
  return {
    tokenHash: row.token_hash,
    userId: row.user_id,
    jti: row.jti,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    rotatedToJti: row.rotated_to_jti,
    createdAt: row.created_at,
    ip: row.ip,
    ua: row.ua
  };
}
