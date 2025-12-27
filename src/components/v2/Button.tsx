/**
 * Button组件 V2 - 基于UI重构设计方案
 *
 * 规范来源：UI重构设计方案.md - 5. 交互状态规范 - 按钮状态
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { colorsV2, radiusV2, buttonStatesV2, animationsV2 } from '@/styles/design-tokens-v2';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮内容 */
  children: React.ReactNode;

  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';

  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';

  /** 是否禁用 */
  disabled?: boolean;

  /** 是否加载中 */
  loading?: boolean;

  /** 是否全宽 */
  fullWidth?: boolean;

  /** 自定义类名 */
  className?: string;

  /** 点击事件 */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Button组件 - 符合设计系统规范
 *
 * @example
 * <Button variant="primary">主要按钮</Button>
 * <Button variant="outline" size="sm">轮廓按钮</Button>
 * <Button disabled>禁用按钮</Button>
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  onClick,
  ...props
}: ButtonProps) {
  // 尺寸配置
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',          // 高度32px, 左右padding 12px, 字号12px
    md: 'h-9 px-4 text-sm',           // 高度36px, 左右padding 16px, 字号14px
    lg: 'h-10 px-6 text-base',        // 高度40px, 左右padding 24px, 字号16px
  };

  // 变体样式配置
  const variantClasses = {
    primary: cn(
      'text-white border border-transparent',
      !disabled && !loading && 'hover:opacity-90',
    ),
    secondary: cn(
      'bg-gray-100 text-gray-900 border border-transparent',
      !disabled && !loading && 'hover:bg-gray-200',
    ),
    outline: cn(
      'bg-transparent border',
      !disabled && !loading && 'hover:bg-gray-50',
    ),
    ghost: cn(
      'bg-transparent border-transparent',
      !disabled && !loading && 'hover:bg-gray-50',
    ),
  };

  // 处理点击事件
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled || loading}
      style={{
        borderRadius: `${radiusV2.button}px`,
        backgroundColor:
          disabled || loading
            ? buttonStatesV2.disabled.background
            : variant === 'primary'
            ? buttonStatesV2.default.background
            : undefined,
        color: disabled || loading ? buttonStatesV2.disabled.color : undefined,
        transition: `all ${animationsV2.interaction.buttonClick.duration}ms ease`,
      }}
      className={cn(
        // 基础样式
        'inline-flex items-center justify-center',
        'font-medium',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'transition-all duration-150',

        // 尺寸
        sizeClasses[size],

        // 变体
        variant === 'primary' && !disabled && !loading && variantClasses.primary,
        variant === 'secondary' && variantClasses.secondary,
        variant === 'outline' && variantClasses.outline,
        variant === 'ghost' && variantClasses.ghost,

        // 禁用和加载状态
        (disabled || loading) && 'cursor-not-allowed opacity-50',

        // 全宽
        fullWidth && 'w-full',

        // 自定义类名
        className
      )}
    >
      {/* 加载图标 */}
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {children}
    </button>
  );
}
