import { Env, clearSession, clearSessionCookie, json } from './_utils';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  await clearSession(request, env);
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
};
