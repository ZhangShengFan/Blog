import { json, isAuthenticated, type Env } from '../auth/_utils';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAuthenticated(request, env))) return json({ error: 'Unauthorized' }, 401);
  const payload = await request.json().catch(() => ({}));
  return json({ ok: true, received: payload });
};
