// 博客配置文件
// VITE_SITE_URL 环境变量优先于此处的 url 配置
export const siteConfig = {
  title: 'ZSFan 的 Blog',
  subtitle: '记录开发、折腾与思考',
  description: 'ZSFan 的个人博客，记录开发、折腾与思考',
  logo: '/logo.png',
  seoImage: '/logo.png',
  footerText: '© 2026 ZSFan 的博客',
  runtimePrefix: '本站运行时间',
  runtimeStartDate: '2026-01-01',
  runtimeShowHours: true,
  runtimeShowMinutes: true,
  runtimeShowSeconds: true,
  url: 'https://blog.zsfan8986.dpdns.org',
  social: {
    github: 'https://github.com/ZhangShengFan/',
    email: 'mailto:zsfan-nb@hotmail.com',
    rawEmail: 'zsfan-nb@hotmail.com',
  },
  author: {
    name: 'ZSFan',
    avatar: 'https://q1.qlogo.cn/g?b=qq&nk=1453508737&s=100',
    role: 'Developer',
    bio: 'Android 开发者，热爱折腾技术与 Cloudflare 生态',
  },
  toc: {
    collapseInactiveRootBranches: true,
  },
  friendsPage: {
    repoUrl: 'https://github.com/ZhangShengFan/Blog',
    repoFriendsUrl: 'https://github.com/ZhangShengFan/Blog/tree/main/friends',
    repoFriendsDir: 'friends',
    announcement: '博客已重置完成，新的内容将从这里重新开始。',
  },
  beian: {
    text: '',
    url: '',
  },
  analytics: {
    umamiScriptSrc: 'https://cloud.umami.is/script.js',
    umamiWebsiteId: 'a94473a1-ffcb-421b-8ebc-70eb7c821ee6',
    umamiShareUrl: '',
    statusPageUrl: '',
  },
};
