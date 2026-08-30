import { Env, isAuthenticated, isInitDone, json, markInitDone } from './auth/_utils';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAuthenticated(request, env))) {
    return json({ ok: false, error: '未登录或登录已失效' }, 401);
  }
  if (await isInitDone(env)) {
    return json({ ok: false, error: '该站点已完成初始化，不能重复执行' }, 409);
  }
  await markInitDone(env);
  return json({ ok: true, initDone: true });
};
