import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = fileURLToPath(new URL('..', import.meta.url));
const POSTS_DIR = path.join(ROOT_DIR, 'posts');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const ALLOWED_POST_FIELDS = new Set([
  'id', 'title', 'excerpt', 'date', 'updatedAt', 'category', 'tags', 'coverImage',
  'draft', 'readTime', 'author', 'authors', 'featured', 'top'
]);
const HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const errors = [];

const report = (file, message) => {
  errors.push(`${path.relative(ROOT_DIR, file)}: ${message}`);
};

const isValidDate = (value) => {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === String(value);
};

const stripCodeBlocks = (content) => content.replace(/^(```|~~~)[\s\S]*?^\1\s*$/gm, '');

const slugify = (value) => value
  .replace(/[`*_~]/g, '')
  .toLocaleLowerCase()
  .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'section';

const validateUrl = (value, file, label, { asset = false } = {}) => {
  const reference = String(value).trim();
  if (!reference || /[\s"'<>]/.test(reference)) {
    report(file, `${label} contains invalid characters: ${reference}`);
    return;
  }

  if (reference.startsWith('data:')) {
    if (asset && reference.startsWith('data:image/')) return;
    report(file, `${label} must be an HTTP(S) URL or a local path`);
    return;
  }

  if (reference.startsWith('/') && !reference.startsWith('//')) {
    if (!asset) return;
    const localPath = reference.split(/[?#]/, 1)[0];
    const resolvedPath = path.join(PUBLIC_DIR, localPath.replace(/^\/+/, ''));
    if (!fs.existsSync(resolvedPath)) {
      report(file, `${label} points to a missing public asset: ${reference}`);
    }
    return;
  }

  try {
    const url = new URL(reference);
    if (!HTTP_PROTOCOLS.has(url.protocol)) {
      report(file, `${label} must use http or https: ${reference}`);
    }
  } catch {
    report(file, `${label} is not a valid URL: ${reference}`);
  }
};

const validateMarkdownReferences = (content, file) => {
  const source = stripCodeBlocks(content);
  for (const match of source.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^)]*["'])?\)/g)) {
    validateUrl(match[1], file, 'image reference', { asset: true });
  }
  for (const match of source.matchAll(/(?<!!)\[[^\]]+\]\(([^)\s]+)(?:\s+["'][^)]*["'])?\)/g)) {
    validateUrl(match[1], file, 'link reference');
  }
};

const validateHeadings = (content, file) => {
  const seen = new Set();
  for (const match of stripCodeBlocks(content).matchAll(/^#{1,3}\s+(.+?)\s*#*\s*$/gm)) {
    const id = slugify(match[1]);
    if (seen.has(id)) {
      report(file, `duplicate heading anchor: ${id}`);
    }
    seen.add(id);
  }
};

const postFiles = fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith('.md')).sort();
const postIds = new Map();

for (const filename of postFiles) {
  const file = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(file, 'utf8');
  let parsed;

  try {
    parsed = matter(raw);
  } catch (error) {
    report(file, `invalid frontmatter: ${error.message}`);
    continue;
  }

  const { data, content } = parsed;
  const id = String(data.id || filename.replace(/\.md$/, '')).trim();
  const requiredFields = ['title', 'excerpt', 'date', 'category', 'tags'];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      report(file, `missing required field: ${field}`);
    }
  }

  for (const field of Object.keys(data)) {
    if (!ALLOWED_POST_FIELDS.has(field)) {
      report(file, `unknown frontmatter field: ${field}`);
    }
  }

  if (postIds.has(id)) {
    report(file, `duplicate post id "${id}"; already used by ${postIds.get(id)}`);
  }
  postIds.set(id, filename);

  if (!isValidDate(data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date)) {
    report(file, 'date must use YYYY-MM-DD format');
  }
  if (data.updatedAt !== undefined && !isValidDate(data.updatedAt instanceof Date ? data.updatedAt.toISOString().slice(0, 10) : data.updatedAt)) {
    report(file, 'updatedAt must use YYYY-MM-DD format');
  }
  if (!Array.isArray(data.tags)) {
    report(file, 'tags must be an array');
  }
  if (data.coverImage !== undefined) {
    validateUrl(data.coverImage, file, 'coverImage', { asset: true });
  }

  validateMarkdownReferences(content, file);
  validateHeadings(content, file);
}

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Content validation passed: ${postFiles.length} post(s) checked.`);
}
