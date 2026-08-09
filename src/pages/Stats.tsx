import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BookOpen,
  Database,
  FileImage,
  FileText,
  FolderTree,
  Hash,
  RefreshCw,
  Type
} from 'lucide-react';

import { Seo } from '../components/Seo';
import { siteConfig } from '../../config/site.config';
import { getSiteStats, SiteStats } from '../services/siteStats';

const EMPTY_SITE_STATS: SiteStats = {
  totalPosts: 0,
  totalWords: 0,
  totalCategories: 0,
  totalTags: 0,
  totalImages: 0,
  categoryStats: [],
  tagStats: [],
  yearlyStats: [],
  recentPosts: [],
  topWordCountPosts: [],
  topImageCountPosts: []
};

interface RankingItem {
  name: string;
  count: number;
  href?: string;
}

const formatValue = (value: number) => new Intl.NumberFormat('zh-CN').format(value);

const SummaryCard = ({
  icon: Icon,
  title,
  value,
  detail
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  detail: string;
}) => (
  <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 transition-colors duration-150 dark:border-zinc-800/80 dark:bg-zinc-900 sm:rounded-2xl sm:p-6">
    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 sm:h-12 sm:w-12">
      <Icon size={20} className="sm:size-[22px]" />
    </div>
    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:text-[11px]">{title}</div>
    <div className="mb-2 text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-100 sm:text-3xl lg:text-4xl">{value}</div>
    <div className="text-xs leading-5 text-zinc-600 dark:text-zinc-400 sm:text-sm sm:leading-6">{detail}</div>
  </div>
);

