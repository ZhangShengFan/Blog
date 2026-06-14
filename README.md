# ZSFan Blog

ZSFan Blog 是一个基于 React + Vite 构建的个人博客项目，部署在 Cloudflare Pages 上，支持文章展示、友链页面、站点配置、后台管理与持久化登录。[web:21][web:25]

## 在线演示

- 演示地址：<https://blog.zsfan.top>

## 项目特点

- 使用 Vite + React 构建，适合静态站点与前端内容展示。[cite:1]
- 文章内容以 Markdown 文件管理，便于直接写作和版本控制。[cite:1]
- 支持 Cloudflare Pages Functions，可用于后台认证、表单处理等服务端逻辑。[web:25]
- 后台登录接入 Cloudflare KV，实现首次设置密码和持久化会话。[cite:1]

## 本地开发

```bash
npm install
npm run dev
```

开发模式下会先生成站点数据，再启动 Vite 开发服务器。[cite:1]

## 构建项目

```bash
npm run build
```

构建流程包含站点数据生成、前端打包和预渲染，所以请不要只执行单独的打包命令。[cite:1]

## Cloudflare Pages 部署

1. 在 Cloudflare Dashboard 中创建 Pages 项目并连接 GitHub 仓库。[web:41]
2. 构建命令填写 `npm run build`，构建输出目录填写 `dist`。[cite:1]
3. Node.js 版本建议使用 20。[cite:1]
4. 配置环境变量 `NODE_VERSION=20` 和 `VITE_SITE_URL=https://blog.zsfan.top`。[cite:1]
5. 如果要启用后台登录，再绑定一个名为 `KV` 的 Cloudflare KV Namespace。[cite:1]

## 后台说明

后台首次进入时会检查 KV 中是否存在密码哈希；如果没有，就要求先设置后台密码，再建立登录会话。[cite:1]

认证接口位于 `functions/api/admin/auth/`，包括 `status`、`setup`、`login` 和 `logout`。[cite:1]

## 目录结构

```text
Posts/     Markdown 文章
Public/    静态资源与后台页面
config/    站点与内容配置
friends/   友情链接数据
functions/ Cloudflare Pages Functions
scripts/   数据生成与预渲染脚本
src/       React 源码
```

## 配置说明

站点基本信息集中在 `config/site.config.ts`，包括标题、简介、作者信息、站点 URL 与社交链接。[cite:1]

如果你修改了站点域名，请记得同步更新 `VITE_SITE_URL` 和 `config/site.config.ts` 里的 `url` 字段。[cite:1]

## License

<div style="border:1px solid #d0d7de;background:#f6f8fa;padding:12px;border-radius:6px;margin:8px 0;"><strong>License</strong><br><a href="https://github.com/ZhangShengFan/Blog/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a></div>
