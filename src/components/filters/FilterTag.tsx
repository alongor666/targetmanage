import React from 'react';
import { cn } from '@/lib/utils';
import { colors } from '@/styles/tokens';

/**
 * 维度类型（对应不同的边框颜色）
 */
export type DimensionType = 'org' | 'customer' | 'business' | 'energy' | 'renewal' | 'terminal';

export interface FilterTagProps {
  /** 标签文本 */
  label: string;

  /** 维度类型（决定边框颜色） */
  dimension: DimensionType;

  /** 删除回调函数 */
  onRemove?: () => void;

  /** 自定义类名 */
  className?: string;
}

/**
 * FilterTag - 筛选标签组件
 *
 * 电商式筛选标签，根据维度类型显示不同颜色的边框。
 * 支持删除功能，采用小巧的设计。
 *
 * @example
 * 基础用法：
 * ```tsx
 * <FilterTag
 *   label="成都本部"
 *   dimension="org"
 *   onRemove={() => handleRemove('成都本部')}
 * />
 * ```
 *
 * @example
 * 不同维度：
 * ```tsx
 * <FilterTag label="新能源" dimension="energy" />
 * <FilterTag label="续保" dimension="renewal" />
 * <FilterTag label="APP" dimension="terminal" />
 * ```
 */
export function FilterTag({
  label,
  dimension,
  onRemove,
  className,
}: FilterTagProps) {
  // 获取维度边框颜色
  const dimensionColor = colors.dimension[dimension];

  return (
    <div
      className={cn(
        // 基础样式
        'inline-flex items-center gap-1.5',
        'px-2.5 py-1',
        'rounded-md',
        'bg-white border-2',
        'text-xs font-medium',
        'transition-all duration-150',

        // 悬停效果
        onRemove && 'hover:shadow-sm',

        className
      )}
      style={{
        borderColor: dimensionColor,
        color: colors.text.primary,
      }}
    >
      {/* 标签文本 */}
      <span className="select-none">{label}</span>

      {/* 删除按钮 */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            'flex items-center justify-center',
            'w-3.5 h-3.5',
            'rounded-full',
            'hover:bg-gray-200',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-1 focus:ring-tesla/30 focus:ring-offset-1',
          )}
          aria-label={`删除筛选条件: ${label}`}
        >
          {/* X 图标 */}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L9 9M9 1L1 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
