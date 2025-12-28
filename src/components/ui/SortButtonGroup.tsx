/**
 * 排序按钮组组件
 *
 * @module SortButtonGroup
 * @description 全局可复用的排序按钮组，支持多种排序方式切换
 *
 * @features
 * - 支持升序/降序切换
 * - 可配置多个排序选项
 * - 活动状态高亮显示
 * - 箭头指示排序方向
 * - 完全可复用的设计
 *
 * @example
 * ```tsx
 * <SortButtonGroup
 *   options={[
 *     { key: 'premium', label: '保费规划' },
 *     { key: 'share', label: '占比规划' },
 *     { key: 'growth', label: '增长率规划' },
 *   ]}
 *   activeKey="premium"
 *   sortOrder="desc"
 *   onSortChange={(key, order) => console.log(key, order)}
 * />
 * ```
 */

import { ButtonHTMLAttributes, useMemo } from 'react';

/**
 * 排序选项定义
 */
export interface SortOption {
  /** 排序键值 */
  key: string;
  /** 显示标签 */
  label: string;
  /** 是否禁用该选项 */
  disabled?: boolean;
}

/**
 * 排序方向
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 组件 Props
 */
export interface SortButtonGroupProps {
  /** 排序选项数组（支持 readonly） */
  options: readonly SortOption[] | SortOption[];
  /** 当前激活的排序键 */
  activeKey: string;
  /** 当前排序方向 */
  sortOrder: SortOrder;
  /** 排序变化回调 */
  onSortChange: (key: string, order: SortOrder) => void;
  /** 额外的CSS类名 */
  className?: string;
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 按钮样式变体 */
  variant?: 'default' | 'outline' | 'ghost';
}

/**
 * 获取尺寸样式
 */
function getSizeClasses(size: SortButtonGroupProps['size']): string {
  const sizeMap = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  return sizeMap[size || 'md'];
}

/**
 * 获取变体样式（统一设计规范：蓝色字 + 蓝色边框，无背景）
 */
function getVariantClasses(variant: SortButtonGroupProps['variant'], isActive: boolean): string {
  if (isActive) {
    // 选中状态：蓝色字 + 蓝色边框，无背景
    return 'bg-transparent text-blue-600 border-blue-600 hover:text-blue-700 hover:border-blue-700';
  }

  // 未选中状态：灰色字 + 灰色边框，无背景
  const variantMap = {
    default: 'bg-transparent text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-400',
    outline: 'bg-transparent text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-400',
    ghost: 'bg-transparent text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-400',
  };
  return variantMap[variant || 'default'];
}

/**
 * 获取箭头图标
 */
function getSortArrow(order: SortOrder, isActive: boolean): string {
  if (!isActive) return '⇅';
  return order === 'asc' ? '↑' : '↓';
}

/**
 * 单个排序按钮
 */
interface SortButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  option: SortOption;
  isActive: boolean;
  sortOrder: SortOrder;
  size: SortButtonGroupProps['size'];
  variant: SortButtonGroupProps['variant'];
  onClick: () => void;
}

function SortButton({
  option,
  isActive,
  sortOrder,
  size,
  variant,
  onClick,
  ...buttonProps
}: SortButtonProps) {
  const baseClasses = useMemo(() => {
    return [
      'inline-flex items-center gap-1.5 rounded border font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-current',
      getSizeClasses(size),
      getVariantClasses(variant, isActive),
    ].join(' ');
  }, [size, variant, isActive]);

  return (
    <button
      type="button"
      className={baseClasses}
      onClick={onClick}
      disabled={option.disabled}
      aria-pressed={isActive}
      aria-label={`按${option.label}${isActive ? (sortOrder === 'asc' ? '升序' : '降序') : ''}排序`}
      {...buttonProps}
    >
      <span>{option.label}</span>
      <span className="text-xs opacity-70" aria-hidden="true">
        {getSortArrow(sortOrder, isActive)}
      </span>
    </button>
  );
}

/**
 * 排序按钮组组件
 */
export function SortButtonGroup({
  options,
  activeKey,
  sortOrder,
  onSortChange,
  className = '',
  size = 'md',
  variant = 'default',
}: SortButtonGroupProps) {
  const containerClasses = useMemo(() => {
    return ['inline-flex flex-wrap gap-2', className].join(' ');
  }, [className]);

  /**
   * 处理按钮点击
   * - 如果点击当前激活的按钮，则切换排序方向
   * - 如果点击不同的按钮，则切换到新的排序方式（默认降序）
   */
  const handleSortClick = (option: SortOption) => {
    if (option.disabled) return;

    if (option.key === activeKey) {
      // 切换排序方向
      const newOrder: SortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      onSortChange(option.key, newOrder);
    } else {
      // 切换到新的排序键，默认使用降序
      onSortChange(option.key, 'desc');
    }
  };

  return (
    <div className={containerClasses} role="group" aria-label="排序选项">
      {options.map((option) => (
        <SortButton
          key={option.key}
          option={option}
          isActive={option.key === activeKey}
          sortOrder={sortOrder}
          size={size}
          variant={variant}
          onClick={() => handleSortClick(option)}
        />
      ))}
    </div>
  );
}

/**
 * 预设的排序选项配置
 */
export const SortPresets = {
  /**
   * 保费规划图排序选项
   */
  orgPremium: [
    { key: 'premium', label: '保费规划' },
    { key: 'share', label: '占比规划' },
    { key: 'growth', label: '增长率规划' },
  ] as const,

  /**
   * 通用数值排序选项
   */
  numeric: [
    { key: 'value', label: '数值' },
    { key: 'percent', label: '百分比' },
  ] as const,

  /**
   * 时间排序选项
   */
  temporal: [
    { key: 'date', label: '日期' },
    { key: 'period', label: '周期' },
  ] as const,
} as const;
