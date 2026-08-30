import { Env, getPasswordHash, getRepo, getToken, isAuthenticated, json } from './_utils';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const hash = await getPasswordHash(env);
  const authenticated = hash ? await isAuthenticated(request, env) : false;
  const hasToken = !!(await getToken(env));
  const repo = (await getRepo(env)) || '';
  return json({ ok: true, initialized: !!hash, authenticated, hasToken, repo });
};
