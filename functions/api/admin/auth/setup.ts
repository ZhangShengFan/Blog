import { Env, createSession, getPasswordHash, json, sessionCookie, sha256 } from './_utils';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const existing = await getPasswordHash(env);
  if (existing) return json({ ok: false, error: 'PASSWORD_ALREADY_SET' }, 409);
  const body = await request.json<any>().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (password.length < 6) return json({ ok: false, error: '密码至少需要 6 位' }, 400);
  await env.KV.put('admin:password:v1', await sha256(password));
  const token = await createSession(env);
  return json({ ok: true, initialized: true, authenticated: true }, 200, { 'Set-Cookie': sessionCookie(token) });
};
