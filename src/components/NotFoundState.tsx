import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';

interface NotFoundStateProps {
  title: string;
  description: string;
  backTo?: string;
  backLabel?: string;
  debugLabel?: string;
}

const MESSAGES = [
  { emoji: '🔭', text: '这个页面去宇宙旅行了，还没回来' },
  { emoji: '🌊', text: '这个页面被海浪卷走了' },
  { emoji: '🦕', text: '这个页面比恐龙消失得还彻底' },
  { emoji: '☁️', text: '这个页面飘到云端找不到了' },
  { emoji: '🐉', text: '这个页面被龙叼走了' },
  { emoji: '🚀', text: '这个页面已经飞出太阳系' },
];

export const NotFoundState: React.FC<NotFoundStateProps> = React.memo(({
  title,
  description,
  backTo = '/',
  backLabel = '返回首页',
  debugLabel
}) => {
  const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const timer = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.');
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative mb-6 select-none">
        <span className="font-serif text-[9rem] font-black leading-none text-zinc-100 dark:text-zinc-800 md:text-[12rem]">
          404
        </span>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl animate-bounce md:text-6xl">
          {msg.emoji}
        </span>
      </div>

      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-75 dark:bg-zinc-600" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
        </span>
        正在全力搜索{dots}
      </div>

      <h1 className="mb-3 font-serif text-2xl font-bold text-ink dark:text-white md:text-3xl">
        {msg.text}
      </h1>

      <p className="mb-2 max-w-md text-sm leading-7 text-zinc-500 dark:text-zinc-400">
        {description}
      </p>

      {debugLabel && (
        <div className="mb-8 inline-flex max-w-full items-center rounded-xl border border-zinc-200/80 bg-zinc-50 px-4 py-2 font-mono text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
          {debugLabel}
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.03] hover:opacity-90 dark:bg-white dark:text-ink"
        >
          <Home size={15} />
          {backLabel}
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-bold text-zinc-700 transition-all hover:scale-[1.03] hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
        >
          <ArrowLeft size={15} />
          上一页
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-bold text-zinc-700 transition-all hover:scale-[1.03] hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
        >
          <Search size={15} />
          搜索文章
        </Link>
      </div>
    </div>
  );
});
