---
id: deploy-tutorial
title: ZSFan Blog 详细部署教程
excerpt: 从 0 到上线，基于 React + Vite + Cloudflare Pages 的完整部署教程
date: 2026-06-14
category: 教程
tags::
  - Cloudflare
  - Pages
  - 部署
  - React
  - Vite
coverImage: https://pan.sanzhong.xyz/file/blog/deploy-tutorial.PNG
---

# ZSFan Blog 详细部署教程：从 0 到上线，基于 React + Vite + Cloudflare Pages

> 本文是 ZSFan Blog 项目的完整部署教程，从项目结构、本地开发、Cloudflare Pages 部署、KV 持久化登录配置、GitHub Actions 自动部署，到写文章和管理友链，一步一步带你把基于 React + Vite 的个人博客上线。

线上地址：[https://blog.zsfan.top](https://blog.zsfan.top)  
GitHub 仓库：[https://github.com/ZhangShengFan/Blog](https://github.com/ZhangShengFan/Blog)

## 一、项目简介

ZSFan Blog 是一个基于 React 18 + Vite 5 构建的个人博客系统，部署在 Cloudflare Pages 上，支持：

- **Markdown 文章管理**：每篇文章一个 `.md` 文件，存放在 `posts/` 目录
- **友情链接管理**：每个友链一个 `.json` 文件，存放在 `friends/` 目录
- **深色 / 浅色模式自动切换**
- **全文搜索**：支持对文章标题、摘要、正文进行全文搜索
- **移动端自适应**：在手机上也能流畅浏览
- **文章分类、标签、归档**：按分类、标签和时间归档文章
- **自研后台管理界面**：密码登录，无需第三方 CMS，访问 `/admin`
- **KV 持久化登录**：首次设置后台密码和 GitHub Token，存进 Cloudflare KV，登录态通过 Cookie + KV 维持
- **自动生成 Sitemap 和 RSS Feed**
- **GitHub Actions 自动部署**：每次推送 `main` 分支自动构建并部署到 Cloudflare Pages

线上地址：[https://blog.zsfan.top](https://blog.zsfan.top)

## 二、项目结构

```text
.
├── posts/              # Markdown 文章（每篇一个 .md 文件）
├── friends/            # 友情链接（每个友链一个 .json 文件）
├── public/
│   ├── _redirects      # CF Pages SPA 路由回退
│   ├── _headers        # CF Pages 缓存和安全头
│   └── admin/          # 自研后台管理界面（index.html）
├── config/
│   ├── site.config.ts  # 博客基本信息配置
│   └── content.config.json  # 文章分类配置
├── src/                # React 源码
├── scripts/            # 构建脚本（生成数据、预渲染）
├── functions/          # Cloudflare Pages Functions（后台认证接口）
│   └── api/admin/auth/
│       ├── _utils.ts
│       ├── status.ts
│       ├── setup.ts
│       ├── login.ts
│       └── logout.ts
├── .github/workflows/  # GitHub Actions 自动部署
│   └── deploy.yml
├── index.html          # 入口 HTML
├── vite.config.ts      # Vite 配置
├── package.json        # 项目依赖和脚本
├── wrangler.toml       # Cloudflare Pages 本地配置（含 KV 绑定声明）
└── README.md           # 项目说明
```

## 三、准备工作

### 1. 前置条件

- 一个 GitHub 账号
- 一个 Cloudflare 账号
- 本地安装 Node.js 20
- 一个域名（可选）

### 2. 克隆项目

```bash
git clone https://github.com/ZhangShengFan/Blog.git
cd Blog
npm install
```

## 四、本地开发与预览

```bash
npm run dev
```

访问 `http://localhost:5173`

```bash
npm run build
```

```bash
npx wrangler pages dev dist
```

访问 `http://localhost:8788`

## 五、部署到 Cloudflare Pages

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. 选择仓库 `ZhangShengFan/Blog`
3. 构建配置：
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`
   - Node.js 版本：`20`
4. 环境变量：
   - `NODE_VERSION=20`
   - `VITE_SITE_URL=https://blog.zsfan.top`
5. 创建 KV Namespace，绑定变量名 `KV`

## 六、配置后台管理

访问 `/admin`，首次进入设置密码和 Token，之后登录即可。

## 七、GitHub Actions 自动部署

添加 Secrets：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_SITE_URL`

## 八、写文章与添加友链

见 README.md

## 九、常见问题

见 README.md
