import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnalyticsConsent, hasAnalyticsConfig, loadAnalytics, setAnalyticsConsent } from '@/services/analytics';

export const CookieNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (hasAnalyticsConfig() && getAnalyticsConsent() === null) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    setAnalyticsConsent('accepted');
    loadAnalytics();
    setIsVisible(false);
  };

  const handleDecline = () => {
    setAnalyticsConsent('declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* 左侧标题和文字内容 */}
              <div className="flex flex-1 flex-col gap-2 pr-4 sm:flex-row sm:items-start sm:gap-4">
                {/* Cookie使用标题 */}
                <div className="flex-shrink-0">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">访问统计</span>
                </div>
                
                {/* 文字内容 */}
                <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  <p className="mb-1">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">我们尊重您的隐私。</span>
                  </p>
                  <p>
                    经您同意后，本站会加载 Umami 进行匿名访问统计，用于改进内容与体验。暂不同意不会影响博客的核心功能。
                  </p>
                </div>
              </div>

              {/* 按钮组 */}
              <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-shrink-0">
                <button
                  type="button"
                  onClick={handleDecline}
                  className="flex-1 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:ring-white sm:flex-initial"
                >
                  暂不同意
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:focus:ring-white sm:flex-initial"
                >
                  同意匿名统计
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
