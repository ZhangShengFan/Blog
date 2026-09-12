import { Env, createSession, getPasswordHash, json, sessionCookie, sha256, setToken } from './_utils';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const existing = await getPasswordHash(env);
  if (!existing) return json({ ok: false, error: 'PASSWORD_NOT_SET' }, 409);
  const body = await request.json<any>().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';
  const token = typeof body?.token === 'string' ? body.token : '';
  if (!password) return json({ ok: false, error: '请输入密码' }, 400);
  if ((await sha256(password)) !== existing) return json({ ok: false, error: '密码错误，请重试' }, 401);
  if (token && (token.startsWith('ghp_') || token.startsWith('github_pat_'))) {
    await setToken(env, token);
  }
  const sessionToken = await createSession(env);
  return json({ ok: true, authenticated: true }, 200, { 'Set-Cookie': sessionCookie(sessionToken) });
};
