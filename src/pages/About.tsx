import React from 'react';
import { Github, Mail, Code, Terminal } from 'lucide-react';
import { siteConfig } from '@config/site.config';
import { Seo } from '../components/Seo';
import { ProgressiveImage } from '@/components/ProgressiveImage';

export const About = () => {
  const techStack = [
    'Kotlin', 'Java', 'Android', 'JavaScript', 'TypeScript',
    'React', 'Node.js', 'Python', 'Bash / Shell',
    'Cloudflare Pages', 'Cloudflare Workers', 'GitHub Actions',
    'Docker', 'Gradle', 'Vite',
  ];

  return (
    <div className="mx-auto max-w-4xl py-12 md:py-20">
      <Seo title="关于" description={`关于 ${siteConfig.author.name}：${siteConfig.author.bio}`} />

      {/* 个人信息卡片 */}
      <div className="mb-12 flex flex-col items-center gap-8 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 p-8 text-center md:flex-row md:gap-12 md:p-12 md:text-left">
        <div className="group relative">
          <div className="relative z-10 h-32 w-32 overflow-hidden rounded-full border-4 border-zinc-200 dark:border-zinc-800 md:h-40 md:w-40">
            <ProgressiveImage src={siteConfig.author.avatar} alt="Avatar" wrapperClassName="h-full w-full" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="mb-3 font-serif text-4xl font-bold text-zinc-900 dark:text-zinc-100 md:text-5xl">
            {siteConfig.author.name}
          </h1>
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{siteConfig.author.role}</p>
          <p className="mb-8 font-sans text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">{siteConfig.author.bio}</p>

          <div className="flex items-center justify-center gap-4 md:justify-start">
            <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              <Github size={18} />
              <span>GitHub</span>
            </a>
            <a href={siteConfig.social.email} className="flex items-center gap-2 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 px-5 py-2.5 text-sm font-bold text-zinc-900 transition-colors dark:text-zinc-100">
              <Mail size={18} />
              <span>邮箱</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* 技术栈 */}
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 p-8">
          <div className="mb-6 flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
            <Code className="text-zinc-700 dark:text-zinc-300" />
            <h2 className="font-serif text-2xl font-bold">技术栈</h2>
          </div>
          <div className="flex flex-col gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="block w-full rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* 关于我 */}
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 p-8">
          <div className="mb-6 flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
            <Terminal className="text-zinc-700 dark:text-zinc-300" />
            <h2 className="font-serif text-2xl font-bold">关于我</h2>
          </div>
          <div className="space-y-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
            <p>
              我是 <strong className="text-zinc-900 dark:text-zinc-100">ZSFan</strong>，一名热爱折腾的全栈开发者，专注于 Android 开发与 Web 全栈方向。
            </p>
            <p>
              日常喜欢用 <strong className="text-zinc-900 dark:text-zinc-100">Cloudflare</strong> 系列产品搭建各种工具和服务，享受从零构建到上线的完整过程。
            </p>
            <p>
              这个博客用来记录我的技术探索、项目经验和生活随笔，内容真实、不拍脑袋，欢迎交流。
            </p>
            <p>
              有任何想法或合作意向，欢迎通过 GitHub 或邮件联系我。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
