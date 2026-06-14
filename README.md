# ZSFan 的博客

> 凡的博客 — 基于 React + Vite 构建，部署在 Cloudflare Pages 上的个人博客。

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://blog-buh.pages.dev)
[![GitHub](https://img.shields.io/badge/GitHub-ZhangShengFan-181717?logo=github)](https://github.com/ZhangShengFan/)

## 预览

🌐 **线上地址**：[https://blog-buh.pages.dev](https://blog-buh.pages.dev)

## 功能

- ⚡ 基于 React 18 + Vite 5，极速构建
- 🌙 深色 / 浅色模式自动切换
- 📝 Markdown 渲染，支持代码高亮、表格、数学公式、Mermaid 图表
- 🔍 全文搜索
- 📱 移动端自适应
- 🗂️ 文章分类、标签、归档
- 🧑‍💻 自研后台管理界面（密码登录，无需第三方 CMS）
- 🤝 友情链接管理
- 📊 站点统计
- 🚀 每次访问显示启动动画
- 🗺️ 自动生成 Sitemap、RSS Feed

## 技术栈

| 分类 | 技术 |
|---|---|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式 | Tailwind CSS |
| 动画 | Framer Motion |
| Markdown | react-markdown + remark + rehype |
| 部署 | Cloudflare Pages |
| CI/CD | GitHub Actions |

## 目录结构

```
.
├── posts/              # Markdown 文章（每篇一个 .md 文件）
├── friends/            # 友情链接（每个友链一个 .json 文件）
├── public/
│   ├── _redirects      # CF Pages SPA 路由回退
│   ├── _headers        # CF Pages 缓存和安全头
│   └── admin/          # 自研后台管理界面
├── config/
│   ├── site.config.ts  # 博客基本信息配置
│   └── content.config.json  # 文章分类配置
├── src/                # React 源码
├── scripts/            # 构建脚本（生成数据、预渲染）
└── .github/workflows/  # GitHub Actions 自动部署
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build

# 本地预览构建产物（模拟 CF Pages 环境）
npx wrangler pages dev dist
```

## 写文章

### 方式一：后台界面（推荐）

访问 `/admin`，输入密码登录，在可视化界面中编辑并发布文章。发布后自动 commit 到 GitHub，触发 CF Pages 重新构建。

### 方式二：直接编辑文件

在 `posts/` 目录下新建 `.md` 文件，frontmatter 格式如下：

```markdown
---
id: my-post-id
title: 文章标题
excerpt: 文章摘要（50~120 字）
date: 2026-06-14
category: 技术
tags:
  - 标签1
  - 标签2
coverImage: /posts-img/cover.png
featured: false
draft: false
---

正文内容（Markdown）
```

**分类选项**：`教程` / `技术` / `随笔` / `分享` / `其他`

## 添加友链

在 `friends/` 目录下新建 `.json` 文件：

```json
{
  "name": "博客名称",
  "description": "一句话介绍",
  "avatar": "https://example.com/avatar.png",
  "url": "https://example.com"
}
```

## 部署到 Cloudflare Pages

### 控制台部署

1. 打开 [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → 创建 → Pages
2. 连接 GitHub 仓库 `ZhangShengFan/Blog`
3. 构建配置：

| 字段 | 值 |
|---|---|
| 构建命令 | `npm run build` |
| 构建输出目录 | `dist` |
| Node.js 版本 | `20` |

4. 环境变量：

| 变量名 | 值 |
|---|---|
| `NODE_VERSION` | `20` |
| `VITE_SITE_URL` | `https://你的域名` |

### GitHub Actions 自动部署

在仓库 **Settings → Secrets and variables → Actions** 添加：

| Secret | 说明 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | CF API Token（需 Cloudflare Pages:Edit 权限） |
| `CLOUDFLARE_ACCOUNT_ID` | CF 控制台右侧的 Account ID |
| `VITE_SITE_URL` | 博客完整 URL |

之后每次推送 `main` 分支自动触发构建部署。

## 修改博客信息

编辑 `config/site.config.ts`：

```ts
export const siteConfig = {
  title: '博客名称',
  subtitle: '副标题',
  description: 'SEO 描述',
  url: 'https://你的域名',
  author: {
    name: '昵称',
    avatar: '头像 URL',
    role: '身份描述',
    bio: '个人简介',
  },
  social: {
    github: 'https://github.com/你的用户名',
    email: 'mailto:你的邮箱',
  },
  // ...
};
```

## License

[MIT](./LICENSE)
