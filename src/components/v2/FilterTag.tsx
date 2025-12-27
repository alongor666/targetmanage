/**
 * FilterTag组件 V2 - 基于UI重构设计方案
 *
 * 规范来源：UI重构设计方案.md - 4.2 筛选控制区 - 筛选标签
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { filterV2 } from '@/styles/design-tokens-v2';

export interface FilterTagProps {
  /** 标签文本 */
  label: string;

  /** 是否可关闭 */
  closable?: boolean;

  /** 关闭事件回调 */
  onClose?: () => void;

  /** 自定义类名 */
  className?: string;
}

/**
 * FilterTag组件 - 筛选标签
 *
 * 规范：
 * - 背景：#E9ECEF
 * - 圆角：4px
 * - 内边距：8px 12px
 *
 * @example
 * <FilterTag label="车险" />
 * <FilterTag label="全省" closable onClose={() => {}} />
 */
export function FilterTag({
  label,
  closable = false,
  onClose,
  className,
}: FilterTagProps) {
  return (
    <div
      style={{
        backgroundColor: filterV2.tag.background,
        borderRadius: `${filterV2.tag.borderRadius}px`,
        paddingLeft: `${filterV2.tag.paddingX}px`,
        paddingRight: closable ? `${filterV2.tag.paddingX - 4}px` : `${filterV2.tag.paddingX}px`,
        paddingTop: `${filterV2.tag.paddingY}px`,
        paddingBottom: `${filterV2.tag.paddingY}px`,
      }}
      className={cn(
        'inline-flex items-center gap-2',
        'text-sm font-medium',
        'text-gray-700',
        className
      )}
    >
      <span>{label}</span>

      {closable && (
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center rounded hover:bg-gray-300/50 transition-colors"
          style={{
            width: '16px',
            height: '16px',
          }}
          aria-label="关闭"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
