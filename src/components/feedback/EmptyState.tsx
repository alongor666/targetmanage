import React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /** 主标题文字 */
  title?: string;

  /** 描述文字 */
  description?: string;

  /** 自定义图标（可选） */
  icon?: React.ReactNode;

  /** 操作按钮（可选） */
  action?: React.ReactNode;

  /** 自定义类名 */
  className?: string;
}

/**
 * EmptyState - 空状态占位组件
 *
 * 用于显示无数据、搜索无结果等空状态场景。
 * 提供一致的视觉反馈和可选的操作引导。
 *
 * @example
 * 基础用法：
 * ```tsx
 * <EmptyState
 *   title="暂无数据"
 *   description="当前没有可显示的内容"
 * />
 * ```
 *
 * @example
 * 带操作按钮：
 * ```tsx
 * <EmptyState
 *   title="暂无机构数据"
 *   description="请先导入机构数据"
 *   action={
 *     <button className="bg-tesla text-text-inverse px-4 py-2 rounded-sm">
 *       导入数据
 *     </button>
 *   }
 * />
 * ```
 *
 * @example
 * 自定义图标：
 * ```tsx
 * <EmptyState
 *   icon={<SearchIcon className="w-16 h-16 text-text-muted" />}
 *   title="搜索无结果"
 *   description="尝试使用其他关键词"
 * />
 * ```
 */
export function EmptyState({
  title = '暂无数据',
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4',
        'text-center',
        className
      )}
    >
      {/* 图标区域 */}
      <div className="mb-4">
        {icon || (
          <svg
            className="w-16 h-16 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
      </div>

      {/* 文字区域 */}
      <h3 className="text-base font-semibold text-text-primary mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-text-secondary max-w-md mb-6">
          {description}
        </p>
      )}

      {/* 操作区域 */}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
