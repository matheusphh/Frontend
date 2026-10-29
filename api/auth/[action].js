const { sql } = require('@vercel/postgres');
const { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } = require('node:crypto');

const iterations = 310_000;

function passwordHash(password, salt = randomBytes(16)) {
  const digest = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  return `pbkdf2_sha256$${iterations}$${salt.toString('hex')}$${digest.toString('hex')}`;
}

function verifyPassword(password, stored) {
  try {
    const [algorithm, rounds, saltHex, expectedHex] = stored.split('$');
    if (algorithm !== 'pbkdf2_sha256') return false;
    const expected = Buffer.from(expectedHex, 'hex');
    const actual = pbkdf2Sync(password, Buffer.from(saltHex, 'hex'), Number(rounds), expected.length, 'sha256');
    return expected.length === actual.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function json(response, status, payload) {
  response.setHeader('Cache-Control', 'no-store');
  return response.status(status).json(payload);
}

async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at BIGINT NOT NULL
  )`;
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return json(response, 405, { message: 'Método não permitido.' });
  }

  const action = request.query?.action || new URL(request.url).pathname.split('/').filter(Boolean).pop();
  if (action !== 'register' && action !== 'login') {
    return json(response, 404, { message: 'Rota não encontrada.' });
  }

  let payload;
  try {
    if (Buffer.byteLength(JSON.stringify(request.body ?? {})) > 16_384) {
      return json(response, 413, { message: 'A requisição excede o tamanho permitido.' });
    }
    payload = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('invalid_json');
  } catch {
    return json(response, 400, { message: 'Requisição JSON inválida.' });
  }

  try {
    await ensureSchema();

    if (action === 'register') {
      const name = typeof payload.name === 'string' ? payload.name.trim() : '';
      const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
      const password = payload.password;
      if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return json(response, 400, { message: 'Informe nome e e-mail válidos.' });
      }
      if (typeof password !== 'string' || password.length < 8 || password.length > 256) {
        return json(response, 400, { message: 'A senha deve ter entre 8 e 256 caracteres.' });
      }
      try {
        const result = await sql`
          INSERT INTO users (name, email, password_hash)
          VALUES (${name}, ${email}, ${passwordHash(password)})
          RETURNING id, name, email
        `;
        return json(response, 201, result.rows[0]);
      } catch (error) {
        if (error.code === '23505') return json(response, 409, { message: 'Este e-mail já está cadastrado.' });
        throw error;
      }
    }

    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const password = payload.password;
    const result = await sql`SELECT id, name, email, password_hash FROM users WHERE email = ${email} LIMIT 1`;
    const user = result.rows[0];
    if (!user || typeof password !== 'string' || !verifyPassword(password, user.password_hash)) {
      return json(response, 401, { message: 'E-mail ou senha inválidos.' });
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    await sql`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (${tokenHash}, ${user.id}, ${expiresAt})`;
    return json(response, 200, {
      accessToken: token,
      refreshToken: token,
      user: { id: Number(user.id), name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    return json(response, 500, { message: 'Erro interno do servidor.' });
  }
};
