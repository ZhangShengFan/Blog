import { Env, createSession, getPasswordHash, json, sessionCookie, sha256, setToken } from './_utils';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const existing = await getPasswordHash(env);
  if (existing) return json({ ok: false, error: 'PASSWORD_ALREADY_SET' }, 409);
  const body = await request.json<any>().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';
  const token = typeof body?.token === 'string' ? body.token : '';
  if (password.length < 6) return json({ ok: false, error: '密码至少需要 6 位' }, 400);
  if (!token || !(token.startsWith('ghp_') || token.startsWith('github_pat_'))) {
    return json({ ok: false, error: '请输入有效的 GitHub Token' }, 400);
  }
  await env.KV.put('admin:password:v1', await sha256(password));
  await setToken(env, token);
  const sessionToken = await createSession(env);
  return json({ ok: true, initialized: true, authenticated: true }, 200, { 'Set-Cookie': sessionCookie(sessionToken) });
};
