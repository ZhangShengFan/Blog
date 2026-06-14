export interface Env {
  KV: KVNamespace;
}

const PASSWORD_KEY = 'admin:password:v1';
const TOKEN_KEY = 'admin:token:v1';
const SESSION_PREFIX = 'admin:session:';
const SESSION_COOKIE = 'admin_session';
const SESSION_TTL = 60 * 60 * 24 * 30;

export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getPasswordHash(env: Env) {
  return env.KV.get(PASSWORD_KEY);
}

export async function getToken(env: Env) {
  return env.KV.get(TOKEN_KEY);
}

export async function setToken(env: Env, token: string) {
  await env.KV.put(TOKEN_KEY, token);
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

export function getSessionToken(req: Request) {
  const cookie = req.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|; )admin_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export async function isAuthenticated(req: Request, env: Env) {
  const token = getSessionToken(req);
  if (!token) return false;
  return !!(await env.KV.get(`${SESSION_PREFIX}${token}`));
}

export async function createSession(env: Env) {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const token = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  await env.KV.put(`${SESSION_PREFIX}${token}`, '1', { expirationTtl: SESSION_TTL });
  return token;
}

export async function clearSession(req: Request, env: Env) {
  const token = getSessionToken(req);
  if (token) await env.KV.delete(`${SESSION_PREFIX}${token}`);
}

export function sessionCookie(token: string) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
