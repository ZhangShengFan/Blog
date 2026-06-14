import React from 'react';
import { Code2, ExternalLink, FileText } from 'lucide-react';

import { Seo } from '../components/Seo';
import { siteConfig } from '@config/site.config';

interface SponsorOption {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  detail: string;
  buttonText: string;
  buttonLink?: string;
}

const sponsorOptions: SponsorOption[] = [
  {
    id: 'code',
    icon: Code2,
    title: '赞助代码',
    description: '提交修复、优化体验，或补充新功能。',
    detail: '适合熟悉 React、TypeScript、构建脚本或博客内容工作流的朋友。',
    buttonText: '前往仓库',
    buttonLink: siteConfig.social.github
  },
  {
    id: 'article',
    icon: FileText,
    title: '赞助文章',
    description: '提供优质文章、勘误或内容建议。',
    detail: '欢迎通过 PR 补充技术文章、使用心得、教程或修正文档问题。',
    buttonText: '提交内容',
    buttonLink: siteConfig.social.github
  }
];

export const Sponsor: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl pb-16 pt-8 md:pb-24 md:pt-12">
      <Seo title="赞助" description="支持 ZSFan 的博客 的方式：贡献代码或撰写文章，帮助博客持续成长。" />

      <header className="mb-8 rounded-2xl border border-zinc-200 bg-white px-5 py-8 text-center dark:border-zinc-800 dark:bg-zinc-900 md:mb-10 md:px-8 md:py-10">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">Support ZSFan 的博客</p>
        <h1 className="mb-4 font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">
          没有收款码的赞助
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 md:text-base">
          如果这个项目帮到了你，可以通过代码贡献或内容共建支持它继续维护。
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5" aria-label="赞助方式">
        {sponsorOptions.map((option) => {
          const Icon = option.icon;
          return (
            <a
              key={option.id}
              href={option.buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-64 flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/80"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                <Icon size={21} />
              </div>
              <h2 className="mb-2 font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">{option.title}</h2>
              <p className="mb-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{option.description}</p>
              <p className="mb-5 text-xs leading-5 text-zinc-500 dark:text-zinc-500">{option.detail}</p>
              <span className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                {option.buttonText}
                <ExternalLink size={14} />
              </span>
            </a>
          );
        })}
      </section>
    </div>
  );
};
