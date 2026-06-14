import { json, isAuthenticated, type Env } from '../auth/_utils';
import { readFile } from 'fs/promises';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAuthenticated(request, env))) return json({ error: 'Unauthorized' }, 401);
  const data = await import('../../../../generated/friends.json');
  return json({ friends: data.default || [] });
};
