/**
 * ToggleButton组件 V2 - 切换按钮（统一设计规范）
 *
 * 规范：
 * - 选中：蓝色字 + 蓝色边框，无背景
 * - 未选中：灰色字 + 灰色边框，无背景
 * - 悬停：边框加深
 * - 全局统一样式
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { colorsV2, radiusV2, animationsV2 } from '@/styles/design-tokens-v2';

export interface ToggleButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** 按钮内容 */
  children: React.ReactNode;

  /** 是否选中 */
  selected?: boolean;

  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';

  /** 是否禁用 */
  disabled?: boolean;

  /** 点击事件 */
  onClick?: () => void;

  /** 自定义类名 */
  className?: string;

  /** 左侧图标 */
  icon?: React.ReactNode;
}

/**
 * ToggleButton组件 - 统一的切换按钮样式
 *
 * 设计规范：
 * - 选中状态：蓝色文字 (#007BFF) + 蓝色边框 (1px) + 透明背景
 * - 未选中状态：灰色文字 (#6C757D) + 灰色边框 (1px) + 透明背景
 * - 悬停状态：边框颜色加深，文字颜色加深
 * - 禁用状态：透明度降低，不可交互
 *
 * @example
 * // 基础用法
 * <ToggleButton selected={true} onClick={() => {}}>
 *   选项1
 * </ToggleButton>
 *
 * @example
 * // 带图标
 * <ToggleButton selected={false} onClick={() => {}} icon="📊">
 *   占比视图
 * </ToggleButton>
 */
export function ToggleButton({
  children,
  selected = false,
  size = 'md',
  disabled = false,
  onClick,
  className,
  icon,
  ...props
}: ToggleButtonProps) {
  // 尺寸配置
  const sizeClasses = {
    sm: 'h-7 px-2.5 text-xs gap-1',      // 高度28px, padding 10px, 字号12px
    md: 'h-8 px-3 text-xs gap-1.5',      // 高度32px, padding 12px, 字号12px
    lg: 'h-9 px-4 text-sm gap-2',        // 高度36px, padding 16px, 字号14px
  };

  // 处理点击事件
  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled}
      style={{
        borderRadius: `${radiusV2.button}px`,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: selected
          ? colorsV2.primary.blue
          : colorsV2.background.separator,
        color: selected
          ? colorsV2.primary.blue
          : colorsV2.text.secondary,
        backgroundColor: 'transparent',
        transition: `all ${animationsV2.interaction.buttonClick.duration}ms ease`,
      }}
      className={cn(
        // 基础样式
        'inline-flex items-center justify-center',
        'font-medium',
        'focus:outline-none',

        // 尺寸
        sizeClasses[size],

        // 悬停状态
        !disabled && !selected && 'hover:border-gray-400 hover:text-gray-900',
        !disabled && selected && 'hover:border-blue-600 hover:text-blue-600',

        // 激活状态（点击时）
        !disabled && 'active:scale-[0.98]',

        // 禁用状态
        disabled && 'cursor-not-allowed opacity-40',

        // 自定义类名
        className
      )}
    >
      {/* 左侧图标 */}
      {icon && <span className="flex-shrink-0">{icon}</span>}

      {/* 按钮内容 */}
      {children}
    </button>
  );
}

/**
 * ToggleButtonGroup - 切换按钮组（互斥选择）
 */
export interface ToggleButtonGroupProps<T extends string = string> {
  /** 当前选中的值 */
  value: T;

  /** 选项列表 */
  options: Array<{
    value: T;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;

  /** 值变化回调 */
  onChange: (value: T) => void;

  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';

  /** 自定义类名 */
  className?: string;
}

/**
 * ToggleButtonGroup - 切换按钮组
 *
 * @example
 * <ToggleButtonGroup
 *   value="proportion"
 *   options={[
 *     { value: 'proportion', label: '占比', icon: '📊' },
 *     { value: 'absolute', label: '绝对值', icon: '📈' },
 *     { value: 'table', label: '表格', icon: '📋' },
 *   ]}
 *   onChange={(value) => setMode(value)}
 * />
 */
export function ToggleButtonGroup<T extends string = string>({
  value,
  options,
  onChange,
  size = 'md',
  className,
}: ToggleButtonGroupProps<T>) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
          disabled={option.disabled}
          size={size}
          icon={option.icon}
        >
          {option.label}
        </ToggleButton>
      ))}
    </div>
  );
}
