import React from 'react';
import { cn } from '@/lib/utils';

export interface FilterSelectorProps<T extends string = string> {
  /** 筛选器标签，显示在选择器上方 */
  label: string;

  /** 当前选中的值 */
  value: T;

  /** 值变更时的回调函数 */
  onChange: (value: T) => void;

  /** 可选项列表 */
  options: Array<{ value: T; label: string }>;

  /** 是否处于激活/聚焦状态 */
  active?: boolean;

  /** 自定义类名 */
  className?: string;

  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * FilterSelector - 下拉筛选器组件
 *
 * 符合设计规范的筛选器，支持特斯拉蓝选中状态、悬停效果和焦点状态。
 * 使用泛型类型参数确保类型安全。
 *
 * @example
 * 基础用法：
 * ```tsx
 * <FilterSelector
 *   label="产品"
 *   value={product}
 *   onChange={setProduct}
 *   options={[
 *     { value: 'total', label: '汇总' },
 *     { value: 'auto', label: '车险' },
 *   ]}
 * />
 * ```
 *
 * @example
 * 类型安全的用法：
 * ```tsx
 * type ProductView = 'total' | 'auto' | 'property';
 *
 * const [product, setProduct] = useState<ProductView>('total');
 *
 * <FilterSelector<ProductView>
 *   label="产品"
 *   value={product}
 *   onChange={setProduct}
 *   options={[
 *     { value: 'total', label: '汇总' },
 *     { value: 'auto', label: '车险' },
 *     { value: 'property', label: '财产险' },
 *   ]}
 * />
 * ```
 */
export function FilterSelector<T extends string = string>({
  label,
  value,
  onChange,
  options,
  active = false,
  className,
  disabled = false,
}: FilterSelectorProps<T>) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* 标签 */}
      <label className="text-xs text-text-secondary">{label}</label>

      {/* 选择器 */}
      <select
        className={cn(
          // 基础样式 - 使用设计token
          'rounded-sm border px-2 py-1 text-sm',
          'bg-white/90 backdrop-blur-sm',
          'transition-normal',

          // 默认边框
          'border-border-light',

          // 悬停状态
          'hover:border-tesla hover:shadow-sm',

          // 激活/选中状态
          active && 'border-tesla bg-tesla text-text-inverse',

          // 焦点状态
          'focus:outline-none focus:shadow-focus',

          // 禁用状态
          disabled &&
            'bg-border-light text-text-muted cursor-not-allowed hover:border-border-light hover:shadow-none'
        )}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
