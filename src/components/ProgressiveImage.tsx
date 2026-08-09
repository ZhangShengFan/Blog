import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  placeholderClassName?: string;
  aspectRatio?: string;
  effect?: 'blur' | 'fade' | 'none';
}

const mergeClassName = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(' ');

export const ProgressiveImage: React.FC<ProgressiveImageProps> = React.memo(({
  wrapperClassName,
  placeholderClassName,
  className,
  onLoad,
  onError,
  decoding = 'async',
  loading: loadingProp,
  src,
  alt,
  aspectRatio,
  effect = 'blur',
  width,
  height,
  sizes,
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 优化：当 src 变化时重置状态并同步图片状态
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setRetryCount(0);

    const image = imgRef.current;
    if (!image || !src) {
      return;
    }

    // 检查图片是否已经加载完成（来自缓存）
    if (image.complete) {
      if (image.naturalWidth > 0) {
        setIsLoaded(true);
      } else {
        setHasError(true);
      }
    }
  }, [src]);

  const wrapperStyle: React.CSSProperties = { minHeight: '1px' };
  if (aspectRatio) {
    wrapperStyle.aspectRatio = aspectRatio;
  } else if (width && height) {
    wrapperStyle.aspectRatio = `${width} / ${height}`;
  }

  const resolvedLoading = loadingProp || (props.fetchPriority === 'high' ? 'eager' : 'lazy');
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const imageTransitionClass = prefersReducedMotion || effect === 'none'
    ? 'opacity-100'
    : isLoaded ? 'opacity-100' : 'opacity-0';

  return (
    <div className={mergeClassName('relative overflow-hidden', wrapperClassName)} style={wrapperStyle}>
      <div
        aria-hidden="true"
        className={mergeClassName(
          'pointer-events-none absolute inset-0 bg-zinc-200/80 transition-opacity duration-500 dark:bg-zinc-800/80',
          isLoaded || hasError ? 'opacity-0' : 'opacity-100',
          placeholderClassName
        )}
      />
      <div
        aria-hidden="true"
        className={mergeClassName(
          'pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-100/70 transition-opacity duration-500 dark:bg-zinc-900/60',
          isLoaded || hasError ? 'opacity-0' : 'opacity-100'
        )}
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-500 dark:border-zinc-700 dark:border-t-zinc-400" />
      </div>
      {hasError ? (
        <div className="relative flex min-h-[6rem] flex-col items-center justify-center gap-2 rounded-[inherit] border border-dashed border-zinc-200 bg-zinc-100/90 px-4 py-6 text-center text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
          <span className="line-clamp-2">图片暂时无法加载{alt ? `：${alt}` : ''}</span>
          <button
            type="button"
            aria-label="重新加载图片"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-500 hover:text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-white"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setHasError(false);
              setIsLoaded(false);
              setRetryCount((count) => count + 1);
            }}
          >
            <RefreshCw size={13} />
            重试
          </button>
        </div>
      ) : (
        <img
          key={`${src}-${retryCount}`}
          {...props}
          ref={imgRef}
          src={src}
          alt={alt}
          decoding={decoding}
          loading={resolvedLoading}
          width={width}
          height={height}
          sizes={sizes}
          className={mergeClassName(
            'relative transition-all duration-500 ease-out',
            imageTransitionClass,
            className
          )}
          onLoad={(event) => {
            setIsLoaded(true);
            setHasError(false);
            onLoad?.(event);
          }}
          onError={(event) => {
            setHasError(true);
            onError?.(event);
          }}
        />
      )}
    </div>
  );
});

