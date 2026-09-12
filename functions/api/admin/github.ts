import { Env, getToken, isAuthenticated, json } from './auth/_utils';

const REPO = 'ZhangShengFan/Blog';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAuthenticated(request, env))) {
    return json({ ok: false, error: '未登录或登录已失效' }, 401);
  }

  const token = await getToken(env);
  if (!token) {
    return json({ ok: false, error: '请先在后台保存 GitHub Token' }, 400);
  }

  const body = await request.json<any>().catch(() => null);
  const path = typeof body?.path === 'string' ? body.path.trim() : '';
  const method = typeof body?.method === 'string' ? body.method.toUpperCase() : 'GET';
  const payload = body?.body ?? null;

  if (!path || /^https?:\/\//i.test(path)) {
    return json({ ok: false, error: '无效的 GitHub API 路径' }, 400);
  }

  const githubResponse = await fetch(`https://api.github.com/repos/${REPO}/${path.replace(/^\/+/, '')}`, {
    method,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'ZSFan-Blog-Admin',
    },
    body: payload === null ? undefined : JSON.stringify(payload),
  });

  const responseText = await githubResponse.text();
  return new Response(responseText, {
    status: githubResponse.status,
    headers: {
      'Content-Type': githubResponse.headers.get('Content-Type') || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};
