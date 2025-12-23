import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  /** 加载文字 */
  text?: string;

  /** 加载器尺寸 */
  size?: 'sm' | 'md' | 'lg';

  /** 是否全屏居中 */
  fullscreen?: boolean;

  /** 自定义类名 */
  className?: string;
}

/**
 * LoadingState - 加载状态组件
 *
 * 提供统一的数据加载反馈，包含旋转加载器和可选文字。
 * 支持不同尺寸和全屏模式。
 *
 * @example
 * 基础用法：
 * ```tsx
 * <LoadingState text="正在加载数据..." />
 * ```
 *
 * @example
 * 不同尺寸：
 * ```tsx
 * <LoadingState size="sm" text="加载中" />
 * <LoadingState size="lg" text="正在处理大量数据..." />
 * ```
 *
 * @example
 * 全屏加载：
 * ```tsx
 * <LoadingState fullscreen text="系统初始化中..." />
 * ```
 */
export function LoadingState({
  text = '正在加载数据...',
  size = 'md',
  fullscreen = false,
  className,
}: LoadingStateProps) {
  // 计算加载器尺寸
  const spinnerSizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizeMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        fullscreen ? 'min-h-screen' : 'py-12',
        className
      )}
    >
      {/* 旋转加载器 */}
      <div
        className={cn(
          'animate-spin rounded-full border-4 border-border-light border-t-tesla',
          spinnerSizeMap[size]
        )}
        role="status"
        aria-label="加载中"
      />

      {/* 加载文字 */}
      {text && (
        <p
          className={cn(
            'mt-4 text-text-secondary',
            textSizeMap[size]
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}
