import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = fileURLToPath(new URL('..', import.meta.url));
const POSTS_DIR = path.join(ROOT_DIR, 'posts');
const HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const REQUEST_TIMEOUT_MS = 8000;
const CONCURRENCY = 4;

const stripCodeBlocks = (content) => content.replace(/^(```|~~~)[\s\S]*?^\1\s*$/gm, '');

const collectExternalLinks = () => {
  const links = new Map();
  const files = fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith('.md'));

  files.forEach((filename) => {
    const filePath = path.join(POSTS_DIR, filename);
    const { content } = matter(fs.readFileSync(filePath, 'utf8'));
    const source = stripCodeBlocks(content);
    const patterns = [
      /!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^)]*["'])?\)/g,
      /(?<!!)\[[^\]]+\]\(([^)\s]+)(?:\s+["'][^)]*["'])?\)/g
    ];

    patterns.forEach((pattern) => {
      for (const match of source.matchAll(pattern)) {
        const value = match[1].trim();
        try {
          const url = new URL(value);
          if (HTTP_PROTOCOLS.has(url.protocol) && !links.has(value)) {
            links.set(value, filename);
          }
        } catch {
          // Local and malformed references are handled by check-content.
        }
      }
    });
  });

  return links;
};

const requestLink = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal
    });

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        redirect: 'follow',
        signal: controller.signal
      });
    }

    // 401/403/429 说明服务端可达，只是拒绝自动探测或触发了限流。
    return (response.status >= 200 && response.status < 400) || [401, 403, 429].includes(response.status)
      ? null
      : `HTTP ${response.status}`;
  } catch (error) {
    return error.name === 'AbortError' ? `timeout after ${REQUEST_TIMEOUT_MS}ms` : error.message;
  } finally {
    clearTimeout(timeoutId);
  }
};

const links = Array.from(collectExternalLinks().entries());
const failures = [];
let nextIndex = 0;

const worker = async () => {
  while (nextIndex < links.length) {
    const currentIndex = nextIndex++;
    const [url, filename] = links[currentIndex];
    const error = await requestLink(url);
    if (error) {
      failures.push({ filename, url, error });
    }
  }
};

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, links.length) }, worker));

if (failures.length > 0) {
  console.error(`External link check failed: ${failures.length} link(s)`);
  failures.forEach(({ filename, url, error }) => console.error(`- ${filename}: ${url} (${error})`));
  process.exitCode = 1;
} else {
  console.log(`External link check passed: ${links.length} unique link(s) checked.`);
}
