// 博客配置文件
// VITE_SITE_URL 环境变量优先于此处的 url 配置
export const siteConfig = {
  title: '我的博客',
  subtitle: '记录、分享与思考',
  description: '一个基于 React + Vite + Cloudflare Pages 的个人博客',
  logo: '/logo.png',
  seoImage: '/logo.png',
  footerText: '© 2026 我的博客',
  runtimeStartDate: '2026-01-01',
  runtimeShowHours: true,
  runtimeShowMinutes: false,
  runtimeShowSeconds: false,
  runtimeLabel: '小站已运行',
  url: 'https://your-domain.example.com',
  social: {
    github: 'https://github.com/your-username',
    email: 'mailto:you@example.com',
    rawEmail: 'you@example.com',
  },
  author: {
    name: '你的昵称',
    avatar: '/logo.png',
    role: 'Developer',
    bio: 'Hello World',
  },
  toc: {
    collapseInactiveRootBranches: true,
  },
  friendsPage: {
    repoUrl: 'https://github.com/your-username/your-repo',
    repoFriendsUrl: 'https://github.com/your-username/your-repo/tree/main/friends',
    repoFriendsDir: 'friends',
    announcement: '欢迎来到我的博客，内容正在建设中。',
  },
  beian: {
    text: '',
    url: 'https://beian.miit.gov.cn/',
  },
  gonganBeian: {
    enabled: false,
    text: '',
    url: 'https://www.beian.gov.cn/portal/registerSystemInfo',
  },
  analytics: {
    umamiScriptSrc: 'https://cloud.umami.is/script.js',
    umamiWebsiteId: '',
    umamiShareUrl: '',
    statusPageUrl: '',
  },
};
