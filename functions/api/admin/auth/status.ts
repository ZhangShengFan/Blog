import { Env, getPasswordHash, isAuthenticated, json } from './_utils';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const hash = await getPasswordHash(env);
  const authenticated = hash ? await isAuthenticated(request, env) : false;
  return json({ ok: true, initialized: !!hash, authenticated });
};