const RankingCard = ({
  title,
  items,
  valueSuffix = '篇',
  emptyText = '暂无可展示的数据'
}: {
  title: string;
  items: RankingItem[];
  valueSuffix?: string;
  emptyText?: string;
}) => {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/90">
      <h3 className="mb-4 font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.name}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                {item.href ? (
                  <Link
                    to={item.href}
                    className="min-w-0 truncate font-medium text-zinc-700 transition-colors hover:text-zinc-950 hover:underline dark:text-zinc-300 dark:hover:text-white"
                    title={item.name}
                  >
                    {index + 1}. {item.name}
                  </Link>
                ) : (
                  <span className="min-w-0 truncate font-medium text-zinc-700 dark:text-zinc-300" title={item.name}>
                    {index + 1}. {item.name}
                  </span>
                )}
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{formatValue(item.count)}{valueSuffix}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
                  style={{ width: `${Math.max(8, (item.count / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 px-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400">
          {emptyText}
        </div>
      )}
    </div>
  );
};

const StatsLoading = () => (
  <div className="space-y-8" aria-live="polite" aria-busy="true">
    <section className="rounded-2xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-5 md:p-6 lg:p-8">
      <div className="mb-6 h-9 w-36 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-4 sm:gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/70" />
        ))}
      </div>
    </section>
    <div className="grid gap-5 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      ))}
    </div>
    <span className="sr-only">正在加载站点统计数据</span>
  </div>
);

export const Stats = () => {
  const [siteStats, setSiteStats] = useState<SiteStats>(EMPTY_SITE_STATS);
  const [siteStatsLoading, setSiteStatsLoading] = useState(true);
  const [siteStatsError, setSiteStatsError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setSiteStatsLoading(true);
    setSiteStatsError(null);

    getSiteStats()
      .then((statsData) => {
        if (!cancelled) {
          setSiteStats(statsData);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Failed to load site stats:', error);
          setSiteStatsError('统计数据加载失败，请检查网络后重试。');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSiteStatsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  const averageWords = siteStats.totalPosts > 0
    ? Math.round(siteStats.totalWords / siteStats.totalPosts)
    : 0;
  const categoryItems = (siteStats.categoryStats || []).map((item) => ({
    ...item,
    href: `/?category=${encodeURIComponent(item.name)}`
  }));
  const tagItems = (siteStats.tagStats || []).slice(0, 8).map((item) => ({
    ...item,
    href: `/tags?tag=${encodeURIComponent(item.name)}`
  }));
  const yearlyItems = (siteStats.yearlyStats || []).map((item) => ({
    name: `${item.year} 年`,
    count: item.count
  }));
  const topWordCountItems = (siteStats.topWordCountPosts || []).map((post) => ({
    name: post.title,
    count: post.wordCount || 0,
    href: `/post/${post.id}`
  }));
  const topImageCountItems = (siteStats.topImageCountPosts || [])
    .filter((post) => (post.imageCount || 0) > 0)
    .map((post) => ({
      name: post.title,
      count: post.imageCount || 0,
      href: `/post/${post.id}`
    }));

  return (
    <div className="pb-10 md:pb-20">
      <Seo title="统计" description="ZSFan 的博客站点统计概览：文章数、总字数、分类标签、图片数量等核心数据一目了然。" />

      {siteStatsLoading ? (
        <StatsLoading />
      ) : siteStatsError ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 sm:p-12" role="alert">
          <Database className="mx-auto mb-4 text-zinc-400" size={32} />
          <h1 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">暂时无法读取统计数据</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{siteStatsError}</p>
          <button
            type="button"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:ring-offset-zinc-900"
          >
            <RefreshCw size={16} />
            重新加载
          </button>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-5 md:p-6 lg:p-8">
            <div className="mb-5 flex items-center gap-2.5 md:mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <Database size={18} />
              </div>
              <h1 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100 md:text-2xl">站点概览</h1>
            </div>

            <div className="grid gap-4 sm:gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <SummaryCard icon={FileText} title="当前文章数" value={formatValue(siteStats.totalPosts)} detail="已公开发布的文章总数" />
              <SummaryCard icon={Type} title="总字数" value={formatValue(siteStats.totalWords)} detail="按正文内容累计的总阅读字数" />
              <SummaryCard icon={BookOpen} title="平均篇幅" value={formatValue(averageWords)} detail="每篇已发布文章的平均字数" />
              <SummaryCard icon={FolderTree} title="总分类数" value={formatValue(siteStats.totalCategories)} detail="已发布文章涉及的分类数量" />
              <SummaryCard icon={Hash} title="总标签数" value={formatValue(siteStats.totalTags)} detail="已发布文章中去重后的标签数" />
              <SummaryCard icon={FileImage} title="总图片数" value={formatValue(siteStats.totalImages)} detail="正文内 Markdown 图片累计数量" />
            </div>
          </section>

          <section className="mt-8 grid gap-5 md:mt-10 lg:grid-cols-3">
            <RankingCard title="分类文章数" items={categoryItems} emptyText="暂无文章分类数据" />
            <RankingCard title="热门标签 Top" items={tagItems} emptyText="暂无文章标签数据" />
            <RankingCard title="年度发布趋势" items={yearlyItems} emptyText="暂无年度发布数据" />
          </section>

          <section className="mt-8 grid gap-5 md:mt-10 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/90">
              <h3 className="mb-4 font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">最近更新</h3>
              {(siteStats.recentPosts || []).length > 0 ? (
                <div className="space-y-3">
                  {(siteStats.recentPosts || []).map((post) => (
                    <Link key={post.id} to={`/post/${post.id}`} className="block rounded-xl border border-zinc-100 p-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50">
                      <div className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{post.title}</div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{post.updatedAt || post.date}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 px-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400">
                  暂无最近更新的文章
                </div>
              )}
            </div>
            <RankingCard title="字数最多" valueSuffix="字" items={topWordCountItems} emptyText="暂无文章字数数据" />
            <RankingCard title="图片最多" valueSuffix="张" items={topImageCountItems} emptyText="正文暂未使用 Markdown 图片" />
          </section>

          <section className="mt-8 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-5 md:mt-12 md:p-6 lg:mt-14 lg:p-8">
            <div className="mb-5 flex items-center gap-2.5 md:mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <BarChart3 size={18} />
              </div>
              <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100 md:text-2xl">访问统计</h2>
            </div>

            <p className="mb-6 text-sm leading-6 text-zinc-600 dark:text-zinc-400 md:text-base md:leading-7">
              查看详细的访问统计数据，包括访客数、访问次数和浏览量。
            </p>

            <div className="flex justify-center">
              <a
                href={siteConfig.analytics.umamiShareUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-14 w-full max-w-xl items-center justify-center gap-3 rounded-2xl border border-zinc-300 bg-zinc-900 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:ring-offset-zinc-950 sm:text-lg"
                title="查看 Umami 统计数据"
                onClick={(event) => { if (!siteConfig.analytics.umamiShareUrl) event.preventDefault(); }}
              >
                <BarChart3 size={20} />
                <span>查看 Umami 统计数据</span>
              </a>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5 md:mt-12 md:p-6 lg:mt-14 lg:p-8">
            <div className="mb-5 flex items-center gap-2.5 md:mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <Activity size={18} />
              </div>
              <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100 md:text-2xl">运行状态</h2>
            </div>

            <p className="mb-6 text-sm leading-6 text-zinc-600 dark:text-zinc-400 md:text-base md:leading-7">
              实时监控网站的运行状态和可用性，查看历史运行时间和响应速度。
            </p>

            <div className="flex justify-center">
              <a
                href={siteConfig.analytics.statusPageUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-14 w-full max-w-xl items-center justify-center gap-3 rounded-2xl border border-zinc-300 bg-zinc-900 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:ring-offset-zinc-950 sm:text-lg"
                title="查看网站运行状态"
                onClick={(event) => { if (!siteConfig.analytics.statusPageUrl) event.preventDefault(); }}
              >
                <Activity size={20} />
                <span>查看网站运行状态</span>
              </a>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
