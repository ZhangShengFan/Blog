import { json, isAuthenticated, type Env } from './auth/_utils';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAuthenticated(request, env))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return json({ error: 'Missing file' }, 400);
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return json({ error: 'File too large' }, 400);
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const base64 = btoa(String.fromCharCode(...bytes));
  const dataUrl = `data:${file.type || 'application/octet-stream'};base64,${base64}`;

  return json({ url: dataUrl, name: file.name, size: file.size });
};
