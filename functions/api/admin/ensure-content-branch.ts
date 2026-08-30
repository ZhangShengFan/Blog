import { Env, getRepo, getToken, isAuthenticated, json } from './auth/_utils';

async function githubRequest(repo: string, token: string, path: string, method = 'GET', body: any = null) {
  const res = await fetch(`https://api.github.com/repos/${repo}/${path}`, {
    method,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Blog-Admin',
    },
    body: body === null ? undefined : JSON.stringify(body),
  });
  return res;
}

// 确保内容分支（zsfan）存在；如果不存在，则从 main 分支当前的 commit 创建一个新分支，
// 这样 fork 的人首次登录时，会自动把你仓库当时已有的文章/友链原样带过去，不会丢失任何内容。
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAuthenticated(request, env))) {
    return json({ ok: false, error: '未登录或登录已失效' }, 401);
  }
  const token = await getToken(env);
  if (!token) return json({ ok: false, error: '请先在后台保存 GitHub Token' }, 400);
  const repo = await getRepo(env);
  if (!repo) return json({ ok: false, error: '请先在后台设置 GitHub 仓库' }, 400);

  const CONTENT_BRANCH = 'zsfan';

  const checkRes = await githubRequest(repo, token, `git/ref/heads/${CONTENT_BRANCH}`);
  if (checkRes.status === 200) {
    return json({ ok: true, created: false, branch: CONTENT_BRANCH });
  }
  if (checkRes.status !== 404) {
    const errText = await checkRes.text();
    return json({ ok: false, error: `检查内容分支失败: ${errText}` }, 500);
  }

  const mainRefRes = await githubRequest(repo, token, 'git/ref/heads/main');
  if (!mainRefRes.ok) {
    const errText = await mainRefRes.text();
    return json({ ok: false, error: `无法读取 main 分支: ${errText}` }, 500);
  }
  const mainRef = await mainRefRes.json<any>();
  const sha = mainRef?.object?.sha;
  if (!sha) return json({ ok: false, error: 'main 分支状态异常，无法创建内容分支' }, 500);

  const createRes = await githubRequest(repo, token, 'git/refs', 'POST', {
    ref: `refs/heads/${CONTENT_BRANCH}`,
    sha,
  });
  if (!createRes.ok) {
    const errText = await createRes.text();
    return json({ ok: false, error: `创建内容分支失败: ${errText}` }, 500);
  }

  return json({ ok: true, created: true, branch: CONTENT_BRANCH });
};
